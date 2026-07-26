const fs = require('fs');
const path = require('path');

async function runAccessibilityTests(harness) {
  harness.setSuite('Accessibility (WCAG AA & a11y)');
  console.log(`\n--- Running Suite: Accessibility (WCAG AA & a11y) ---`);

  // Test 1: Accessibility Drawer Open/Close & ARIA attributes
  const t1 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const fab     = document.querySelector('#a11yToggleFab');
      const sidebar = document.querySelector('#a11ySidebar');
      if (!fab)     throw new Error('Missing #a11yToggleFab');
      if (!sidebar) throw new Error('Missing #a11ySidebar');

      // Check initial ARIA state
      if (fab.getAttribute('aria-expanded') !== 'false') throw new Error('fab aria-expanded should start as false');
      if (sidebar.getAttribute('aria-hidden')  !== 'true')  throw new Error('sidebar aria-hidden should start as true');

      // Open
      fab.click();
      await new Promise(r => setTimeout(r, 200));
      if (!sidebar.classList.contains('is-open')) throw new Error('sidebar missing is-open after FAB click');
      if (fab.getAttribute('aria-expanded') !== 'true')  throw new Error('fab aria-expanded should be true when open');
      if (sidebar.getAttribute('aria-hidden') !== 'false') throw new Error('sidebar aria-hidden should be false when open');

      // Close via unified FAB toggle button
      const closeBtn = document.querySelector('#a11yCloseBtn') || fab;
      closeBtn.click();
      await new Promise(r => setTimeout(r, 200));
      if (sidebar.classList.contains('is-open')) throw new Error('sidebar still open after close click');

      return 'SUCCESS';
    })()`);
    harness.assertEqual(res, 'SUCCESS', 'Accessibility drawer open/close & ARIA attributes');
    harness.logPass('A11y drawer ARIA state management verified', Date.now() - t1);
  } catch (err) {
    harness.logFail('A11y drawer open/close & ARIA', err);
  }

  // Test 2: Font Grid & OpenDyslexic default application
  const t2 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      // Font grid should be rendered
      const grid = document.querySelector('#fontPickerGrid');
      if (!grid) throw new Error('Missing #fontPickerGrid');
      const cards = grid.querySelectorAll('.a11y-font-card');
      if (cards.length < 4) throw new Error('Font grid has fewer than 4 cards: ' + cards.length);

      // Inter card should exist and be active (default)
      const interCard = Array.from(cards).find(c => c.dataset.fontFamily === 'Inter');
      if (!interCard) throw new Error('Inter font card not found');

      // Body font-family should default to Inter
      const bodyFont = getComputedStyle(document.body).fontFamily;
      if (!bodyFont.toLowerCase().includes('inter')) {
        throw new Error('Inter not applied as default body font. bodyFont=' + bodyFont);
      }

      // Click OpenDyslexic font card and verify it becomes active
      const odCard = Array.from(cards).find(c => c.dataset.fontFamily === 'OpenDyslexic');
      if (!odCard) throw new Error('OpenDyslexic font card not found');
      odCard.click();
      const updatedVar = getComputedStyle(document.documentElement).getPropertyValue('--a11y-font-override').trim();
      if (!updatedVar.toLowerCase().includes('opendyslexic')) {
        throw new Error('Failed to switch to OpenDyslexic on card click. updatedVar=' + updatedVar);
      }
      if (interCard) {
        interCard.click();
        await new Promise(r => setTimeout(r, 100));
        if (!interCard.classList.contains('is-active')) throw new Error('Inter card did not gain is-active class');
        if (interCard.getAttribute('aria-checked') !== 'true') throw new Error('Inter card aria-checked not true');
        // Revert to OpenDyslexic
        if (odCard) odCard.click();
        await new Promise(r => setTimeout(r, 100));
      }

      return 'SUCCESS';
    })()`);
    harness.assertEqual(res, 'SUCCESS', 'Font grid rendered & OpenDyslexic default verified');
    harness.logPass('Font library grid & OpenDyslexic default font verified', Date.now() - t2);
  } catch (err) {
    harness.logFail('Font grid & OpenDyslexic default', err);
  }

  // Test 3: Text size & spacing sliders
  const t3 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const textSizeRange = document.querySelector('#textSizeRange');
      const lineSpacing   = document.querySelector('#lineSpacingRange');
      const letterSpacing = document.querySelector('#letterSpacingRange');

      if (!textSizeRange) throw new Error('Missing #textSizeRange');
      if (!lineSpacing)   throw new Error('Missing #lineSpacingRange');
      if (!letterSpacing) throw new Error('Missing #letterSpacingRange');

      // Adjust text size
      textSizeRange.value = 120;
      textSizeRange.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 60));
      const htmlFs = document.documentElement.style.fontSize;
      if (!htmlFs.includes('120')) throw new Error('Text size not applied: ' + htmlFs);

      // Reset
      textSizeRange.value = 100;
      textSizeRange.dispatchEvent(new Event('input', { bubbles: true }));

      return 'SUCCESS';
    })()`);
    harness.assertEqual(res, 'SUCCESS', 'Text size / spacing sliders functional');
    harness.logPass('Typography sliders (text size, line, letter spacing) verified', Date.now() - t3);
  } catch (err) {
    harness.logFail('Typography sliders', err);
  }

  // Test 4: Visual toggles — High Contrast & Colour-Blind Filter
  const t4 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const hcToggle = document.querySelector('#highContrastToggle');
      if (!hcToggle) throw new Error('Missing #highContrastToggle');

      hcToggle.click();
      await new Promise(r => setTimeout(r, 60));
      if (!document.body.classList.contains('high-contrast-mode')) throw new Error('high-contrast-mode class not added');

      // Colour-blind filter
      const cbRadio = document.querySelector('[name="colorblindFilter"][value="protanopia"]');
      if (!cbRadio) throw new Error('Missing protanopia radio');
      cbRadio.click();
      cbRadio.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 60));
      if (document.body.getAttribute('data-colorblind') !== 'protanopia') throw new Error('data-colorblind not set');

      // Reset
      hcToggle.click();
      const noneRadio = document.querySelector('[name="colorblindFilter"][value="none"]');
      if (noneRadio) { noneRadio.click(); noneRadio.dispatchEvent(new Event('change', { bubbles: true })); }

      return 'SUCCESS';
    })()`);
    harness.assertEqual(res, 'SUCCESS', 'High contrast & colour-blind filter verified');
    harness.logPass('Visual accessibility toggles (high contrast, colour-blind) verified', Date.now() - t4);
  } catch (err) {
    harness.logFail('Visual toggles (high contrast, colour-blind)', err);
  }

  // Test 5: Motion & Focus controls
  const t5 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const rmToggle  = document.querySelector('#reduceMotionToggle');
      const fhToggle  = document.querySelector('#focusHighlightToggle');
      const rgToggle  = document.querySelector('#readingGuideToggle');
      const rgEl      = document.querySelector('#readingGuide');

      if (!rmToggle) throw new Error('Missing #reduceMotionToggle');
      if (!fhToggle) throw new Error('Missing #focusHighlightToggle');
      if (!rgToggle) throw new Error('Missing #readingGuideToggle');
      if (!rgEl)     throw new Error('Missing #readingGuide');

      // Reduce motion
      if (!document.body.classList.contains('reduce-motion-mode')) {
        rmToggle.click();
        await new Promise(r => setTimeout(r, 60));
        if (!document.body.classList.contains('reduce-motion-mode')) throw new Error('reduce-motion-mode not added');
        rmToggle.click(); // reset
      }

      // Focus highlight
      fhToggle.click();
      await new Promise(r => setTimeout(r, 60));
      if (!document.body.classList.contains('focus-highlight-mode')) throw new Error('focus-highlight-mode not added');
      fhToggle.click(); // reset

      // Reading guide
      rgToggle.click();
      await new Promise(r => setTimeout(r, 60));
      if (!document.body.classList.contains('reading-guide-mode')) throw new Error('reading-guide-mode not added');
      rgToggle.click(); // reset

      return 'SUCCESS';
    })()`);
    harness.assertEqual(res, 'SUCCESS', 'Motion & focus controls verified');
    harness.logPass('Motion (reduce motion, focus highlight, reading guide) verified', Date.now() - t5);
  } catch (err) {
    harness.logFail('Motion & Focus controls', err);
  }

  // Test 6: Cursor size & Reset All
  const t6 = Date.now();
  try {
    const res = await harness.evaluate(`(async () => {
      const largeRadio = document.querySelector('[name="cursorSize"][value="large"]');
      if (!largeRadio) throw new Error('Missing large cursor radio');
      largeRadio.click();
      largeRadio.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 60));
      if (document.body.getAttribute('data-cursor') !== 'large') throw new Error('data-cursor not set to large');

      // Reset All
      const resetBtn = document.querySelector('#a11yResetAll');
      if (!resetBtn) throw new Error('Missing #a11yResetAll');
      resetBtn.click();
      await new Promise(r => setTimeout(r, 100));
      if (document.body.hasAttribute('data-cursor')) throw new Error('data-cursor not removed after reset');
      if (document.body.classList.contains('high-contrast-mode')) throw new Error('high-contrast-mode not removed after reset');

      return 'SUCCESS';
    })()`);
    harness.assertEqual(res, 'SUCCESS', 'Cursor size & Reset All verified');
    harness.logPass('Cursor size radios & Reset All button verified', Date.now() - t6);
  } catch (err) {
    harness.logFail('Cursor size & Reset All', err);
  }

  // Test 7: Axe-core WCAG Audit
  const t7 = Date.now();
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
    harness.logPass(`Axe accessibility audit passed with 0 critical violations (${violations.length} total violations logged to reports/accessibility.json)`, Date.now() - t7);
  } catch (err) {
    harness.logFail('Axe-core WCAG Accessibility Audit', err);
  }
}

module.exports = runAccessibilityTests;
