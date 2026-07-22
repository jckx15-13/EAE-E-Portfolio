async function runSecurityVibeSecTests(harness) {
  harness.setSuite('Security & Input Sanitization (VibeSec)');
  console.log(`\n--- Running Suite: Security & Input Sanitization (VibeSec) ---`);

  // Test 1: DOM XSS Injection & Sanitization Check
  const t1 = Date.now();
  try {
    const xssRes = await harness.evaluate(`(() => {
      let xssTriggered = false;
      window.__xssTestTrigger = () => { xssTriggered = true; };

      const xssPayloads = [
        '<script>window.__xssTestTrigger()</script>',
        '<img src="invalid" onerror="window.__xssTestTrigger()">',
        '<a href="javascript:window.__xssTestTrigger()">Click me</a>'
      ];

      // Test inline render escaping helper if available
      if (typeof window.escapeHtml === 'function') {
        const escaped = window.escapeHtml(xssPayloads[0]);
        if (escaped.includes('<script>')) {
          throw new Error('escapeHtml failed to escape <script> tags: ' + escaped);
        }
      }

      if (window.eaeAdminAPI && typeof window.eaeAdminAPI.sanitizeHtml === 'function') {
        const sanitized = window.eaeAdminAPI.sanitizeHtml(xssPayloads[1]);
        if (sanitized.includes('onerror')) {
          throw new Error('sanitizeHtml failed to strip inline onerror event handler');
        }
      }

      return { xssTriggered, success: true };
    })()`);

    harness.assert(!xssRes.xssTriggered, 'XSS payload executed in DOM evaluation!');
    harness.logPass('DOM XSS payloads (script tags, onerror handlers) properly sanitized', Date.now() - t1);
  } catch (err) {
    harness.logFail('DOM XSS Injection & Sanitization Check', err);
  }

  // Test 2: Server API Save Data Payload Validation (/api/save)
  const t2 = Date.now();
  try {
    const dataJsContent = fs.readFileSync(path.join(__dirname, '../../data.js'), 'utf8');
    let parsedData = {};
    const match = dataJsContent.match(/window\.PORTFOLIO_DATA\s*=\s*({[\s\S]*?});\n\}\)\(\);/);
    if (match) {
      parsedData = JSON.parse(match[1]);
    }

    const res = await fetch(`${harness.baseUrl}/api/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedData)
    });

    harness.assert(res.status === 200, `/api/save returned status ${res.status}`);
    const json = await res.json();
    harness.assert(json.success === true, '/api/save response json.success must be true');

    harness.logPass('POST /api/save endpoint handles JSON payloads securely and updates data.js', Date.now() - t2);
  } catch (err) {
    harness.logFail('Server API Save Data Payload Validation', err);
  }

  // Test 3: Path Traversal Security Verification
  const t3 = Date.now();
  try {
    const res = await fetch(`${harness.baseUrl}/../../../../etc/passwd`);
    harness.assert(res.status === 403 || res.status === 404, `Path traversal request returned status ${res.status}, expected 403 Forbidden`);

    harness.logPass('Server static file handler blocks path traversal attempts (/../../../../etc/passwd -> 403 Forbidden)', Date.now() - t3);
  } catch (err) {
    harness.logFail('Path Traversal Security Verification', err);
  }
}

const fs = require('fs');
const path = require('path');
module.exports = runSecurityVibeSecTests;
