# Comprehensive Project Audit & Analysis: Smart Parking System

## Executive Summary
This document provides an exhaustive, line-by-line audit and forensic analysis of the legacy **Smart Parking System** repository. It catalogues all assets, evaluates security, architectural, concurrency, and usability defects, and specifies the modernization requirements for rebuilding the system using:
- **Frontend**: Modern React (JavaScript / JSX only, strictly NO TypeScript), Vite, Tailwind CSS, Lucide React, Axios.
- **Backend**: Java 21+ / Spring Boot 3, Spring JDBC (`JdbcTemplate` / `NamedParameterJdbcTemplate`), BCrypt security, REST APIs.
- **Database**: MySQL 8+ with 3NF relational modeling, strict constraints, ACID transactions, and pessimistic concurrency locks (`SELECT ... FOR UPDATE`).

---

## 1. Complete Directory Structure
```
d:\Smart-Parking-System-master\
├── .classpath                          # Eclipse JRE 1.8, Tomcat 8 container, absolute desktop JAR path
├── .gitattributes                      # Git attributes configuration
├── .gitignore                          # Git ignore configuration
├── .project                            # Eclipse WST / Java Web Facet configuration
├── .settings/                          # Eclipse IDE project facet descriptors
│   ├── .jsdtscope
│   ├── org.eclipse.jdt.core.prefs
│   ├── org.eclipse.wst.common.component
│   ├── org.eclipse.wst.common.project.facet.core.xml
│   ├── org.eclipse.wst.jsdt.ui.superType.container
│   └── org.eclipse.wst.jsdt.ui.superType.name
├── README.md                           # Brief legacy academic overview
├── build/
│   └── classes/                        # Compiled legacy .class output directory
├── src/                                # Java source files in the DEFAULT (unnamed) package
│   ├── Final_Bike_Book.java            # Bike booking creation & session invalidation
│   ├── Final_Car_Book.java             # Car booking creation & session invalidation
│   ├── Leave_Customer.java             # Checkout fare calculation or cancellation & record deletion
│   ├── Locations_spot_info.java        # Displays parking lots by selected location
│   ├── LogoutServlet.java              # Invalidates session and prints logout message
│   ├── Parking_spot_info.java          # Displays visual grid of car & bike slots by lot
│   ├── Select_spot_bike.java           # Immediate vs scheduled booking selector for bikes
│   ├── Select_spot_car.java            # Immediate vs scheduled booking selector for cars
│   ├── Sign_in_Customer.java           # Authentication via full table scan & booking redirection
│   └── Sign_up_cust_servlet.java       # User registration & MAX(customer_id) retrieval
└── WebContent/                         # Legacy web root
    ├── META-INF/
    │   └── MANIFEST.MF                 # Basic manifest file
    ├── Sign_in_customer.html           # Login form
    ├── Sign_up_customer.html           # Registration form
    ├── index.html                      # Marketing landing page with carousels & gallery
    ├── link.html                       # HTML snippet containing a logout link
    ├── css/
    │   ├── animate.css                 # CSS3 animation library (68 KB)
    │   ├── bootstrap.css               # Bootstrap 3.3.5 unminified (121 KB)
    │   ├── bootstrap.min.css           # Bootstrap 3.3.5 minified (99 KB)
    │   └── style3.css                  # Custom styling (16 KB)
    ├── js/
    │   ├── bootstrap.min.js            # Bootstrap 3.3.5 JS (29 KB)
    │   ├── easing.js                   # jQuery Easing v1.3 (4 KB)
    │   ├── jquery.min.js               # jQuery v1.11.1 (84 KB)
    │   ├── main.js                     # Mobile burger menu toggler (197 B)
    │   ├── move-top.js                 # UItoTop scroll plugin (1 KB)
    │   ├── responsiveslides.min.js     # ResponsiveSlides plugin v1.54 (3 KB)
    │   └── wow.min.js                  # WOW.js scroll animations v1.0.1 (4 KB)
    └── images/                         # Static image assets (logos, lots, avatars, backgrounds)
```

---

## 2. All HTML Files
1. **`WebContent/index.html`** (518 lines, 13.6 KB):
   - Landing page containing a top header bar with branding, navigation links (`Sign In`, `Gallery`, `Contact`).
   - Hero banner with a "Book your spot!" title and a "Sign Up" button triggering a Bootstrap modal.
   - Image carousels (`myCarousel`, `myCarousel1`) displaying parking lot images.
   - Testimonial slider (`#slider2`) using `responsiveslides.min.js`.
   - Gallery section showcasing Bangalore locations (Yeshwantpur, Indiranagar, Malleshwaram, Yelahanka).
   - Contact section with hardcoded address ("MSRIT, Mattikere, Bangalore") and phone number.
2. **`WebContent/Sign_in_customer.html`** (119 lines, 2.6 KB):
   - Header bar with branding.
   - Fixed-size centered form container (`.form_bg`, 500x500px).
   - Form fields: `uname` (Username, which is the auto-generated numeric customer ID) and `pwd` (Password). Submits via `POST` to `Sign_in_Customer`.
3. **`WebContent/Sign_up_customer.html`** (123 lines, 2.7 KB):
   - Form collecting: `cust_name` (Text), `V_number` (Text, maxlength 10), `V_type` (Text, maxlength 1; instruction prompts "0-> Bike 1->Car"), and `cust_pwd` (Password).
   - Submits via `POST` to `Sign_up_cust_servlet`.
4. **`WebContent/link.html`** (11 lines, 179 B):
   - Minimal snippet containing `<a href="LogoutServlet" style="float: right;">Logout</a>`. Intended to be included via `RequestDispatcher` in servlets.

---

## 3. All JSP Files
- **Audit Result**: Zero (`0`) JSP files exist in the project.
- Rather than using JSP (`.jsp`), the author generated dynamic HTML views directly within Java Servlets by issuing `out.println("<html>...")` calls through `HttpServletResponse.getWriter()`.

---

## 4. All CSS Files
1. **`WebContent/css/style3.css`** (1,235 lines):
   - Custom style rules. Implements fixed header (`height: 108px`, `background-color: SandyBrown`), rigid fixed-pixel modals and forms (`.form_bg { width: 500px; height: 500px; border-radius: 70px; }`), custom `#panel` and `#flip` accordion panels for booking selections, hover transitions on lot images, and basic footer positioning.
   - Font family globally forced to `verdana, sans-serif`.
2. **`WebContent/css/bootstrap.css` & `bootstrap.min.css`** (v3.3.5, 2015):
   - Outdated Bootstrap 3 layout grid, buttons, modals, and carousel components.
3. **`WebContent/css/animate.css`**:
   - Classic CSS animation utility classes (`wow fadeInLeft`, `bounceIn`, etc.).

---

## 5. All JavaScript Files
1. **`WebContent/js/jquery.min.js`**: jQuery v1.11.1 (released May 2014) — highly outdated with known XSS CVEs.
2. **`WebContent/js/bootstrap.min.js`**: Bootstrap v3.3.5 script supporting carousel, modal, and collapse plugins.
3. **`WebContent/js/main.js`**:
   ```javascript
   $(document).ready(function(){
       $('.burger_icon').click(function(){
           $('header nav').toggleClass('show');
           $('header .burger_icon').toggleClass('active');
       });
   });
   ```
4. **`WebContent/js/wow.min.js` & `wow.js`**: WOW.js v1.0.1 for trigger animations on window scroll.
5. **`WebContent/js/easing.js`**: jQuery Easing v1.3 for smooth scroll animations.
6. **`WebContent/js/move-top.js`**: Smooth scroll-to-top button plugin.
7. **`WebContent/js/responsiveslides.min.js`**: Lightweight responsive slider v1.54.

---

## 6. All Java Classes & Servlets
All classes reside in the **default package** (no `package com.smartparking...;` statement) and extend `HttpServlet`:

| Class Name | URL Mapping | Supported Methods | Responsibilities & Logic |
|---|---|---|---|
| `Sign_up_cust_servlet` | `/Sign_up_cust_servlet` | `doPost` | Parses user registration parameters, inserts record into `customer_info`, retrieves `MAX(customer_id)`, and renders an HTML page showing the generated ID to use as username. |
| `Sign_in_Customer` | `/Sign_in_Customer` | `doPost` | Loads all rows from `customer_info`, iterates sequentially to match username and password. On success, sets session attribute `username`, queries `parking_spot_info` for active spot. Redirects to location browser or active booking screen. |
| `Locations_spot_info` | `/Locations_spot_info` | `doGet`, `doPost` | Parses location code `action`, queries `locations` and `parking_lot_info`, and lists lots in that location. |
| `Parking_spot_info` | `/Parking_spot_info` | `doGet`, `doPost` | Reads lot number `action`, queries lot capacities, queries booked spots from `parking_spot_info`, and generates color-coded HTML buttons for Car and Bike slots. |
| `Select_spot_car` | `/Select_spot_car` | `doGet`, `doPost` | Receives car slot number, stores in session, offers "Park Now" (instant) or "Advanced Booking" (day + hour dropdowns). |
| `Select_spot_bike` | `/Select_spot_bike` | `doGet`, `doPost` | Duplicate of `Select_spot_car` specifically routing to `Final_Bike_Book`. |
| `Final_Car_Book` | `/Final_Car_Book` | `doGet`, `doPost` | Inserts car booking into `parking_spot_info` (status 1 if instant, status 0 if advanced), prints confirmation, and immediately calls `session.invalidate()`. |
| `Final_Bike_Book` | `/Final_Bike_Book` | `doGet`, `doPost` | Duplicate of `Final_Car_Book` with vehicle type 0. |
| `Leave_Customer` | `/Leave_Customer` | `doGet`, `doPost` | If `park == "Cancel Booking"`, deletes spot record. If leaving, calculates fare via naive hour subtraction, deletes spot record, and prints bill. |
| `LogoutServlet` | `/LogoutServlet` | `doGet`, `doPost` | Invalidates session and renders a logout message. |

---

## 7. All JDBC Code & Database Connection Patterns
In every single servlet class, a direct, raw JDBC connection is opened using `DriverManager`:
```java
String url = "jdbc:mysql://localhost:3306/";
String dbname = "parking_system_db";
String uname = "root";
String pwd = "root";
String driver = "com.mysql.jdbc.Driver";

Class.forName(driver).newInstance();
Connection con = DriverManager.getConnection(url + dbname, uname, pwd);
```
### Defects Identified:
1. **No Connection Pooling**: Every HTTP request opens a brand-new TCP socket and SSL/handshake connection to MySQL, resulting in severe latency and socket exhaustion under load.
2. **Deprecated Driver**: `com.mysql.jdbc.Driver` is deprecated in modern MySQL Connector/J; the modern driver class is `com.mysql.cj.jdbc.Driver`.
3. **Hardcoded Credentials**: Root username and password (`root`/`root`) are hardcoded across 10 distinct files.
4. **Connection Leaks**: `Connection`, `Statement`, and `ResultSet` objects are frequently left open without `try-with-resources` or `finally` blocks, leading to cursor and file descriptor leaks.

---

## 8. All SQL Queries Audit
| Location | SQL Statement | Flaws / Vulnerabilities |
|---|---|---|
| `Sign_up_cust_servlet:86` | `insert into customer_info values(null,?,?,?,?)` | Positional insert without explicit column names; stores plaintext password. |
| `Sign_up_cust_servlet:93` | `select max(customer_id) from customer_info` | Race condition: under concurrent signups, User A receives User B's ID. |
| `Sign_in_Customer:65` | `select * from customer_info` | Full table scan: reads entire table into memory for manual credential matching. |
| `Sign_in_Customer:109` | `select * from parking_spot_info where cid='` + a + `'` | SQL Injection vulnerability via unparameterized concatenation. |
| `Sign_in_Customer:120` | `select location_name,Code from locations` | Unordered query; case-sensitive column name `Code`. |
| `Sign_in_Customer:134` | `select location_name,number_of_parking_lots from locations where code=` + lcode | SQL Injection vulnerability; N+1 query inside while loop. |
| `Sign_in_Customer:140` | `select parking_lot_name,park_number from parking_lot_info where location_code=` + lcode | SQL Injection vulnerability; nested loop query. |
| `Locations_spot_info:86` | `select location_name,number_of_parking_lots from locations where code=` + lcode | SQL Injection vulnerability; assumes 1-based index. |
| `Locations_spot_info:90` | `select parking_lot_name,park_number from parking_lot_info where location_code=` + lcode | SQL Injection vulnerability; N+1 query pattern. |
| `Locations_spot_info:101`| `select * from parking_lot_info where park_number=` + ... | N+1 query; prints arbitrary columns by numerical index (1 to 9). |
| `Parking_spot_info:77`   | `select * from parking_lot_info where park_number=` + ... | SQL Injection vulnerability. |
| `Parking_spot_info:103`  | `select spot_number,status from parking_spot_info where park_num=` + ... + ` and vehicle_type=1 order by spot_number` | SQL Injection vulnerability; does not check date/time window. |
| `Parking_spot_info:143`  | `select spot_number,status from parking_spot_info where park_num=` + ... + ` and vehicle_type=0 order by spot_number` | SQL Injection vulnerability. |
| `Final_Car_Book:80`      | `insert into parking_spot_info values(?,?,?,?,now(),curtime(),1)` | Blind insert without locking or checking slot availability. |
| `Final_Car_Book:93`      | `select * from parking_spot_info where cid='` + username + `'` | SQL Injection vulnerability. |
| `Final_Car_Book:155`     | `insert into parking_spot_info values(?,?,?,?,'` + temp + `','` + hour + `:00:00',0)` | Severe SQL Injection via string interpolation; fragile date parsing. |
| `Leave_Customer:78`      | `select park_num,spot_number,book_in_time,vehicle_type from parking_spot_info where cid=` + ... | Read attempted concurrent with deletion. |
| `Leave_Customer:79`      | `delete from parking_spot_info where cid=` + ... | Complete data loss; destroys historical record of booking. |
| `Leave_Customer:119`     | `select park_num,spot_number,book_in_time,vehicle_type from parking_spot_info where cid=` + ... | Executed before delete, but result read after delete. |
| `Leave_Customer:120`     | `delete from parking_spot_info where cid=` + ... | Permanent deletion of session and revenue record. |
| `Leave_Customer:129`     | `select cost_of_car_parkings from parking_lot_info where park_number=` + ... | SQL Injection vulnerability. |
| `Leave_Customer:135`     | `select cost_of_bike_parkings from parking_lot_info where park_number=` + ... | SQL Injection vulnerability. |

---

## 9. All Forms & Parameters
1. **User Registration Form** (`Sign_up_customer.html`):
   - Action: `Sign_up_cust_servlet`, Method: `POST`
   - Inputs: `cust_name` (string), `V_number` (string, max 10), `V_type` (single char "0" or "1"), `cust_pwd` (string).
2. **User Login Form** (`Sign_in_customer.html`):
   - Action: `Sign_in_Customer`, Method: `POST`
   - Inputs: `uname` (string customer ID), `pwd` (string password).
3. **Location Selector Form** (`Sign_in_Customer`):
   - Action: `Locations_spot_info`, Method: `GET`
   - Inputs: `<input type="image" name="action" value="<lcode>">`.
4. **Lot Selector Form** (`Locations_spot_info`):
   - Action: `Parking_spot_info`, Method: `GET`
   - Inputs: `<input type="image" name="action" value="<pnum>">`.
5. **Slot Selection Form** (`Parking_spot_info`):
   - Action: `Select_spot_car` or `Select_spot_bike`, Method: `GET`
   - Inputs: `<button type="submit" name="park" value="<slot_number>">`.
6. **Booking Confirmation Form** (`Select_spot_car`, `Select_spot_bike`):
   - Action: `Final_Car_Book` or `Final_Bike_Book`, Method: `GET`
   - Immediate mode: `<input type="submit" name="parking" value="park">`.
   - Advanced mode: `<select name="date">`, `<select name="hour">`, `<input type="submit" name="parking" value="book">`.
7. **Checkout / Cancellation Form** (`Sign_in_Customer`):
   - Action: `Leave_Customer`, Method: `GET`
   - Inputs: `<input type="submit" name="park" value="Cancel Booking">` or `<input type="submit" name="park" value="Leave now!">`.

---

## 10. Existing User Flows
```
[Visitor] -> index.html (Browse Gallery / Info)
     |
     +---> Sign_up_customer.html -> POST Sign_up_cust_servlet -> Generates ID (e.g. 104)
     |
     +---> Sign_in_customer.html -> POST Sign_in_Customer (Inputs ID + Pwd)
                 |
        +--------+--------+
        |                 |
  (No Active Spot)   (Has Active Spot)
        |                 |
  List Locations          Display Spot Info
        |                 |
  Locations_spot_info     +---> Click "Cancel Booking" -> Leave_Customer -> DELETES row
        |                 |
  Parking_spot_info       +---> Click "Leave now!"     -> Leave_Customer -> NAIVE Fare -> DELETES row
        |
  View Car/Bike Grid
        |
  Select_spot_car / bike
        |
  +-----+-----+
  |           |
"Park Now"  "Advanced Booking" (Date + Hour)
  |           |
  Final_Car_Book / Final_Bike_Book
  (Blind INSERT into parking_spot_info)
  (session.invalidate() -> Forced Logout!)
```

---

## 11. Authentication & Session Logic Analysis
- **User Identifier**: The user's login username is an auto-increment integer `customer_id`. Users must remember a random integer to log in.
- **Credential Storage**: Passwords are stored in plaintext in `customer_info.cust_pwd`.
- **Authentication Method**:
  ```java
  ResultSet r = stmt.executeQuery("select * from customer_info");
  while(r.next()) {
      if(cust_uname.equals(r.getString(1)) && cust_pwd.equals(r.getString(5))) { ... }
  }
  ```
  This is a full table scan, vulnerable to timing attacks, CPU/memory exhaustion, and credential exposure.
- **Session Management**: Session attributes stored: `username`, `park_num`, `park`.
- **Forced Logout Glitch**: In `Final_Car_Book` and `Final_Bike_Book`, immediately after inserting a booking record, `session.invalidate()` is called. The user is logged out right after booking and must sign in again.

---

## 12. Parking Booking & Concurrency Logic Analysis
- **Double Booking Flaw**: The booking servlets perform a blind `INSERT INTO parking_spot_info` without checking if another transaction has already claimed the slot:
  ```java
  PreparedStatement s = con.prepareStatement("insert into parking_spot_info values(?,?,?,?,now(),curtime(),1)");
  s.setInt(1, Integer.parseInt(snum));
  s.setInt(2, Integer.parseInt(pnum));
  s.setInt(3, 1);
  s.setInt(4, Integer.parseInt(username));
  s.executeUpdate();
  ```
- **Absence of Transactions**: Autocommit is enabled by default (`setAutoCommit(true)`). No transaction boundaries, row locks, or isolation levels are set.
- **Servlet Thread Safety Violation**:
  - `Locations_spot_info.java` declares instance variables `String lcode_string; int lcode;`.
  - `Parking_spot_info.java` declares instance variable `String pnum;`.
  - In a servlet container, a single servlet instance handles concurrent HTTP threads. When User A and User B make concurrent requests, they overwrite each other's instance variables, causing User A to view or book User B's lot.

---

## 13. Fare Calculation Logic Analysis
In `Leave_Customer.java`:
```java
Date date = new Date();
String time = date.toString().substring(11, 20);
int h = Integer.parseInt(time.substring(0,2).toString()) + 1;
int time_booked = Integer.parseInt(book_in_time.substring(0, 2).toString());
float bill = (h - time_booked) * cost;
```
### Defects:
1. **Midnight Boundary / Negative Bill**: If a user checks in at 22:00 and checks out at 02:00, `h = 3`, `time_booked = 22`, resulting in `(3 - 22) * cost = -19 * cost` (a negative bill).
2. **Multi-Day Blindness**: The date difference is completely ignored. Parking for 3 days charges only the difference in hours.
3. **Minutes Discarded**: No accounting for minutes or seconds.
4. **No Minimum Charge or Grace Period**: Leaving within 2 minutes still charges for a full hour.
5. **Permanent Data Destruction**: Immediately after calculating the fare, `delete from parking_spot_info where cid = ...` is executed. The revenue, billing, and session data are destroyed forever.

---

## 14. Dependencies, Runtime & Server Requirements
- **Java Requirements**: Legacy project targeted Java 8 (`jre1.8.0_20`). Modern target is Java 21 LTS with Spring Boot 3.4+.
- **Tomcat Configuration**: Legacy required Apache Tomcat 8.0 servlet container. Modern backend will use embedded Tomcat via Spring Boot.
- **MySQL Requirements**: Legacy used `mysql-connector-java-5.1.37` on MySQL 5.x. Modern target is MySQL 8.0+ with `mysql-connector-j` 8.4+.

---

## 15. Summary of Problems Found
1. **Security**:
   - Plaintext passwords stored in database.
   - Table-scan authentication logic (`select * from customer_info`).
   - Multiple SQL injection vectors via string concatenation.
   - Hardcoded database credentials in 10 files.
   - No role-based access control (Admin does not exist).
   - Insecure direct object reference (IDOR).
   - XSS vulnerabilities by printing unescaped input to HTML.
2. **Concurrency & Thread Safety**:
   - Shared mutable state in servlet singletons (`lcode`, `pnum`, `username`).
   - Blind inserts causing double-booking collisions.
   - Race conditions on user registration (`select max(customer_id)`).
   - Zero database transaction boundaries.
3. **Data Integrity & Architecture**:
   - Hard deletion on checkout obliterates booking and revenue history.
   - Flawed fare calculation producing negative bills.
   - Single vehicle limit forced during user signup.
   - Binary vehicle type (0 or 1) cannot represent EVs, SUVs, or trucks.
   - Forced session invalidation after booking.
   - Code duplication across bike/car servlets.
4. **Frontend & Accessibility**:
   - Rigid fixed-pixel forms (`500px` by `500px`) causing severe overflow on mobile screens.
   - Color-only slot status indication (green, orange, red) violating WCAG accessibility guidelines.
   - No loading states, empty states, or error handling.

---

## 16. Features That Must Be Preserved in Modernization
1. **User Sign Up & Authentication**: Preserve user registration and sign-in capabilities, upgrading to email/password with BCrypt hashing and JWT tokens.
2. **Multi-Vehicle Support**: Preserve vehicle assignment while expanding to support multiple vehicles per account.
3. **Location & Parking Lot Discovery**: Preserve location browsing and lot exploration with rich metadata, addresses, and live capacity counters.
4. **Interactive Visual Slot Matrix**: Preserve visual slot layout with intuitive status badges: `AVAILABLE`, `SELECTED`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`, `DISABLED`.
5. **Immediate & Scheduled Booking Modes**: Preserve "Park Now" (instant check-in) and "Advanced Booking" (future time slot reservation).
6. **Cancellation & Checkout Workflows**: Preserve booking cancellation and parking departure with rigorous backend fare calculations.
7. **Vehicle-Specific Pricing**: Preserve distinct pricing tiers for cars and bikes while adding support for additional vehicle types.
