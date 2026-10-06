# Database Setup & Configuration Guide

This directory contains the production-grade relational database scripts for the **Smart Parking System** designed for **MySQL 8.0+** using the **InnoDB** storage engine and `utf8mb4` character set.

---

## Files in this Directory

| File | Description |
|---|---|
| `schema.sql` | Complete DDL script defining all 11 normalized tables, constraints, foreign keys, and indexes. |
| `seed.sql` | Initial bootstrap data containing roles, administrator accounts, sample customers, vehicles, parking locations, lots, slots, pricing rules, and booking sessions. |
| `README.md` | This setup and configuration documentation. |

---

## 1. Prerequisites

- **MySQL Server**: Version 8.0 or higher
- **Storage Engine**: InnoDB (mandatory for transactions and foreign keys)
- **Character Set**: `utf8mb4` (collation: `utf8mb4_unicode_ci`)

---

## 2. Database Initialization

### Step 1: Create Database
Connect to your MySQL server as an administrative user and create the database:

```sql
CREATE DATABASE parking_system_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Dedicated Application User (Recommended)
For security, avoid connecting with the MySQL `root` superuser:

```sql
CREATE USER 'smartpark_app'@'localhost' IDENTIFIED BY 'StrongPassword!2026';
GRANT ALL PRIVILEGES ON parking_system_db.* TO 'smartpark_app'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Execute Schema Script
Run `schema.sql` to build tables and constraints:

```bash
# Using MySQL Command Line (Windows PowerShell / CMD)
mysql -u smartpark_app -p parking_system_db < database/schema.sql

# Or inside MySQL client:
mysql> USE parking_system_db;
mysql> SOURCE d:/Smart-Parking-System-master/database/schema.sql;
```

### Step 4: Execute Seed Script
Populate initial locations, parking facilities, pricing tiers, and default accounts:

```bash
mysql -u smartpark_app -p parking_system_db < database/seed.sql

# Or inside MySQL client:
mysql> SOURCE d:/Smart-Parking-System-master/database/seed.sql;
```

---

## 3. Pre-Seeded Default Accounts

| Role | Email / Username | Default Password | Notes |
|---|---|---|---|
| **System Administrator** | `admin@smartparking.com` | `User@123` | Full admin privileges (dashboard, pricing, slots). |
| **Customer 1** | `john.doe@example.com` | `User@123` | Has registered Car and Bike; active parking session. |
| **Customer 2** | `jane.smith@example.com` | `User@123` | Has registered Car and EV; confirmed upcoming booking. |
| **Customer 3** | `rahul.sharma@example.com` | `User@123` | Has registered SUV; completed past booking. |

*Note: All passwords in `seed.sql` are stored as BCrypt hashes.*

---

## 4. Schema Integrity & Concurrency Architecture

### Referential Integrity Rules
1. **Restrict Deletions**: Deletion of Users, Lots, Slots, or Vehicles with active bookings is strictly restricted (`ON DELETE RESTRICT`).
2. **Cascade Deletions**: Deletion of a Parking Lot cleanly cascades to its physical Slots and Pricing Rules (`ON DELETE CASCADE`).
3. **Audit Trail Preservation**: If a user account is removed, related audit logs retain the historical event with `user_id` set to `NULL` (`ON DELETE SET NULL`).

### Double-Booking Prevention Index
The booking table includes a composite index tailored for high-frequency interval conflict queries:
```sql
CREATE INDEX idx_bookings_slot_status_interval 
ON bookings (slot_id, status, start_time, end_time);
```
During booking creation, the backend acquires a row lock:
```sql
SELECT id FROM parking_slots WHERE id = ? FOR UPDATE;
```
It then checks for time overlap against active reservations using this index:
```sql
SELECT COUNT(*) FROM bookings 
WHERE slot_id = ? 
  AND status IN ('CONFIRMED', 'ACTIVE') 
  AND (? < end_time AND ? > start_time);
```
This guarantees that no two concurrent transactions can book the same slot for overlapping time windows.
