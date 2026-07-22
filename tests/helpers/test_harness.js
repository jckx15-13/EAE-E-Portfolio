const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestHarness {
  constructor() {
    this.serverProcess = null;
    this.chromeProcess = null;
    this.ws = null;
    this.tabId = null;
    this.baseUrl = 'http://127.0.0.1:3000';
    this.chromePort = 9222;
    this.suiteResults = [];
    this.currentSuite = 'General';
    this.pageErrors = [];
  }

  setSuite(name) {
    this.currentSuite = name;
  }

  logPass(testName, durationMs = 0) {
    console.log(`  ✅ [PASS] ${testName} (${durationMs}ms)`);
    this.suiteResults.push({ suite: this.currentSuite, test: testName, status: 'PASSED', durationMs });
  }

  logFail(testName, error) {
    console.error(`  ❌ [FAIL] ${testName}: ${error.message || error}`);
    this.suiteResults.push({ suite: this.currentSuite, test: testName, status: 'FAILED', error: error.message || String(error) });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  assertIncludes(haystack, needle, message) {
    if (!haystack || !haystack.includes(needle)) {
      throw new Error(`${message || 'Assertion failed'}: expected "${haystack}" to include "${needle}"`);
    }
  }

  async ensureServerRunning() {
    try {
      const res = await fetch(`${this.baseUrl}/`);
      if (res.status === 200) {
        console.log(`[Harness] Portfolio server is active at ${this.baseUrl}`);
        return;
      }
    } catch (e) {
      // Server not up yet, spawn it
    }

    console.log(`[Harness] Starting portfolio server (node server.js)...`);
    const projectRoot = path.join(__dirname, '../..');
    this.serverProcess = spawn('node', ['server.js'], { cwd: projectRoot });

    this.serverProcess.stdout.on('data', (d) => {
      // console.log('[Server stdout]:', d.toString().trim());
    });
    this.serverProcess.stderr.on('data', (d) => {
      console.error('[Server stderr]:', d.toString().trim());
    });

    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 400));
      try {
        const res = await fetch(`${this.baseUrl}/`);
        if (res.status === 200) {
          console.log(`[Harness] Server successfully launched.`);
          return;
        }
      } catch (err) {}
    }
    throw new Error(`Failed to start portfolio server at ${this.baseUrl}`);
  }

  async launchBrowser() {
    const chromePath = '/home/admin/.config/Antigravity/bin/google-chrome';
    if (!fs.existsSync(chromePath)) {
      throw new Error(`Google Chrome binary not found at ${chromePath}`);
    }

    console.log(`[Harness] Launching headless Chrome on port ${this.chromePort}...`);
    this.chromeProcess = spawn(chromePath, [
      '--headless',
      `--remote-debugging-port=${this.chromePort}`,
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]);

    let responsive = false;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.chromePort}/json/version`);
        if (res.ok) {
          responsive = true;
          break;
        }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 400));
    }

    if (!responsive) {
      throw new Error(`Headless Chrome failed to respond on port ${this.chromePort}`);
    }
  }

  async createTab(urlPath = '/?admin=true', width = 1280, height = 800) {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }

    const newTabRes = await fetch(`http://127.0.0.1:${this.chromePort}/json/new`, { method: 'PUT' });
    if (!newTabRes.ok) {
      throw new Error('Failed to create new tab in Chrome');
    }

    const tab = await newTabRes.json();
    this.tabId = tab.id;
    const wsUrl = tab.webSocketDebuggerUrl;

    this.ws = new globalThis.WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    const pageErrors = [];
    this.pageErrors = pageErrors;

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.exceptionThrown') {
        const details = data.params.exceptionDetails;
        const msg = details.exception ? (details.exception.description || details.exception.value) : details.text;
        pageErrors.push(msg);
      }
      if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        pageErrors.push(text);
      }
    };

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768
    });

    const fullUrl = `${this.baseUrl}${urlPath}`;
    await this.send('Page.navigate', { url: fullUrl });

    // Wait for Page.loadEventFired
    await new Promise((resolve) => {
      const onMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'Page.loadEventFired') {
          this.ws.removeEventListener('message', onMessage);
          resolve();
        }
      };
      this.ws.addEventListener('message', onMessage);
    });

    await new Promise(r => setTimeout(r, 200));
    return tab.id;
  }

  async send(method, params = {}) {
    if (!this.ws) throw new Error('WebSocket connection not open');
    const id = Math.floor(Math.random() * 1000000);
    return new Promise((resolve, reject) => {
      const onMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          this.ws.removeEventListener('message', onMessage);
          if (data.error) reject(new Error(data.error.message || JSON.stringify(data.error)));
          else resolve(data.result);
        }
      };
      this.ws.addEventListener('message', onMessage);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, awaitPromise = true) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise
    });
    if (res.exceptionDetails) {
      const ex = res.exceptionDetails;
      const msg = ex.exception ? (ex.exception.description || ex.exception.value) : ex.text;
      throw new Error(`Evaluation Exception: ${msg}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768
    });
  }

  async closeTab() {
    if (this.tabId) {
      try {
        await fetch(`http://127.0.0.1:${this.chromePort}/json/close/${this.tabId}`);
      } catch (e) {}
      this.tabId = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
  }

  async cleanup() {
    await this.closeTab();
    if (this.chromeProcess) {
      try { this.chromeProcess.kill('SIGKILL'); } catch (e) {}
      this.chromeProcess = null;
    }
    if (this.serverProcess) {
      try { this.serverProcess.kill('SIGKILL'); } catch (e) {}
      this.serverProcess = null;
    }
  }
}

module.exports = TestHarness;
