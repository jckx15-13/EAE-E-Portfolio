const puppeteer = require('../node_modules/puppeteer');

(async () => {
  console.log("=== Comprehensive Grid & Flex Alignment Audit ===");
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  
  const allLayoutContainers = await page.evaluate(() => {
    const list = [];
    // Query all elements in the body
    const allElements = Array.from(document.body.querySelectorAll('*'));
    
    allElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      const display = computedStyle.display;
      
      if (display === 'grid' || display === 'flex' || display === 'inline-grid' || display === 'inline-flex') {
        // Let's identify if this is a card container by checking its class, ID, or children
        const classList = Array.from(el.classList).join(' ');
        const id = el.id ? `#${el.id}` : '';
        const tag = el.tagName.toLowerCase();
        const selector = `${tag}${id}${classList ? '.' + classList.replace(/\s+/g, '.') : ''}`;
        
        // Skip some common system or tiny elements if needed, but keeping them for complete audit is better
        const children = Array.from(el.children);
        
        // If there are no children, skip
        if (children.length === 0) return;
        
        // Check if children look like cards (e.g., article tag, or have card in class, or has border/background-color/shadow)
        const childrenDetails = children.map(c => {
          const cStyle = window.getComputedStyle(c);
          const hasBackground = cStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && cStyle.backgroundColor !== 'transparent';
          const hasBorder = cStyle.borderStyle !== 'none' && cStyle.borderWidth !== '0px';
          const hasShadow = cStyle.boxShadow !== 'none';
          const hasRadius = cStyle.borderRadius !== '0px';
          const isCardLike = c.tagName === 'ARTICLE' || c.classList.contains('card') || (hasBackground && (hasBorder || hasShadow || hasRadius));
          
          return {
            tagName: c.tagName,
            className: c.className,
            isCardLike,
            height: c.getBoundingClientRect().height,
            scrollHeight: c.scrollHeight
          };
        });
        
        const isCardContainer = childrenDetails.some(c => c.isCardLike);
        
        list.push({
          selector,
          display,
          alignItems: computedStyle.alignItems,
          isCardContainer,
          childCount: children.length,
          childrenDetails
        });
      }
    });
    
    return list;
  });
  
  console.log("Found layout containers:");
  console.log(JSON.stringify(allLayoutContainers, null, 2));
  
  const cardContainersWithStretch = allLayoutContainers.filter(c => c.isCardContainer && c.alignItems === 'stretch');
  if (cardContainersWithStretch.length > 0) {
    console.error("\n❌ FAILED: Found Card Containers with stretch alignment:");
    cardContainersWithStretch.forEach(c => {
      console.error(`- Selector: ${c.selector}`);
      console.error(`  Computed Align-Items: ${c.alignItems}`);
      console.error(`  Display: ${c.display}`);
    });
  } else {
    console.log("\n✅ SUCCESS: No card containers use 'align-items: stretch'!");
  }
  
  await browser.close();
})();
