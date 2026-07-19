const puppeteer = require('./node_modules/puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const results = [];
  for (const viewport of [{width: 1280,height:800},{width:820,height:900},{width:520,height:900},{width:380,height:900}]) {
    await page.setViewport(viewport);
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
    const bodyRect = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        scrollWidth: html.scrollWidth,
        clientWidth: html.clientWidth,
        bodyScrollWidth: body.scrollWidth,
        bodyClientWidth: body.clientWidth,
        overflowX: getComputedStyle(html).overflowX,
        siteHeaderWidth: document.querySelector('.site-header')?.getBoundingClientRect().width,
        heroWidth: document.querySelector('.hero')?.getBoundingClientRect().width,
        wideEls: Array.from(document.querySelectorAll('*')).filter(el => el.scrollWidth > el.clientWidth + 1).slice(0,10).map(el => ({tag: el.tagName, cls: el.className, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth}))
      };
    });
    await page.screenshot({ path: `responsive-${viewport.width}.png`, fullPage: true });
    results.push({viewport, bodyRect});
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
