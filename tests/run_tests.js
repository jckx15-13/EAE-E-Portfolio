const path = require('path');
const fs = require('fs');
const TestHarness = require('./helpers/test_harness');

const runDataIntegrityTests = require('./suites/01_data_integrity.test.js');
const runUINavigationTests = require('./suites/02_ui_navigation_modes.test.js');
const runAccessibilityTests = require('./suites/03_accessibility_a11y.test.js');
const runLiveEditorE2ETests = require('./suites/04_live_editor_e2e.test.js');
const runSecurityVibeSecTests = require('./suites/05_security_vibesec.test.js');
const runResponsiveViewportTests = require('./suites/06_responsive_viewports.test.js');

async function runMasterTestSuite() {
  console.log('=====================================================');
  console.log('      EAE PORTFOLIO EXPANDED TEST SUITE RUNNER       ');
  console.log('=====================================================\n');

  const args = process.argv.slice(2);
  let targetSuite = 'all';
  for (const arg of args) {
    if (arg.startsWith('--suite=')) {
      targetSuite = arg.split('=')[1].toLowerCase();
    }
  }

  const harness = new TestHarness();
  const startTime = Date.now();
  let overallPassed = true;

  // Save original data.js to restore after tests finish
  const dataJsPath = path.join(__dirname, '../data.js');
  const originalDataJs = fs.existsSync(dataJsPath) ? fs.readFileSync(dataJsPath, 'utf8') : null;

  try {
    await harness.ensureServerRunning();
    await harness.launchBrowser();
    await harness.createTab('/?admin=true');

    if (targetSuite === 'all' || targetSuite === 'data') {
      await runDataIntegrityTests(harness);
    }

    if (targetSuite === 'all' || targetSuite === 'ui') {
      await runUINavigationTests(harness);
    }

    if (targetSuite === 'all' || targetSuite === 'a11y') {
      await runAccessibilityTests(harness);
    }

    if (targetSuite === 'all' || targetSuite === 'e2e') {
      await runLiveEditorE2ETests(harness);
    }

    if (targetSuite === 'all' || targetSuite === 'security') {
      await runSecurityVibeSecTests(harness);
    }

    if (targetSuite === 'all' || targetSuite === 'responsive') {
      await runResponsiveViewportTests(harness);
    }

  } catch (fatalErr) {
    console.error(`\n🔥 [FATAL TEST SUITE ERROR]: ${fatalErr.message || fatalErr}`);
    overallPassed = false;
  } finally {
    // Restore original data.js file
    if (originalDataJs !== null) {
      try {
        fs.writeFileSync(dataJsPath, originalDataJs, 'utf8');
      } catch (err) {
        console.error('Failed to restore data.js:', err.message);
      }
    }

    await harness.cleanup();

    const totalDuration = Date.now() - startTime;
    const passes = harness.suiteResults.filter(r => r.status === 'PASSED').length;
    const fails = harness.suiteResults.filter(r => r.status === 'FAILED').length;
    if (fails > 0) overallPassed = false;

    console.log('\n=====================================================');
    console.log('              TEST SUITE SUMMARY REPORT              ');
    console.log('=====================================================');
    console.log(`  Total Tests Run: ${harness.suiteResults.length}`);
    console.log(`  Passed:          ${passes} ✅`);
    console.log(`  Failed:          ${fails} ${fails > 0 ? '❌' : ''}`);
    console.log(`  Total Duration:  ${totalDuration}ms`);
    console.log('=====================================================\n');

    // Save summary report JSON
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportsDir, 'summary.json'),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalTests: harness.suiteResults.length,
        passes,
        fails,
        durationMs: totalDuration,
        results: harness.suiteResults
      }, null, 2),
      'utf8'
    );

    if (!overallPassed) {
      process.exit(1);
    }
  }
}

runMasterTestSuite();
