const puppeteer = require('../node_modules/puppeteer');

(async () => {
  console.log("=== Programmatic Card Stretch and Alignment Verification ===");
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  
  const auditResults = await page.evaluate(() => {
    const results = [];
    
    // Select selectors that look like card containers/grids
    const selectors = [
      '.project-grid',
      '.achievement-grid',
      '.personal-map-grid',
      '.evidence-deck-grid',
      '.simple-grid',
      '.reflection-grid',
      '.applications-grid',
      '.learning-card-grid',
      '.skillsfuture-grid',
      '.cert-grid',
      '.experience-gallery',
      '.journey-list',
      '.snapshot-grid',
      '.strength-grid',
      '.goals-layout'
    ];
    
    selectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (!element) {
        results.push({ selector, found: false });
        return;
      }
      
      const computedStyle = window.getComputedStyle(element);
      const display = computedStyle.display;
      const alignItems = computedStyle.alignItems;
      
      // Let's inspect the children (cards) to check if they are stretched.
      const children = Array.from(element.children);
      const childDetails = children.map((child, idx) => {
        const childComputedStyle = window.getComputedStyle(child);
        const height = child.getBoundingClientRect().height;
        
        // We can check if height is significantly greater than scrollHeight (if there's overflow or empty space)
        // or inspect computed heights.
        return {
          index: idx,
          tagName: child.tagName,
          className: child.className,
          height: height,
          clientHeight: child.clientHeight,
          scrollHeight: child.scrollHeight,
          minHeight: childComputedStyle.minHeight
        };
      });
      
      results.push({
        selector,
        found: true,
        display,
        alignItems,
        childCount: children.length,
        childDetails
      });
    });
    
    return results;
  });
  
  console.log(JSON.stringify(auditResults, null, 2));
  
  // Also check if any card containers use stretch
  const stretchingContainers = auditResults.filter(r => r.found && r.alignItems === 'stretch');
  if (stretchingContainers.length > 0) {
    console.error("\n❌ FAILED: Found containers using 'align-items: stretch':");
    stretchingContainers.forEach(c => console.error(`  - ${c.selector} (align-items: ${c.alignItems})`));
  } else {
    console.log("\n✅ SUCCESS: No card containers use 'align-items: stretch'!");
  }
  
  await browser.close();
})();
