# Concurrency Control & Double-Booking Prevention: Smart Parking System

## 1. Executive Summary & Problem Statement

In high-density urban parking environments, multiple drivers routinely attempt to reserve the same optimal parking slot within the exact same sub-second window. In the legacy Smart Parking System, this scenario caused catastrophic double-booking, data corruption, and user lockouts due to:
1. **Blind Unchecked Inserts**: `Final_Car_Book.java` and `Final_Bike_Book.java` executed raw SQL `INSERT INTO parking_spot_info values(?,?,?,?,now(),curtime(),1)` without transactional boundaries or availability checks.
2. **Race Conditions in State Tracking**: The database had no unique interval constraints or status lifecycle to represent a slot reserved for a future window versus currently occupied.
3. **Servlet Multithreading Flaws**: Servlets declared shared instance variables (`String pnum; int lcode;`) on the singleton class instance, causing concurrent user requests to overwrite each other's target slot numbers in memory before writing to the database.

This document details the enterprise concurrency architecture implemented in the modernized system using **Pessimistic Row-Level Locking (`SELECT ... FOR UPDATE`)**, **Interval Overlap Verification**, and **Spring Transaction Boundaries (`Isolation.REPEATABLE_READ`)**.

---

## 2. Legacy Failure Analysis

```
Time    User A Thread (Car Slot 14)               User B Thread (Car Slot 14)
----    ---------------------------               ---------------------------
T1      GET /Parking_spot_info?action=14          GET /Parking_spot_info?action=14
        (Reads slot 14 as empty)                  (Reads slot 14 as empty)
T2      GET /Final_Car_Book?parking=park          
        (INSERT INTO parking_spot_info)           GET /Final_Car_Book?parking=park
                                                  (INSERT INTO parking_spot_info)
T3      Both records written!                     Collision: Duplicate active spots!
        User A arrives at lot                     User B arrives at lot (Collision!)
```

### Critical Flaws in Legacy Servlets:
- **No Concurrency Lock**: Neither optimistic version tokens nor pessimistic database locks were used.
- **Auto-Commit Mode**: Default `con.setAutoCommit(true)` committed individual statements immediately without rollbacks.
- **Hard Deletes on Exit**: `Leave_Customer.java` deleted records rather than maintaining an audit trail, obliterating forensic evidence of collisions.

---

## 3. Modern Concurrency Architecture

### Multi-Layer Defense Matrix
```
[Client HTTP Request: POST /api/bookings]
                    │
                    ▼
[Layer 1: Input & Ownership Validation]
  - Vehicle belongs to authenticated UserPrincipal
  - Temporal consistency: (endTime > startTime)
                    │
                    ▼
[Layer 2: Transaction Scope & Row-Level Lock]
  - @Transactional(isolation = Isolation.REPEATABLE_READ)
  - Execution: SELECT id, lot_id, slot_type, status FROM parking_slots WHERE id = :slotId FOR UPDATE
  * Result: InnoDB holds exclusive row-level X-lock until COMMIT/ROLLBACK
                    │
                    ▼
[Layer 3: Physical Bay State Verification]
  - Verify slot.isActive() == TRUE
  - Verify slot.status NOT IN ('MAINTENANCE', 'DISABLED')
  - Verify slot.slotType == vehicle.vehicleType
                    │
                    ▼
[Layer 4: Temporal Interval Overlap Verification]
  - SQL: SELECT COUNT(*) FROM bookings 
         WHERE slot_id = :slotId 
           AND status IN ('CONFIRMED', 'ACTIVE')
           AND (:startTime < end_time AND :endTime > start_time)
  - If count > 0: Throw SlotUnavailableException (HTTP 409 Conflict)
                    │
                    ▼
[Layer 5: Safe Write & State Transition]
  - INSERT INTO bookings (booking_reference, ...) VALUES (...)
  - If immediate booking: UPDATE parking_slots SET status = 'RESERVED'
  - COMMIT Transaction (X-lock released)
```

---

## 4. Mathematical Interval Overlap Proof

Two time intervals $[S_1, E_1)$ and $[S_2, E_2)$ overlap if and only if:
$$\max(S_1, S_2) < \min(E_1, E_2)$$

In standard relational SQL, where Interval 1 is the candidate request $(\text{reqStart}, \text{reqEnd})$ and Interval 2 is an existing active booking $(B.\text{start\_time}, B.\text{end\_time})$:
```sql
SELECT COUNT(*) 
FROM bookings b
WHERE b.slot_id = :slotId
  AND b.status IN ('CONFIRMED', 'ACTIVE')
  AND (:reqStartTime < b.end_time AND :reqEndTime > b.start_time);
```

### Edge-Case Matrix Evaluated:

| Scenario | Candidate Window | Existing Booking | Conflict? | Evaluation |
|---|---|---|---|---|
| **Preceding** | 10:00 - 11:00 | 11:00 - 12:00 | **NO** | `10:00 < 12:00` (True) AND `11:00 > 11:00` (False) $\to$ Count = 0. Allowed. |
| **Succeeding** | 12:00 - 13:00 | 11:00 - 12:00 | **NO** | `12:00 < 12:00` (False) $\to$ Count = 0. Allowed. |
| **Complete Overlap** | 11:00 - 12:00 | 11:00 - 12:00 | **YES** | `11:00 < 12:00` (True) AND `12:00 > 11:00` (True) $\to$ Rejected. |
| **Enclosing** | 10:30 - 12:30 | 11:00 - 12:00 | **YES** | `10:30 < 12:00` (True) AND `12:30 > 11:00` (True) $\to$ Rejected. |
| **Partial Head** | 10:30 - 11:30 | 11:00 - 12:00 | **YES** | `10:30 < 12:00` (True) AND `11:30 > 11:00` (True) $\to$ Rejected. |
| **Partial Tail** | 11:30 - 12:30 | 11:00 - 12:00 | **YES** | `11:30 < 12:00` (True) AND `12:30 > 11:00` (True) $\to$ Rejected. |

---

## 5. Spring Data & JDBC Implementation Details

### Repository Method (`JdbcParkingSlotRepository.java`)
```java
@Override
public Optional<ParkingSlot> findByIdForUpdate(Long id) {
    String sql = BASE_SELECT + " WHERE id = ? FOR UPDATE";
    try {
        ParkingSlot slot = jdbcTemplate.queryForObject(sql, rowMapper, id);
        return Optional.ofNullable(slot);
    } catch (EmptyResultDataAccessException e) {
        return Optional.empty();
    }
}
```

### Transaction Boundary (`BookingService.java`)
```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
    // 1. Pessimistic lock
    ParkingSlot slot = slotRepository.findByIdForUpdate(request.getSlotId())
        .orElseThrow(() -> new ResourceNotFoundException("Slot not found", "SLOT_NOT_FOUND"));

    // 2. Interval conflict check
    long conflicts = bookingRepository.countConflictingBookings(slot.getId(), startTime, endTime);
    if (conflicts > 0) {
        throw new SlotUnavailableException("Slot " + slot.getSlotNumber() + " is already reserved");
    }

    // 3. Insert booking & audit log
    Booking saved = bookingRepository.save(booking);
    return BookingResponse.fromBooking(saved);
}
```

---

## 6. Concurrency Guarantees & Deadlock Prevention

1. **Deadlock Avoidance by Ordering**:
   - Every booking operation locks rows in a consistent hierarchy: Slot row (`parking_slots`) $\to$ Bookings table search $\to$ Insert `bookings`.
   - Because single-slot reservations only lock one row in `parking_slots`, cyclic lock dependency deadlocks are fundamentally eliminated.
2. **Predictable User Feedback**:
   - When User A locks Slot 10, User B's thread waits on the database lock until User A's transaction completes.
   - Upon User A's commit, User B's thread acquires the lock, performs the interval overlap check, immediately detects the conflict, and returns a clean, structured HTTP 409 response:
     ```json
     {
       "success": false,
       "message": "Slot A-10 has an active reservation during the selected time interval",
       "errorCode": "SLOT_UNAVAILABLE",
       "status": 409,
       "timestamp": "2026-10-06T16:32:00Z"
     }
     ```
3. **Audit Trail Immutability**:
   - All booking creations and cancellations generate immutable records in `audit_logs` capturing user ID, timestamp, entity ID, and reason, ensuring zero data loss.
