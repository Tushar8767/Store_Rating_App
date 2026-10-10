# Troubleshooting Guide

Common issues, diagnostic commands, and recovery procedures for the Store Rating DevOps Mini-Project.

---

## 1. Port Conflicts (Port 8080 or Port 5000 Already in Use)

**Symptom:**
`Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use`

**Cause:**
Another web server, proxy, or background service (e.g., Tomcat, Jenkins, another Nginx instance) is using port 8080 or 5000.

**Solution:**
1. Check what process is listening on the port:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess
   ```
2. Stop the conflicting process or change the port mapping in `docker-compose.yml`:
   ```yaml
   ports:
     - "8081:80"  # Map host port 8081 to container port 80
   ```

---

## 2. PostgreSQL Connection Failure ("Connection Refused" or "Password Authentication Failed")

**Symptom:**
`error: password authentication failed for user "postgres"` or `ECONNREFUSED 127.0.0.1:5432`

**Diagnostics:**
1. Ensure the PostgreSQL service/container is running:
   ```bash
   docker compose ps postgres
   ```
2. Verify credentials in `.env` match `docker-compose.yml`.
3. In local Node mode, verify your Windows PostgreSQL service is started:
   ```powershell
   Get-Service -Name *postgres*
   Start-Service postgresql-x64-17
   ```

---

## 3. Nginx Returns HTTP 502 Bad Gateway

**Symptom:**
Browser displays `502 Bad Gateway` when accessing `/api/stores`.

**Cause:**
Nginx cannot reach either backend instance (`backend-1` or `backend-2`), or both instances are still starting up or have crashed.

**Diagnostics:**
1. Check Nginx error logs:
   ```bash
   docker compose logs nginx
   ```
2. Check backend container health:
   ```bash
   docker compose ps
   docker compose logs backend-1
   docker compose logs backend-2
   ```
3. Test health endpoints directly:
   ```bash
   curl http://localhost:8080/lb-health
   ```

---

## 4. Frontend Fails to Communicate with API (CORS Errors)

**Symptom:**
Browser developer console shows: `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource`.

**Cause:**
Browser origin header does not match backend `CLIENT_ORIGIN` environment variable.

**Solution:**
In `backend/src/app.js`, CORS is configured to accept origins from port 5173 (Vite dev) and port 8080 (Nginx reverse proxy). Ensure requests go through the unified reverse proxy:
```
http://localhost:8080
```
This ensures the frontend and backend share the same origin, eliminating CORS issues entirely.

---

## 5. Docker Desktop Not Running on Windows

**Symptom:**
`docker: The term 'docker' is not recognized` or `error during connect: This error may indicate that the docker daemon is not running.`

**Solution:**
1. Open Docker Desktop from the Windows Start menu.
2. Wait for the Docker whale icon to show "Docker Desktop is running".
3. If Docker Desktop is unavailable, use the native Node.js demonstration script:
   ```powershell
   node scripts/run-ha-test.js
   ```
   This executes the high-availability failover demonstration natively on your machine without requiring Docker.

---

## 6. How to Completely Reset & Rebuild the Containers

To reset database state and start with a fresh installation:
```bash
# Stop and remove containers, networks, and persistent volumes
docker compose down -v

# Rebuild images without cache and start in detached mode
docker compose up --build -d

# Check startup status
docker compose ps
```
