# System Architecture: Highly Available Store Rating Application

**Assignment:** DevOps TA2 Mini-Project  
**Topic:** Cloud-Based Highly Available Application — An application should remain available even if one application server fails  
**Student:** Tushar Chaugule (Roll No: 4148, RBT: RBT23CS051)  
**College:** JSPM's RSCOE | **Faculty:** Prof. Neha Jain  
**Academic Year:** 2026–2027  

---

## 1. Architectural Overview

The application is structured into four distinct, decoupled tiers to demonstrate **High Availability (HA)**, **Fault Tolerance**, **Load Balancing**, and **Stateless Scalability**:

1. **Client / Presentation Layer:** Web browser accessing the application through a single reverse proxy entrypoint on port `8080`.
2. **Reverse Proxy & Load Balancing Layer (Nginx):** Receives all client traffic, serves static frontend assets or proxies to frontend container, and load balances API calls across healthy backend instances using Round-Robin with active connection failure detection (`max_fails=2`, `fail_timeout=5s`, `proxy_next_upstream`).
3. **Application Layer (Redundant Express Backends):**
   - `backend-1` (Port 5000 inside container / Port 5001 local)
   - `backend-2` (Port 5000 inside container / Port 5002 local)
   - Both backends are identical stateless Express.js instances that share the same JWT signing secret and database credentials.
   - Each backend provides `/api/health` and `/api/metrics` endpoints that expose its unique container/host identifier (`instanceId`) and real-time database connectivity status.
4. **Data Layer (PostgreSQL):** A single source of truth database with persistent volume storage (`pgdata`), relational constraints, and automatic migration/seeding.

---

## 2. High Availability Architecture Diagram

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

## 3. High Availability & Fault Tolerance Mechanism

### 3.1 Statelessness & Session Redundancy
Because the application uses cryptographically signed **JSON Web Tokens (JWT)**:
- Client authentication state is not retained in container memory or local sticky sessions.
- An authentication token issued by `backend-1` is immediately valid on `backend-2` because both instances share the identical `JWT_SECRET`.
- When an in-flight request fails due to `backend-1` crashing, Nginx transparently re-routes the user request to `backend-2` with zero session loss.

### 3.2 Upstream Failover Configuration (Nginx)
The Nginx configuration implements rapid failure detection:
```nginx
upstream backend_servers {
    server backend-1:5000 max_fails=2 fail_timeout=5s;
    server backend-2:5000 max_fails=2 fail_timeout=5s;
}

location /api/ {
    proxy_pass http://backend_servers/api/;
    proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    proxy_next_upstream_tries 3;
    proxy_next_upstream_timeout 5s;
    proxy_connect_timeout 2s;
}
```
- If an instance fails to respond within 2 seconds or returns a 50x error, Nginx routes the request to the alternate instance.
- After 2 failed attempts, the faulty instance is temporarily evicted from the load balancing pool for 5 seconds.
- Once the instance recovers and begins answering requests, it is seamlessly restored to the pool.

---

## 4. Single Point of Failure (SPOF) Analysis & Real-World Cloud Comparison

| Architectural Layer | Local DevOps Mini-Project (Compose) | Production Cloud Equivalent (AWS / Azure / GCP) |
|---|---|---|
| **Reverse Proxy / Load Balancer** | Single container (`store-rating-nginx`) on host port 8080 | Cloud Load Balancer (AWS ALB / GCP Cloud Load Balancing) across multiple Availability Zones with Anycast IP |
| **Application Layer** | 2 containers on single host (`backend-1`, `backend-2`) | Auto Scaling Group (EC2 / ECS / Kubernetes Pods) distributed across at least 2 Availability Zones |
| **Database Layer** | Single PostgreSQL instance (`store-rating-db`) with local volume | Managed High-Availability Multi-AZ Database (AWS Aurora / RDS Multi-AZ) with synchronous standby replica and automated failover |
| **Physical Host / Infrastructure** | Single physical laptop / developer workstation | Multi-Region or Multi-Zone cloud data centers with independent power grids and networking |

> **Conclusion for College Viva:**  
> The local deployment demonstrates **application-tier high availability and automated failover**. In production cloud systems, high availability must be extended to the database tier (via multi-AZ replication) and DNS/Load Balancer tier to survive complete data center outages.
