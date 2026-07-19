const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const auditLog = [];

  async function auditWidth(width, height = 900) {
    await page.setViewport({ width, height });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    auditLog.push(`\n=== WIDTH: ${width}px ===`);

    // Get page title and hero text
    const heroTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText : 'N/A';
    });
    auditLog.push(`Hero Title: ${heroTitle.slice(0, 80)}...`);

    // Check if view mode buttons are visible
    const viewModes = await page.evaluate(() => {
      const cards = document.querySelector('#view-cards');
      const timeline = document.querySelector('#view-timeline');
      const story = document.querySelector('#view-story');
      return {
        cardsVisible: !!cards && cards.offsetParent !== null,
        timelineVisible: !!timeline && timeline.offsetParent !== null,
        storyVisible: !!story && story.offsetParent !== null,
        cardsActive: cards?.classList.contains('is-active') || false
      };
    });
    auditLog.push(`View Modes Visible: ${JSON.stringify(viewModes)}`);

    // Switch to Timeline
    await page.click('#view-timeline');
    await page.waitForTimeout(300);
    const timelineActive = await page.evaluate(() => {
      return document.querySelector('#view-timeline')?.classList.contains('is-active');
    });
    auditLog.push(`Timeline mode activated: ${timelineActive}`);

    // Switch to Story
    await page.click('#view-story');
    await page.waitForTimeout(300);
    const storyActive = await page.evaluate(() => {
      return document.querySelector('#view-story')?.classList.contains('is-active');
    });
    auditLog.push(`Story mode activated: ${storyActive}`);

    // Switch back to Cards
    await page.click('#view-cards');
    await page.waitForTimeout(300);

    // Scroll down and check if sections are present
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(200);

    const visibleSections = await page.evaluate(() => {
      const sections = {
        heroSection: !!document.querySelector('.hero'),
        evidenceOverview: !!document.querySelector('#evidence-overview'),
        achievementFlow: !!document.querySelector('#achievement-flow'),
        projectsSection: !!document.querySelector('#projects'),
        achievementsSection: !!document.querySelector('#achievements'),
        goalsSection: !!document.querySelector('#goals'),
        applicationsSection: !!document.querySelector('#applications')
      };
      return sections;
    });
    auditLog.push(`Sections Present: ${JSON.stringify(visibleSections)}`);

    // Check for project cards
    const projectCount = await page.evaluate(() => {
      const grid = document.querySelector('#projectsGrid');
      return grid ? grid.children.length : 0;
    });
    auditLog.push(`Projects visible: ${projectCount}`);

    // Check for achievement cards
    const achievementCount = await page.evaluate(() => {
      const grid = document.querySelector('#achievementCards');
      return grid ? grid.children.length : 0;
    });
    auditLog.push(`Achievements visible: ${achievementCount}`);

    // Try to open a project modal (first project)
    const projectOpened = await page.evaluate(async () => {
      const firstCard = document.querySelector('#projectsGrid .project-card');
      if (firstCard) {
        firstCard.click();
        return true;
      }
      return false;
    }).catch(() => false);

    if (projectOpened) {
      await page.waitForTimeout(300);
      const modalOpen = await page.evaluate(() => {
        const modal = document.querySelector('#achievementModal');
        return modal ? !modal.hidden : false;
      });
      auditLog.push(`Project modal opened: ${modalOpen}`);
    }

    auditLog.push('---');
  }

  // Test widths
  const widths = [1440, 1280, 1024, 820, 768, 520, 390, 380];

  for (const width of widths) {
    try {
      await auditWidth(width);
    } catch (e) {
      auditLog.push(`Error at ${width}px: ${e.message}`);
    }
  }

  console.log(auditLog.join('\n'));
  fs.writeFileSync('/home/admin/Documents/EAE Materials/audit-log.txt', auditLog.join('\n'));

  await browser.close();
})();
