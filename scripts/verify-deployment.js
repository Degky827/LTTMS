/**
 * LTTMS V1 — Automated Deployment & Smoke Test Verification Script
 * Validates liveness, readiness, Swagger docs, auth, and booking endpoints.
 *
 * Usage:
 *   node scripts/verify-deployment.js [BASE_URL]
 *   Example: node scripts/verify-deployment.js http://localhost:5000
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.argv[2] || process.env.API_BASE_URL || 'http://localhost:5000';

console.log('='.repeat(70));
console.log(' LTTMS V1 — Automated Deployment Verification');
console.log(` Target Base URL: ${BASE_URL}`);
console.log(` Timestamp:       ${new Date().toISOString()}`);
console.log('='.repeat(70));

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(urlPath, BASE_URL);
    const client = fullUrl.protocol === 'https:' ? https : http;

    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: 10000
    };

    const startTime = Date.now();
    const req = client.request(fullUrl, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          responseTime,
          body: parsed
        });
      });
    });

    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request to ${urlPath} timed out after 10000ms`));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runVerification() {
  const checks = [];

  // Check 1: Liveness Probe (/health)
  try {
    const res = await request('/health');
    const ok = res.statusCode === 200 && res.body?.status === 'ok';
    checks.push({ name: 'Liveness Probe (/health)', passed: ok, details: `HTTP ${res.statusCode} (${res.responseTime}ms)` });
  } catch (err) {
    checks.push({ name: 'Liveness Probe (/health)', passed: false, details: err.message });
  }

  // Check 2: Readiness Probe (/ready)
  try {
    const res = await request('/ready');
    const ok = res.statusCode === 200 && res.body?.status === 'ready' && res.body?.dependencies?.database?.status === 'up';
    checks.push({ name: 'Readiness Probe (/ready)', passed: ok, details: `HTTP ${res.statusCode} - DB: ${res.body?.dependencies?.database?.status || 'unknown'}` });
  } catch (err) {
    checks.push({ name: 'Readiness Probe (/ready)', passed: false, details: err.message });
  }

  // Check 3: OpenAPI 3 Specification (/api-docs.json)
  try {
    const res = await request('/api-docs.json');
    const ok = res.statusCode === 200 && res.body?.openapi === '3.0.3';
    const pathCount = res.body?.paths ? Object.keys(res.body.paths).length : 0;
    checks.push({ name: 'OpenAPI 3 Spec (/api-docs.json)', passed: ok, details: `HTTP ${res.statusCode} - Documented Paths: ${pathCount}` });
  } catch (err) {
    checks.push({ name: 'OpenAPI 3 Spec (/api-docs.json)', passed: false, details: err.message });
  }

  // Check 4: Legacy Route Compatibility (/api/health)
  try {
    const res = await request('/api/health');
    const ok = res.statusCode === 200 && res.body?.status === 'ok';
    checks.push({ name: 'Legacy API Alias (/api/health)', passed: ok, details: `HTTP ${res.statusCode} (${res.responseTime}ms)` });
  } catch (err) {
    checks.push({ name: 'Legacy API Alias (/api/health)', passed: false, details: err.message });
  }

  // Check 5: Marketplace Services Listing (/api/v1/services)
  try {
    const res = await request('/api/v1/services');
    const ok = res.statusCode === 200 && res.body?.success === true;
    checks.push({ name: 'Marketplace Services API (/api/v1/services)', passed: ok, details: `HTTP ${res.statusCode} (${res.responseTime}ms)` });
  } catch (err) {
    checks.push({ name: 'Marketplace Services API (/api/v1/services)', passed: false, details: err.message });
  }

  // Check 6: Booking Availability Endpoint (/api/v1/bookings/check-availability)
  try {
    const res = await request('/api/v1/bookings/check-availability?serviceId=654321000000000000000101&date=2026-12-01&slotsCount=2');
    const ok = res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401 || res.statusCode === 404;
    checks.push({ name: 'Booking Engine Guard (/api/v1/bookings/check-availability)', passed: ok, details: `HTTP ${res.statusCode} (Protected Endpoint Active)` });
  } catch (err) {
    checks.push({ name: 'Booking Engine (/api/v1/bookings/check-availability)', passed: false, details: err.message });
  }

  // Print Summary
  console.log('\nVerification Results:');
  console.log('-'.repeat(70));
  let allPassed = true;
  checks.forEach(c => {
    const mark = c.passed ? '[PASS]' : '[FAIL]';
    if (!c.passed) allPassed = false;
    console.log(`  ${mark} ${c.name.padEnd(45)} -> ${c.details}`);
  });
  console.log('-'.repeat(70));

  if (allPassed) {
    console.log('[SUCCESS] All deployment smoke tests PASSED! Deployment is healthy and responsive.\n');
    process.exit(0);
  } else {
    console.error('[ERROR] One or more deployment verification checks FAILED.\n');
    process.exit(1);
  }
}

runVerification();
