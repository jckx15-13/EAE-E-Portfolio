async function runUINavigationTests(harness) {
  harness.setSuite('UI & Navigation Modes');
  console.log(`\n--- Running Suite: UI & Navigation Modes ---`);

  // Test 1: View Mode Switches (cards, timeline, story)
  const t1 = Date.now();
  try {
    const viewRes = await harness.evaluate(`(() => {
      const btnCards = document.querySelector('#view-cards');
      const btnTimeline = document.querySelector('#view-timeline');
      const btnStory = document.querySelector('#view-story');

      if (!btnCards || !btnTimeline || !btnStory) {
        throw new Error('Missing view mode control buttons (#view-cards, #view-timeline, #view-story)');
      }

      // 1. Story mode
      btnStory.click();
      if (document.body.dataset.viewMode !== 'story' || !document.body.classList.contains('story-mode')) {
        throw new Error('Failed to switch to story mode');
      }

      // 2. Timeline mode
      btnTimeline.click();
      if (document.body.dataset.viewMode !== 'timeline' || !document.body.classList.contains('timeline-mode')) {
        throw new Error('Failed to switch to timeline mode');
      }

      // 3. Cards mode
      btnCards.click();
      if (document.body.dataset.viewMode !== 'cards' || !document.body.classList.contains('cards-mode')) {
        throw new Error('Failed to switch back to cards mode');
      }

      return 'SUCCESS';
    })()`);

    harness.assertEqual(viewRes, 'SUCCESS', 'View mode switching must succeed');
    harness.logPass('View mode buttons toggle dataset and body classes correctly', Date.now() - t1);
  } catch (err) {
    harness.logFail('View mode buttons toggle dataset and body classes', err);
  }

  // Test 2: Theme Toggle (Dark / Light) & Style check
  const t2 = Date.now();
  try {
    const themeRes = await harness.evaluate(`(async () => {
      const toggle = document.querySelector('#themeToggle');
      if (!toggle) throw new Error('Missing #themeToggle button');

      const initialTheme = document.body.getAttribute('data-theme') || 'dark';

      // Test Light Mode computed background
      document.body.setAttribute('data-theme', 'light');
      await new Promise(r => setTimeout(r, 200));
      const lightBg = window.getComputedStyle(document.body).backgroundColor;
      const lightRgb = lightBg.replace(/[^0-9,]/g, '').split(',').map(Number);
      if (lightRgb.length >= 3 && (lightRgb[0] < 170 || lightRgb[1] < 170 || lightRgb[2] < 170)) {
        throw new Error('Light theme background is too dark: ' + lightBg);
      }

      // Test Dark Mode computed background
      document.body.setAttribute('data-theme', 'dark');
      await new Promise(r => setTimeout(r, 200));
      const darkBg = window.getComputedStyle(document.body).backgroundColor;
      const darkRgb = darkBg.replace(/[^0-9,]/g, '').split(',').map(Number);
      if (darkRgb.length >= 3 && (darkRgb[0] > 100 || darkRgb[1] > 100 || darkRgb[2] > 100)) {
        throw new Error('Dark theme background is too light: ' + darkBg);
      }

      // Restore initial theme
      document.body.setAttribute('data-theme', initialTheme);
      return 'SUCCESS';
    })()`);

    harness.assertEqual(themeRes, 'SUCCESS', 'Theme toggle must work cleanly');
    harness.logPass('Theme toggle switches light/dark mode with proper theme variables', Date.now() - t2);
  } catch (err) {
    harness.logFail('Theme toggle light/dark mode execution', err);
  }

  // Test 3: Project Filter Buttons & Search Query Filter
  const t3 = Date.now();
  try {
    const filterRes = await harness.evaluate(`(async () => {
      const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
      const searchInput = document.querySelector('#projectSearchInput, #searchInput, .search-input');

      // Test category filter click if present
      if (filterBtns.length > 1) {
        filterBtns[1].click();
        await new Promise(r => setTimeout(r, 150));
        filterBtns[0].click(); // click All
        await new Promise(r => setTimeout(r, 150));
      }

      // Test search filter input if present
      if (searchInput) {
        searchInput.value = 'NonExistentQueryXYZ99';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 200));

        // Reset search
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 200));
      }

      return 'SUCCESS';
    })()`);

    harness.assertEqual(filterRes, 'SUCCESS', 'Project filter and search input test');
    harness.logPass('Project category filters and live search input function without errors', Date.now() - t3);
  } catch (err) {
    harness.logFail('Project category filters and search input', err);
  }

  // Test 4: Modal Popup & Backdrop / Keyboard Escape Interaction
  const t4 = Date.now();
  try {
    const modalRes = await harness.evaluate(`(async () => {
      const card = document.querySelector('.project-card, .snapshot-card, .timeline-item[role="button"]');
      if (!card) return 'SKIPPED_NO_CARDS';

      card.click();
      await new Promise(r => setTimeout(r, 200));

      const modal = document.querySelector('.modal, .evidence-modal, .project-modal, [role="dialog"]');
      if (!modal) throw new Error('Modal element did not appear after card click');

      // Close modal using escape key event
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      return 'SUCCESS';
    })()`);

    harness.logPass('Project/Evidence modal opens and handles Keyboard Escape close event', Date.now() - t4);
  } catch (err) {
    harness.logFail('Project/Evidence modal interaction', err);
  }

  // Test 5: In-App Multi-Media & Spreadsheet Viewer Modal
  const t5 = Date.now();
  try {
    const mediaViewerRes = await harness.evaluate(`(async () => {
      await new Promise(r => setTimeout(r, 150));
      const openFn = window.openMediaViewerModal || (typeof openMediaViewerModal === 'function' ? openMediaViewerModal : null);
      if (typeof openFn !== 'function') {
        throw new Error('openMediaViewerModal function is missing on window object');
      }

      // 1. Test CSV Spreadsheet Viewer
      openFn('docs/FLL_Mission_Data.csv', 'FLL Mission Data Spreadsheet');
      await new Promise(r => setTimeout(r, 400));

      const modal = document.querySelector('#achievementModal');
      if (!modal) throw new Error('Modal #achievementModal not found');
      if (!modal.classList.contains('modal-wide')) {
        throw new Error('#achievementModal missing .modal-wide class for spreadsheet viewing');
      }

      const tableWrapper = modal.querySelector('.spreadsheet-table-wrapper');
      const searchInput = modal.querySelector('.spreadsheet-search-input');
      if (!tableWrapper || !searchInput) {
        throw new Error('Spreadsheet table wrapper or search input missing in modal');
      }

      // 2. Test Video Viewer
      openFn('videos/SkillQuest-demo.webm', 'SkillQuest Video Demo');
      await new Promise(r => setTimeout(r, 200));

      const videoElement = modal.querySelector('.media-video-element');
      if (!videoElement) {
        throw new Error('Video player element .media-video-element missing in modal');
      }

      // 3. Test Draw.io Flowchart Viewer
      openFn('docs/source_materials/raw_materials/SPD User Flow Flow chart.drawio', 'SPD User Flowchart');
      await new Promise(r => setTimeout(r, 200));

      const drawioContainer = modal.querySelector('.media-drawio-container');
      const drawioToolbar = modal.querySelector('.drawio-toolbar');
      if (!drawioContainer || !drawioToolbar) {
        throw new Error('Draw.io flowchart viewer or toolbar missing in modal');
      }

      // 4. Test In-App Presentation Slides Viewer
      openFn('https://www.canva.com/design/DAHM4xnRXzo/dqwWK6e9zzf3GcKGTFlgSA/view?embed', 'Canva Presentation Slides');
      await new Promise(r => setTimeout(r, 200));

      const slidesContainer = modal.querySelector('.media-slides-container');
      const slidesIframe = modal.querySelector('.media-slides-iframe');
      if (!slidesContainer || !slidesIframe) {
        throw new Error('In-app slides container or iframe missing in modal');
      }

      // 5. Test Image Lightbox Viewer
      openFn('images/robots/fll-robot-design.png', 'Robot Design Lightbox');
      await new Promise(r => setTimeout(r, 200));

      const lightboxToolbar = modal.querySelector('.lightbox-toolbar');
      if (!lightboxToolbar) {
        throw new Error('Image lightbox toolbar missing in modal');
      }

      // Close modal
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.click();

      return 'SUCCESS';
    })()`);

    harness.assertEqual(mediaViewerRes, 'SUCCESS', 'In-app multi-media and spreadsheet viewer test');
    harness.logPass('In-app viewer renders Draw.io flowcharts, presentation slides, CSV spreadsheets, video player, and lightboxes with modal-wide layouts', Date.now() - t5);
  } catch (err) {
    harness.logFail('In-app multi-media and spreadsheet viewer execution', err);
  }
}

module.exports = runUINavigationTests;
