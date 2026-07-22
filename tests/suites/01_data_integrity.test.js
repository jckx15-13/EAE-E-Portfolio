const fs = require('fs');
const path = require('path');

async function runDataIntegrityTests(harness) {
  harness.setSuite('Data Integrity & Schema');
  console.log(`\n--- Running Suite: Data Integrity & Schema ---`);

  const projectRoot = path.join(__dirname, '../..');
  const dataJsPath = path.join(projectRoot, 'data.js');

  // Test 1: data.js file existence & syntax
  const t1 = Date.now();
  try {
    harness.assert(fs.existsSync(dataJsPath), 'data.js must exist in project root');
    const dataContent = fs.readFileSync(dataJsPath, 'utf8');
    harness.assertIncludes(dataContent, 'window.PORTFOLIO_DATA', 'data.js must define window.PORTFOLIO_DATA');
    harness.logPass('data.js file exists and declares PORTFOLIO_DATA', Date.now() - t1);
  } catch (err) {
    harness.logFail('data.js file exists and declares PORTFOLIO_DATA', err);
  }

  // Test 2: Browser evaluation of PORTFOLIO_DATA schema
  const t2 = Date.now();
  try {
    const dataSchema = await harness.evaluate(`(() => {
      const data = window.PORTFOLIO_DATA;
      if (!data) return { valid: false, reason: 'PORTFOLIO_DATA missing' };
      
      const requiredKeys = ['profile', 'projects'];
      const missing = requiredKeys.filter(k => !data[k]);
      if (missing.length > 0) return { valid: false, reason: 'Missing keys: ' + missing.join(', ') };

      const projects = Array.isArray(data.projects) ? data.projects : [];
      const achievements = Array.isArray(data.achievements) ? data.achievements : [];
      const evidence = Array.isArray(data.evidence) ? data.evidence : achievements;

      let techCount = 0;
      projects.forEach(p => {
        if (p.technologiesUsed || p.category) techCount++;
      });

      return {
        valid: true,
        profileName: data.profile ? data.profile.name : null,
        techCount,
        evidenceCount: evidence.length,
        projectCount: projects.length,
        firstProjectTitle: projects[0] ? projects[0].title : null
      };
    })()`);

    harness.assert(dataSchema.valid, `Schema invalid: ${dataSchema.reason}`);
    harness.assert(dataSchema.projectCount > 0, 'PORTFOLIO_DATA must contain at least 1 project');
    harness.assert(dataSchema.techCount > 0, 'PORTFOLIO_DATA projects must specify technologiesUsed or category');
    harness.assert(dataSchema.evidenceCount > 0, 'PORTFOLIO_DATA must contain evidence / achievement items');
    harness.logPass(`PORTFOLIO_DATA schema validated (${dataSchema.projectCount} projects, ${dataSchema.evidenceCount} evidence/achievement items, ${dataSchema.techCount} projects with technology details)`, Date.now() - t2);
  } catch (err) {
    harness.logFail('PORTFOLIO_DATA schema validation', err);
  }

  // Test 3: Local Image Asset File Existence
  const t3 = Date.now();
  try {
    const imagePaths = await harness.evaluate(`(() => {
      const paths = [];
      const data = window.PORTFOLIO_DATA || {};
      
      if (data.profile && data.profile.avatar) paths.push(data.profile.avatar);
      
      (data.projects || []).forEach(p => {
        if (p.image) paths.push(p.image);
        if (Array.isArray(p.images)) p.images.forEach(img => paths.push(img));
      });
      
      const timeline = data.timeline || data.growthTimeline || data.evidence || data.achievements || [];
      (Array.isArray(timeline) ? timeline : []).forEach(t => {
        if (t.image) paths.push(t.image);
      });

      return Array.from(new Set(paths)).filter(p => typeof p === 'string' && !p.startsWith('http') && !p.startsWith('data:'));
    })()`);

    let missingFiles = [];
    for (const relPath of imagePaths) {
      const fullPath = path.join(projectRoot, relPath);
      if (!fs.existsSync(fullPath)) {
        missingFiles.push(relPath);
      }
    }

    harness.assertEqual(missingFiles.length, 0, `Missing local image assets: ${missingFiles.join(', ')}`);
    harness.logPass(`Verified ${imagePaths.length} local image assets exist on disk`, Date.now() - t3);
  } catch (err) {
    harness.logFail('Local Image Asset File Existence', err);
  }
}

module.exports = runDataIntegrityTests;
