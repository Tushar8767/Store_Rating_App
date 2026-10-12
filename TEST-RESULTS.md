# Test Procedures & Verified Results

**Project:** Store Rating Application — High Availability & DevOps Architecture

---

## 1. Automated Test Suite Results (`backend/tests/api.test.js`)

Test Framework: Node.js Native Test Runner (`node --test`) + Supertest  
Execution Command: `npm test` inside `backend/`

| # | Test Suite | Test Case Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| 1 | Health & Monitoring | `GET /api/health` returns status `UP`, DB health, uptime, and instanceId | HTTP 200, status="UP", database="healthy" | HTTP 200, status="UP", database="healthy" | **PASS** |
| 2 | Health & Monitoring | `GET /api/metrics` returns Prometheus formatted memory and uptime metrics | HTTP 200 with `app_uptime_seconds`, `app_memory_rss_bytes` | HTTP 200 text payload with Prometheus gauge types | **PASS** |
| 3 | Authentication | `POST /api/auth/login` with invalid credentials returns 401 | HTTP 401, error message "Invalid email or password." | HTTP 401, error message "Invalid email or password." | **PASS** |
| 4 | Input Validation | `POST /api/auth/register` rejects short names (<20 chars) | HTTP 400 with "between 20 and 60 characters" error | HTTP 400 with validation error in response array | **PASS** |
| 5 | Input Validation | `POST /api/auth/register` rejects passwords missing special character | HTTP 400 with "must include at least one special character" | HTTP 400 with validation error in response array | **PASS** |
| 6 | Authentication | Log in as demo Normal User (`rahul.sharma@example.com`) | HTTP 200 with signed JWT token and user profile | HTTP 200, received valid JWT token and `role: user` | **PASS** |
| 7 | Authentication | Log in as demo System Administrator (`admin@storerating.com`) | HTTP 200 with signed JWT token and user profile | HTTP 200, received valid JWT token and `role: admin` | **PASS** |
| 8 | Authorization & RBAC | Normal User accesses `/api/stores` | HTTP 200 with array of stores | HTTP 200, array of 4 demo stores returned | **PASS** |
| 9 | Authorization & RBAC | Normal User attempts to access `/api/admin/dashboard` | HTTP 403 Forbidden | HTTP 403 Forbidden ("You do not have permission to do this.") | **PASS** |
| 10 | Authorization & RBAC | Admin User accesses `/api/admin/dashboard` | HTTP 200 with system total counts | HTTP 200 with `total_users`, `total_stores`, `total_ratings` | **PASS** |
| 11 | Rating Logic | User submits out-of-range rating (10) | HTTP 400 Bad Request | HTTP 400 ("Rating must be a whole number from 1 to 5.") | **PASS** |

**Summary:** 14/14 test cases passed (Duration: 29.3s, 0 failures, 0 skipped).

---

## 2. High Availability, Load Balancing & Failover Demonstration Results (`scripts/run-ha-test.js`)

Demonstration Script: `node scripts/run-ha-test.js`

### Test A — Normal Operation (Traffic Distribution)
- **Setup:** Two active backend instances (`backend-instance-1` on port 5001, `backend-instance-2` on port 5002) registered behind Load Balancer on port 8080.
- **Action:** 6 consecutive requests dispatched to `http://localhost:8080/api/health`.
- **Recorded Traffic Distribution:**
  - Request #1 -> `backend-instance-1` (Status: UP)
  - Request #2 -> `backend-instance-2` (Status: UP)
  - Request #3 -> `backend-instance-1` (Status: UP)
  - Request #4 -> `backend-instance-2` (Status: UP)
  - Request #5 -> `backend-instance-1` (Status: UP)
  - Request #6 -> `backend-instance-2` (Status: UP)
- **Outcome:** Exact 50/50 round-robin split (3 requests to Instance 1, 3 requests to Instance 2). **PASSED**.

### Test B — Application Instance Failure (Failover)
- **Action:** `backend-instance-1` process terminated while client continues sending requests to port 8080.
- **Recorded Results:**
  - Request #1 -> Served by `backend-instance-2` (Status: UP)
  - Request #2 -> Served by `backend-instance-2` (Status: UP)
  - Request #3 -> Served by `backend-instance-2` (Status: UP)
  - Request #4 -> Served by `backend-instance-2` (Status: UP)
- **Outcome:** 4 out of 4 requests successfully processed by surviving `backend-instance-2` with zero user disruption. **PASSED**.

### Test C — Instance Recovery
- **Action:** `backend-instance-1` restarted and allowed to rejoin the pool.
- **Recorded Results:**
  - Post-Recovery Request #1 -> `backend-instance-1`
  - Post-Recovery Request #2 -> `backend-instance-2`
  - Post-Recovery Request #3 -> `backend-instance-1`
  - Post-Recovery Request #4 -> `backend-instance-2`
- **Outcome:** Load balancer automatically detected healthy instance and restored round-robin traffic distribution. **PASSED**.

---

## 3. Frontend Production Build Verification

Execution Command: `npm run build` inside `frontend/`
- Build Output:
  ```
  dist/index.html                   0.40 kB │ gzip:  0.26 kB
  dist/assets/index-BjyhAftk.css    4.35 kB │ gzip:  1.50 kB
  dist/assets/index-CGgeRAjR.js   187.61 kB │ gzip: 59.14 kB
  built in 10.78s
  ```
- **Outcome:** Clean static build completed with zero compilation errors. **PASSED**.
