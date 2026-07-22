const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log("=== EAE Portfolio Test Suite ===");
  const dataFilePath = path.join(__dirname, '../data.js');
  const originalDataJs = fs.existsSync(dataFilePath) ? fs.readFileSync(dataFilePath, 'utf8') : null;
  
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
  
  chromeProcess.stdout.on('data', (data) => {
    console.log("[Chrome Stdout]:", data.toString().trim());
  });
  chromeProcess.stderr.on('data', (data) => {
    console.log("[Chrome Stderr]:", data.toString().trim());
  });

  // Wait for chrome to start
  console.log("Waiting for Chrome to become responsive...");
  let newTabRes = null;
  for (let i = 0; i < 20; i++) {
    try {
      newTabRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
      if (newTabRes.ok) {
        break;
      }
    } catch (e) {
      // Chrome not ready yet
    }
    await new Promise(r => setTimeout(r, 500));
  }

  if (!newTabRes || !newTabRes.ok) {
    throw new Error("Chrome did not become responsive on port 9222");
  }

  let exitCode = 0;
  let ws = null;
  try {
    // Create new tab via PUT to /json/new
    console.log("Creating new tab in Chrome...");
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
    
    console.log("Navigating to http://127.0.0.1:3000/?admin=true...");
    await send('Page.navigate', { url: 'http://127.0.0.1:3000/?admin=true' });
    
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
    
    console.log("Page loaded. Running theme toggle test...");

    const themeResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        const themeToggle = document.querySelector('#themeToggle');
        if (!themeToggle) throw new Error("Missing #themeToggle button");
        
        // 1. Initial State
        let theme = document.body.getAttribute('data-theme');
        if (theme !== 'dark') throw new Error("Expected initial theme to be dark");
        
        // 2. Toggle to light
        themeToggle.click();
        if (document.body.getAttribute('data-theme') !== 'light') {
          throw new Error("Expected theme to be light after 1 click");
        }
        
        // 3. Toggle back to dark (verifying no 'editor' theme)
        themeToggle.click();
        if (document.body.getAttribute('data-theme') !== 'dark') {
          throw new Error("Expected theme to be dark after 2 clicks (skipping editor)");
        }
        
        // 4. Open Live Editor
        const editorBtn = document.querySelector('.live-editor-fab');
        if (!editorBtn) throw new Error("Missing .live-editor-fab button");
        editorBtn.click();
        
        // Wait for sidebar to open
        await new Promise(r => setTimeout(r, 100));
        
        const sidebar = document.querySelector('.live-editor-sidebar');
        if (!sidebar) throw new Error("Sidebar not created");
        if (!document.body.classList.contains('admin-mode')) {
          throw new Error("Expected body to have 'admin-mode' class");
        }
        if (document.body.getAttribute('data-theme') === 'editor') {
          throw new Error("Expected body NOT to have data-theme='editor'");
        }
        if (!sidebar.classList.contains('editor-opposite-light')) {
          throw new Error("Expected sidebar to have 'editor-opposite-light' when page is dark");
        }
        
        // 5. Toggle theme while editor is open
        themeToggle.click(); // switches to light
        if (document.body.getAttribute('data-theme') !== 'light') throw new Error("Page should be light");
        if (!sidebar.classList.contains('editor-opposite-dark')) {
          throw new Error("Expected sidebar to have 'editor-opposite-dark' when page is light");
        }
        
        // 6. Close Live Editor
        editorBtn.click();
        await new Promise(r => setTimeout(r, 100));
        if (document.body.classList.contains('admin-mode')) {
          throw new Error("Expected body to lose 'admin-mode' class");
        }
        
        return "SUCCESS";
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    
    if (themeResult.exceptionDetails) {
      throw new Error("Theme evaluation failed: " + themeResult.exceptionDetails.text);
    }
    
    console.log("Theme toggle tests PASSED successfully!");
    
    console.log("Running 2.5D SRT Style & Layout Verification Suite...");
    const srtResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        await new Promise(r => setTimeout(r, 300));
        const button = document.querySelector('.theme-toggle-btn, .view-mode-pill, .button, .a11y-toggle-fab');
        if (!button) throw new Error("No button element found to test 2.5D styling");
        
        const buttonStyle = window.getComputedStyle(button);
        if (!buttonStyle) throw new Error("Could not retrieve computed style for button");
        
        const card = document.querySelector('.snapshot-card, .project-card, .achievement-card, .personal-map-card, .evidence-card');
        if (!card) throw new Error("No card element found on rendered page");
        const cardStyle = window.getComputedStyle(card);
        
        // Assert 2.5D SRT border or extrusion shadow is present
        const hasExtrusionBorder = parseFloat(buttonStyle.borderBottomWidth) >= 2 || buttonStyle.boxShadow.includes('0px 4px 0px') || buttonStyle.boxShadow.includes('0px 3px 0px') || cardStyle.boxShadow.includes('0px 4px 0px');
        if (!hasExtrusionBorder) {
          throw new Error("2.5D SRT extrusion style missing on button/card");
        }
        
        // Assert Light Mode Section Background Coherence
        const themeToggle = document.querySelector('#themeToggle');
        if (themeToggle) {
          const initialTheme = document.body.getAttribute('data-theme') || 'dark';
          if (initialTheme !== 'light') {
            themeToggle.click(); // Ensure switched to light mode
            await new Promise(r => setTimeout(r, 100));
          }
          
          const section = document.querySelector('.section') || document.body;
          if (section) {
            const sectionBg = window.getComputedStyle(section).backgroundColor;
            const bodyBg = window.getComputedStyle(document.body).backgroundColor;
            const bgToUse = (sectionBg && sectionBg !== 'rgba(0, 0, 0, 0)' && sectionBg !== 'transparent') ? sectionBg : bodyBg;
            const rgb = bgToUse.replace(/[^0-9,]/g, '').split(',').map(Number);
            if (rgb.length >= 3) {
              const r = rgb[0], g = rgb[1], b = rgb[2];
              if (r < 180 || g < 180 || b < 180) {
                throw new Error("Light mode background is not cohesive light theme! sectionBg=" + sectionBg + ", bodyBg=" + bodyBg + ", bgToUse=" + bgToUse + ", rgb=[" + r + "," + g + "," + b + "]");
              }
            }
          }
          
          if (initialTheme !== 'light') {
            themeToggle.click(); // Restore initial theme
          }
        }
        
        return "SUCCESS";
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    
    if (srtResult.exceptionDetails) {
      const exMsg = srtResult.exceptionDetails.exception ? (srtResult.exceptionDetails.exception.description || srtResult.exceptionDetails.exception.value) : srtResult.exceptionDetails.text;
      throw new Error("2.5D SRT Style evaluation failed: " + exMsg);
    }
    
    console.log("2.5D SRT Style & Layout tests PASSED successfully!");
    
    console.log("Running Left Accessibility Sidebar & OpenDyslexic Toggle Suite...");
    const a11yResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        const fab = document.querySelector('#a11yToggleFab');
        const sidebar = document.querySelector('#a11ySidebar');
        const toggle = document.querySelector('#dyslexicToggle');
        
        if (!fab) throw new Error("Missing #a11yToggleFab button");
        if (!sidebar) throw new Error("Missing #a11ySidebar drawer");
        if (!toggle) throw new Error("Missing #dyslexicToggle checkbox");
        
        // 1. Open left sidebar
        fab.click();
        await new Promise(r => setTimeout(r, 100));
        if (!sidebar.classList.contains('is-open')) {
          throw new Error("Expected #a11ySidebar to have class 'is-open' after FAB click");
        }
        
        // 2. Toggle OpenDyslexic font
        toggle.click();
        if (!document.body.classList.contains('dyslexic-mode')) {
          throw new Error("Expected body to have class 'dyslexic-mode' after checking toggle");
        }
        
        // STAGE 2.1: Strict computed font assertion across multiple DOM elements
        const bodyFont = window.getComputedStyle(document.body).fontFamily;
        const headingFont = window.getComputedStyle(document.querySelector('h1, h2, h3') || document.body).fontFamily;
        const pFont = window.getComputedStyle(document.querySelector('p') || document.body).fontFamily;
        
        if (!bodyFont.includes('OpenDyslexic')) {
          throw new Error("Computed body font-family does not contain OpenDyslexic: " + bodyFont);
        }
        if (!headingFont.includes('OpenDyslexic')) {
          throw new Error("Computed heading font-family does not contain OpenDyslexic: " + headingFont);
        }
        if (!pFont.includes('OpenDyslexic')) {
          throw new Error("Computed paragraph font-family does not contain OpenDyslexic: " + pFont);
        }
        
        // 3. Toggle back
        toggle.click();
        if (document.body.classList.contains('dyslexic-mode')) {
          throw new Error("Expected body to lose class 'dyslexic-mode' after unchecking toggle");
        }
        
        // 4. Close sidebar
        const closeBtn = document.querySelector('#a11yCloseBtn');
        if (closeBtn) closeBtn.click();
        await new Promise(r => setTimeout(r, 100));
        if (sidebar.classList.contains('is-open')) {
          throw new Error("Expected #a11ySidebar to close after clicking close button");
        }
        
        return "SUCCESS";
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    
    if (a11yResult.exceptionDetails) {
      throw new Error("Accessibility evaluation failed: " + a11yResult.exceptionDetails.text);
    }
    
    console.log("Left Accessibility Sidebar & OpenDyslexic tests PASSED successfully!");
    
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

    // --- E2E: Live Editor insert-section, asset upload, insert asset, restore flows
    console.log("Running E2E Live Editor flows...");
    const e2eRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        // Open live editor
        const fab = document.querySelector('.live-editor-fab');
        if (!fab) throw new Error('Live editor FAB not found');
        fab.click();
        await new Promise(r => setTimeout(r, 300));
        const sidebar = document.querySelector('.live-editor-sidebar');
        if (!sidebar) throw new Error('Sidebar not found');

        // Upload a tiny image via data URL into the file input
        const input = sidebar.querySelector('input[type="file"]');
        if (!input) throw new Error('Asset file input not found');
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9d3xwQAAAABJRU5ErkJggg==';
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'e2e-test.png', { type: 'image/png' });
        const dt = new DataTransfer(); dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // wait for asset to be processed
        await new Promise(r => setTimeout(r, 800));
        if (!(window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.uploadedAssets && window.PORTFOLIO_DATA.uploadedAssets.length > 0)) {
          throw new Error('Uploaded asset not present in data');
        }

        // Add a supported section template via template select
        const addBtn = Array.from(sidebar.querySelectorAll('button')).find(b => /Add section/i.test(b.textContent));
        const select = sidebar.querySelector('.template-select');
        if (!select || !addBtn) throw new Error('Template selector or add button not found');
        select.value = 'text-image';
        addBtn.click();
        await new Promise(r => setTimeout(r, 400));

        // Ensure custom section added
        const cs = window.PORTFOLIO_DATA.customSections || [];
        if (!cs.length) throw new Error('No custom sections after add');
        const last = cs[cs.length - 1];

        // Insert the first uploaded asset into the last added section using admin API
        if (!(window.eaeAdminAPI && typeof window.eaeAdminAPI.insertAssetToSection === 'function')) {
          throw new Error('eaeAdminAPI.insertAssetToSection not available');
        }
        const assetUrl = (window.PORTFOLIO_DATA.uploadedAssets[0].optimized || window.PORTFOLIO_DATA.uploadedAssets[0].url);
        const inserted = window.eaeAdminAPI.insertAssetToSection(assetUrl, last.id);
        if (!inserted) throw new Error('insertAssetToSection returned false');
        await new Promise(r => setTimeout(r, 400));

        // Verify that last section now has an image or images
        const refreshed = window.PORTFOLIO_DATA.customSections.find(s => s.id === last.id) || last;
        const hasImage = refreshed.image || (Array.isArray(refreshed.images) && refreshed.images.length > 0);
        if (!hasImage) {
          throw new Error('Asset was not inserted into the new section');
        }

        // Ensure versions were created
        const versions = JSON.parse(localStorage.getItem('eaePortfolioVersions') || '[]');
        if (!Array.isArray(versions) || versions.length === 0) throw new Error('No versions present after changes');

        // Restore the previous version (if available)
        if (versions.length > 1) {
          // simulate clicking restore via quick DOM operation
          const restoreData = versions[1].data;
          window.PORTFOLIO_DATA = JSON.parse(JSON.stringify(restoreData));
          // re-run render if available
          if (typeof window.render === 'function') window.render();
        }

        const close = document.querySelector('.sidebar-close-btn');
        if (close) close.click();
        const toast = document.querySelector('.live-editor-toast');
        if (toast) toast.remove();

        return { ok: true, message: 'E2E flows completed' };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    if (e2eRes.exceptionDetails) throw new Error('E2E script failed: ' + e2eRes.exceptionDetails.text);
    console.log('E2E result:', e2eRes.result.value);

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
    if (originalDataJs !== null) {
      try {
        fs.writeFileSync(dataFilePath, originalDataJs, 'utf8');
      } catch (restoreErr) {
        console.error('Failed to restore data.js after tests:', restoreErr.message);
        exitCode = 1;
      }
    }

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
