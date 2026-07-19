const puppeteer = require('puppeteer');

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440px' },
  { width: 1366, height: 768, name: '1366px' },
  { width: 1280, height: 800, name: '1280px' },
  { width: 1024, height: 768, name: '1024px' },
  { width: 820, height: 1024, name: '820px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 520, height: 780, name: '520px' },
  { width: 430, height: 932, name: '430px' },
  { width: 390, height: 844, name: '390px' },
  { width: 380, height: 812, name: '380px' },
  { width: 360, height: 800, name: '360px' }
];

const MODES = ['cards', 'timeline', 'story'];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let findingsLog = [];

  try {
    // Navigate to the site
    console.log('🔍 Audit starting...\n');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Test each viewport
    for (const vp of VIEWPORTS) {
      console.log(`Testing ${vp.name}...`);
      await page.setViewport(vp);
      await new Promise(r => setTimeout(r, 500));

      // Check for horizontal overflow
      const overflowCheck = await page.evaluate(() => {
        const htmlWidth = document.documentElement.clientWidth;
        const bodyWidth = document.body.scrollWidth;
        return {
          viewportWidth: htmlWidth,
          scrollWidth: bodyWidth,
          hasOverflow: bodyWidth > htmlWidth,
          overflowAmount: Math.max(0, bodyWidth - htmlWidth)
        };
      });

      if (overflowCheck.hasOverflow) {
        findingsLog.push(`❌ ${vp.name}: Horizontal overflow detected (${overflowCheck.overflowAmount}px)`);
      }

      // Check if view-mode-bar or header is covering content
      const chromeCheck = await page.evaluate(() => {
        const chrome = document.querySelector('.site-chrome');
        const main = document.querySelector('main#main');
        const hero = document.querySelector('.hero');
        
        if (!chrome || !main) return { error: 'Elements not found' };

        const chromeBottom = chrome.getBoundingClientRect().bottom;
        const heroTop = hero ? hero.getBoundingClientRect().top : null;
        
        return {
          chromeBoundingRect: chrome.getBoundingClientRect(),
          chromeCssHeight: getComputedStyle(chrome).height,
          mainPaddingTop: getComputedStyle(main).paddingTop,
          chromeBottom,
          heroTop,
          isOverlapping: heroTop !== null && chromeBottom > heroTop
        };
      });

      if (chromeCheck.isOverlapping) {
        findingsLog.push(`⚠️  ${vp.name}: Header/chrome may be overlapping hero content`);
      }

      // Test each view mode
      for (const mode of MODES) {
        const modeButton = `#view-${mode}`;
        try {
          await page.click(modeButton);
          await new Promise(r => setTimeout(r, 300));

          // Check for layout shifts
          const layoutCheck = await page.evaluate(() => {
            const main = document.querySelector('main#main');
            const gridItems = document.querySelectorAll('.project-grid > *, .achievement-grid > *, .story-connector');
            
            return {
              mainWidth: main ? main.clientWidth : null,
              gridItemsCount: gridItems.length,
              bodyScrollWidth: document.body.scrollWidth,
              hasScrollbar: document.body.scrollWidth > window.innerWidth
            };
          });

          if (layoutCheck.hasScrollbar && vp.width < 768) {
            findingsLog.push(`⚠️  ${vp.name} (${mode}): Possible horizontal scrollbar`);
          }

          // Check card alignment (stretch issue)
          const cardCheck = await page.evaluate(() => {
            const cards = document.querySelectorAll('.project-card, .achievement-card, .timeline-card-node');
            const stretched = Array.from(cards).filter(card => {
              const style = getComputedStyle(card);
              return style.height === '100%' || style.minHeight === '100%';
            });
            return {
              totalCards: cards.length,
              stretchedCount: stretched.length,
              firstCardHeight: cards[0] ? cards[0].getBoundingClientRect().height : null
            };
          });

        } catch (e) {
          findingsLog.push(`⚠️  ${vp.name} (${mode}): Error clicking mode - ${e.message}`);
        }
      }
    }

    // Test modals and interactive elements
    console.log('\nTesting modals and interactivity...');
    
    // Reset to large viewport for modal test
    await page.setViewport({ width: 1280, height: 800 });
    await page.click('#view-cards');
    await new Promise(r => setTimeout(r, 300));

    // Try to open a modal if present
    const modalTest = await page.evaluate(() => {
      const modalTriggers = document.querySelectorAll('[data-modal-trigger], .achievement-card button, a[href*="#modal"]');
      return {
        modalTriggersFound: modalTriggers.length,
        mainContent: document.querySelector('main#main') ? 'found' : 'not found'
      };
    });

    // Test Live Editor FAB
    const fabTest = await page.evaluate(() => {
      const fab = document.querySelector('.live-editor-fab');
      if (!fab) return { found: false };
      const rect = fab.getBoundingClientRect();
      const main = document.querySelector('main#main');
      const mainBottom = main.getBoundingClientRect().bottom;
      return {
        found: true,
        fabPosition: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        mayBlockContent: rect.y < mainBottom - 100
      };
    });

    if (fabTest.found && fabTest.mayBlockContent) {
      findingsLog.push(`⚠️  Live Editor FAB may block content at certain scroll positions`);
    }

    // Test keyboard accessibility
    console.log('\nTesting keyboard navigation...');
    const keyboardTest = await page.evaluate(() => {
      const skipLink = document.querySelector('.skip-link');
      const focusableElements = document.querySelectorAll('button, a, [tabindex]');
      
      return {
        skipLinkExists: !!skipLink,
        skipLinkVisible: skipLink ? getComputedStyle(skipLink).display !== 'none' : false,
        focusableElementsCount: focusableElements.length
      };
    });

    if (!keyboardTest.skipLinkExists) {
      findingsLog.push(`❌ Skip link not found`);
    }

    // Test focus visibility
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusTest = await page.evaluate(() => {
      const focused = document.activeElement;
      const focusStyle = getComputedStyle(focused);
      return {
        focusedElement: focused?.tagName,
        outlineWidth: focusStyle.outlineWidth
      };
    });

  } catch (err) {
    console.error('Audit error:', err);
    findingsLog.push(`❌ Critical error: ${err.message}`);
  } finally {
    await browser.close();

    console.log('\n📋 AUDIT FINDINGS:\n');
    if (findingsLog.length === 0) {
      console.log('✅ No critical issues detected in responsive layout.');
    } else {
      findingsLog.forEach(finding => console.log(finding));
    }
    console.log('\n✅ Audit complete.');
  }
})();
