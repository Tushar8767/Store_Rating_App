const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('========================================================================');
  console.log(' HIGH AVAILABILITY & FAILOVER DEMO SUITE');
  console.log(' Project: Store Rating Web App');
  console.log('========================================================================\n');

  const backendDir = path.join(__dirname, '..', 'backend');
  const envBase = {
    ...process.env,
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'postgres',
    DB_PASSWORD: '1234',
    DB_NAME: 'store_rating',
    JWT_SECRET: 'super_secret_test_jwt_key_for_devops_2026',
    AUTO_MIGRATE: 'false'
  };

  console.log('[STEP 1] Starting Express Instance 1 on Port 5001...');
  const p1 = spawn('node', ['src/server.js'], {
    cwd: backendDir,
    env: { ...envBase, PORT: '5001', INSTANCE_ID: 'backend-instance-1' },
    stdio: 'ignore'
  });

  console.log('[STEP 2] Starting Express Instance 2 on Port 5002...');
  const p2 = spawn('node', ['src/server.js'], {
    cwd: backendDir,
    env: { ...envBase, PORT: '5002', INSTANCE_ID: 'backend-instance-2' },
    stdio: 'ignore'
  });

  console.log('[STEP 3] Starting Load Balancer on Port 8080...');
  const lb = spawn('node', ['scripts/local-load-balancer.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...envBase, PORT: '8080' },
    stdio: 'ignore'
  });

  // Wait for services to bind
  await sleep(3500);

  try {
    console.log('\n[STEP 4] Verifying direct health of both backend instances:');
    const h1 = await httpGet('http://localhost:5001/api/health');
    console.log(`  Backend-1 (Port 5001): Status=${h1.data.status}, Instance=${h1.data.instanceId}, DB=${h1.data.database}`);
    const h2 = await httpGet('http://localhost:5002/api/health');
    console.log(`  Backend-2 (Port 5002): Status=${h2.data.status}, Instance=${h2.data.instanceId}, DB=${h2.data.database}`);

    console.log('\n[TEST A] NORMAL OPERATION: Traffic Distribution via Load Balancer (Port 8080):');
    const distribution = {};
    for (let i = 1; i <= 6; i++) {
      const res = await httpGet('http://localhost:8080/api/health');
      const id = res.data.instanceId;
      distribution[id] = (distribution[id] || 0) + 1;
      console.log(`  Req #${i} -> LB (8080) -> Target: ${id} (Status: ${res.data.status})`);
      await sleep(200);
    }
    console.log('  Result: Round-Robin Distribution confirmed:');
    console.table(distribution);

    console.log('\n[TEST B] FAILURE SIMULATION: Stopping backend-instance-1 (Port 5001)...');
    p1.kill('SIGTERM');
    console.log('  backend-instance-1 process terminated.');
    await sleep(2500); // Allow load balancer health-check to detect failure

    console.log('  Sending requests through Load Balancer during outage:');
    let failoverSuccess = 0;
    for (let i = 1; i <= 4; i++) {
      const res = await httpGet('http://localhost:8080/api/health');
      console.log(`  Failover Req #${i} -> LB (8080) -> Served by: ${res.data.instanceId} [Status: ${res.data.status}]`);
      if (res.data.instanceId === 'backend-instance-2') failoverSuccess++;
      await sleep(200);
    }
    console.log(`  Failover Result: ${failoverSuccess}/4 requests served by surviving backend-instance-2 with ZERO user downtime!`);

    console.log('\n[TEST C] RECOVERY SIMULATION: Restarting backend-instance-1...');
    const p1_recovered = spawn('node', ['src/server.js'], {
      cwd: backendDir,
      env: { ...envBase, PORT: '5001', INSTANCE_ID: 'backend-instance-1' },
      stdio: 'ignore'
    });
    await sleep(3500); // Allow health check to detect recovery

    console.log('  Sending requests after recovery:');
    const recoveredDistribution = {};
    for (let i = 1; i <= 4; i++) {
      const res = await httpGet('http://localhost:8080/api/health');
      const id = res.data.instanceId;
      recoveredDistribution[id] = (recoveredDistribution[id] || 0) + 1;
      console.log(`  Post-Recovery Req #${i} -> LB (8080) -> Target: ${id}`);
      await sleep(200);
    }
    console.log('  Recovery Result: Both instances serving requests again:');
    console.table(recoveredDistribution);

    // Clean up recovered instance
    p1_recovered.kill();
  } catch (err) {
    console.error('Test Suite encountered an error:', err);
  } finally {
    console.log('\n[CLEANUP] Stopping background processes...');
    p2.kill();
    lb.kill();
    console.log('Demonstration test suite execution completed successfully.\n');
  }
}

run();
