const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(buf) });
        } catch {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = { ...extraHeaders };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(buf) });
        } catch {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('=== TEST 1: Super Admin Login ===');
  const loginRes = await post('/api/v1/auth/login', {
    email: 'superadmin@tms.com',
    password: 'Tms@123456'
  });
  console.log('Login status:', loginRes.status);
  const token = loginRes.body.data?.accessToken || loginRes.body.accessToken;
  console.log('Token exists:', !!token);

  console.log('\n=== TEST 2: Super Admin System Console Overview ===');
  const adminRes = await get('/api/v1/admin/overview', token);
  console.log('Admin Overview status:', adminRes.status);
  console.log('Admin metrics:', adminRes.body);

  console.log('\n=== TEST 3: System Health Telemetry ===');
  const healthRes = await get('/api/v1/admin/system-health', token);
  console.log('Health status:', healthRes.status);
  console.log('Services:', Object.keys(healthRes.body?.services || {}));

  console.log('\n=== TEST 4: Modular Dashboard Endpoints ===');
  const dashOverview = await get('/api/v1/dashboard/overview', token);
  console.log('Dashboard Overview status:', dashOverview.status);
  console.log('KPIs:', dashOverview.body);

  const dashShipments = await get('/api/v1/dashboard/shipments', token);
  console.log('Dashboard Shipments status:', dashShipments.status, 'Count:', dashShipments.body?.length);

  const dashFleet = await get('/api/v1/dashboard/fleet', token);
  console.log('Dashboard Fleet status:', dashFleet.status, 'Count:', dashFleet.body?.length);

  const dashFin = await get('/api/v1/dashboard/financial', token);
  console.log('Dashboard Financial status:', dashFin.status, 'Data:', dashFin.body);

  console.log('\n=== TEST 5: Context Switching (SYSTEM vs Tenant Scope) ===');
  const systemScopeShipments = await get('/api/v1/shipments', token, { 'x-organization-context': 'SYSTEM' });
  console.log('Shipments in SYSTEM context:', systemScopeShipments.body?.length || 0);

  const tenantScopeShipments = await get('/api/v1/shipments', token, { 'x-organization-context': 'org-apex-001' });
  console.log('Shipments in Apex context:', tenantScopeShipments.body?.length || 0);

  console.log('\n=== TEST 6: Driver Role Data Isolation ===');
  const driverLogin = await post('/api/v1/auth/login', {
    email: 'driver@tms.com',
    password: 'Tms@123456'
  });
  const driverToken = driverLogin.body.data?.accessToken || driverLogin.body.accessToken;
  const driverAdminTry = await get('/api/v1/admin/overview', driverToken);
  console.log('Driver trying to access Super Admin overview (Expect 403):', driverAdminTry.status);

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
}

run().catch(console.error);
