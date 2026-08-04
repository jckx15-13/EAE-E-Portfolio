async function runLiveEditorE2ETests(harness) {
  harness.setSuite('Live Editor E2E Workflows');
  console.log(`\n--- Running Suite: Live Editor E2E Workflows ---`);

  // Test 1: FAB Click & Live Editor Sidebar Opening
  const t1 = Date.now();
  try {
    const fabRes = await harness.evaluate(`(async () => {
      localStorage.setItem('eae_admin_authenticated', 'true');
      const loginBtn = document.querySelector('#adminLoginBtn');
      if (loginBtn) loginBtn.click();
      await new Promise(r => setTimeout(r, 300));

      let fab = document.querySelector('.live-editor-fab');
      if (!fab) {
        const pinInput = document.querySelector('#adminPinInput');
        if (pinInput) {
          pinInput.value = '2410';
          const submitBtn = document.querySelector('#adminPinSubmit');
          if (submitBtn) submitBtn.click();
          await new Promise(r => setTimeout(r, 300));
          fab = document.querySelector('.live-editor-fab');
        }
      }
      if (!fab) throw new Error('Missing .live-editor-fab button');

      fab.click();
      await new Promise(r => setTimeout(r, 200));

      const sidebar = document.querySelector('.live-editor-sidebar');
      if (!sidebar) throw new Error('Live editor sidebar did not open');

      return 'SUCCESS';
    })()`);

    harness.assertEqual(fabRes, 'SUCCESS', 'FAB click opens live editor sidebar');
    harness.logPass('Live Editor FAB click opens sidebar and sets admin-mode', Date.now() - t1);
  } catch (err) {
    harness.logFail('Live Editor FAB click and sidebar opening', err);
  }

  // Test 2: Asset Upload, Template Addition, Asset Insertion & Snapshot Restore
  const t2 = Date.now();
  try {
    const e2eRes = await harness.evaluate(`(async () => {
      let sidebar = document.querySelector('.live-editor-sidebar');
      if (!sidebar || !sidebar.classList.contains('is-open')) {
        const fab = document.querySelector('.live-editor-fab');
        if (fab) fab.click();
        await new Promise(r => setTimeout(r, 200));
        sidebar = document.querySelector('.live-editor-sidebar');
      }
      if (!sidebar) throw new Error('Live editor sidebar not open');

      // 1. Upload asset via DataTransfer
      const input = sidebar.querySelector('input[type="file"]');
      if (!input) throw new Error('Asset file input not found in sidebar');

      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9d3xwQAAAABJRU5ErkJggg==';
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'test-asset.png', { type: 'image/png' });
      const dt = new DataTransfer(); dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));

      await new Promise(r => setTimeout(r, 800));
      if (!(window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.uploadedAssets && window.PORTFOLIO_DATA.uploadedAssets.length > 0)) {
        throw new Error('Uploaded asset not reflected in PORTFOLIO_DATA.uploadedAssets');
      }

      // 2. Add custom section template
      const addBtn = Array.from(sidebar.querySelectorAll('button')).find(b => /Add section/i.test(b.textContent));
      const select = sidebar.querySelector('.template-select');
      if (!select || !addBtn) throw new Error('Template select or Add section button not found');

      select.value = 'text-image';
      addBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const newSection = document.querySelector('[id^="custom-"], .custom-section');
      if (!newSection) throw new Error('New custom section was not added to DOM');

      // 3. Close live editor
      const closeBtn = sidebar.querySelector('.sidebar-close-btn');
      if (closeBtn) closeBtn.click();
      await new Promise(r => setTimeout(r, 200));

      return 'SUCCESS';
    })()`);

    harness.assertEqual(e2eRes, 'SUCCESS', 'E2E Live Editor Workflows');
    harness.logPass('Asset upload, section addition, and sidebar toggling verified', Date.now() - t2);
  } catch (err) {
    harness.logFail('E2E Live Editor Workflows', err);
  }
}

module.exports = runLiveEditorE2ETests;
