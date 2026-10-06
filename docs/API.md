# REST API Specification: Smart Parking System

All API endpoints return responses encapsulated in a standardized `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "message": "Status description",
  "data": { ... },
  "errorCode": null,
  "timestamp": "2026-10-06T16:50:00Z"
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register New User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phoneNumber": "+919876543299",
    "password": "Password@123",
    "initialVehiclePlate": "KA-01-AB-1234",
    "initialVehicleType": "CAR",
    "initialVehicleMake": "Honda",
    "initialVehicleModel": "City"
  }
  ```
- **Response**: `201 Created` with JWT token and user profile object.

### 1.2 User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password@123"
  }
  ```
- **Response**: `200 OK` with JWT token and user profile object.

### 1.3 Get Current Authenticated Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response**: `200 OK` with authenticated UserPrincipal details.

---

## 2. Location & Facility Discovery (`/api/locations`, `/api/lots`)

### 2.1 Get All Locations
- **Method**: `GET`
- **Path**: `/api/locations`
- **Auth Required**: No (Public)

### 2.2 Get Parking Lots By Location
- **Method**: `GET`
- **Path**: `/api/locations/{id}/lots`
- **Auth Required**: No (Public)

### 2.3 Get Parking Lot Details
- **Method**: `GET`
- **Path**: `/api/lots/{id}`
- **Auth Required**: No (Public)

### 2.4 Get Lot Slots Layout
- **Method**: `GET`
- **Path**: `/api/lots/{id}/slots`
- **Query Parameters**:
  - `vehicleType` (optional, e.g. `CAR`, `BIKE`, `EV`, `SUV`)
  - `floorLevel` (optional, e.g. `1`, `2`)
  - `status` (optional, e.g. `AVAILABLE`, `OCCUPIED`)
- **Auth Required**: No (Public)

---

## 3. Vehicle Garage Management (`/api/vehicles`)

### 3.1 Get User Vehicles
- **Method**: `GET`
- **Path**: `/api/vehicles`
- **Auth Required**: Yes (`Bearer <token>`)

### 3.2 Add New Vehicle
- **Method**: `POST`
- **Path**: `/api/vehicles`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "licensePlate": "KA-03-EV-9999",
    "vehicleType": "EV",
    "make": "Tata",
    "model": "Nexon EV",
    "color": "Teal Blue",
    "isDefault": true
  }
  ```

### 3.3 Set Default Vehicle
- **Method**: `POST`
- **Path**: `/api/vehicles/{id}/default`
- **Auth Required**: Yes (`Bearer <token>`)

### 3.4 Delete Vehicle
- **Method**: `DELETE`
- **Path**: `/api/vehicles/{id}`
- **Auth Required**: Yes (`Bearer <token>`)

---

## 4. Concurrency-Safe Reservations (`/api/bookings`)

### 4.1 Create Booking ("Park Now" or "Advanced")
- **Method**: `POST`
- **Path**: `/api/bookings`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "slotId": 14,
    "vehicleId": 2,
    "isImmediate": true,
    "durationHours": 2
  }
  ```
  *Scheduled Mode Example*:
  ```json
  {
    "slotId": 14,
    "vehicleId": 2,
    "isImmediate": false,
    "startTime": "2026-10-07T10:00:00",
    "endTime": "2026-10-07T12:00:00"
  }
  ```
- **Response**: `201 Created` with `bookingReference` and calculated estimated fare.

### 4.2 Cancel Booking
- **Method**: `POST`
- **Path**: `/api/bookings/{id}/cancel`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "reason": "Change of schedule"
  }
  ```

### 4.3 Get My Bookings
- **Method**: `GET`
- **Path**: `/api/bookings/my`
- **Auth Required**: Yes (`Bearer <token>`)

---

## 5. Physical Sessions & Automated Checkout (`/api/sessions`)

### 5.1 Barrier Gate Check-In
- **Method**: `POST`
- **Path**: `/api/sessions/check-in`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "bookingReference": "BK-1791285043544-8B47",
    "entryGate": "Gate-North"
  }
  ```
- **Response**: `201 Created` with `sessionCode` and active timestamp.

### 5.2 Barrier Gate Check-Out & Settlement
- **Method**: `POST`
- **Path**: `/api/sessions/{id}/check-out`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "exitGate": "Gate-Exit-South",
    "paymentMethod": "UPI"
  }
  ```
- **Response**: `200 OK` with full receipt breakdown: duration, standard fare, overstay penalties, payment status `COMPLETED`, and bay release confirmation.

### 5.3 Get Active Session
- **Method**: `GET`
- **Path**: `/api/sessions/active`
- **Auth Required**: Yes (`Bearer <token>`)

---

## 6. Administrator Controls (`/api/admin`)

### 6.1 System KPI Statistics
- **Method**: `GET`
- **Path**: `/api/admin/stats`
- **Auth Required**: Yes (`ROLE_ADMIN`)

### 6.2 Driver Directory
- **Method**: `GET`
- **Path**: `/api/admin/users?offset=0&limit=50`
- **Auth Required**: Yes (`ROLE_ADMIN`)

### 6.3 System Audit Log Stream
- **Method**: `GET`
- **Path**: `/api/admin/audit-logs?offset=0&limit=50`
- **Auth Required**: Yes (`ROLE_ADMIN`)
