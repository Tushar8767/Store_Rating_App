# Store Rating Application

A full-stack store rating web platform where users explore and rate stores, store owners monitor their store performance and customer feedback, and administrators manage the entire ecosystem.

Built for the **Full Stack Store Rating Web Application** challenge.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Key Features](#key-features)
4. [User Roles](#user-roles)
5. [Technology Stack](#technology-stack)
6. [System Architecture](#system-architecture)
7. [Project Folder Structure](#project-folder-structure)
8. [Database Design](#database-design)
9. [Authentication & Authorization](#authentication--authorization)
10. [API Overview](#api-overview)
11. [Admin Features](#admin-features)
12. [Normal User Features](#normal-user-features)
13. [Store Owner Features](#store-owner-features)
14. [Validation Rules](#validation-rules)
15. [Search, Filtering & Sorting](#search-filtering--sorting)
16. [Rating System](#rating-system)
17. [Error Handling](#error-handling)
18. [Testing](#testing)
19. [Environment Variables](#environment-variables)
20. [Installation Requirements](#installation-requirements)
21. [Backend Setup](#backend-setup)
22. [Database Setup](#database-setup)
23. [Frontend Setup](#frontend-setup)
24. [How to Run the Complete Application](#how-to-run-the-complete-application)
25. [Git & Repository Instructions](#git--repository-instructions)
26. [Security Notes](#security-notes)
27. [Known Limitations & Missing Features](#known-limitations--missing-features)
28. [Future Improvements](#future-improvements)

---

## 1. Project Overview

The **Store Rating Application** provides a role-driven portal allowing:
- **Normal Users** to discover registered stores, view live average ratings, and submit or update their personal 1–5 star ratings.
- **Store Owners** to access a dedicated dashboard displaying their store's aggregate rating and the list of customers who submitted reviews.
- **System Administrators** to manage users (normal users, store owners, and administrators), register new stores, and monitor system metrics.

---

## 2. Problem Statement

Retail discovery systems require strict data integrity, fair rating policies, and role boundaries:
- Ratings must be limited to an exact 1–5 range, with duplicate ratings by the same user on the same store prohibited while permitting modifications.
- Strict input validation is required to ensure data quality across user identities and addresses.
- Multi-tier role permissions must be enforced at both the client interface and server routing layers.
- Store owners require direct visibility into customer sentiment and ratings without access to administrative controls.

---

## 3. Key Features

- **Unified Authentication:** Centralized login routing users to their designated role landing page (`/stores` for users, `/admin` for admins, `/owner` for owners).
- **Public Registration:** Self-service registration restricted strictly to normal users (`role: 'user'`).
- **Dynamic Store Rating Engine:** Real-time SQL aggregation (`ROUND(AVG(rating), 1)`) with `UNIQUE (user_id, store_id)` enforcement.
- **Debounced Live Search & Multi-Column Sorting:** Search by Name and Address with bidirectional sorting (`ASC` / `DESC`).
- **Admin Management Console:** Real-time dashboard KPI counts (`total_users`, `total_stores`, `total_ratings`), user onboarding, store onboarding, and store owner assignment.
- **Store Owner Insight Hub:** Store average rating computation and breakdown of reviewing users.
- **Cross-Role Password Management:** Self-service password change for all authenticated roles.

---

## 4. User Roles

| Role | Access Level | Landing Route | Key Capabilities |
|---|---|---|---|
| **System Administrator (`admin`)** | Full System Control | `/admin` | Dashboard metrics, add users (admin/user/owner), add stores, filter/sort user & store directories, inspect user profiles (including store rating details). |
| **Normal User (`user`)** | Client Platform | `/stores` | Self-signup, browse stores, debounced search by name/address, view overall and self-submitted ratings, submit/modify 1–5 rating. |
| **Store Owner (`owner`)** | Store Management | `/owner` | View assigned store metrics, track average ratings, view raters table (user name, email, rating, date). |

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18 (`18.3.1`)
- **Build Tool / Bundler:** Vite 5 (`5.4.0`) with `@vitejs/plugin-react` (`4.3.1`)
- **Routing:** React Router DOM v6 (`6.26.0`)
- **State Management:** React Context API (`AuthContext`) + Custom Hooks (`useFetch`, `useDebounce`)
- **Styling:** Custom Vanilla CSS (`index.css`) with CSS custom properties and mobile-responsive breakpoints (no external UI libraries)

### Backend
- **Runtime Environment:** Node.js (v18+)
- **Web Framework:** Express.js (`4.19.2`)
- **Database Driver:** `pg` (Node Postgres `8.12.0`) Connection Pool
- **Authentication:** JSON Web Tokens (`jsonwebtoken` `9.0.2`)
- **Security & Hashing:** `bcryptjs` (`2.4.3`) with 10 salt rounds
- **CORS Support:** `cors` (`2.8.5`)
- **Environment Handling:** `dotenv` (`16.4.5`)

### Database
- **Engine:** PostgreSQL (tested with versions 14+)
- **Driver:** Raw SQL queries executed through `pg.Pool` with parameterized queries

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│                React 18 + Vite (Port 5173)                  │
│   ├── Context: AuthContext (JWT & User state in storage)    │
│   ├── Client Routing: React Router v6 + ProtectedRoute      │
│   └── API Client: fetch wrapper (services/api.js)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (via Vite Proxy /api)
┌──────────────────────────────▼──────────────────────────────┐
│                      Server Layer                           │
│                  Express.js (Port 5000)                     │
│   ├── Global Middleware: CORS, express.json()               │
│   ├── Router: backend/src/routes/index.js                   │
│   ├── Middleware:                                           │
│   │   ├── authenticate (JWT verification & DB identity sync)│
│   │   └── authorize (Role RBAC: 'admin', 'user', 'owner')   │
│   ├── Controllers: auth, store, rating, admin, owner, user  │
│   └── Error Middleware: HttpError & PostgreSQL code mapper  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL ($1, $2, ...)
┌──────────────────────────────▼──────────────────────────────┐
│                      Database Layer                         │
│                        PostgreSQL                           │
│   ├── users (id, name, email, password_hash, address, role) │
│   ├── stores (id, name, email, address, owner_id FK)        │
│   └── ratings (id, user_id FK, store_id FK, rating, ...)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Project Folder Structure

```
store-rating-app/
├── README.md
├── backend/
│   ├── .env.example              # Sample environment template
│   ├── .gitignore                # Ignores node_modules and .env
│   ├── package.json              # Express, pg, bcryptjs, jsonwebtoken dependencies
│   ├── db/
│   │   ├── schema.sql            # Table definitions, constraints, indexes
│   │   └── setup.js              # Database initialization and demo seed script
│   └── src/
│       ├── app.js                # Express app setup and middleware configuration
│       ├── server.js             # HTTP server listener and environment pre-checks
│       ├── config/
│       │   └── db.js             # pg.Pool database connection configuration
│       ├── controllers/
│       │   ├── adminController.js # Admin dashboard, user & store management
│       │   ├── authController.js  # User registration & authentication
│       │   ├── ownerController.js # Store owner metrics & rating queries
│       │   ├── ratingController.js# Rating creation and update logic
│       │   ├── storeController.js # Store catalog querying & calculations
│       │   └── userController.js  # Password management
│       ├── middleware/
│       │   ├── auth.js           # authenticate & authorize middleware
│       │   └── errorHandler.js   # Centralized error handler & 404 handler
│       ├── routes/
│       │   └── index.js          # REST route declarations & protection guards
│       └── utils/
│           ├── HttpError.js      # Custom error class with HTTP status
│           ├── asyncHandler.js   # Promise wrapper for async route handlers
│           ├── parseId.js        # Safe integer ID parsing utility
│           ├── query.js          # Sort whitelisting & ILIKE escape utilities
│           ├── token.js          # JWT sign utility
│           └── validators.js     # Backend validation functions
└── frontend/
    ├── .gitignore                # Ignores node_modules and dist
    ├── index.html                # HTML entry point
    ├── package.json              # React, React DOM, React Router, Vite
    ├── vite.config.js            # Vite configuration with /api reverse proxy
    └── src/
        ├── App.jsx               # Application route declarations
        ├── index.css             # Application styling and responsive rules
        ├── main.jsx              # React DOM initialization & AuthProvider wrapper
        ├── components/
        │   ├── ErrorMessage.jsx  # Server error alert presentation
        │   ├── FilterBar.jsx     # Reusable search and filter input component
        │   ├── FormInput.jsx     # Standardized form input field with error feedback
        │   ├── LoadingState.jsx  # Async loading indicator
        │   ├── Navbar.jsx        # Role-aware navigation bar
        │   ├── ProtectedRoute.jsx# Role-based route guard
        │   ├── RatingInput.jsx   # 1 to 5 interactive rating selector
        │   └── SortableTh.jsx    # Table column header with ASC/DESC toggles
        ├── context/
        │   └── AuthContext.jsx   # Authentication context & local token management
        ├── hooks/
        │   ├── useDebounce.js    # Debounce timer hook for input filtering
        │   └── useFetch.js       # Data fetch abstraction with cancellation guard
        ├── layouts/
        │   └── AppLayout.jsx     # Master layout including Navbar and container
        ├── pages/
        │   ├── AddStore.jsx      # Admin store creation form
        │   ├── AddUser.jsx       # Admin user creation form
        │   ├── AdminDashboard.jsx# Admin KPI dashboard
        │   ├── AdminStores.jsx   # Admin store listing with search & sort
        │   ├── AdminUsers.jsx    # Admin user listing with filter & sort
        │   ├── ChangePassword.jsx# Authenticated password change page
        │   ├── Login.jsx         # User login form
        │   ├── OwnerDashboard.jsx# Store owner rating analytics page
        │   ├── Register.jsx      # Normal user sign-up form
        │   ├── StoreList.jsx     # Normal user store browser & rating submitter
        │   └── UserDetails.jsx   # Admin detailed view of a user/owner
        ├── services/
        │   └── api.js            # Centralized fetch client for backend endpoints
        └── utils/
            └── validators.js     # Frontend field validation and formatters
```

---

## 8. Database Design

The PostgreSQL database schema consists of three relational tables defined in `backend/db/schema.sql`:

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(60)  NOT NULL CHECK (char_length(name) BETWEEN 20 AND 60),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  address       VARCHAR(400) NOT NULL,
  role          VARCHAR(10)  NOT NULL CHECK (role IN ('admin', 'user', 'owner')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  address    VARCHAR(400) NOT NULL,
  owner_id   INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ratings (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id   INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, store_id)
);

CREATE INDEX idx_ratings_store ON ratings(store_id);
```

### Relational Rules & Constraints
1. **One-to-One Owner Constraint:** `stores.owner_id` is unique (`UNIQUE REFERENCES users(id)`), ensuring an owner can manage at most one store.
2. **One Rating Per Store Per User:** `UNIQUE (user_id, store_id)` prevents duplicate rating rows at the database level.
3. **Rating Boundaries:** Database-level `CHECK (rating BETWEEN 1 AND 5)` guarantees rating validity.
4. **Calculated Averages:** Store average ratings and dashboard metrics are computed on-the-fly (`AVG(rating)`, `COUNT(*)`) to prevent synchronization drift.

---

## 9. Authentication & Authorization

### Authentication Flow
1. **Login:** Users submit credentials to `POST /api/auth/login`. Passwords are authenticated via `bcrypt.compare`.
2. **Token Generation:** The backend signs a JWT using `JWT_SECRET` containing the user's `id` and `role`, defaulting to an 8-hour expiration.
3. **Session Persistence:** The client stores the JWT and user profile in browser `localStorage`.
4. **Subsequent Requests:** Requests supply the HTTP header: `Authorization: Bearer <token>`.

### Two-Tier Authorization Enforcement
1. **Backend Database Verification (`backend/src/middleware/auth.js`):**
   - `authenticate`: Decodes the JWT and queries `users` table to verify the user account still exists and retrieves their current `role`.
   - `authorize(...roles)`: Verifies if the verified database role matches the required role. Disallowed requests receive HTTP 403.
2. **Frontend Route Guards (`frontend/src/components/ProtectedRoute.jsx`):**
   - Blocks unauthorized views in React Router and redirects users to their appropriate role home page or `/login`.

---

## 10. API Overview

All API endpoints are prefixed with `/api`.

| Method | Path | Role Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new normal user account (`role: 'user'`). |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT + user profile. |
| `PUT` | `/api/users/password` | Authenticated (`admin`, `user`, `owner`) | Updates password for the current user session. |
| `GET` | `/api/stores` | Normal User (`user`) | Lists stores with search, sort, `overall_rating`, and user's `my_rating`. |
| `GET` | `/api/stores/:id` | Normal User (`user`) | Retrieves single store details including user rating. |
| `POST` | `/api/stores/:id/rating` | Normal User (`user`) | Submits a new 1–5 rating for a store (409 if already submitted). |
| `PUT` | `/api/stores/:id/rating` | Normal User (`user`) | Modifies an existing rating for a store (404 if no previous rating). |
| `GET` | `/api/admin/dashboard` | Administrator (`admin`) | Returns system counts: `total_users`, `total_stores`, `total_ratings`. |
| `GET` | `/api/admin/users` | Administrator (`admin`) | Retrieves users with filters (`name`, `email`, `address`, `role`) and sorting. |
| `POST` | `/api/admin/users` | Administrator (`admin`) | Creates a new user with specified role (`admin`, `user`, `owner`). |
| `GET` | `/api/admin/users/:id` | Administrator (`admin`) | Retrieves full details for a user; includes store and rating for owners. |
| `GET` | `/api/admin/stores` | Administrator (`admin`) | Retrieves stores with filters (`name`, `email`, `address`) and sorting. |
| `POST` | `/api/admin/stores` | Administrator (`admin`) | Creates a store and optionally assigns an unassigned store owner. |
| `GET` | `/api/admin/owners` | Administrator (`admin`) | Lists store owners not yet assigned to any store. |
| `GET` | `/api/owner/dashboard` | Store Owner (`owner`) | Retrieves the owner's store, aggregate rating, and raters list. |

---

## 11. Admin Features

1. **Dashboard Overview (`/admin`):** Displays real-time aggregate counts for registered users, stores, and submitted ratings.
2. **User Directory (`/admin/users`):** Displays name, email, address, and role.
   - Filters: By Name, Email, Address, and Role (Admin, Normal user, Store owner).
   - Sorting: Ascending and descending column sorts for Name, Email, Address, and Role.
3. **User Inspection (`/admin/users/:id`):** Displays full profile information. If the user is a Store Owner, displays the assigned store name, total ratings received, and average rating.
4. **User Creation (`/admin/users/new`):** Admin can create accounts for any role: Normal User, Administrator, or Store Owner.
5. **Store Directory (`/admin/stores`):** Displays store name, email, address, and live average rating. Supports search and multi-column sorting.
6. **Store Creation (`/admin/stores/new`):** Admin can register a new store and assign an existing unassigned Store Owner via a dropdown selector.
7. **Logout:** Session cleared via the navigation bar.

---

## 12. Normal User Features

1. **Sign Up (`/register`):** Public registration form with validation. Automatically assigns `role: 'user'`.
2. **Login (`/login`):** Authenticates and redirects directly to `/stores`.
3. **Store Catalog (`/stores`):**
   - Displays Store Name, Address, Overall Rating (with review count), and the user's submitted rating.
   - Shows "Not rated" when the user has not submitted a rating yet.
4. **Search & Filter:** Dual search fields for Store Name and Store Address with debounced querying.
5. **Sorting:** Sorts stores by Name, Address, or Overall Rating (ascending or descending).
6. **Rating Submission & Modification:**
   - 1 to 5 interactive button selector.
   - Dynamic action button: detects if a rating already exists to call `POST` (Submit rating) or `PUT` (Update rating).
7. **Change Password (`/change-password`):** Updates password after validating current password.
8. **Logout:** Clears session and returns to login.

---

## 13. Store Owner Features

1. **Login (`/login`):** Authenticates and redirects directly to `/owner`.
2. **Store Owner Dashboard (`/owner`):**
   - Displays assigned store name and physical address.
   - Displays aggregate average store rating (rounded to 1 decimal place).
   - Displays total number of ratings received.
3. **Reviewers Audit Table:** Lists every customer who reviewed the store, including:
   - User Full Name
   - User Email Address
   - Submitted Rating (out of 5)
   - Date of submission / last modification
4. **Change Password (`/change-password`):** Allows updating password.
5. **Logout:** Clears session and returns to login.

---

## 14. Validation Rules

Validation rules are enforced across both client and server layers (`backend/src/utils/validators.js` and `frontend/src/utils/validators.js`):

| Target Field | Rule Description | Implementation |
|---|---|---|
| **User Name** | Minimum 20 characters, Maximum 60 characters | `v.trim().length >= 20 && v.trim().length <= 60` |
| **Address** | Required, Maximum 400 characters | `v.trim().length > 0 && v.length <= 400` |
| **Password** | 8 to 16 characters, $\ge$ 1 uppercase letter, $\ge$ 1 special character | `v.length >= 8 && v.length <= 16 && /[A-Z]/.test(v) && /[^A-Za-z0-9]/.test(v)` |
| **Email** | Standard email format, max 255 chars | `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` |
| **Rating** | Integer strictly between 1 and 5 | `Number.isInteger(rating) && rating >= 1 && rating <= 5` |
| **Store Name** | 1 to 100 characters | `v.trim().length >= 1 && v.trim().length <= 100` |

---

## 15. Search, Filtering & Sorting

- **Debounced Text Filtering:** The frontend implements `useDebounce(filters, 300)` to delay backend requests until typing pauses.
- **Backend Search:** Query strings are converted to parameterized SQL using `ILIKE` via `likePattern()` which safely escapes wildcards (`%` and `_`).
- **Sorting Mechanism:** Table headers use `SortableTh` components to toggle `asc` and `desc`. The backend validates requested sort keys against a whitelist (`USER_SORT`, `STORE_SORT`, `SORT_COLUMNS`) in `backend/src/utils/query.js`, preventing SQL injection.

---

## 16. Rating System

- **Calculation Method:** Ratings are computed directly in SQL using `ROUND(AVG(r.rating), 1)::float`. Unrated stores return `NULL` and display "No ratings yet".
- **Unique Submission Constraint:** Database-level `UNIQUE (user_id, store_id)` prevents race-condition duplicates.
- **RESTful Endpoints:**
  - `POST /api/stores/:id/rating` creates a rating (returns HTTP 409 Conflict if one exists).
  - `PUT /api/stores/:id/rating` updates the existing rating (returns HTTP 404 Not Found if no rating was previously recorded).

---

## 17. Error Handling

- **Centralized Middleware:** `backend/src/middleware/errorHandler.js` catches all application exceptions.
- **Consistent Response Payload:**
  ```json
  {
    "message": "Please fix the highlighted fields.",
    "errors": ["Password must include at least one uppercase letter."]
  }
  ```
- **PostgreSQL Error Mapping:**
  - Error code `23505` (unique violation) $\rightarrow$ HTTP 409 Conflict ("This record already exists" or constraint-specific message).
  - Error code `23503` (foreign key violation) $\rightarrow$ HTTP 400 Bad Request ("A referenced record does not exist.").
- **Client Presentation:** The frontend captures response error objects and renders them cleanly in `ErrorMessage.jsx` with input field highlights.

---

## 18. Testing

### Implemented Tests
- **Database Setup & Constraint Verification:** `backend/db/setup.js` executes and tests DDL queries, foreign keys, unique constraints, and initial mock data insertion.
- **Utility & Logic Testing:** Modular design in `backend/src/utils/validators.js`, `query.js`, and `parseId.js` with pure functional separation.

### Test Limitations
- Automated test runners (such as Jest, Mocha, Vitest, or Supertest) are **not currently configured** in `backend/package.json` or `frontend/package.json`.
- Testing is currently performed via setup scripts and manual API/UI test suites.

### Recommended Manual Test Suite
1. **Registration & Constraints:**
   - Attempt registration with a 15-character name (must be rejected for $< 20$ chars).
   - Attempt registration with password lacking a special character (must be rejected).
   - Register a valid normal user (must succeed and route to `/stores`).
2. **Duplicate Prevention:**
   - Attempt registration with an existing email (must return 409 Conflict).
3. **Rating Submission:**
   - Rate a store with score 4 (button switches to "Update rating").
   - Click score 5 and submit update (confirm overall rating recalculates).
4. **Role Boundary Checks:**
   - As a normal user, attempt accessing `/admin` (redirects automatically; direct API calls to `/api/admin/users` return 403 Forbidden).
   - As a store owner, inspect `/owner` to view reviews, then attempt accessing `/admin` (redirects).

---

## 19. Environment Variables

Create a `.env` file in the `backend/` directory based on `backend/.env.example`.

| Variable | Description | Default / Example Value |
|---|---|---|
| `PORT` | Backend Express server port | `5000` |
| `DB_HOST` | PostgreSQL server hostname | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL user password | `your_postgres_password` |
| `DB_NAME` | PostgreSQL database name | `store_rating` |
| `JWT_SECRET` | Secret key for signing authentication tokens | *A long random secure string* |
| `JWT_EXPIRES_IN` | Token expiration period | `8h` |
| `CLIENT_ORIGIN` | Allowed CORS origin URL | `http://localhost:5173` |

> **Security Note:** Never commit `.env` files with production secrets to version control.

---

## 20. Installation Requirements

Ensure the following tools are installed on your machine:
- **Node.js:** v18.0.0 or later (v20+ recommended)
- **NPM:** v9.0.0 or later
- **PostgreSQL:** v14.0 or later (service running locally or accessible remotely)

---

## 21. Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell, use: `Copy-Item .env.example .env`)*
4. Open `backend/.env` and configure your PostgreSQL password (`DB_PASSWORD`) and a secure `JWT_SECRET`.

---

## 22. Database Setup

1. Create the PostgreSQL database:
   ```bash
   # Using PostgreSQL CLI
   createdb -U postgres store_rating

   # Or in psql shell:
   # CREATE DATABASE store_rating;
   ```
2. Run the schema creation and seed script:
   ```bash
   npm run db:setup
   ```
   *This command executes `backend/db/setup.js`, creating all required tables and seeding demo accounts.*

### Demo Seed Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **System Admin** | `admin@storerating.com` | `Admin@123` | Master administrator |
| **Normal User** | `rahul.sharma@example.com` | `Rahul@123` | Seed user with ratings |
| **Normal User** | `priya.iyer@example.com` | `Priya@123` | Seed user with ratings |
| **Normal User** | `amit.verma@example.com` | `Amit@1234` | Seed user with ratings |
| **Normal User** | `sneha.patil@example.com` | `Sneha@123` | Seed user with ratings |
| **Store Owner** | `owner.greenbasket@example.com` | `Owner@123` | Owner of "Green Basket Groceries" |
| **Store Owner** | `owner.booknook@example.com` | `Owner@123` | Owner of "Book Nook" |
| **Store Owner** | `owner.techhub@example.com` | `Owner@123` | Owner of "Tech Hub Electronics" |

---

## 23. Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 24. How to Run the Complete Application

### Step 1: Start the Backend Server
In the `backend/` directory terminal:
```bash
npm run dev
```
*(Starts Express API on `http://localhost:5000` with Node file watching enabled)*

### Step 2: Start the Frontend Application
In the `frontend/` directory terminal:
```bash
npm run dev
```
*(Starts Vite development server on `http://localhost:5173`)*

### Step 3: Access the Web App
Open your browser and navigate to:
```
http://localhost:5173
```
Log in using any of the demo accounts listed above.

---

## 25. Git & Repository Instructions

If preparing this repository for submission or cloning onto a new machine:

1. **Initialize Git Repository (if not already initialized):**
   ```bash
   git init
   git add .
   git commit -m "feat: complete full stack store rating application"
   ```
2. **Verify Ignored Files:**
   Confirm that `backend/.env`, `backend/node_modules`, and `frontend/node_modules` are excluded:
   ```bash
   git status
   ```
3. **Link to Remote Submission Repository:**
   ```bash
   git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
   git branch -M main
   git push -u origin main
   ```

---

## 26. Security Notes

- **Password Storage:** All passwords are salt-hashed using `bcryptjs` with 10 salt rounds prior to persistence.
- **SQL Injection Prevention:** SQL queries strictly utilize parameterized placeholders (`$1`, `$2`), avoiding raw string concatenation.
- **Order Injection Protection:** Sort parameters are validated against hardcoded column maps before inclusion in queries.
- **Input Sanitization:** Email strings are sanitized, normalized to lowercase, and trimmed.
- **Role Verification:** Critical endpoints do not rely on claims in client tokens alone; the user's role is verified against the database on each request.

---

## 27. Known Limitations & Missing Features

1. **Automated Test Suite:** The codebase does not include an automated unit or integration testing runner (e.g., Jest / Vitest / Supertest).
2. **Pagination:** Store lists and user lists retrieve all matching rows without SQL pagination (`LIMIT` / `OFFSET`).
3. **Token Storage:** The JWT is stored in browser `localStorage`. Using `httpOnly` secure cookies would provide enhanced protection against XSS vulnerabilities.
4. **Delete and Edit Operations:** The challenge specified creation and inspection for stores and users; deletion and profile editing (other than password changes) are not implemented.

---

## 28. Future Improvements

- Add end-to-end integration tests using Supertest for backend APIs and Playwright for frontend user flows.
- Implement server-side pagination with query params (`page`, `limit`).
- Transition JWT transmission to secure, same-site `httpOnly` cookies.
- Implement rate limiting (`express-rate-limit`) on authentication and rating submission endpoints.
- Add HTTP security headers via `helmet`.
- Provide store management tools allowing owners to edit their store details and address.
