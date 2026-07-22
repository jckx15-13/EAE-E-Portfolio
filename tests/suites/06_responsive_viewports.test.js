async function runResponsiveViewportTests(harness) {
  harness.setSuite('Responsive Viewports & Multi-Device Layout');
  console.log(`\n--- Running Suite: Responsive Viewports & Multi-Device Layout ---`);

  const viewports = [
    { name: 'Mobile (375x667)', width: 375, height: 667 },
    { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    { name: 'Desktop (1280x800)', width: 1280, height: 800 },
    { name: 'Large Monitor (1920x1080)', width: 1920, height: 1080 }
  ];

  for (const vp of viewports) {
    const t = Date.now();
    try {
      await harness.setViewport(vp.width, vp.height);
      await new Promise(r => setTimeout(r, 200));

      const layoutCheck = await harness.evaluate(`(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const hasHorizontalScroll = docWidth > (winWidth + 2); // 2px margin for rounding

        const main = document.querySelector('main, #main, .main-container');
        const mainVisible = main ? window.getComputedStyle(main).display !== 'none' : false;

        const navBar = document.querySelector('.view-mode-bar, nav, header');
        const navVisible = navBar ? window.getComputedStyle(navBar).display !== 'none' : false;

        return {
          docWidth,
          winWidth,
          hasHorizontalScroll,
          mainVisible,
          navVisible
        };
      })()`);

      harness.assert(!layoutCheck.hasHorizontalScroll, `Horizontal overflow detected! Document scroll width (${layoutCheck.docWidth}px) exceeds viewport width (${layoutCheck.winWidth}px)`);
      harness.assert(layoutCheck.mainVisible, 'Main content section must be visible');
      harness.logPass(`Viewport ${vp.name}: No horizontal overflow, main content rendered cleanly`, Date.now() - t);
    } catch (err) {
      harness.logFail(`Viewport ${vp.name} layout check`, err);
    }
  }

  // Restore default desktop viewport
  await harness.setViewport(1280, 800);
}

module.exports = runResponsiveViewportTests;
