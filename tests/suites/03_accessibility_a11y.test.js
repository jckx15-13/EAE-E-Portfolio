const fs = require('fs');
const path = require('path');

async function runAccessibilityTests(harness) {
  harness.setSuite('Accessibility (WCAG AA & a11y)');
  console.log(`\n--- Running Suite: Accessibility (WCAG AA & a11y) ---`);

  // Test 1: Accessibility Drawer & OpenDyslexic Font Toggle
  const t1 = Date.now();
  try {
    const a11yDrawerRes = await harness.evaluate(`(async () => {
      const fab = document.querySelector('#a11yToggleFab');
      const sidebar = document.querySelector('#a11ySidebar');
      const toggle = document.querySelector('#dyslexicToggle');

      if (!fab) throw new Error('Missing #a11yToggleFab button');
      if (!sidebar) throw new Error('Missing #a11ySidebar drawer');
      if (!toggle) throw new Error('Missing #dyslexicToggle checkbox');

      // Open drawer
      fab.click();
      await new Promise(r => setTimeout(r, 150));
      if (!sidebar.classList.contains('is-open')) {
        throw new Error('#a11ySidebar missing is-open class after FAB click');
      }

      // Enable OpenDyslexic mode
      toggle.click();
      if (!document.body.classList.contains('dyslexic-mode')) {
        throw new Error('Body missing dyslexic-mode class');
      }

      // Verify computed font family on elements
      const bodyFont = window.getComputedStyle(document.body).fontFamily;
      const headingFont = window.getComputedStyle(document.querySelector('h1, h2, h3') || document.body).fontFamily;
      const pFont = window.getComputedStyle(document.querySelector('p') || document.body).fontFamily;

      if (!bodyFont.includes('OpenDyslexic')) {
        throw new Error('Body computed font does not include OpenDyslexic: ' + bodyFont);
      }
      if (!headingFont.includes('OpenDyslexic')) {
        throw new Error('Heading computed font does not include OpenDyslexic: ' + headingFont);
      }
      if (!pFont.includes('OpenDyslexic')) {
        throw new Error('Paragraph computed font does not include OpenDyslexic: ' + pFont);
      }

      // Disable toggle
      toggle.click();
      if (document.body.classList.contains('dyslexic-mode')) {
        throw new Error('Body did not remove dyslexic-mode class');
      }

      // Close drawer
      const closeBtn = document.querySelector('#a11yCloseBtn');
      if (closeBtn) closeBtn.click();
      await new Promise(r => setTimeout(r, 150));

      return 'SUCCESS';
    })()`);

    harness.assertEqual(a11yDrawerRes, 'SUCCESS', 'Accessibility drawer & OpenDyslexic font toggle');
    harness.logPass('Left Accessibility Sidebar & OpenDyslexic computed font cascade verified', Date.now() - t1);
  } catch (err) {
    harness.logFail('Left Accessibility Sidebar & OpenDyslexic font toggle', err);
  }

  // Test 2: Axe-core WCAG Audit
  const t2 = Date.now();
  try {
    const projectRoot = path.join(__dirname, '../..');
    const axePath = path.join(projectRoot, 'node_modules/axe-core/axe.min.js');
    harness.assert(fs.existsSync(axePath), 'axe-core script must exist at node_modules/axe-core/axe.min.js');

    const axeScript = fs.readFileSync(axePath, 'utf8');
    await harness.send('Runtime.evaluate', { expression: axeScript, returnByValue: false });

    const auditRes = await harness.evaluate(`axe.run()`, true);
    harness.assert(auditRes && Array.isArray(auditRes.violations), 'axe.run() returned invalid results structure');

    const violations = auditRes.violations.map(v => ({
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

    const criticalViolations = violations.filter(v => v.impact === 'critical');
    
    // Save report to tests/reports/accessibility.json
    const reportsDir = path.join(projectRoot, 'tests/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, 'accessibility.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      url: harness.baseUrl,
      violationCount: violations.length,
      criticalCount: criticalViolations.length,
      violations
    }, null, 2), 'utf8');

    harness.assertEqual(criticalViolations.length, 0, `Found ${criticalViolations.length} CRITICAL accessibility violations`);
    harness.logPass(`Axe accessibility audit passed with 0 critical violations (${violations.length} total violations logged to reports/accessibility.json)`, Date.now() - t2);
  } catch (err) {
    harness.logFail('Axe-core WCAG Accessibility Audit', err);
  }
}

module.exports = runAccessibilityTests;
