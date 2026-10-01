const http = require('http');

function post(path, body) {
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
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
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

async function verifyAll() {
  const loginRes = await post('/api/v1/auth/login', {
    email: 'superadmin@tms.com',
    password: 'Tms@123456'
  });
  const token = loginRes.body.data.accessToken;

  const endpoints = [
    '/api/v1/organizations',
    '/api/v1/users',
    '/api/v1/orders',
    '/api/v1/shipments',
    '/api/v1/vehicles',
    '/api/v1/drivers',
    '/api/v1/customers',
    '/api/v1/carriers',
    '/api/v1/dispatch',
    '/api/v1/billing/invoices',
    '/api/v1/billing/claims',
    '/api/v1/documents',
    '/api/v1/audit-logs',
    '/api/v1/notifications',
  ];

  console.log('--- Verifying All Modules on Pure Sequelize ORM ---');
  for (const ep of endpoints) {
    const res = await get(ep, token);
    const count = Array.isArray(res.body?.data) ? res.body.data.length : (Array.isArray(res.body) ? res.body.length : (res.body ? 1 : 0));
    console.log(`Endpoint: ${ep.padEnd(28)} Status: ${res.status} | Records: ${count}`);
  }
}

verifyAll().catch(console.error);
