const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const url = process.env.URL || 'http://localhost:8001';
  const out = process.env.OUT || 'screenshots/preview.png';
  try {
    await fs.promises.mkdir(require('path').dirname(out), { recursive: true });
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 800));
    await page.screenshot({ path: out, fullPage: true });
    console.log('Saved screenshot to', out);
    await browser.close();
  } catch (err) {
    console.error('Screenshot failed:', err);
    process.exit(1);
  }
})();
