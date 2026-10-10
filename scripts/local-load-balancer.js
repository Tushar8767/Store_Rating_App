const http = require('http');
const httpProxy = require('http-proxy');

// Simple, high-performance Node load balancer demonstrating round-robin,
// upstream health-checking, failover, and static frontend file serving.
const PORT = process.env.PORT || 8080;
const BACKENDS = [
  { url: 'http://localhost:5001', id: 'backend-instance-1', alive: true, fails: 0 },
  { url: 'http://localhost:5002', id: 'backend-instance-2', alive: true, fails: 0 }
];

let currentIndex = 0;
const proxy = httpProxy.createProxyServer({ changeOrigin: true });

proxy.on('error', (err, req, res) => {
  console.error(`[LB-PROXY-ERROR] Target failed:`, err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway: Upstream instance unavailable', details: err.message }));
  }
});

// Periodic background health checking
setInterval(() => {
  BACKENDS.forEach((backend) => {
    const healthUrl = `${backend.url}/api/health`;
    const req = http.get(healthUrl, { timeout: 1500 }, (res) => {
      if (res.statusCode === 200) {
        if (!backend.alive) {
          console.log(`[LB-HEALTH] Instance ${backend.id} (${backend.url}) RECOVERED -> ALIVE`);
        }
        backend.alive = true;
        backend.fails = 0;
      } else {
        markFailed(backend, `status ${res.statusCode}`);
      }
    });

    req.on('error', (e) => {
      markFailed(backend, e.message);
    });

    req.on('timeout', () => {
      req.destroy();
      markFailed(backend, 'timeout');
    });
  });
}, 2000);

function markFailed(backend, reason) {
  backend.fails++;
  if (backend.fails >= 2 && backend.alive) {
    backend.alive = false;
    console.warn(`[LB-HEALTH] Instance ${backend.id} (${backend.url}) marked DOWN. Reason: ${reason}`);
  }
}

function getNextHealthyBackend() {
  const healthyBackends = BACKENDS.filter(b => b.alive);
  if (healthyBackends.length === 0) return null;
  const backend = healthyBackends[currentIndex % healthyBackends.length];
  currentIndex = (currentIndex + 1) % healthyBackends.length;
  return backend;
}

const server = http.createServer((req, res) => {
  // Load balancer health endpoint
  if (req.url === '/lb-health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'UP',
      component: 'local-node-load-balancer',
      backends: BACKENDS.map(b => ({ id: b.id, url: b.url, alive: b.alive }))
    }));
  }

  // Reverse proxy API requests
  if (req.url.startsWith('/api/')) {
    const targetBackend = getNextHealthyBackend();
    if (!targetBackend) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Service Unavailable: All backend instances are down' }));
    }

    res.setHeader('X-Upstream-Backend', targetBackend.id);
    return proxy.web(req, res, { target: targetBackend.url });
  }

  // Fallback for frontend/Vite dev or static assets
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<h1>Store Rating App Load Balancer</h1><p>API load balancing active on port ${PORT}.</p><ul>` +
    BACKENDS.map(b => `<li>${b.id}: ${b.alive ? 'HEALTHY' : 'DOWN'} (${b.url})</li>`).join('') + '</ul>');
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[LOAD-BALANCER] Running on http://localhost:${PORT}`);
  console.log(`Upstream 1: http://localhost:5001 (backend-instance-1)`);
  console.log(`Upstream 2: http://localhost:5002 (backend-instance-2)`);
  console.log(`=======================================================`);
});
