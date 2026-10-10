# Viva Voce Questions & Answers: DevOps & High Availability

**Course:** DevOps (Academic Year 2026–2027)  
**Student:** Tushar Chaugule (Roll No: 4148, RBT: RBT23CS051)  
**College:** JSPM's RSCOE | **Faculty:** Prof. Neha Jain  

---

### Q1: What is High Availability (HA) in cloud and system design?
**Answer:** High Availability is a system design approach that ensures an agreed level of operational performance and uptime, even when components (such as an application server or container) fail. In this project, HA is achieved at the application tier by deploying multiple redundant Express instances behind an Nginx reverse proxy so that if one instance crashes, incoming requests automatically fail over to the surviving instance without service interruption.

### Q2: What is the role of Nginx in this project?
**Answer:** Nginx acts as a reverse proxy and load balancer. It acts as the single public gateway (Port 8080) for all client requests. It proxies static frontend requests to the React application container and load balances dynamic API requests (`/api/*`) across backend instances using a round-robin algorithm with upstream health failure detection.

### Q3: How does Nginx detect when a backend instance is down?
**Answer:** In `nginx/nginx.conf`, the upstream servers are configured with `max_fails=2` and `fail_timeout=5s`, alongside `proxy_next_upstream error timeout http_502 http_503`. When Nginx receives connection errors or 50x responses from a target instance twice, it temporarily removes it from rotation for 5 seconds and transparently re-routes in-flight requests to another healthy backend.

### Q4: Why is containerization using Docker beneficial for DevOps?
**Answer:** Docker packages an application along with all its runtime dependencies, system libraries, configuration, and environment variables into an immutable container image. This eliminates the "works on my machine" problem, guarantees consistent behavior across local development and production environments, and simplifies deployment.

### Q5: What is Docker Compose and why is it used here?
**Answer:** Docker Compose is a tool for defining and running multi-container Docker applications using a single YAML file (`docker-compose.yml`). In our project, it coordinates the startup order, networking, environment variables, healthchecks, and volumes for five components: PostgreSQL, `backend-1`, `backend-2`, `frontend`, and Nginx.

### Q6: How does JWT authentication support High Availability?
**Answer:** JSON Web Tokens (JWT) are stateless. Because authentication tokens are cryptographically signed with a secret key and contain the user ID and role, server instances do not need to store session data in local RAM. Either backend instance can independently verify and accept any valid token signed with the shared `JWT_SECRET`, allowing seamless load balancing and failover across instances.

### Q7: What is the purpose of the `/api/health` endpoint?
**Answer:** The health endpoint provides real-time visibility into the operational state of a specific backend instance. It verifies database connectivity (`SELECT 1`), reports process uptime, memory consumption, and returns the unique `instanceId`. This allows Docker healthchecks, Nginx, or external monitoring systems to determine if the container is ready to accept traffic.

### Q8: What does CI/CD mean, and how is it implemented in your project?
**Answer:** CI (Continuous Integration) is the automated practice of building and testing code changes on every commit. CD (Continuous Delivery/Deployment) is the automated release of verified software. In this project, Continuous Integration is implemented using GitHub Actions (`.github/workflows/ci.yml`), which automatically boots a PostgreSQL service container, runs the backend test suite, builds the React frontend, and verifies Docker image builds on every push.

### Q9: What happens if the PostgreSQL database fails in this architecture?
**Answer:** In this local mini-project, PostgreSQL represents a **Single Point of Failure (SPOF)**. Because both backend instances connect to a single database container, a database failure would prevent both backends from functioning. In a production cloud system, database high availability is achieved using managed Multi-AZ deployments with automated failover and synchronous read/write replicas (e.g., AWS RDS Multi-AZ or Aurora).

### Q10: How can we scale the backend services in Docker Compose?
**Answer:** Using the command `docker compose up -d --scale backend-1=2`. However, in setups with static Nginx upstream IP/DNS mappings, dynamic scaling requires either DNS round-robin, dynamic reverse proxy reloaders (like Traefik or Nginx with Docker socket listeners), or a container orchestrator like Kubernetes.

### Q11: Why is multi-stage building used in the frontend Dockerfile?
**Answer:** A multi-stage Docker build uses Node.js in the first stage to compile and build the static React assets (`npm run build`), and then copies only the resulting compiled `dist/` directory into a lightweight Nginx Alpine container for the second stage. This keeps the production container image tiny (under 25MB) and removes unnecessary compilers and dev tools from production.

### Q12: How are database credentials and secrets managed securely?
**Answer:** Secrets are never hardcoded in source control. They are parameterized using environment variables (`.env`), documented safely in `.env.example`, and loaded into containers via Docker Compose. The `.env` file is explicitly ignored in both `.gitignore` and `.dockerignore`.

### Q13: What is the difference between vertical scaling and horizontal scaling?
**Answer:** 
- **Vertical Scaling (Scale Up):** Adding more CPU, RAM, or storage to a single server instance.
- **Horizontal Scaling (Scale Out):** Adding more server instances to distribute load across a cluster. High availability relies primarily on horizontal scaling to eliminate single points of failure.

### Q14: What metrics are exposed by the backend for Prometheus?
**Answer:** The `/api/metrics` endpoint exposes runtime metrics in standard Prometheus exposition format:
- `app_uptime_seconds`: Total runtime of the Node process in seconds.
- `app_memory_rss_bytes`: Resident Set Size memory allocation.
- `app_memory_heap_used_bytes`: V8 engine heap memory utilized by the application.

### Q15: What is the difference between local Docker High Availability and Cloud High Availability?
**Answer:** Local Docker Compose provides process-level and container-level redundancy on a single host. If the physical computer shuts down or loses power, all containers terminate. True Cloud High Availability distributes redundant instances across physically separate data centers (Availability Zones) with redundant power, cooling, and internet links, ensuring the system survives geographic or hardware disasters.
