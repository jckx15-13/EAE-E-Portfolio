const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log("=== EAE Portfolio Test Suite ===");
  
  // 1. Check if server is already running, if not, spawn it
  let serverProcess = null;
  let serverRunning = false;
  try {
    const res = await fetch('http://127.0.0.1:3000/');
    if (res.status === 200) {
      console.log("Portfolio server is already running on port 3000.");
      serverRunning = true;
    }
  } catch (err) {
    // Server not running, spawn it
    console.log("Starting portfolio server (node server.js)...");
    serverProcess = spawn('node', ['server.js'], { cwd: __dirname + '/..' });
    serverProcess.stdout.on('data', (data) => console.log("[Server]:", data.toString().trim()));
    serverProcess.stderr.on('data', (data) => console.error("[Server Error]:", data.toString().trim()));
    
    // Wait for server to start
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const res = await fetch('http://127.0.0.1:3000/');
        if (res.status === 200) {
          serverRunning = true;
          break;
        }
      } catch (e) {}
    }
  }

  if (!serverRunning) {
    console.error("Failed to start or connect to portfolio server on port 3000.");
    process.exit(1);
  }

  // 2. Launch headless Chrome
  console.log("Launching headless Chrome...");
  const chromeProcess = spawn('/home/admin/.config/Antigravity/bin/google-chrome', [
    '--headless',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu'
  ]);
  
  chromeProcess.stderr.on('data', (data) => {
    // console.log("[Chrome]:", data.toString().trim());
  });

  // Wait for chrome to start
  await new Promise(r => setTimeout(r, 2000));

  let exitCode = 0;
  let ws = null;
  try {
    // Create new tab via PUT to /json/new
    console.log("Creating new tab in Chrome...");
    const newTabRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
    const tab = await newTabRes.json();
    console.log(`Created tab: id=${tab.id}`);
    
    ws = new globalThis.WebSocket(tab.webSocketDebuggerUrl);
    
    const pageErrors = [];
    
    const send = (method, params = {}) => {
      const id = Math.floor(Math.random() * 1000000);
      return new Promise((resolve, reject) => {
        const onMessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', onMessage);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        ws.addEventListener('message', onMessage);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };
    
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    
    console.log("Connected to Tab WebSocket.");
    
    // Listen for exceptions and console errors
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.exceptionThrown') {
        const details = data.params.exceptionDetails;
        const msg = details.exception ? (details.exception.description || details.exception.value) : details.text;
        console.error("Browser JavaScript Exception:", msg);
        pageErrors.push(msg);
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type;
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        if (type === 'error') {
          console.error("Browser Console Error:", text);
          pageErrors.push(text);
        } else {
          console.log(`[Browser Console]: [${type}]`, text);
        }
      }
    };
    
    await send('Page.enable');
    await send('Runtime.enable');
    
    console.log("Navigating to http://127.0.0.1:3000/...");
    await send('Page.navigate', { url: 'http://127.0.0.1:3000/' });
    
    // Wait for load event
    await new Promise((resolve) => {
      const onMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'Page.loadEventFired') {
          ws.removeEventListener('message', onMessage);
          resolve();
        }
      };
      ws.addEventListener('message', onMessage);
    });
    
    console.log("Page loaded. Running view-mode toggle test...");
    
    // Run evaluation script to click view-mode buttons and verify
    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const btnCards = document.querySelector('#view-cards');
        const btnTimeline = document.querySelector('#view-timeline');
        const btnStory = document.querySelector('#view-story');
        
        if (!btnCards) throw new Error("Missing #view-cards button");
        if (!btnTimeline) throw new Error("Missing #view-timeline button");
        if (!btnStory) throw new Error("Missing #view-story button");
        
        // 1. Click Story Mode
        btnStory.click();
        if (document.body.dataset.viewMode !== 'story') {
          throw new Error("Expected body viewMode dataset to be 'story'");
        }
        if (!document.body.classList.contains('story-mode')) {
          throw new Error("Expected body to have class 'story-mode'");
        }
        
        // 2. Click Timeline Mode
        btnTimeline.click();
        if (document.body.dataset.viewMode !== 'timeline') {
          throw new Error("Expected body viewMode dataset to be 'timeline'");
        }
        if (!document.body.classList.contains('timeline-mode')) {
          throw new Error("Expected body to have class 'timeline-mode'");
        }
        
        // 3. Click Cards Mode
        btnCards.click();
        if (document.body.dataset.viewMode !== 'cards') {
          throw new Error("Expected body viewMode dataset to be 'cards'");
        }
        if (!document.body.classList.contains('cards-mode')) {
          throw new Error("Expected body to have class 'cards-mode'");
        }
        
        return "SUCCESS";
      })()`,
      returnByValue: true
    });
    
    if (result.exceptionDetails) {
      throw new Error("Evaluation failed: " + result.exceptionDetails.text);
    }
    
    console.log("Evaluation script returned:", result.result.value);
    
    if (pageErrors.length > 0) {
      throw new Error(`Test failed with ${pageErrors.length} browser errors during interaction.`);
    }
    
    console.log("View-mode toggle tests PASSED successfully!");

    // 4. Accessibility Auditing
    console.log("Injecting axe-core...");
    const axePath = path.join(__dirname, '../node_modules/axe-core/axe.min.js');
    if (!fs.existsSync(axePath)) {
      throw new Error("axe-core script not found at " + axePath);
    }
    const axeScript = fs.readFileSync(axePath, 'utf8');
    
    await send('Runtime.evaluate', {
      expression: axeScript,
      returnByValue: false
    });
    
    console.log("Running axe-core accessibility audit...");
    const auditRes = await send('Runtime.evaluate', {
      expression: `axe.run()`,
      awaitPromise: true,
      returnByValue: true
    });
    
    if (auditRes.exceptionDetails) {
      throw new Error("Axe audit failed: " + auditRes.exceptionDetails.text);
    }
    
    const axeResult = auditRes.result.value;
    const violations = (axeResult.violations || []).map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map(n => ({
        target: n.target,
        html: n.html,
        failureSummary: n.failureSummary
      }))
    }));

    const report = {
      timestamp: new Date().toISOString(),
      url: 'http://127.0.0.1:3000/',
      violationCount: violations.length,
      violations: violations
    };
    
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, 'accessibility.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`Accessibility report written to ${reportPath}`);
    
  } catch (err) {
    console.error("Test execution failed:", err.message);
    exitCode = 1;
  } finally {
    if (ws) {
      try {
        ws.close();
      } catch (e) {}
    }
    
    console.log("Cleaning up chrome process...");
    chromeProcess.kill('SIGKILL');
    
    if (serverProcess) {
      console.log("Stopping portfolio server...");
      serverProcess.kill('SIGKILL');
    }
    
    // Give OS a moment to clean up process tree
    setTimeout(() => {
      process.exit(exitCode);
    }, 1000);
  }
}

run();
