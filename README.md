# Store Rating Application — DevOps & High Availability Upgrade

A full-stack, containerized store rating platform upgraded for the **DevOps**:  
**“Cloud-Based Highly Available Application — An application should remain available even if one application server fails.”**

---

---

## 1. Project & DevOps Overview

The **Store Rating Web Application** allows:
- **Normal Users** to register, log in, browse registered stores, and submit/modify 1–5 star ratings.
- **Store Owners** to inspect average customer sentiment, ratings, and a breakdown of reviewing users.
- **System Administrators** to manage users, add stores, and monitor overall system metrics.

### DevOps Upgrade Features
- **High Availability (HA):** Two redundant Express.js API instances (`backend-1` and `backend-2`) behind an Nginx reverse proxy load balancer on port `8080`.
- **Automatic Upstream Failover:** Nginx detects failed backend instances within seconds and routes requests to surviving instances with **zero user downtime**.
- **Stateless Authentication:** Stateless JSON Web Tokens (JWT) signed with a shared key allow seamless request distribution across any backend instance.
- **Health Checks & Monitoring:** `/api/health` reports status, database connectivity, and instance identity; `/api/metrics` exports Prometheus metrics.
- **Continuous Integration (CI):** GitHub Actions workflow (`.github/workflows/ci.yml`) runs tests against an ephemeral PostgreSQL service container, builds the React frontend, and verifies Docker builds.
- **Automated Testing:** 14 automated tests covering health endpoints, authentication, validations, and role-based authorization (`npm test`).

---

## 2. High Availability Architecture

```
                              [ Web Client / Browser ]
                                         │
                                         ▼ HTTP Port 8080
                    ┌───────────────────────────────────────────┐
                    │      Nginx Reverse Proxy & Load Balancer   │
                    │      (store-rating-nginx / Port 8080)     │
                    └─────────────────────┬─────────────────────┘
                                          │
                     ┌────────────────────┴───────────────────┐
                     │ (Static App)                           │ (/api/* API Requests)
                     ▼                                        ▼ Round-Robin & Failover
        ┌─────────────────────────┐               ┌───────────────────────────────┐
        │  React Frontend Server  │               │      Nginx Upstream Pool      │
        │ (store-rating-frontend) │               │   backend_servers (5000)      │
        └─────────────────────────┘               └───────┬───────────────┬───────┘
                                                          │               │
                                           ┌──────────────┘               └──────────────┐
                                           ▼                                             ▼
                             ┌───────────────────────────┐                 ┌───────────────────────────┐
                             │  Express API Instance 1   │                 │  Express API Instance 2   │
                             │ (store-rating-backend-1)  │                 │ (store-rating-backend-2)  │
                             │   Identity: backend-1     │                 │   Identity: backend-2     │
                             │   Health: /api/health     │                 │   Health: /api/health     │
                             │   Metrics: /api/metrics   │                 │   Metrics: /api/metrics   │
                             └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                                           │                                             │
                                           │       Shared Relational Queries             │
                                           └──────────────────────┬──────────────────────┘
                                                                  ▼
                                                   ┌───────────────────────────┐
                                                   │    PostgreSQL Database    │
                                                   │    (store-rating-db)      │
                                                   │    Port: 5432 (Internal)  │
                                                   │    Volume: pgdata         │
                                                   └───────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend:** React 18, Vite 5, React Router v6, Pure CSS.
- **Backend:** Node.js 20, Express 4, `pg` connection pool, `bcryptjs`, `jsonwebtoken`.
- **Database:** PostgreSQL 16 with persistent volume and relational integrity constraints.
- **Reverse Proxy & Load Balancer:** Nginx Alpine (Reverse proxy, failover, round-robin).
- **Container Orchestration:** Docker & Docker Compose v2.
- **CI/CD:** GitHub Actions.
- **Testing:** Node.js native test runner (`node --test`), Supertest.

---

## 4. Quick Start: How to Run the Project

### Option A: Using Docker Compose (Standard DevOps Deployment)

1. **Clone the repository and enter the directory:**
   ```bash
   git clone https://github.com/Tushar8767/Store_Rating_App.git
   cd Store_Rating_App
   ```

2. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Build and start all 5 containers in detached mode:**
   ```bash
   docker compose up --build -d
   ```

4. **Verify container health:**
   ```bash
   docker compose ps
   ```

5. **Access the application:**
   - **Frontend & Web Application:** `http://localhost:8080`
   - **Load Balancer Health:** `http://localhost:8080/lb-health`
   - **API Health:** `http://localhost:8080/api/health`

---

### Option B: Native Node.js & Local PostgreSQL (Host Environment)

If Docker is not running or during local development:

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Run database setup:**
   ```bash
   cd backend
   npm run db:setup
   ```

3. **Run the Automated High Availability Demonstration Suite:**
   ```powershell
   node scripts/run-ha-test.js
   ```
   *This starts two backend instances (ports 5001 & 5002), starts the local load balancer (port 8080), verifies round-robin traffic, simulates an instance failure, verifies failover to the surviving backend, and tests recovery.*

---

## 5. Demo Credentials

The database is pre-seeded with accounts for all roles:

| Role | Email | Password | Access Details |
|---|---|---|---|
| **System Administrator** | `admin@storerating.com` | `Admin@123` | Master admin dashboard, user/store management |
| **Normal User** | `rahul.sharma@example.com` | `Rahul@123` | Browses stores, rates 1–5, modifies ratings |
| **Normal User** | `priya.iyer@example.com` | `Priya@123` | Regular customer account |
| **Store Owner** | `owner.greenbasket@example.com` | `Owner@123` | Owner dashboard for "Green Basket Groceries" |
| **Store Owner** | `owner.booknook@example.com` | `Owner@123` | Owner dashboard for "Book Nook" |

---

## 6. High Availability & Failover Verification Steps

### 1. Verify Application & Architecture
- Open `http://localhost:8080` in the browser.
- Log in as Normal User (`rahul.sharma@example.com` / `Rahul@123`) $\rightarrow$ browse stores, submit a rating.
- Log in as Admin (`admin@storerating.com` / `Admin@123`) $\rightarrow$ inspect dashboard metrics and user directory.
- Review the decoupled 4-tier architecture (`ARCHITECTURE.md`).

### 2. Verify Round-Robin Load Balancing
- Query the load balancer multiple times:
  ```bash
  curl http://localhost:8080/api/health
  ```
- Notice how the returned `instanceId` alternates between `backend-1` and `backend-2`.

### 3. Simulate Instance Failure & Failover
- Stop `backend-1`:
  ```bash
  docker compose stop backend-1
  ```
  *(Or stop instance 1 in the local test script)*
- Send requests to `http://localhost:8080/api/health` again:
  - Requests are immediately served by `backend-2` with **zero errors**.
  - The frontend continues working seamlessly.

### 4. Verify Instance Recovery
- Restart `backend-1`:
  ```bash
  docker compose start backend-1
  ```
- Send requests again $\rightarrow$ traffic resumes balancing across both instances.

### 5. Automated Tests & CI/CD
- Run `npm test` inside `backend/` $\rightarrow$ all 14 tests pass.
- See `.github/workflows/ci.yml` for automated testing and container build validation on GitHub.

---

## 7. Scaling the Backend

To scale the backend instances with Docker Compose:
```bash
docker compose up -d --scale backend-1=2
```
*Note: Because Nginx uses static upstream names (`backend-1` and `backend-2`), dynamic scaling beyond the defined upstream targets requires dynamic proxy reloaders (e.g. Traefik) or Kubernetes. See `ARCHITECTURE.md` for a full explanation.*

---

## 8. Viewing Logs & Resource Monitoring

- **View combined logs:**
  ```bash
  docker compose logs -f
  ```
- **View Nginx access & upstream distribution logs:**
  ```bash
  docker compose logs -f nginx
  ```
- **Monitor container CPU & Memory usage in real time:**
  ```bash
  docker stats
  ```
- **Prometheus Metrics Endpoint:**
  ```bash
  curl http://localhost:8080/api/metrics
  ```

---

## 9. Project Documentation Files

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — Comprehensive architectural analysis and Single Point of Failure (SPOF) discussion.
- [`TEST-RESULTS.md`](TEST-RESULTS.md) — Test procedures, expected results, and verified test outputs.
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) — Diagnostic and resolution guide for common deployment errors.
