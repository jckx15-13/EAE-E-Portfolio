(function () {
  /* ==========================================================================
   * SECTION 1: CONSTANTS, SELECTORS & CONFIGURATION
   * ========================================================================== */
  const data = window.PORTFOLIO_DATA || {};

  // Local editor gate. This is a convenience PIN for the no-code editor on this
  // device, not secure authentication — the portfolio is a static local site.
  const ADMIN_PIN = "2410";
  const ADMIN_AUTH_KEY = "eae_admin_authenticated";
  const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const STORAGE_KEYS = {
    uploads: 'eaePortfolioUploads',
    viewMode: 'eaePortfolioViewModeV2',
    theme: 'eaePortfolioTheme',
    versions: 'eaePortfolioVersions',
    publishedSnapshot: 'eaePublishedSnapshot',
    schoolReturn: 'eaePortfolioReturn',
  };
  const SELECTORS = {
    achievementModal: '#achievementModal',
    modalContent: '#modalContent',
    main: '#main',
    siteChrome: '.site-chrome',
    siteHeader: '.site-header',
    navToggle: '.nav-toggle',
    siteNav: '#siteNav',
    themeToggle: '#themeToggle',
    scrollProgressBar: '#scrollProgressBar',
    scrollProgress: '.scroll-progress',
    printPortfolio: '#printPortfolio',
    versionsList: '.versions-list',
  };
  const LABELS = {
    featuredProject: 'Featured Project',
    readCaseStudyDetails: 'Read case study details',
    howIDidIt: 'How I did it',
  };
  const PROJECT_MODE_ORDER = {
    story: [
      'Kodecoon Project Journey',
      'PyCon Hackathon & SkillQuest (Cybersecurity & Career Education)',
      'Personal Student Portfolio Website',
      'SPD Caregiver & Admin Event Portal Prototype',
      'FLL 2026 Unearthed Robot Design & Planning',
      '3D Design & Mechanical Prototyping (Thingiverse Creations)',
    ],
    timeline: [
      'Kodecoon Project Journey',
      'FLL 2026 Unearthed Robot Design & Planning',
      'PyCon Hackathon & SkillQuest (Cybersecurity & Career Education)',
      'Personal Student Portfolio Website',
      'SPD Caregiver & Admin Event Portal Prototype',
      '3D Design & Mechanical Prototyping (Thingiverse Creations)',
    ],
  };

  const LEARNING_REPO_BRANCH_ORDER = [
    'main',
    'coding',
    'robotics',
    'academic-growth',
    'cybersecurity',
    'projects',
    'eae-direction'
  ];

  // [selector, data path, fallback] for the copy that comes straight from data.js.
  // Every selector here resolves to a real node in index.html — bindings for headings
  // that no longer exist were dropped rather than left as silent no-ops.
  const HERO_TEXT_BINDINGS = [
    ["#brandName", "profile.shortName", "EAE Portfolio"],
    ["#heroName", "profile.name", ""],
    ["#heroTitle", "profile.headline", ""],
    ["#heroIdentityLine", "profile.identityLine", ""],
    ["#heroSubtitle", "profile.subheadline", ""],
    ["#heroPhotoCaption", "profile.photoCaption", ""],
    ["#brandStatement", "profile.brandStatement", ""],
    [".skip-link", "uiLabels.skipLink", "Skip to content"],
    ["#heroBtnPrimary", "uiLabels.heroBtnPrimary", "View strongest projects"],
    ["#heroBtnSecondary", "uiLabels.heroBtnSecondary", "View evidence timeline"],
    ["#heroBtnApplications", "uiLabels.heroBtnApplications", "View EAE direction"],
    ["#achievementStoryLede", "uiLabels.achievementStoryLede", "Verifiable proof of participation, competitions, and academic growth."],
    ["#goalsShortTerm", "uiLabels.goalsShortTerm", "Short-term"],
    ["#goalsLongTerm", "uiLabels.goalsLongTerm", "Long-term"],
    ["#applicationsLede", "uiLabels.applicationsLede", ""],
    ["#footerText", "uiLabels.footerText", "Jaron Chew's EAE portfolio: projects, evidence, reflection, and direction."],
    ["#printPortfolio", "uiLabels.footerPrintBtn", "Print portfolio"],
  ];

  const HERO_LINK_TARGETS = [
    ["#heroBtnPrimary", "#projects"],
    ["#heroBtnSecondary", "#timeline"],
    ["#heroBtnApplications", "#applications"],
  ];

  // Editor shortcuts, kept in sync with the section order in index.html.
  const EDITOR_QUICK_JUMPS = [
    ["Hero", "#about"],
    ["Skill mapping", "#learning-useful"],
    ["Technical journey", "#timeline"],
    ["Reflection journal", "#reflections"],
    ["Projects", "#projects"],
    ["Evidence", "#achievements"],
    ["Course fit", "#applications"],
  ];

  // `main` is my life; every other branch is a direction that life grew in.
  const LEARNING_REPO_BRANCH_LABELS = {
    main: 'main (my life)',
    coding: 'coding',
    robotics: 'robotics',
    'academic-growth': 'academic-growth',
    cybersecurity: 'cybersecurity',
    projects: 'projects',
    'eae-direction': 'eae-direction'
  };

  // `git notes` attach commentary to a specific commit without rewriting it. Each
  // reflection hangs off the commit it is actually about, in authored order.
  // Overridable per reflection via reflections[i].noteOn.
  const REFLECTION_NOTE_ANCHORS = [
    'commit-fll-robot-design',
    'commit-skillquest',
    'commit-spd-portal',
    'commit-kodecoon-project-journey'
  ];

  // Which commit each "A Map of Me" chapter annotates, in the order the chapters
  // are authored. Overridable per card via personalMap.cards[i].anchorCommit.
  const JOURNEY_TAG_ANCHORS = [
    'commit-scratch-coder-course',
    'commit-roblox-sdg',
    'commit-fll-robot-design',
    'commit-skillquest',
    'commit-math-growth',
    'commit-eae-direction'
  ];

  const LEARNING_REPO_BRANCH_COLORS = {
    main: '#38bdf8',
    coding: '#22c55e',
    robotics: '#f59e0b',
    'academic-growth': '#a78bfa',
    cybersecurity: '#ef4444',
    projects: '#06b6d4',
    'eae-direction': '#ec4899'
  };

  let modalLastActiveElement = null;
  let navigationSetupDone = false;
  let scrollProgressSetupDone = false;
  let printModeSetupDone = false;
  let chromeHeightSetupDone = false;
  let chromeHeightObserver = null;

  /* ==========================================================================
   * SECTION 2: ACCESSIBILITY & MODAL HELPER FUNCTIONS
   * ========================================================================== */
  function rememberModalFocusOrigin() {
    const active = document.activeElement;
    if (active && active !== document.body) {
      modalLastActiveElement = active;
    }
  }

  function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
      if (el.disabled) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      return el.tabIndex >= 0;
    });
  }

  function focusFirstModalElement(dialog) {
    if (!dialog) return;
    const closeButton = dialog.querySelector('.modal-close');
    const focusables = getFocusableElements(dialog);
    const target = closeButton || focusables[0] || dialog;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }

  function openModalDialog(dialog) {
    if (!dialog) return;
    rememberModalFocusOrigin();
    const mainEl = document.getElementById('main');
    if (mainEl) mainEl.setAttribute('aria-hidden', 'true');
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    focusFirstModalElement(dialog);
  }

  function closeModalDialog(dialog) {
    if (!dialog) return;
    const mainEl = document.getElementById('main');
    if (mainEl) mainEl.removeAttribute('aria-hidden');
    try {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    } catch (e) {
      dialog.removeAttribute('open');
    }
    if (modalLastActiveElement && typeof modalLastActiveElement.focus === 'function') {
      setTimeout(() => {
        try { modalLastActiveElement.focus(); } catch (e) {}
      }, 0);
    }
  }


  /* Assign left/right classes to timeline items to create alternating layout */

  // Editor runtime state for selection, last added section, and undo
  window._eaeEditorState = window._eaeEditorState || {
    selectedSectionId: null,
    lastAddedSectionId: null,
    undoStack: []
  };

  /* ==========================================================================
   * SECTION 2B: EDITOR MODULE INITIALIZATION
   * Initialize all 5 production-ready editor modules (state, validator, error handler, operation, backup)
   * ========================================================================== */
  let editorState = null;
  let editorValidator = null;
  let editorErrorHandler = null;
  let editorBackup = null;

  // Reference to unsubscribe functions for cleanup
  const editorUnsubscribers = [];

  function initializeEditorModules() {
    // Only initialize if admin mode is enabled
    if (!validateAdminToken()) return;

    try {
      // 1. Initialize EditorState (undo/redo stack manager)
      editorState = new EditorState(data, 50);
      console.log('✓ EditorState initialized (maxSnapshots: 50)');

      // 2. Initialize EditorValidator (schema & dependency checker)
      editorValidator = new EditorValidator();
      console.log('✓ EditorValidator initialized');

      // 3. Initialize EditorErrorHandler (error recovery & user messaging)
      editorErrorHandler = new EditorErrorHandler();
      console.log('✓ EditorErrorHandler initialized');

      // 4. Initialize EditorBackup (automatic snapshots every 30 seconds)
      editorBackup = new EditorBackup(30000, 20); // 30s interval, max 20 snapshots
      console.log('✓ EditorBackup initialized (autoBackup: 30s interval, maxSnapshots: 20)');

      // 5. Wire EditorState listener to update undo/redo UI when state changes
      const unsubState = editorState.onChange((eventType, payload) => {
        updateUndoRedoUI();
      });
      editorUnsubscribers.push(unsubState);

      // 6. Wire EditorErrorHandler listener to display errors to user
      const unsubError = editorErrorHandler.onError((eventType, payload) => {
        if (eventType === 'error') {
          displayEditorError(payload.code, payload.message, payload.context);
        }
      });
      editorUnsubscribers.push(unsubError);

      // 7. Wire EditorBackup to auto-backup every 30 seconds
      editorBackup.startAutoBackup(() => editorState.getCurrentState());

      // 8. Subscribe to backup events
      const unsubBackup = editorBackup.onBackupEvent((eventType, payload) => {
        if (eventType === 'autoBackupCreated') {
          console.log(`📦 Auto-backup created (${payload.size} bytes)`);
        }
      });
      editorUnsubscribers.push(unsubBackup);

      // Initialize admin API for undo/redo and other operations
      window.eaeAdminAPI = window.eaeAdminAPI || {};
      window.eaeAdminAPI.undo = performUndo;
      window.eaeAdminAPI.redo = performRedo;
      window.eaeAdminAPI.canUndo = () => editorState ? editorState.canUndo() : false;
      window.eaeAdminAPI.canRedo = () => editorState ? editorState.canRedo() : false;

      console.log('✅ All editor modules initialized and wired together');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize editor modules:', error);
      return false;
    }
  }

  function updateUndoRedoUI() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (!editorState) return;

    if (undoBtn) {
      const canUndo = editorState.canUndo();
      undoBtn.disabled = !canUndo;
      undoBtn.classList.toggle('disabled', !canUndo);
      undoBtn.title = canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo';
    }

    if (redoBtn) {
      const canRedo = editorState.canRedo();
      redoBtn.disabled = !canRedo;
      redoBtn.classList.toggle('disabled', !canRedo);
      redoBtn.title = canRedo ? 'Redo (Ctrl+Shift+Z)' : 'Nothing to redo';
    }
  }

  function performUndo() {
    if (!editorState || !editorState.canUndo()) return;

    try {
      const restoredState = editorState.undo();
      if (restoredState) {
        Object.assign(data, restoredState);
        window.location.reload(); // Reload to reflect UI changes
      }
    } catch (error) {
      if (editorErrorHandler) {
        editorErrorHandler.log('UNDO_FAILED', 'Failed to undo last operation', { error });
      }
      console.error('Undo failed:', error);
    }
  }

  function performRedo() {
    if (!editorState || !editorState.canRedo()) return;

    try {
      const restoredState = editorState.redo();
      if (restoredState) {
        Object.assign(data, restoredState);
        window.location.reload(); // Reload to reflect UI changes
      }
    } catch (error) {
      if (editorErrorHandler) {
        editorErrorHandler.log('REDO_FAILED', 'Failed to redo last operation', { error });
      }
      console.error('Redo failed:', error);
    }
  }

  function displayEditorError(code, message, context) {
    if (!editorErrorHandler) return;

    const userMsg = editorErrorHandler.createUserMessage(code, context);
    showEditorErrorModal(userMsg.title, userMsg.message, userMsg.suggestions);
  }

  function showEditorErrorModal(title, message, suggestions) {
    let modal = document.getElementById('editorErrorModal');

    if (!modal) {
      modal = document.createElement('dialog');
      modal.id = 'editorErrorModal';
      modal.className = 'editor-error-modal';
      document.body.appendChild(modal);
    }

    const html = `
      <div class="modal-card">
        <button class="modal-close" aria-label="Close error dialog">✖</button>
        <h2>${title}</h2>
        <p>${message}</p>
        ${suggestions && suggestions.length > 0 ? `
          <div class="error-suggestions">
            <h3>Suggestions:</h3>
            <ul>
              ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="modal-actions">
          <button class="button button-primary close-error-modal">Got it</button>
          ${editorBackup && editorBackup.listRestorePoints().length > 0 ? `
            <button class="button button-secondary restore-from-backup">Restore from backup</button>
          ` : ''}
        </div>
      </div>
    `;

    modal.innerHTML = html;
    openModalDialog(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => closeModalDialog(modal));
    modal.querySelector('.close-error-modal').addEventListener('click', () => closeModalDialog(modal));

    const restoreBtn = modal.querySelector('.restore-from-backup');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        showRestorePointsModal();
        closeModalDialog(modal);
      });
    }
  }

  function showRestorePointsModal() {
    if (!editorBackup) return;

    const restorePoints = editorBackup.listRestorePoints();
    if (restorePoints.length === 0) {
      alert('No restore points available');
      return;
    }

    let modal = document.getElementById('restorePointsModal');
    if (!modal) {
      modal = document.createElement('dialog');
      modal.id = 'restorePointsModal';
      modal.className = 'restore-points-modal';
      document.body.appendChild(modal);
    }

    const html = `
      <div class="modal-card">
        <button class="modal-close" aria-label="Close restore dialog">✖</button>
        <h2>📦 Restore from Backup</h2>
        <p>Choose a restore point to revert your changes:</p>
        <div class="restore-points-list">
          ${restorePoints.reverse().map((rp, idx) => `
            <div class="restore-point-item">
              <button class="restore-point-btn" data-index="${restorePoints.length - 1 - idx}">
                <span class="restore-time">${rp.timestamp}</span>
                <span class="restore-age">${rp.age}</span>
                <span class="restore-type">${rp.manual ? '📌 Manual' : '📦 Auto'}</span>
              </button>
            </div>
          `).join('')}
        </div>
        <div class="modal-actions">
          <button class="button button-secondary close-restore-modal">Cancel</button>
        </div>
      </div>
    `;

    modal.innerHTML = html;
    openModalDialog(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => closeModalDialog(modal));
    modal.querySelector('.close-restore-modal').addEventListener('click', () => closeModalDialog(modal));

    modal.querySelectorAll('.restore-point-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        restoreFromBackupPoint(index);
        closeModalDialog(modal);
      });
    });
  }

  function restoreFromBackupPoint(index) {
    if (!editorBackup) return;

    try {
      const restoredData = editorBackup.restore(index);
      Object.assign(data, restoredData);
      editorState.restoreState(restoredData);
      showSaveNotification('✅ Restored from backup');
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error('Restore failed:', error);
      showSaveNotification('❌ Failed to restore');
    }
  }

  /* ==========================================================================
   * SECTION 3: STATE MANAGEMENT & LOCAL STORAGE UPLOAD OVERRIDES
   * ========================================================================== */
  // Override with local uploads if available
  (function overrideWithLocalUploads() {
    const uploadStorageKey = STORAGE_KEYS.uploads;
    try {
      const uploads = JSON.parse(localStorage.getItem(uploadStorageKey)) || {};

      // 1. Profile image
      if (uploads.profile) {
        data.profile.profileImage = uploads.profile;
      }

      // 2. Robotics image
      if (uploads.robotics) {
        data.robotics.roboticsImage = uploads.robotics;
      }

      // 3. Achievements
      if (uploads.achievements && data.achievements) {
        data.achievements.forEach(ach => {
          const up = uploads.achievements[ach.title];
          if (up) {
            if (up.image) ach.image = up.image;
            if (up.certificate) ach.certificate = up.certificate;
          }
        });
      }

      // 4. Projects
      if (uploads.projects && data.projects) {
        data.projects.forEach(proj => {
          const upImage = uploads.projects[proj.title];
          if (upImage) {
            proj.images = [upImage];
          }
        });
      }

      // 5. Leadership
      if (uploads.leadership && data.hiddenSections?.leadership?.entries) {
        data.hiddenSections.leadership.entries.forEach(entry => {
          const upImage = uploads.leadership[entry.title];
          if (upImage) {
            entry.imagePath = upImage;
          }
        });
      }

      // 6. Community Service
      if (uploads.communityService && data.hiddenSections?.communityService?.entries) {
        data.hiddenSections.communityService.entries.forEach(entry => {
          const upImage = uploads.communityService[entry.title];
          if (upImage) {
            entry.imagePath = upImage;
          }
        });
      }
    } catch (e) {
      console.warn("Failed to load local uploads", e);
    }
  })();

  const navItems = [
    ["About", "about"],
    ["Mindset", "philosophy"],
    ["Cybersecurity", "why-cybersecurity"],
    ["Skills", "learning-useful"],
    ["Journey", "timeline"],
    ["Reflection", "reflections"],
    ["Projects", "projects"],
    ["Library", "achievements"],
    ["Hobbies", "hobbies"],
    ["Course Fit", "applications"],
    ["Goals", "goals"],
  ];
  const primaryNavIds = new Set([
    "about",
    "philosophy",
    "why-cybersecurity",
    "learning-useful",
    "timeline",
    "reflections",
    "projects",
    "achievements",
    "hobbies",
    "applications",
    "goals",
  ]);

  const $ = (selector, root = document) => root.querySelector(selector);

  function create(tag, className, text, editPath) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) {
      element.textContent = text;
      markPlaceholder(element, text);
      if (editPath) element.dataset.editPath = editPath;
    }
    return element;
  }

  function renderEaeSnapshot() {
    const container = $("#personalSnapshot");
    if (!container) return;
    const cards = (data.eaeSnapshot && Array.isArray(data.eaeSnapshot.cards) && data.eaeSnapshot.cards.length > 0)
      ? data.eaeSnapshot.cards
      : (data.projects || []).filter((p) => p.highlighted || p.snapshotLabel).map((p) => ({
          label: p.snapshotLabel || "Project",
          title: p.snapshotTitle || p.title,
          body: p.snapshotSummary || p.portfolioSignal || p.problem,
          image: p.image || (Array.isArray(p.images) && p.images[0]) || "",
          linkTarget: "#projects",
          projectTitle: p.title
        }));
    if (!cards || !cards.length) return;
    container.replaceChildren();
    const grid = create("div", "eae-snapshot-grid");
    cards.forEach((item, index) => {
      const card = create("article", "snapshot-card reveal");
      if (item.image) {
        const media = create("div", "snapshot-media");
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title || item.label || "Evidence image";
        media.appendChild(img);
        card.append(media);
      }
      card.append(create("p", "card-kicker", item.label));
      card.append(create("h2", "", item.title));
      card.append(create("p", "", item.body));
      const actions = create("div", "snapshot-actions");
      const link = create("a", "button button-secondary", "View");
      link.href = item.linkTarget || "#projects";
      link.setAttribute("aria-label", `View ${item.title}`);
      actions.append(link);
      card.append(actions);
      grid.append(card);
    });
    container.append(grid);
  }

  function markPlaceholder(element, value) {
    if (typeof value !== "string") return;
    if (
      value.includes("[") ||
      value.toLowerCase().includes("awaiting") ||
      value.toLowerCase().includes("to be confirmed")
    ) {
      element.classList.add("placeholder-text");
    }
  }

  function renderBulletText(element, value) {
    const lines = String(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) {
      element.textContent = "";
      return;
    }
    const usesBullets = lines.every((line) => line.startsWith("•") || line.startsWith("- "));
    if (!usesBullets) {
      element.textContent = lines.join(' ');
      return;
    }
    const list = document.createElement('ul');
    list.className = 'bullet-list';
    lines.forEach((line) => {
      const cleaned = line.replace(/^\u2022\s*|^-\s*/g, '').trim();
      const li = document.createElement('li');
      li.textContent = cleaned;
      list.append(li);
    });
    element.replaceChildren(list);
  }

  function setText(selector, value, editPath = "") {
    const element = $(selector);
    if (!element) return;
    if (typeof value === 'string' && value.includes('\n') && value.match(/^[\s\S]*[•\-]\s+/)) {
      renderBulletText(element, value);
    } else {
      element.textContent = value || "";
    }
    markPlaceholder(element, value || "");
    if (editPath) {
      element.dataset.editPath = editPath;
    }
  }


  function buildCards(container, dataArray, basePath, config) {
    if (!container) return;
    container.replaceChildren();
    (dataArray || []).forEach((item, index) => {
      const card = create("article", config.cardClass || "");
      config.elements.forEach((elDef) => {
        const value = typeof elDef.value === 'function' ? elDef.value(item, index) : item[elDef.key];
        const editPath = elDef.hasEditPath ? `${basePath}.${index}.${elDef.key}` : undefined;
        const el = create(elDef.tag, elDef.className || "", value, editPath);
        if (elDef.onCreated) elDef.onCreated(el, item, index);
        card.append(el);
      });
      container.append(card);
    });
  }

  function renderNav() {
    const nav = $(SELECTORS.siteNav);
    if (!nav) return;
    const container = nav.querySelector(".section-tab-bar-inner") || nav;
    container.replaceChildren();
    const visibilityConfig = data.sectionVisibility || {};

    navItems.forEach(([label, id]) => {
      if (visibilityConfig[id]) return;
      const link = create("a", "section-tab-pill", label, `uiLabels.nav${label}`);
      link.href = `#${id}`;
      link.dataset.section = id;
      link.setAttribute("role", "tab");
      container.appendChild(link);
    });
  }

  function getDataPath(path) {
    return path.split(".").reduce((value, key) => (value == null ? value : value[key]), data);
  }

  function renderHero() {
    document.title = data.meta?.title || "Student EAE Portfolio";

    HERO_TEXT_BINDINGS.forEach(([selector, path, fallback]) => {
      setText(selector, getDataPath(path) || fallback, path);
    });

    HERO_LINK_TARGETS.forEach(([selector, href]) => {
      const link = $(selector);
      if (link) link.href = href;
    });

    const heroProfileImage = $("#heroProfileImage");
    if (heroProfileImage && data.profile?.profileImage) {
      heroProfileImage.src = data.profile.profileImage;
      heroProfileImage.alt = data.profile?.profileImageAlt || `Photo related to ${data.profile?.name || "Jaron Chew"}`;
      heroProfileImage.fetchPriority = "high";
    }
  }

  function renderPhilosophy() {
    setText("#philosophyIntro", data.philosophy?.intro || "", "philosophy.intro");

    // Render snapshot/mindset cards
    const snapshotGrid = $("#personalSnapshot");
    if (snapshotGrid) {
      snapshotGrid.replaceChildren();
      (data.philosophy?.mindset || []).forEach((item, index) => {
        const card = create("article", "snapshot-card reveal");
        card.append(create("h3", "", item.title, `philosophy.mindset.${index}.title`));
        card.append(create("p", "", item.body, `philosophy.mindset.${index}.body`));
        snapshotGrid.append(card);
      });
    }

  }

  function renderWhyCybersecurity() {
    setText("#whyCyberIntro", data.whyCybersecurity?.intro || "", "whyCybersecurity.intro");
    const grid = $("#cybersecurityReasons");
    if (grid) {
      grid.replaceChildren();
      (data.whyCybersecurity?.reasons || []).forEach((item, index) => {
        const card = create("article", "strength-card small-card reveal");
        card.append(create("h3", "", item.title, `whyCybersecurity.reasons.${index}.title`));
        card.append(create("p", "", item.body, `whyCybersecurity.reasons.${index}.body`));
        grid.append(card);
      });
    }
  }

  let activeLearningSubjectId = null;

  function renderLearningUseful() {
    const title = $("#learningUsefulTitle");
    const intro = $("#learningUsefulIntro");
    const content = $("#learningUsefulContent");
    const section = data.learningThatStaysUseful;
    if (!title || !intro || !content || !section) return;

    title.textContent = section.title || "Learning That Stays Useful";
    title.dataset.editPath = "learningThatStaysUseful.title";

    intro.replaceChildren();
    const introLines = Array.isArray(section.intro) ? section.intro : [];
    introLines.forEach((line, index) => {
      intro.append(create("p", "learning-useful-intro-line", line, `learningThatStaysUseful.intro.${index}`));
    });

    content.replaceChildren();
    const subjects = Array.isArray(section.subjects) ? section.subjects : [];
    if (!subjects.length) return;

    const selector = create("div", "learning-subject-selector");
    selector.setAttribute("role", "tablist");
    selector.setAttribute("aria-label", "Academic subject selector");

    const panel = create("div", "learning-subject-panel reveal");
    panel.id = "learningSubjectPanel";
    panel.setAttribute("role", "tabpanel");

    subjects.forEach((subject) => {
      const pill = create("button", "learning-subject-pill", subject.shortName || subject.name);
      pill.type = "button";
      pill.dataset.subjectId = subject.id;
      pill.setAttribute("role", "tab");
      pill.setAttribute("aria-selected", "false");
      pill.addEventListener("click", () => switchLearningSubject(subject.id));
      selector.append(pill);
    });

    selector.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const pills = Array.from(selector.querySelectorAll(".learning-subject-pill"));
      const current = pills.findIndex((pill) => pill.classList.contains("is-active"));
      const next = (current + (event.key === "ArrowRight" ? 1 : -1) + pills.length) % pills.length;
      pills[next].click();
      pills[next].focus();
    });

    const carry = create("div", "learning-carry-tags reveal");
    carry.append(create("p", "learning-carry-label", "Ways of thinking I carry forward"));
    const tagWrap = create("div", "learning-carry-tag-row");
    (section.carryForwardTags || []).forEach((tag) => {
      const span = create("span", "learning-carry-tag", tag);
      span.dataset.tag = tag;
      tagWrap.append(span);
    });
    carry.append(tagWrap);

    content.append(selector, panel, carry);

    const fallbackId = subjects[0].id;
    const startId = subjects.some((subject) => subject.id === activeLearningSubjectId) ? activeLearningSubjectId : fallbackId;
    switchLearningSubject(startId, { instant: true });
  }

  function switchLearningSubject(subjectId, options = {}) {
    const section = data.learningThatStaysUseful;
    const subjects = Array.isArray(section?.subjects) ? section.subjects : [];
    const subject = subjects.find((item) => item.id === subjectId);
    const panel = $("#learningSubjectPanel");
    if (!subject || !panel) return;

    activeLearningSubjectId = subjectId;
    const subjectIndex = subjects.indexOf(subject);

    document.querySelectorAll(".learning-subject-pill").forEach((pill) => {
      const active = pill.dataset.subjectId === subjectId;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-selected", String(active));
      pill.tabIndex = active ? 0 : -1;
    });

    const updatePanel = () => {
      panel.replaceChildren();
      panel.append(create("p", "card-kicker", "Selected subject"));
      panel.append(create("h3", "learning-subject-title", subject.name, `learningThatStaysUseful.subjects.${subjectIndex}.name`));

      const trains = create("section", "learning-subject-block");
      trains.append(create("h4", "learning-subject-block-title", "Trains"));
      const chips = create("div", "learning-skill-chip-row");
      (subject.trains || []).forEach((skill) => chips.append(create("span", "learning-skill-chip", skill)));
      trains.append(chips);

      const useful = create("section", "learning-subject-block");
      useful.append(create("h4", "learning-subject-block-title", "Stays useful in"));
      useful.append(create("p", "learning-subject-text", subject.usefulIn || "", `learningThatStaysUseful.subjects.${subjectIndex}.usefulIn`));

      const reflection = create("section", "learning-subject-block learning-subject-reflection");
      reflection.append(create("h4", "learning-subject-block-title", "What stays with me"));
      reflection.append(create("p", "learning-subject-text", subject.reflection || "", `learningThatStaysUseful.subjects.${subjectIndex}.reflection`));

      panel.append(trains, useful, reflection);

      document.querySelectorAll(".learning-carry-tag").forEach((tag) => {
        const active = (subject.trains || []).some((skill) => skill.toLowerCase() === (tag.dataset.tag || "").toLowerCase());
        tag.classList.toggle("is-active", active);
      });

      refreshReveal(panel);
    };

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (options.instant || reduceMotion) {
      updatePanel();
      return;
    }

    panel.classList.add("is-exiting");
    window.setTimeout(() => {
      updatePanel();
      panel.classList.remove("is-exiting");
      panel.classList.add("is-entering");
      window.setTimeout(() => panel.classList.remove("is-entering"), 420);
    }, 120);
  }

  function renderLifeEntry() {
    setText("#timelineIntro", data.lifeEntry?.intro || "", "lifeEntry.intro");
    setText("#lifeEntryTitle", data.lifeEntry?.title || "", "lifeEntry.title");
    setText("#lifeEntryIntro", data.lifeEntry?.intro || "", "lifeEntry.intro");
    setText("#lifeEntryDoorway", data.lifeEntry?.doorway || "", "lifeEntry.doorway");

    buildCards($("#lifeChapters"), data.lifeEntry?.chapters, "lifeEntry.chapters", {
      cardClass: "life-chapter reveal",
      elements: [
        { tag: "span", className: "life-chapter-number", value: (item, index) => String(index + 1).padStart(2, "0") },
        { tag: "p", className: "card-kicker", key: "anchor", hasEditPath: true },
        { tag: "h3", key: "title", hasEditPath: true },
        { tag: "p", key: "body", hasEditPath: true }
      ]
    });
  }




  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'note';
  }

  // The six chapters of the journey are rendered as annotated tags on the repository
  // of my life. Each tag points at the commit in the graph below that it marks.
  function renderJourneyChapters() {
    const track = $("#journeyChapters");
    if (!track) return;
    const cards = data.personalMap?.cards || [];
    track.replaceChildren();
    if (!cards.length) return;

    const head = create("div", "journey-tag-head");
    head.append(create("span", "journey-tag-command", "git tag --list --sort=creatordate"));
    head.append(create("span", "journey-tag-count", `${cards.length} annotated tags`));
    track.append(head);

    const grid = create("div", "journey-tag-grid");
    cards.forEach((item, index) => {
      const anchorId = item.anchorCommit || JOURNEY_TAG_ANCHORS[index] || "";
      const card = create("article", "journey-tag-card personal-map-card reveal");
      card.dataset.anchorCommit = anchorId;

      const top = create("div", "personal-map-card-top journey-tag-top");
      top.append(create("span", "personal-map-index journey-tag-index", String(index + 1).padStart(2, "0")));
      top.append(create("p", "card-kicker", item.label, `personalMap.cards.${index}.label`));
      card.append(top);

      card.append(create("h3", "", item.title, `personalMap.cards.${index}.title`));
      card.append(create("p", "", item.body, `personalMap.cards.${index}.body`));
      if (item.evidence) {
        card.append(create("p", "personal-map-evidence", item.evidence, `personalMap.cards.${index}.evidence`));
      }

      if (anchorId) {
        const jump = create("button", "text-button journey-tag-jump", "Show commit in graph");
        jump.type = "button";
        jump.addEventListener("click", () => focusCommitRow(anchorId));
        card.append(jump);
      }

      grid.append(card);
    });

    track.append(grid);
  }

  function focusCommitRow(commitId, { scroll = true } = {}) {
    // The graph only exists in Repository view; switch back before locating the row.
    if (document.body.dataset.evidenceView !== 'repository') setEvidenceView('repository');
    const row = document.querySelector(`.git-commit-row[data-commit-id="${commitId}"]`);
    if (!row) return;
    if (scroll) row.scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelectorAll(".git-commit-row.is-highlighted")
      .forEach((el) => el.classList.remove("is-highlighted"));
    row.classList.add("is-highlighted");
    window.setTimeout(() => row.classList.remove("is-highlighted"), 2600);
  }

  // The reflections themselves are attached to their commits inside the graph, the
  // way `git notes` hang off a commit. This section is the note index — `git notes
  // list` — so the journal stays addressable from the nav without repeating itself.
  function renderReflections() {
    const grid = document.getElementById('reflectionList');
    if (!grid) return;
    grid.replaceChildren();

    (data.reflections || []).forEach((reflection, index) => {
      const commitId = reflection.noteOn || REFLECTION_NOTE_ANCHORS[index];
      const row = create('button', 'git-note-index-row reveal');
      row.type = 'button';
      row.dataset.noteOn = commitId || '';

      row.append(create('span', 'git-note-index-ref', `refs/notes/${slugify(reflection.title)}`));
      row.append(create('span', 'git-note-index-title', reflection.title));

      const commit = (data.learningRepository?.commits || []).find((item) => item.id === commitId);
      row.append(create('span', 'git-note-index-target', commit ? `attached to ${commit.title}` : 'attached to the journey'));

      row.addEventListener('click', () => {
        // Highlight without scrolling, then let the note itself own the scroll.
        if (commitId) focusCommitRow(commitId, { scroll: false });
        const note = document.getElementById(`reflection-${slugify(reflection.title)}`);
        if (note) note.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      grid.append(row);
    });
  }

  // Project ordering still keys off this; the view-mode switcher itself is disabled.
  let currentViewMode = "story";


  let viewModeBarObserver = null;
  let viewModeBarSections = [];


  function setupHintTooltips() {
    const triggers = document.querySelectorAll(".hint-trigger");
    triggers.forEach(trigger => {
      let tooltip = null;

      const showTooltip = () => {
        if (tooltip) return;
        const hintText = trigger.dataset.hint;
        tooltip = create("div", "hint-tooltip", hintText);
        const tooltipId = 'tooltip-' + Math.random().toString(36).substr(2, 9);
        tooltip.id = tooltipId;
        tooltip.setAttribute("role", "tooltip");
        document.body.appendChild(tooltip);
        trigger.setAttribute("aria-describedby", tooltipId);

        const rect = trigger.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;

        requestAnimationFrame(() => {
          tooltip.classList.add("is-active");
        });
      };

      const hideTooltip = () => {
        if (!tooltip) return;
        const temp = tooltip;
        tooltip = null;
        trigger.removeAttribute("aria-describedby");
        temp.classList.remove("is-active");
        setTimeout(() => temp.remove(), 200);
      };

      trigger.addEventListener("mouseenter", showTooltip);
      trigger.addEventListener("mouseleave", hideTooltip);
      trigger.addEventListener("focus", showTooltip);
      trigger.addEventListener("blur", hideTooltip);
    });
  }

  function resolveSlidesEmbedUrl(project) {
    const raw = project.slidesEmbedUrl || (typeof project.slides === "string" ? project.slides : "");
    if (!raw) return "";
    const cleanRaw = raw.trim();
    try {
      const url = new URL(cleanRaw);
      if (/canva\.com$/i.test(url.hostname) && /\/design\//i.test(url.pathname)) {
        const pathWithoutEmbed = url.pathname.replace(/\/embed\/?$/i, "");
        const embedPath = `${pathWithoutEmbed.replace(/\/+$/, "")}/embed`;
        return `${url.origin}${embedPath}`;
      }
      return `${url.origin}${url.pathname}${url.hash || ""}`;
    } catch (error) {
      if (cleanRaw.includes("canva.com/design/")) {
        const noQuery = cleanRaw.split(/[?#]/)[0].replace(/\/embed\/?$/i, "");
        return `${noQuery.replace(/\/+$/, "")}/embed`;
      }
      return cleanRaw;
    }
  }

  function appendProjectSupportingImages(media, project, mediaImages) {
    if (!mediaImages.length) return mediaImages[0];
    const thumbnails = create("div", "project-media-thumbnails project-media-supporting");
    mediaImages.forEach((src, imageIndex) => {
      const button = create("button", "project-media-thumb");
      button.type = "button";
      button.setAttribute("aria-label", `View ${project.title} image ${imageIndex + 1}`);
      const thumbnail = document.createElement("img");
      thumbnail.src = src;
      thumbnail.alt = `${project.title} supporting image ${imageIndex + 1}`;
      thumbnail.loading = "lazy";
      thumbnail.decoding = "async";
      button.append(thumbnail);
      button.addEventListener("click", () => openFullImageModal(src, `${project.title} image ${imageIndex + 1}`));
      thumbnails.append(button);
    });
    media.append(thumbnails);
    return mediaImages[0];
  }

  function openMediaViewerModal(src, alt, titleHint) {
    const dialog = $("#achievementModal");
    const content = $("#modalContent");
    if (!dialog || !content) return;

    content.replaceChildren();
    dialog.classList.remove("modal-wide", "modal-school-portfolio");

    const type = detectMediaType(src);
    if (type === 'spreadsheet' || type === 'pdf' || type === 'drawio' || type === 'slides') {
      dialog.classList.add("modal-wide");
    }

    const typeBadges = {
      drawio: "📐 DRAW.IO FLOWCHART",
      slides: "📊 PRESENTATION SLIDES",
      spreadsheet: "📊 SPREADSHEET DATA",
      video: "🎬 VIDEO DEMO",
      audio: "🎵 AUDIO RECORDING",
      pdf: "📄 PDF DOCUMENT",
      document: "📑 DOCUMENT",
      image: "🖼️ IMAGE PREVIEW"
    };

    const header = create("div", "modal-header");
    header.append(create("p", "card-kicker", typeBadges[type] || "MEDIA PREVIEW"));
    header.append(create("h2", "", alt || titleHint || "Media Preview"));

    const mediaContainer = create("div", "modal-media-grid");
    mediaContainer.append(createMediaBlock(src, alt || "Media Preview", "Media unavailable"));
    content.append(header, mediaContainer);

    openModalDialog(dialog);
  }

  function openFullImageModal(src, alt) {
    openMediaViewerModal(src, alt);
  }

  function openSchoolPortfolioModal() {
    const dialog = $(SELECTORS.achievementModal);
    const content = $(SELECTORS.modalContent);
    if (!dialog || !content) return;

    content.replaceChildren();
    dialog.classList.add("modal-wide", "modal-school-portfolio");
    const closeButton = dialog.querySelector(".modal-close");
    if (closeButton) closeButton.setAttribute("aria-label", "Close School E-Portfolio");

    const header = create("div", "modal-header school-portfolio-header");
    header.append(create("p", "card-kicker", "School E-Portfolio"));
    header.append(create("h2", "", "Jaron's School E-Portfolio"));
    header.append(create("p", "modal-summary", "Browse the original school portfolio without leaving this EAE portfolio."));

    const frameWrap = create("div", "school-portfolio-frame-wrap");
    const frame = document.createElement("iframe");
    frame.className = "school-portfolio-frame";
    frame.src = "School_E-Portfolio/Home.html";
    frame.title = "Jaron Chew School E-Portfolio";
    frame.loading = "eager";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frameWrap.append(frame);

    content.append(header, frameWrap);
    openModalDialog(dialog);
  }

  window.openMediaViewerModal = openMediaViewerModal;
  window.openFullImageModal = openFullImageModal;
  window.openSchoolPortfolioModal = openSchoolPortfolioModal;

  // Two-way switch between this portfolio and the exported school e-portfolio.
  // Leaving records where you were, so DRAFT/school-nav.js can send you back to the
  // same section in the same theme instead of dumping you at the top of the page.
  function currentSectionHash() {
    // Hidden sections collapse to top:0 and would otherwise always look "current",
    // so only sections that are actually laid out are considered.
    const sections = Array.from(document.querySelectorAll("#main > section[id]"))
      .filter((section) => section.offsetHeight > 0);
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 160) current = section;
    });
    return current ? `#${current.id}` : "";
  }

  function setupSchoolPortfolioIntegration() {
    const button = $("#schoolPortfolioBtn");
    if (!button) return;
    button.removeAttribute("aria-haspopup");
    button.removeAttribute("aria-controls");
    button.setAttribute("aria-label", "Open School E-Portfolio");
    // The React school portfolio's built entry. The old Home.html export no
    // longer exists, which left this button pointing at a 404.
    button.setAttribute("href", "School_E-Portfolio/dist/index.html");
    if (button.dataset.switchBound === "true") return;
    button.dataset.switchBound = "true";

    button.addEventListener("click", () => {
      try {
        localStorage.setItem(STORAGE_KEYS.schoolReturn, JSON.stringify({
          hash: currentSectionHash(),
          theme: document.body.dataset.theme || "dark",
          savedAt: Date.now()
        }));
      } catch (e) { /* private mode — the school page falls back to the top of the portfolio */ }
    });
  }

  function appendProjectImageMedia(media, project, mediaImages) {
    const leadImage = mediaImages[0];
    if (leadImage) {
      const image = document.createElement("img");
      image.src = leadImage;
      image.alt = `${project.title} project image`;
      image.loading = "lazy";
      image.decoding = "async";
      image.className = "project-media-main";
      media.append(image);
      if (mediaImages.length > 1) {
        const thumbnails = create("div", "project-media-thumbnails");
        mediaImages.slice(1).forEach((src, imageIndex) => {
          const button = create("button", "project-media-thumb");
          button.type = "button";
          button.setAttribute("aria-label", `View ${project.title} image ${imageIndex + 2}`);
          const thumbnail = document.createElement("img");
          thumbnail.src = src;
          thumbnail.alt = `${project.title} supporting thumbnail ${imageIndex + 2}`;
          thumbnail.loading = "lazy";
          thumbnail.decoding = "async";
          button.append(thumbnail);
          button.addEventListener("click", () => openFullImageModal(src, `${project.title} image ${imageIndex + 2}`));
          thumbnails.append(button);
        });
        media.append(thumbnails);
      }
    }
    return leadImage;
  }

  function setupChromeHeight() {
    const chrome = document.querySelector(SELECTORS.siteChrome);
    if (!chrome) return;

    const syncChromeHeight = () => {
      const height = Math.ceil(chrome.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--site-chrome-height', `${height}px`);
    };

    syncChromeHeight();

    if (chromeHeightSetupDone) return;
    chromeHeightSetupDone = true;

    window.addEventListener('resize', syncChromeHeight, { passive: true });

    if ('ResizeObserver' in window) {
      chromeHeightObserver = new ResizeObserver(syncChromeHeight);
      chromeHeightObserver.observe(chrome);
    }
  }

  /**
   * Renders a row of filter buttons into `container`.
   * `isActive(category)` → boolean used for aria-pressed.
   * `onClick(category)` is called when a button is clicked.
   */
  function renderFilterButtons(container, categories, isActive, onClick) {
    container.replaceChildren();
    categories.forEach(category => {
      const button = create('button', 'filter-button', category);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(isActive(category)));
      button.addEventListener('click', () => onClick(category));
      container.append(button);
    });
  }

  /**
   * Appends definition-list rows (.case-row > dt + dd) for each [label, value, editPath] tuple.
   */
  function appendCaseRows(container, fields) {
    fields.forEach(([label, value, path]) => {
      const row = create('div', 'case-row');
      row.append(create('dt', '', label));
      const dd = create('dd', '', value);
      if (path) dd.dataset.editPath = path;
      row.append(dd);
      container.append(row);
    });
  }

  // One normalised shape for every piece of evidence, so the git-graph and the grid
  // render the same nodes instead of each keeping its own bespoke card markup.
  // Graph placement (branch/order) is read back off learningRepository.commits when
  // a commit links to the item; items with no commit still render in the grid.
  function evidenceCommitIndex() {
    const commits = data.learningRepository?.commits;
    const byTitle = new Map();
    if (Array.isArray(commits)) {
      commits.forEach((commit) => {
        const key = commit.linkedProject || commit.linkedAchievement;
        if (key) byTitle.set(key, commit);
      });
    }
    return byTitle;
  }

  function evidenceDetail(label, value) {
    if (value === undefined || value === null) return null;
    const text = Array.isArray(value) ? value.filter(Boolean).join(', ') : String(value).trim();
    return text ? { label, value: text } : null;
  }

  function projectToEvidence(project, index, commitByTitle) {
    const commit = commitByTitle.get(project.title);
    const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
    const video = typeof project.optionalVideo === 'string' ? project.optionalVideo.trim() : '';
    const embed = resolveSlidesEmbedUrl(project);
    return {
      id: commit?.id || `evidence-project-${index}`,
      kind: 'project',
      title: project.title || 'Untitled project',
      date: '',
      status: project.status || '',
      category: project.category || 'Project',
      summary: project.snapshotSummary || project.problem || '',
      branch: commit?.branch || 'projects',
      order: Number(commit?.order || 900 + index),
      media: {
        video,
        embed,
        images,
        poster: project.image || images[0] || ''
      },
      details: [
        evidenceDetail('Problem', project.problem),
        evidenceDetail('My role', project.myRole),
        evidenceDetail('Technologies', project.technologiesUsed),
        evidenceDetail('Outcome', project.outcome)
      ].filter(Boolean),
      linkBack: project.eaeConnection || project.portfolioSignal || '',
      editBase: `projects.${index}`,
      source: project
    };
  }

  function achievementToEvidence(achievement, index, commitByTitle) {
    const commit = commitByTitle.get(achievement.title);
    const images = [achievement.image, achievement.certificate].filter(Boolean);
    return {
      id: commit?.id || `evidence-achievement-${index}`,
      kind: 'achievement',
      title: achievement.title || 'Untitled achievement',
      date: achievement.date || '',
      category: achievement.category || 'Achievement',
      summary: achievement.summary || '',
      branch: commit?.branch || 'main',
      order: Number(commit?.order || 800 + index),
      media: { video: '', embed: '', images, poster: achievement.image || '' },
      details: [
        evidenceDetail('Organisation', achievement.organisation),
        evidenceDetail('Learning outcome', achievement.learningOutcome),
        evidenceDetail('Reflection', achievement.reflection)
      ].filter(Boolean),
      linkBack: achievement.eaeRelevance || achievement.applicantSignal || '',
      editBase: `achievements.${index}`,
      source: achievement
    };
  }

  function certificateToEvidence(certificate, index) {
    const images = [certificate.evidence].filter(Boolean);
    return {
      id: `evidence-certificate-${index}`,
      kind: 'certificate',
      title: certificate.title || 'Certificate',
      date: certificate.date || '',
      category: 'Certificate',
      summary: '',
      branch: 'academic-growth',
      order: 600 + index,
      media: { video: '', embed: '', images, poster: certificate.evidence || '' },
      details: [evidenceDetail('Issuer', certificate.issuer)].filter(Boolean),
      linkBack: '',
      editBase: `certifications.${index}`,
      source: certificate
    };
  }

  function hobbyToEvidence(hobby, index) {
    return {
      id: hobby.id || `evidence-hobby-${index}`,
      kind: 'hobby',
      title: hobby.title || 'Hobby',
      date: '',
      category: hobby.category || 'Hobby',
      summary: hobby.description || '',
      branch: 'hobbies',
      order: 700 + index,
      media: { video: '', embed: '', images: [], poster: '' },
      details: [
        evidenceDetail('Tags', hobby.tags),
        evidenceDetail('Takeaway', hobby.takeaway)
      ].filter(Boolean),
      linkBack: '',
      editBase: `hobbies.entries.${index}`,
      source: hobby
    };
  }

  function buildEvidenceIndex() {
    const commitByTitle = evidenceCommitIndex();
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const achievements = Array.isArray(data.achievements) ? data.achievements : [];
    const certificates = Array.isArray(data.certifications) ? data.certifications : [];
    const hobbies = Array.isArray(data.hobbies?.entries) ? data.hobbies.entries : [];

    const index = [
      ...projects.map((item, i) => projectToEvidence(item, i, commitByTitle)),
      ...achievements.map((item, i) => achievementToEvidence(item, i, commitByTitle)),
      ...certificates.map((item, i) => certificateToEvidence(item, i)),
      ...hobbies.map((item, i) => hobbyToEvidence(item, i))
    ].sort((a, b) => a.order - b.order);

    // A certificate is linked to the work it certifies only on an exact title match.
    // Fuzzy matching would assert relationships the portfolio data never states.
    const workByTitle = new Map();
    index.forEach((node) => {
      if (node.kind === 'project' || node.kind === 'achievement') workByTitle.set(node.title, node);
    });
    index.forEach((node) => {
      if (node.kind !== 'certificate') return;
      const related = workByTitle.get(node.title);
      if (related) node.relatedId = related.id;
    });

    return index;
  }

  // Demonstration first: a viewer should see the thing working before reading about it.
  // Falls back video -> embedded slides -> image -> textual placeholder.
  function evidenceMediaBlock(node) {
    const media = create('div', 'evidence-node-media');
    const { video, embed, images, poster } = node.media;

    if (video) {
      const el = document.createElement('video');
      el.src = video;
      el.controls = true;
      el.preload = 'metadata';
      if (poster) el.poster = poster;
      el.setAttribute('aria-label', `${node.title} demonstration video`);
      media.append(el);
      media.dataset.mediaType = 'video';
      return media;
    }

    if (embed) {
      const wrap = create('div', 'evidence-node-media-embed');
      const frame = document.createElement('iframe');
      frame.src = embed;
      frame.loading = 'lazy';
      frame.title = `${node.title} interactive slides`;
      frame.setAttribute('allowfullscreen', '');
      wrap.append(frame);
      media.append(wrap);
      media.dataset.mediaType = 'embed';
      return media;
    }

    if (images.length) {
      const button = create('button', 'evidence-node-media-image');
      button.type = 'button';
      button.setAttribute('aria-label', `View ${node.title} evidence full size`);
      const img = document.createElement('img');
      img.src = images[0];
      img.alt = `${node.title} evidence`;
      img.loading = 'lazy';
      img.decoding = 'async';
      button.append(img);
      button.addEventListener('click', () => openFullImageModal(images[0], node.title));
      media.append(button);
      media.dataset.mediaType = 'image';
      return media;
    }

    const placeholder = create('div', 'evidence-node-media-placeholder');
    placeholder.append(create('span', 'evidence-node-media-kicker', node.category));
    placeholder.append(create('p', '', 'Evidence media to be added.'));
    media.append(placeholder);
    media.dataset.mediaType = 'none';
    return media;
  }

  function renderEvidenceCard(node) {
    const card = create('article', 'evidence-node reveal');
    card.dataset.evidenceId = node.id;
    card.dataset.kind = node.kind;
    card.dataset.branch = node.branch;

    card.append(evidenceMediaBlock(node));

    const body = create('div', 'evidence-node-body');

    const meta = create('div', 'evidence-node-meta');
    meta.append(create('span', `evidence-node-kind evidence-node-kind--${node.kind}`, node.kind));
    // Certificates carry category "Certificate", which would just repeat the kind chip.
    if (node.category && node.category.toLowerCase() !== node.kind.toLowerCase()) {
      meta.append(create('span', 'evidence-node-category', node.category));
    }
    const stamp = node.date || node.status;
    if (stamp) meta.append(create('span', 'evidence-node-stamp', stamp));
    body.append(meta);

    const heading = create('h3', 'evidence-node-title', node.title);
    heading.dataset.editPath = `${node.editBase}.title`;
    body.append(heading);

    if (node.summary) {
      const summary = create('p', 'evidence-node-summary', node.summary);
      body.append(summary);
    }

    if (node.details.length) {
      const list = create('dl', 'evidence-node-details');
      node.details.forEach(({ label, value }) => {
        const row = create('div', 'evidence-node-detail-row');
        row.append(create('dt', '', label));
        row.append(create('dd', '', value));
        list.append(row);
      });
      body.append(list);
    }

    if (node.relatedId) {
      const jump = create('button', 'evidence-node-related', 'See the work this certifies');
      jump.type = 'button';
      jump.addEventListener('click', () => {
        const target = document.querySelector(`[data-evidence-id="${node.relatedId}"]`);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('is-flagged');
        setTimeout(() => target.classList.remove('is-flagged'), 1600);
      });
      body.append(jump);
    }

    if (node.linkBack) {
      const footer = create('div', 'evidence-node-linkback');
      footer.append(create('span', 'evidence-node-linkback-label', 'How this connects'));
      footer.append(create('p', 'evidence-node-linkback-text', node.linkBack));
      body.append(footer);
    }

    card.append(body);
    return card;
  }

  const EVIDENCE_VIEW_KEY = 'eaePortfolioEvidenceView';
  const GRAPH_VIEW_KEY = 'eaePortfolioGraphView';
  let evidenceGridDrawn = false;
  let projectTimelineDrawn = false;

  const EVIDENCE_ALLOWED_VIEWS = new Set(['repository', 'project-timeline', 'evidence-grid']);

  // Older builds stored 'timeline' / 'projects'; map them onto the new modes so
  // returning visitors land on the closest equivalent instead of a reset view.
  function normalizeEvidenceView(view) {
    if (view === 'timeline') return 'repository';
    if (view === 'projects') return 'evidence-grid';
    return EVIDENCE_ALLOWED_VIEWS.has(view) ? view : 'repository';
  }

  // Certificates first, then projects, then hobbies — the order a reviewer reads in:
  // proof of completion, then the work itself, then the curiosity around it.
  const EVIDENCE_GROUPS = [
    { kinds: ['certificate'], label: 'Certificates', blurb: 'Verified completions and participation records.' },
    { kinds: ['project', 'achievement'], label: 'Projects', blurb: 'Work I designed, built, and reflected on.' },
    { kinds: ['hobby'], label: 'Hobbies', blurb: 'Self-directed exploration outside formal programmes.' }
  ];

  function renderEvidenceGrid() {
    const grid = $('#evidenceGridView');
    if (!grid) return;
    grid.replaceChildren();

    const index = buildEvidenceIndex();
    EVIDENCE_GROUPS.forEach((group) => {
      const nodes = index.filter((node) => group.kinds.includes(node.kind));
      if (!nodes.length) return;

      const section = create('section', 'evidence-group');
      section.dataset.group = group.label.toLowerCase();

      const heading = create('div', 'evidence-group-heading');
      heading.append(create('h3', 'evidence-group-title', group.label));
      heading.append(create('span', 'evidence-group-count', `${nodes.length}`));
      heading.append(create('p', 'evidence-group-blurb', group.blurb));
      section.append(heading);

      const row = create('div', 'evidence-node-grid');
      nodes.forEach((node) => row.append(renderEvidenceCard(node)));
      section.append(row);

      grid.append(section);
    });

    evidenceGridDrawn = true;
    setupReveal();
  }

  function getProjectYear(project) {
    const text = [
      project.status,
      project.date,
      project.developmentJourney,
      project.evidenceStatus,
      project.title
    ].filter(Boolean).join(' ');
    const match = text.match(/\b(20\d{2})\b/);
    return match ? match[1] : 'Current';
  }

  function getProjectTimelineSortValue(project) {
    const year = getProjectYear(project);
    return year === 'Current' ? 9999 : Number(year);
  }

  function renderProjectTimelineView() {
    const container = $('#projectTimelineView');
    if (!container) return;
    container.replaceChildren();

    const projects = Array.isArray(data.projects) ? data.projects : [];
    if (!projects.length) {
      container.append(create('p', 'git-empty-state', 'No projects available yet.'));
      return;
    }

    const ordered = [...projects].sort((a, b) => {
      const ay = getProjectTimelineSortValue(a);
      const by = getProjectTimelineSortValue(b);
      if (ay !== by) return ay - by;
      return (a.title || '').localeCompare(b.title || '');
    });

    const header = create('div', 'project-timeline-header');
    header.append(create('p', 'card-kicker', 'Project Timeline'));
    header.append(create('h3', '', 'How my projects built on each other'));
    header.append(create('p', '', 'A chronological view of the work I built, what each project trained, and what I carried forward into the next one.'));
    container.append(header);

    const timeline = create('div', 'project-timeline-track');

    ordered.forEach((project, index) => {
      const item = create('article', 'project-timeline-item reveal');
      item.dataset.projectTitle = project.title || '';

      const marker = create('div', 'project-timeline-marker');
      marker.append(create('span', 'project-timeline-dot', String(index + 1).padStart(2, '0')));

      const body = create('div', 'project-timeline-card');
      body.append(create('p', 'card-kicker', getProjectYear(project)));
      body.append(create('h3', '', project.title || 'Untitled project'));
      if (project.category) body.append(create('p', 'project-timeline-category', project.category));
      if (project.snapshotSummary || project.problem) {
        body.append(create('p', 'project-timeline-summary', project.snapshotSummary || project.problem));
      }
      if (project.portfolioSignal) {
        const signal = create('div', 'project-timeline-signal');
        signal.append(create('span', 'evidence-band-label', 'What this shows'));
        signal.append(create('p', '', project.portfolioSignal));
        body.append(signal);
      }
      if (project.carriedForward?.lesson) {
        const carry = create('div', 'carried-forward-callout');
        carry.append(create('span', 'carried-forward-badge', 'Carried forward'));
        carry.append(create('p', 'carried-forward-text', project.carriedForward.lesson));
        body.append(carry);
      }

      const actions = create('div', 'project-timeline-actions');
      const evidenceBtn = create('button', 'button button-secondary', 'View project evidence');
      evidenceBtn.type = 'button';
      evidenceBtn.addEventListener('click', () => openProjectModal(project));
      actions.append(evidenceBtn);
      body.append(actions);

      item.append(marker, body);
      timeline.append(item);
    });

    container.append(timeline);
    projectTimelineDrawn = true;
    refreshReveal(container);
  }

  function setEvidenceView(view) {
    const island = $('#evidenceIsland');
    const grid = $('#evidenceGridView');
    const projectTimeline = $('#projectTimelineView');
    // Only the graph itself swaps out. The Reflection Journal lives inside
    // #timeline-content and must stay readable in every view. Scoped to the
    // journey section so the Future Goals timeline never gets hidden with it.
    const graphParts = [
      ...document.querySelectorAll('#timeline-content .timeline-wrap'),
      $('#journeyChapters')
    ].filter(Boolean);
    if (!island || !grid || !projectTimeline || !graphParts.length) return;

    const safeView = normalizeEvidenceView(view);
    const isRepository = safeView === 'repository';
    const isProjectTimeline = safeView === 'project-timeline';
    const isEvidenceGrid = safeView === 'evidence-grid';

    if (isEvidenceGrid && !evidenceGridDrawn) renderEvidenceGrid();
    if (isProjectTimeline && !projectTimelineDrawn) renderProjectTimelineView();

    graphParts.forEach((part) => { part.hidden = !isRepository; });
    projectTimeline.hidden = !isProjectTimeline;
    grid.hidden = !isEvidenceGrid;
    document.body.dataset.evidenceView = safeView;

    island.querySelectorAll('.evidence-island-pill').forEach((pill) => {
      const active = pill.dataset.view === safeView;
      pill.classList.toggle('is-active', active);
      pill.setAttribute('aria-selected', String(active));
      pill.tabIndex = active ? 0 : -1;
    });

    try { localStorage.setItem(EVIDENCE_VIEW_KEY, safeView); } catch (error) { /* storage disabled */ }
  }

  // Projects, achievements, certificates and hobbies all render inside the evidence
  // surface now. Their original sections stay in the DOM so #ids and deep links keep
  // resolving, but their bodies are folded away so nothing renders — or is tabbable —
  // twice. Clicking one of their nav links lands on the surface in Projects view.
  const LEGACY_EVIDENCE_SECTIONS = ['projects', 'achievements', 'hobbies'];

  function foldLegacyEvidenceSections() {
    LEGACY_EVIDENCE_SECTIONS.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      section.classList.add('is-folded-into-evidence');
      Array.from(section.children).forEach((child) => { child.hidden = true; });
    });
  }

  function routeLegacyAnchorsToEvidence() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      if (!LEGACY_EVIDENCE_SECTIONS.includes(id)) return;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        setEvidenceView(id === 'projects' ? 'project-timeline' : 'evidence-grid');
        const surface = $('#timeline');
        if (surface) surface.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function setupEvidenceIsland() {
    const island = $('#evidenceIsland');
    const section = $('#timeline');
    if (!island || !section) return;

    foldLegacyEvidenceSections();
    routeLegacyAnchorsToEvidence();

    const pills = Array.from(island.querySelectorAll('.evidence-island-pill'));

    pills.forEach((pill) => {
      pill.addEventListener('click', () => setEvidenceView(pill.dataset.view));
    });

    island.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const current = pills.findIndex((pill) => pill.classList.contains('is-active'));
      const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + pills.length) % pills.length;
      setEvidenceView(pills[next].dataset.view);
      pills[next].focus();
    });

    let stored = 'repository';
    try { stored = localStorage.getItem(EVIDENCE_VIEW_KEY) || 'repository'; } catch (error) { /* storage disabled */ }
    setEvidenceView(normalizeEvidenceView(stored));

    // The island exists only while the surface it controls is on screen. A direct
    // rect test rather than IntersectionObserver: one cheap read per scroll, and it
    // still resolves correctly when the page is restored mid-scroll.
    const syncIslandPresence = () => {
      const { top, bottom } = section.getBoundingClientRect();
      island.classList.toggle('is-visible', top < window.innerHeight && bottom > 0);
    };

    window.addEventListener('scroll', syncIslandPresence, { passive: true });
    window.addEventListener('resize', syncIslandPresence, { passive: true });
    syncIslandPresence();
  }

  function renderProjects() {
    const filters = $('#projectFilters');
    const grid = $('#projectsGrid');
    const sortSelect = $('#projectSort');
    const resultCount = $('#projectResultCount');
    if (!grid) return;
    const projects = Array.isArray(data.projects)
      ? data.projects.filter((project) => project && typeof project === 'object')
      : [];
    const categories = ['All', ...new Set(projects.map((project) => project.category || 'Uncategorized'))];
    let activeCategory = 'All';
    let currentSort = sortSelect ? sortSelect.value || 'featured' : 'featured';

    const projectText = (project, primary, fallback) =>
      project[primary] ??
      (fallback ? project[fallback] : undefined);
    const projectTechs = (project) => {
      const technologies = project.technologies ?? project.technologiesUsed;
      if (Array.isArray(technologies)) return technologies.filter(Boolean);
      return typeof technologies === 'string'
        ? technologies.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    };
    const projectMedia = (project) => Array.isArray(project.images) ? project.images : [];

    if (sortSelect && !sortSelect.dataset.listenerAttached) {
      sortSelect.dataset.listenerAttached = 'true';
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        drawProjects();
      });
    }

    function drawFilters() {
      if (!filters) return;
      renderFilterButtons(
        filters,
        categories,
        (cat) => cat === activeCategory,
        (cat) => { activeCategory = cat; drawFilters(); drawProjects(); }
      );
    }

    function drawProjects() {
      const grid = $('#projectsGrid');
      const featuredGrid = $('#featuredProjectsGrid');
      if (grid) grid.replaceChildren();
      if (featuredGrid) featuredGrid.replaceChildren();

      let filteredProjects = projects.filter(
        (project) => activeCategory === 'All' || project.category === activeCategory
      );

      if (resultCount) {
        resultCount.textContent = `Showing ${filteredProjects.length} of ${projects.length} projects`;
      }

      const modeOrder = PROJECT_MODE_ORDER[currentViewMode] || null;

      filteredProjects.sort((a, b) => {
        if (currentSort === 'alpha') {
          return (a.title || '').localeCompare(b.title || '');
        } else if (currentSort === 'category') {
          const catDiff = (a.category || '').localeCompare(b.category || '');
          if (catDiff !== 0) return catDiff;
          return (a.title || '').localeCompare(b.title || '');
        }

        // Default 'featured' sorting
        const highlightDiff = Number(Boolean(b.highlighted)) - Number(Boolean(a.highlighted));
        if (highlightDiff !== 0) return highlightDiff;

        if (!modeOrder) return 0;

        const idxA = modeOrder.indexOf(a.title);
        const idxB = modeOrder.indexOf(b.title);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });

      filteredProjects.forEach((project, index) => {
        const originalIndex = data.projects.indexOf(project);

        // Helper to render a project card instance into a specified grid
        const renderCardInstance = (targetGrid, isFeaturedSection) => {
          if (!targetGrid) return;
          const article = create('article', 'project-card reveal');

          if (currentViewMode === 'timeline') {
            if (!isFeaturedSection) {
              article.classList.add('timeline-card-node');
            }
          } else if (currentViewMode === 'story' && !isFeaturedSection) {
            article.classList.add('story-card-node');

            if (index > 0) {
              const prevProject = filteredProjects[index - 1];
              if (project.carriedForward && project.carriedForward.fromProject === prevProject.title) {
                const connector = create('div', 'story-connector reveal');
                const line1 = create('div', 'story-connector-line');
                const callout = create('div', 'carried-forward-callout');
                callout.append(create('span', 'carried-forward-badge', 'What I carried forward'));
                callout.append(create('p', 'carried-forward-text', project.carriedForward.lesson));
                const line2 = create('div', 'story-connector-line');
                connector.append(line1, callout, line2);
                targetGrid.appendChild(connector);
              } else {
                const spacer = create('div', 'story-track-spacer reveal');
                spacer.append(create('span', 'track-label', 'Next Track: Engineering & Prototyping'));
                targetGrid.appendChild(spacer);
              }
            }
          }

          const slidesEmbedUrl = resolveSlidesEmbedUrl(project);
          const videoPath = typeof project.optionalVideo === 'string' ? project.optionalVideo.trim() : '';
          const hasEmbeddedVideo = /\.(webm|mp4|ogg)$/i.test(videoPath);
          const media = create('div', 'project-media');
          if (project.title && project.title.includes('SPD')) {
            media.classList.add('project-media-spd');
          }
          const mediaImages = projectMedia(project);
          let leadImage = mediaImages[0];

          if (project.highlighted) {
            article.classList.add('project-card--highlighted');
            const highlightBadge = create('span', 'project-highlight-badge', LABELS.featuredProject);
            article.append(highlightBadge);
          }

          // For projects like FLL with spreadsheet/developer screenshots, prioritize them as lead media
          const spreadsheetPath = typeof project.spreadsheet === 'string' ? project.spreadsheet.trim() : '';
          const devScreenshots = Array.isArray(project.developerScreenshots) ? project.developerScreenshots.filter(Boolean) : [];

          if (spreadsheetPath || devScreenshots.length) {
            // Lead visual: spreadsheet or first dev screenshot
            if (spreadsheetPath) {
              const ssPreview = create('button', 'project-media-spreadsheet-preview');
              ssPreview.type = 'button';
              ssPreview.setAttribute('aria-label', `View ${project.title} mission data spreadsheet`);
              ssPreview.append(create('span', 'project-media-badge', '📊'));
              ssPreview.append(create('span', 'project-media-label', 'Mission Data'));
              ssPreview.addEventListener('click', () => openMediaViewerModal(spreadsheetPath, `${project.title} Mission Data`));
              media.append(ssPreview);
            }

            // Developer screenshots gallery
            if (devScreenshots.length) {
              const devGallery = create('div', 'project-dev-screenshots');
              devGallery.append(create('p', 'project-dev-label', 'Development Progress'));
              const thumbs = create('div', 'project-dev-thumbnails');
              devScreenshots.forEach((src, i) => {
                const thumb = create('button', 'project-dev-thumb');
                thumb.type = 'button';
                thumb.setAttribute('aria-label', `View development screenshot ${i + 1}`);
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Development screenshot ${i + 1}`;
                img.loading = 'lazy';
                img.decoding = 'async';
                thumb.append(img);
                thumb.addEventListener('click', () => openFullImageModal(src, `${project.title} - Dev Screenshot ${i + 1}`));
                thumbs.append(thumb);
              });
              devGallery.append(thumbs);
              media.append(devGallery);
            }
          }

          if (slidesEmbedUrl) {
            media.classList.add('has-slides');
            const iframeContainer = create('div', 'project-media-iframe-wrap');
            const iframe = document.createElement('iframe');
            iframe.src = slidesEmbedUrl;
            iframe.loading = project.highlighted ? 'eager' : 'lazy';
            iframe.allowFullscreen = true;
            iframe.allow = 'fullscreen; autoplay; encrypted-media';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.setAttribute('allowfullscreen', '');
            iframe.title = `${project.title} slides presentation`;
            iframeContainer.append(iframe);
            media.append(iframeContainer);
            if (typeof project.slides === 'string' && project.slides.startsWith('http')) {
              const slidesBtn = create('button', 'text-button project-media-action-btn project-slides-btn', '📊 View Presentation Slides (In-App)');
              slidesBtn.type = 'button';
              slidesBtn.addEventListener('click', () => openMediaViewerModal(slidesEmbedUrl || project.slides, `${project.title} Presentation Slides`));
              media.append(slidesBtn);
            }
            if (mediaImages.length) {
              leadImage = appendProjectSupportingImages(media, project, mediaImages);
            }
          } else {
            leadImage = appendProjectImageMedia(media, project, mediaImages);
            if (hasEmbeddedVideo) {
              const video = document.createElement('video');
              video.src = videoPath;
              video.controls = true;
              video.preload = 'metadata';
              video.muted = true;
              video.playsInline = true;
              video.setAttribute('aria-label', `${project.title} demo video`);
              media.append(video);
            }
            if (!leadImage && !hasEmbeddedVideo) {
              media.append(createProjectPlaceholder(project));
            }
          }
          if (project.title && project.title.includes('FLL')) {
            media.append(createFLLMultiTechGraphComponent(project));
          }
          if (project.drawio) {
            const drawioBtn = create('button', 'text-button project-media-action-btn project-drawio-btn', '📐 View User Flowchart (Draw.io)');
            drawioBtn.type = 'button';
            drawioBtn.addEventListener('click', () => openMediaViewerModal(project.drawio, `${project.title} User Flowchart`));
            media.append(drawioBtn);
          }
          if (project.spreadsheet) {
            const ssBtn = create('button', 'text-button project-media-action-btn', '📊 View FLL Mission Data (Spreadsheet)');
            ssBtn.type = 'button';
            ssBtn.addEventListener('click', () => openMediaViewerModal(project.spreadsheet, `${project.title} - Mission Data`));
            media.append(ssBtn);
          }
          if (project.optionalVideo && !hasEmbeddedVideo) {
            const vidBtn = create('button', 'text-button project-media-action-btn', '🎬 View SkillQuest Video Demo');
            vidBtn.type = 'button';
            vidBtn.addEventListener('click', () => openMediaViewerModal(project.optionalVideo, `${project.title} Video Demo`));
            media.append(vidBtn);
          }
          article.append(media);

          // Band 2 — the details that identify and frame the media above.
          const body = create('div', 'project-body');
          const detailBand = create('div', 'evidence-details');
          detailBand.append(create('p', 'card-kicker', project.category || 'Portfolio Project'));
          detailBand.append(create('h3', '', project.title));

          if (project.status) {
            detailBand.append(create('p', 'date-line', project.status));
          }

          if (project.portfolioSignal) {
            const signalBlock = create('div', 'project-insight-card');
            signalBlock.append(create('h4', '', 'Portfolio Signal'));
            signalBlock.append(create('p', 'signal-text', project.portfolioSignal));
            detailBand.append(signalBlock);
          }

          if (project.eaeConnection) {
            const eaeBlock = create('div', 'project-insight-card project-evidence-status');
            eaeBlock.append(create('h4', '', 'EAE Connection'));
            eaeBlock.append(create('p', '', project.eaeConnection));
            detailBand.append(eaeBlock);
          }

          const techs = projectTechs(project);
          if (techs.length) {
            const techWrap = create('div', 'tag-grid');
            techs.slice(0, 6).forEach(t => techWrap.append(create('span', 'project-tech-chip', t)));
            detailBand.append(techWrap);
          }
          body.append(detailBand);

          // Band 3 — how the work was actually done. Stays a <details> so the
          // beforeprint handler can still force it open for the printed copy.
          const details = create('details', 'project-details evidence-method');
          const summary = create('summary', 'project-details-summary');
          summary.append(create('span', 'evidence-band-label', LABELS.howIDidIt));
          summary.append(create('span', 'evidence-band-hint', LABELS.readCaseStudyDetails));
          details.append(summary);

          const caseFields = [
            ['Problem', project.problem],
            ['Proposed Solution', project.proposedSolution],
            ['My Role', project.myRole],
            ['Development Journey', project.developmentJourney],
            ['Outcome', project.outcome],
            ['Lessons Learned', project.lessonsLearned],
          ].filter(([, val]) => Boolean(val));

          appendCaseRows(details, caseFields);
          body.append(details);

          const modalBtn = create('button', 'button button-secondary project-modal-btn', 'View full project details');
          modalBtn.type = 'button';
          modalBtn.addEventListener('click', () => openProjectModal(project));
          body.append(modalBtn);

          article.append(body);
          targetGrid.append(article);
        };

        // Always render in the main gallery
        if (grid) renderCardInstance(grid, false);
        // Also render in featured section if highlighted
        if (project.highlighted && featuredGrid) renderCardInstance(featuredGrid, true);
      });

      if (grid) refreshReveal(grid);
      if (featuredGrid) refreshReveal(featuredGrid);
    }

    drawFilters();
    drawProjects();
  }

  function renderCodeShowcase() {
    const container = $("#codeShowcaseContainer");
    if (!container) return;
    container.replaceChildren();

    const showcaseData = data.codeShowcase || {
      title: "Interactive Code Showcase",
      subtitle: "Explore, test, and edit real project code snippets live on the page.",
      snippets: []
    };

    const snippets = showcaseData.snippets || [];
    if (!snippets.length) return;

    let activeIndex = 0;

    const navTabs = create("div", "code-tabs-row");
    navTabs.setAttribute("role", "tablist");
    navTabs.setAttribute("aria-label", "Code Showcase Snippets");

    const codeCard = create("div", "code-showcase-card");

    function updateActiveSnippet(index) {
      activeIndex = index;
      const snippet = snippets[activeIndex];
      if (!snippet) return;

      navTabs.querySelectorAll(".code-tab-btn").forEach((btn, idx) => {
        const isActive = idx === activeIndex;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      codeCard.replaceChildren();

      // Header
      const header = create("div", "code-card-header");
      const titleWrap = create("div", "code-card-title-wrap");
      const langBadge = create("span", `code-lang-badge lang-${snippet.language || 'code'}`, (snippet.language || 'CODE').toUpperCase());
      const title = create("h3", "code-snippet-title", snippet.title);
      title.setAttribute("data-edit-path", `codeShowcase.snippets.${activeIndex}.title`);
      titleWrap.append(langBadge, title);

      const actions = create("div", "code-card-actions");
      const copyBtn = create("button", "button button-secondary code-action-btn", "📋 Copy Code");
      copyBtn.type = "button";
      copyBtn.addEventListener("click", () => {
        const codeText = codeCard.querySelector("code")?.textContent || snippet.code;
        navigator.clipboard.writeText(codeText).then(() => {
          showEditorToast("Code snippet copied to clipboard!");
        });
      });

      const runBtn = create("button", "button button-primary code-action-btn", "▶ Run Test");
      runBtn.type = "button";
      runBtn.addEventListener("click", () => {
        let outputBox = codeCard.querySelector(".code-terminal-output");
        if (!outputBox) {
          outputBox = create("div", "code-terminal-output");
          const termHeader = create("div", "term-header", "⚡ TERMINAL STDOUT OUTPUT");
          const termBody = create("pre", "term-body", snippet.simulatedOutput || "[*] Execution finished cleanly.");
          outputBox.append(termHeader, termBody);
          codeCard.append(outputBox);
        } else {
          outputBox.classList.toggle("is-hidden");
        }
      });

      actions.append(copyBtn, runBtn);
      header.append(titleWrap, actions);

      // Description
      const desc = create("p", "code-snippet-desc", snippet.description);
      desc.setAttribute("data-edit-path", `codeShowcase.snippets.${activeIndex}.description`);

      // Code Container
      const codeWrap = create("div", "code-block-wrap");
      const pre = create("pre", "code-pre");
      const codeEl = create("code", `code-content language-${snippet.language}`, snippet.code);
      codeEl.setAttribute("data-edit-path", `codeShowcase.snippets.${activeIndex}.code`);
      if (document.body.classList.contains("live-editing-active")) {
        codeEl.contentEditable = "true";
      }

      pre.append(codeEl);
      codeWrap.append(pre);

      codeCard.append(header, desc, codeWrap);
    }

    snippets.forEach((s, idx) => {
      const tabBtn = create("button", `code-tab-btn ${idx === 0 ? 'is-active' : ''}`, s.title);
      tabBtn.type = "button";
      tabBtn.setAttribute("role", "tab");
      tabBtn.addEventListener("click", () => updateActiveSnippet(idx));
      navTabs.append(tabBtn);
    });

    container.append(navTabs, codeCard);
    updateActiveSnippet(0);
  }

  function createProjectInsight(project) {
    const originalIndex = data.projects.indexOf(project);
    const insight = create("div", "project-insight");
    const signal = create("section", "project-insight-card");
    signal.append(create("h4", "", "What this proves"));

    const signalP = create("p", "", project.portfolioSignal || "Add the strongest applicant signal for this project.");
    signalP.dataset.editPath = `projects.${originalIndex}.portfolioSignal`;
    signal.append(signalP);
    insight.append(signal);

    const connection = create("section", "project-insight-card");
    connection.append(create("h4", "", "EAE connection"));

    const connectionP = create("p", "", project.eaeConnection || "Add how this project connects to the target course or school.");
    connectionP.dataset.editPath = `projects.${originalIndex}.eaeConnection`;
    connection.append(connectionP);
    insight.append(connection);

    if (project.evidenceStatus) {
      const status = create("p", "project-evidence-status", project.evidenceStatus);
      status.dataset.editPath = `projects.${originalIndex}.evidenceStatus`;
      insight.append(status);
    }

    return insight;
  }

  function createProjectPlaceholder(project) {
    const placeholder = create("div", "project-media-placeholder");
    placeholder.append(create("span", "project-media-kicker", project.category || "Project"));
    placeholder.append(create("strong", "", project.title || "Project evidence"));
    placeholder.append(
      create(
        "p",
        "",
        project.evidenceStatus || "Add a screenshot, certificate, or demo media when available."
      )
    );
    return placeholder;
  }

  function createProjectTechStrip(technologies) {
    const strip = create("div", "project-tech-strip");
    technologies.slice(0, 6).forEach((technology) => {
      strip.append(create("span", "project-tech-chip", technology));
    });
    return strip;
  }

  function renderApplications() {
    const grid = $("#applicationsGrid");
    if (!grid) return;
    grid.replaceChildren();
    const applications = Array.isArray(data.targetApplications)
      ? data.targetApplications.filter((application) => application && typeof application === "object")
      : [];
    applications.forEach((application) => {
      const card = create("article", "application-card reveal");
      const top = create("div", "application-top");
      top.append(create("span", "application-mark", application.shortName));
      top.append(create("h3", "", application.institution));

      card.append(top);
      card.append(create("p", "application-course", application.targetCourse));
      card.append(create("p", "", application.whyThisSchool));

      const list = create("ul", "compact-list");
      (application.evidenceToShow || []).filter(Boolean).forEach((item) => {
        const li = create("li", "", item);
        list.append(li);
      });
      card.append(list);
      grid.append(card);
    });
  }

  function renderAchievements() {
    const cards = $("#achievementCards");
    const timeline = $("#achievementTimeline");
    const filters = $("#achievementFilters");
    const search = $("#achievementSearch");
    const resultCount = $("#achievementResultCount");
    const achievements = Array.isArray(data.achievements)
      ? data.achievements.filter((achievement) => achievement && typeof achievement === "object")
      : [];
    const categories = ["All", ...new Set(achievements.map((achievement) => achievement.category || "Uncategorized"))];
    let activeCategory = "All";

    function drawFilters() {
      if (!filters) return;
      renderFilterButtons(
        filters,
        categories,
        (cat) => cat === activeCategory,
        (cat) => { activeCategory = cat; drawFilters(); drawCards(); }
      );
    }

    function getBranchColor(branchId) {
      return LEARNING_REPO_BRANCH_COLORS[branchId] || '#94a3b8';
    }

    function ensureLearningRepositoryBase() {
      data.learningRepository = data.learningRepository || {};
      const repo = data.learningRepository;

      repo.title = repo.title || 'Learning Repository';
      repo.intro = repo.intro || 'A Git-style visual history of how my coding, robotics, cybersecurity, academic growth, and EAE direction developed over time.';

      repo.branches = Array.isArray(repo.branches) && repo.branches.length
        ? repo.branches
        : LEARNING_REPO_BRANCH_ORDER.map((id) => ({
            id,
            label: LEARNING_REPO_BRANCH_LABELS[id] || id,
            color: getBranchColor(id),
            description: ''
          }));

      repo.commits = Array.isArray(repo.commits) ? repo.commits : [];
      repo.commitOverrides = repo.commitOverrides || {};

      return repo;
    }

    function generateLearningRepoCommitsFromPortfolio() {
      return [
        {
          id: 'commit-scratch-coder-course',
          title: 'Scratch Coder Course',
          message: 'init: started coding journey with logic blocks',
          date: 'February 2019 - September 2019',
          branch: 'main',
          parent: null,
          mergeParents: [],
          order: 1,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'Scratch Coder Course',
          summary: 'The beginning of my coding journey, where I learned variables, loops, functions, lists, Boolean logic, and conditionals.'
        },
        {
          id: 'commit-mit-app-inventor',
          title: 'MIT App Inventor Appathon',
          message: 'feat: built first mobile app interaction',
          date: 'July 2020 - August 2020',
          branch: 'main',
          parent: 'commit-scratch-coder-course',
          mergeParents: [],
          order: 2,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'MIT App Inventor Appathon',
          summary: 'Created Mpainter, an app for drawing on photographs and a digital whiteboard.'
        },
        {
          id: 'commit-python-basic',
          title: 'Python Coder Course - Basic',
          message: 'branch: moved from block logic into Python syntax',
          date: 'February 2021 - July 2021',
          branch: 'coding',
          parent: 'commit-mit-app-inventor',
          mergeParents: [],
          order: 3,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'Python Coder Course - Basic',
          summary: 'Transitioned into text-based programming with Python syntax, Turtle, recursion, variables, loops, and functions.'
        },
        {
          id: 'commit-robotics-nrc',
          title: 'NRC Robotics Competition',
          message: 'branch: applied logic to robotics movement and sensors',
          date: 'September 2021',
          branch: 'robotics',
          parent: 'commit-python-basic',
          mergeParents: [],
          order: 4,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'NRC Robotics Competition',
          summary: 'Applied programming logic to virtual robotics, movement planning, sensor thresholds, and debugging.'
        },
        {
          id: 'commit-python-intermediate',
          title: 'Python Coder Course - Intermediate',
          message: 'feat: built interactive games and GUI systems',
          date: 'October 2021 - March 2022',
          branch: 'coding',
          parent: 'commit-python-basic',
          mergeParents: [],
          order: 5,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'Python Coder Course - Intermediate',
          summary: 'Built interactive applications using Pygame, Tkinter, game states, GUI logic, and event-driven design.'
        },
        {
          id: 'commit-roblox-sdg',
          title: 'Roblox Global Goal Challenge',
          message: 'feat: used games to explain real-world issues',
          date: 'December 2021',
          branch: 'coding',
          parent: 'commit-python-intermediate',
          mergeParents: [],
          order: 6,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'Roblox Global Goal Challenge',
          summary: 'Created an underwater Roblox obstacle course inspired by SDG 14 - Life Below Water.'
        },
        {
          id: 'commit-python-advanced',
          title: 'Python Advanced',
          message: 'feat: deepened OOP, data structures, and algorithms',
          date: 'April 2022 - September 2022',
          branch: 'coding',
          parent: 'commit-python-intermediate',
          mergeParents: [],
          order: 7,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'Python Advanced',
          summary: 'Developed stronger software structure through object-oriented programming, algorithms, and modular design.'
        },
        {
          id: 'commit-math-growth',
          title: 'Mathematics Growth Journey',
          message: 'refactor: strengthened quantitative thinking through resilience',
          date: '2021 - 2024',
          branch: 'academic-growth',
          parent: 'commit-python-basic',
          mergeParents: [],
          order: 8,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'Mathematics Growth Journey',
          summary: 'A personal growth path from struggling with mathematics to building confidence and discipline.'
        },
        {
          id: 'commit-ycep',
          title: 'YCEP Certificate of Participation',
          message: 'branch: entered cybersecurity through networking and forensics',
          date: 'June 2025',
          branch: 'cybersecurity',
          parent: 'commit-python-advanced',
          mergeParents: [],
          order: 9,
          type: 'achievement',
          visible: true,
          linkedAchievement: 'YCEP Certificate of Participation',
          summary: 'Explored cybersecurity fundamentals, networking, ethical hacking concepts, and digital forensics.'
        },
        {
          id: 'commit-fll-robot-design',
          title: 'FLL 2026 Unearthed Robot Design & Planning',
          message: 'feat: engineered robot systems with torque and flowchart planning',
          date: '2026',
          branch: 'robotics',
          parent: 'commit-robotics-nrc',
          mergeParents: [],
          order: 10,
          type: 'project',
          visible: true,
          linkedProject: 'FLL 2026 Unearthed Robot Design & Planning',
          summary: 'Designed a modular robot system using gear ratios, mission planning, movement flowcharts, and sensor logic.'
        },
        {
          id: 'commit-kodecoon-project-journey',
          title: 'Kodecoon Project Journey',
          message: 'feat: curated long-term coding growth into project evidence',
          date: '2019 - 2022',
          branch: 'coding',
          parent: 'commit-python-advanced',
          mergeParents: [],
          order: 11,
          type: 'project',
          visible: true,
          linkedProject: 'Kodecoon Project Journey',
          summary: 'Curated long-term coding progress across Scratch, App Inventor, Spark AR, Roblox, Python, Tkinter, and Pygame.'
        },
        {
          id: 'commit-skillquest',
          title: 'PyCon Hackathon & SkillQuest',
          message: 'merge: combined software, data, AI, and cybersecurity education',
          date: 'June 2026',
          branch: 'cybersecurity',
          parent: 'commit-ycep',
          mergeParents: ['commit-kodecoon-project-journey'],
          order: 12,
          type: 'project',
          visible: true,
          linkedProject: 'PyCon Hackathon & SkillQuest (Cybersecurity & Career Education)',
          summary: 'Built a personalised career and upskilling platform combining software development, data, recommendation logic, and cybersecurity education.'
        },
        {
          id: 'commit-portfolio-website',
          title: 'Personal Student Portfolio Website',
          message: 'docs: organized evidence into a data-driven portfolio',
          date: '2026',
          branch: 'projects',
          parent: 'commit-kodecoon-project-journey',
          mergeParents: ['commit-math-growth'],
          order: 13,
          type: 'project',
          visible: true,
          linkedProject: 'Personal Student Portfolio Website',
          summary: 'Built this portfolio as a structured, editable, data-driven website to present projects, achievements, and reflections.'
        },
        {
          id: 'commit-spd-portal',
          title: 'SPD Caregiver & Admin Event Portal Prototype',
          message: 'feat: designed secure role-based system for real users',
          date: '2026',
          branch: 'projects',
          parent: 'commit-portfolio-website',
          mergeParents: ['commit-skillquest'],
          order: 14,
          type: 'project',
          visible: true,
          linkedProject: 'SPD Caregiver & Admin Event Portal Prototype',
          summary: 'Designed an accessible event portal prototype with caregiver/admin flows, reporting dashboards, and role-based thinking.'
        },
        {
          id: 'commit-eae-direction',
          title: 'EAE Direction',
          message: 'merge: connected coding, robotics, cybersecurity, and academic growth',
          date: 'Current',
          branch: 'eae-direction',
          parent: 'commit-spd-portal',
          mergeParents: [
            'commit-fll-robot-design',
            'commit-skillquest',
            'commit-math-growth'
          ],
          order: 15,
          type: 'milestone',
          visible: true,
          summary: 'My learning paths now converge toward cybersecurity and digital forensics for SP and NP.'
        }
      ];
    }

    // SHA-like ids and diff stats below are symbolic portfolio metadata derived
    // deterministically from each commit id — not a real Git history. The commit
    // details modal states this explicitly so reviewers are never misled.
    function pseudoSha(input) {
      let hash = 0;
      const text = String(input || 'commit');
      for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(7, '0').slice(0, 7);
    }

    function buildPortfolioChangedFiles(commit) {
      const files = [];
      if (commit.linkedProject) {
        files.push({
          path: 'data.js',
          status: 'modified',
          note: `Linked project evidence: ${commit.linkedProject}`
        });
        files.push({
          path: 'images/projects/',
          status: 'added',
          note: 'Project media or supporting visual evidence'
        });
      }
      if (commit.linkedAchievement) {
        files.push({
          path: 'data.js',
          status: 'modified',
          note: `Linked achievement evidence: ${commit.linkedAchievement}`
        });
        files.push({
          path: 'images/certificates/',
          status: 'added',
          note: 'Certificate or proof asset'
        });
      }
      if (!files.length) {
        files.push({
          path: 'portfolio-story.md',
          status: 'modified',
          note: 'Narrative milestone update'
        });
      }
      return files;
    }

    function enrichLearningCommit(commit) {
      const sha = commit.sha || pseudoSha(`${commit.id}-${commit.title}-${commit.order}`);
      const statsSeed = parseInt(sha.slice(0, 3), 16) || 100;
      return {
        author: 'Jaron Chew',
        sha,
        shortSha: sha.slice(0, 7),
        refs: [
          commit.branch ? `branch:${commit.branch}` : '',
          commit.type === 'milestone' ? 'tag:eae-direction' : ''
        ].filter(Boolean),
        filesChanged: Math.max(1, statsSeed % 9),
        additions: Math.max(8, statsSeed % 320),
        deletions: statsSeed % 60,
        changedFiles: buildPortfolioChangedFiles(commit),
        ...commit
      };
    }

    function buildLearningRepositoryState() {
      const repo = ensureLearningRepositoryBase();

      const generated = generateLearningRepoCommitsFromPortfolio();
      const manual = Array.isArray(repo.commits) ? repo.commits : [];
      const overrides = repo.commitOverrides || {};
      const byId = new Map();

      generated.forEach((commit) => {
        byId.set(commit.id, { ...commit });
      });

      manual.forEach((commit) => {
        if (!commit || !commit.id) return;
        byId.set(commit.id, {
          ...(byId.get(commit.id) || {}),
          ...commit
        });
      });

      Object.entries(overrides).forEach(([id, override]) => {
        if (!byId.has(id)) return;
        byId.set(id, {
          ...byId.get(id),
          ...override
        });
      });

      repo.commits = Array.from(byId.values())
        .filter((commit) => commit && commit.visible !== false)
        .map(enrichLearningCommit)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      return repo;
    }

    function assignBranchLanes(commits, branches) {
      const laneMap = new Map();

      LEARNING_REPO_BRANCH_ORDER.forEach((id, index) => {
        laneMap.set(id, index);
      });

      (branches || []).forEach((branch) => {
        if (branch && branch.id && !laneMap.has(branch.id)) {
          laneMap.set(branch.id, laneMap.size);
        }
      });

      (commits || []).forEach((commit) => {
        if (commit && commit.branch && !laneMap.has(commit.branch)) {
          laneMap.set(commit.branch, laneMap.size);
        }
      });

      return laneMap;
    }

    function buildCommitGraphRows(commits, laneMap) {
      const byId = new Map((commits || []).map((commit) => [commit.id, commit]));

      return (commits || []).map((commit, rowIndex) => {
        const parent = commit.parent ? byId.get(commit.parent) : null;
        const mergeParents = Array.isArray(commit.mergeParents)
          ? commit.mergeParents.map((id) => byId.get(id)).filter(Boolean)
          : [];

        return {
          commit,
          rowIndex,
          lane: laneMap.get(commit.branch) || 0,
          parent,
          parentLane: parent ? laneMap.get(parent.branch) : null,
          mergeParents,
          mergeParentLanes: mergeParents.map((p) => laneMap.get(p.branch)).filter((lane) => lane !== undefined),
          isMerge: mergeParents.length > 0
        };
      });
    }

    function createSvgElement(tag, attrs = {}) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          el.setAttribute(key, String(value));
        }
      });
      return el;
    }

    // Rounded-elbow connector: straight down the parent's lane, a rounded corner,
    // then straight across into the child's lane — the presentation-friendly
    // "subway map" shape, not a sweeping curve.
    function connectorPath(from, to) {
      if (from.x === to.x) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      const dir = to.x > from.x ? 1 : -1;
      const span = Math.abs(to.x - from.x);
      const bend = Math.max(6, Math.min(26, span, (to.y - from.y) / 2));
      return `M ${from.x} ${from.y} L ${from.x} ${to.y - bend} Q ${from.x} ${to.y} ${from.x + dir * bend} ${to.y} L ${to.x} ${to.y}`;
    }

    // Paints the whole graph into one overlay SVG that spans every row, so branch
    // lines stay continuous across row gaps and variable card heights.
    function paintLearningGraph(container) {
      const graph = container && container.__learningGraph;
      const body = container?.querySelector('.git-repo-body');
      const layer = container?.querySelector('.git-graph-layer');
      if (!graph || !body || !layer) return;

      const height = body.offsetHeight;
      if (!height) return;

      const columnWidth = parseFloat(getComputedStyle(body).getPropertyValue('--git-graph-col')) || 240;
      const laneCount = Math.max(1, graph.laneMap.size);
      // Lanes are sized to fit the column at every breakpoint: on a narrow phone the
      // gap (and the nodes with it) shrink rather than spilling past the column edge.
      const leftPad = Math.max(8, Math.min(24, columnWidth * 0.1));
      const usableWidth = Math.max(0, columnWidth - leftPad * 2);
      const laneGap = laneCount > 1 ? Math.min(28, usableWidth / (laneCount - 1)) : 0;
      const nodeRadius = Math.max(3.5, Math.min(7, laneGap * 0.42));
      const laneX = (lane) => leftPad + lane * laneGap;

      layer.replaceChildren();
      layer.setAttribute('viewBox', `0 0 ${columnWidth} ${height}`);
      layer.setAttribute('preserveAspectRatio', 'none');
      layer.style.width = `${columnWidth}px`;
      layer.style.height = `${height}px`;

      // Rows are positioned relative to .git-repo-body, so offsetTop is enough.
      const nodeFor = new Map();
      graph.rows.forEach((row) => {
        const el = body.querySelector(`[data-commit-id="${row.commit.id}"]`);
        if (!el) return;
        nodeFor.set(row.commit.id, {
          x: laneX(row.lane),
          y: el.offsetTop + Math.min(52, el.offsetHeight / 2)
        });
      });

      // 1. Edges first, so nodes sit on top of them. Each edge carries the id of
      // the commit it arrives at plus its row index, for hover focus and the
      // staggered draw-in animation.
      graph.rows.forEach((row) => {
        const to = nodeFor.get(row.commit.id);
        if (!to) return;
        const parent = row.parent && nodeFor.get(row.parent.id);
        if (parent) {
          const color = graph.colorFor(row.commit.branch);
          layer.append(createSvgElement('path', {
            class: 'git-parent-line',
            d: connectorPath(parent, to),
            stroke: color,
            'data-commit': row.commit.id,
            'data-row': row.rowIndex,
            style: `color:${color}`
          }));
        }
        row.mergeParents.forEach((mergeParent) => {
          const from = nodeFor.get(mergeParent.id);
          if (!from) return;
          const color = graph.colorFor(mergeParent.branch);
          layer.append(createSvgElement('path', {
            class: 'git-merge-line',
            d: connectorPath(from, to),
            stroke: color,
            'data-commit': row.commit.id,
            'data-row': row.rowIndex,
            style: `color:${color}`
          }));
        });
      });

      // 2. Commit nodes. Standard commits are solid glowing dots; merge commits
      // render as a hollow ring with a solid core so they read differently at a
      // glance, the way premium Git GUIs draw them.
      graph.rows.forEach((row) => {
        const point = nodeFor.get(row.commit.id);
        if (!point) return;
        const color = graph.colorFor(row.commit.branch);
        layer.append(createSvgElement('circle', {
          class: 'git-commit-node-ring', cx: point.x, cy: point.y, r: nodeRadius + 5, stroke: color,
          'data-commit': row.commit.id, 'data-row': row.rowIndex, style: `color:${color}`
        }));
        if (row.isMerge) {
          layer.append(createSvgElement('circle', {
            class: 'git-commit-node git-merge-node',
            cx: point.x, cy: point.y, r: nodeRadius + 1.5,
            'data-commit': row.commit.id, 'data-row': row.rowIndex, style: `color:${color}`
          }));
          layer.append(createSvgElement('circle', {
            class: 'git-commit-node git-merge-node-core',
            cx: point.x, cy: point.y, r: Math.max(2.2, nodeRadius - 2.4),
            fill: color,
            'data-commit': row.commit.id, 'data-row': row.rowIndex, style: `color:${color}`
          }));
        } else {
          layer.append(createSvgElement('circle', {
            class: 'git-commit-node',
            cx: point.x, cy: point.y, r: nodeRadius,
            fill: color,
            'data-commit': row.commit.id, 'data-row': row.rowIndex, style: `color:${color}`
          }));
        }
      });

      // 3. Tag diamonds for the chapters that annotate a commit, like `--decorate`.
      graph.tagAnchors.forEach((label, commitId) => {
        const point = nodeFor.get(commitId);
        if (!point) return;
        const row = graph.rows.find((item) => item.commit.id === commitId);
        const color = graph.colorFor(row?.commit.branch);
        const size = Math.max(3, nodeRadius * 0.8);
        const x = Math.min(point.x + nodeRadius + 8, columnWidth - size - 2);
        layer.append(createSvgElement('path', {
          class: 'git-tag-marker',
          d: `M ${x} ${point.y - size} L ${x + size} ${point.y} L ${x} ${point.y + size} L ${x - size} ${point.y} Z`,
          fill: color,
          'data-commit': commitId,
          'data-row': row?.rowIndex,
          style: `color:${color}`
        }));
      });

      // 4. Branch decoration at the first commit of each lane.
      const decorated = new Set();
      graph.rows.forEach((row) => {
        if (decorated.has(row.commit.branch)) return;
        decorated.add(row.commit.branch);
        const point = nodeFor.get(row.commit.id);
        if (!point) return;
        // Labels on right-hand lanes are anchored inward so long branch names
        // (eae-direction, academic-growth) stay inside the graph column.
        const name = row.commit.branch;
        const fitsRight = point.x + 13 + name.length * 5.4 <= columnWidth - 2;
        const text = createSvgElement('text', {
          class: 'git-branch-label',
          x: fitsRight ? point.x + 13 : Math.max(2, point.x - 13),
          y: point.y - 15,
          'text-anchor': fitsRight ? 'start' : 'end',
          fill: graph.colorFor(name)
        });
        text.textContent = name;
        layer.append(text);
      });

      setupGraphDrawAnimation(container, layer, body);
      if (container.__graphFocusId) applyGraphFocus(container, container.__graphFocusId);
    }

    // Presentation draw-in: branch lines sketch themselves top-to-bottom the first
    // time the graph scrolls into view (stroke-dasharray/-dashoffset), and nodes
    // pop in as the line reaches their row. Runs once per page load; repaints
    // afterwards render the finished state so resizes never re-trigger it.
    function setupGraphDrawAnimation(container, layer, body) {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion || container.__graphDrawDone) return;

      const paths = Array.from(layer.querySelectorAll('.git-parent-line, .git-merge-line'));
      const nodes = Array.from(layer.querySelectorAll('.git-commit-node, .git-commit-node-ring, .git-tag-marker, .git-branch-label'));
      if (!paths.length && !nodes.length) return;

      const STEP = 110; // ms of stagger per graph row

      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        path.style.transition = 'none';
      });
      nodes.forEach((node) => node.classList.add('git-node-pending'));

      // Re-queries the layer at fire time: a repaint between arming and firing
      // replaces every path/node, so a captured list would animate dead elements
      // and leave the live graph invisible.
      const run = () => {
        if (container.__graphDrawDone) return;
        container.__graphDrawDone = true;
        const liveLayer = container.querySelector('.git-graph-layer');
        if (!liveLayer) return;
        const livePaths = Array.from(liveLayer.querySelectorAll('.git-parent-line, .git-merge-line'));
        const liveNodes = Array.from(liveLayer.querySelectorAll('.git-commit-node, .git-commit-node-ring, .git-tag-marker, .git-branch-label'));

        let longest = 0;
        livePaths.forEach((path) => {
          const delay = Number(path.dataset.row || 0) * STEP;
          longest = Math.max(longest, delay + 900);
          path.style.transition = `stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
          path.style.strokeDashoffset = '0';
        });
        liveNodes.forEach((node) => {
          const delay = Number(node.dataset.row || 0) * STEP + 260;
          longest = Math.max(longest, delay + 500);
          node.style.transitionDelay = `${delay}ms`;
          node.classList.add('git-node-arrived');
        });
        // Once drawn, clear the inline helpers: merge lines get their CSS dash
        // pattern back and hover styles stop being shadowed by inline values.
        window.setTimeout(() => {
          livePaths.forEach((path) => {
            path.style.strokeDasharray = '';
            path.style.strokeDashoffset = '';
            path.style.transition = '';
          });
          liveNodes.forEach((node) => {
            node.style.transitionDelay = '';
            node.classList.remove('git-node-pending', 'git-node-arrived');
          });
        }, longest + 250);
      };

      // Arm exactly once. Repaints (fonts, resize, view switches) used to
      // disconnect and re-create the observer, which could destroy it before it
      // ever fired and strand the graph at stroke-dashoffset/scale(0).
      if (container.__graphDrawArmed) return;
      container.__graphDrawArmed = true;

      if (!('IntersectionObserver' in window)) { run(); return; }
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      }, { threshold: 0.12 });
      observer.observe(body);
      // Failsafe: the graph must never stay invisible in a live presentation,
      // whatever the observer does.
      window.setTimeout(run, 2500);
    }

    // Hover isolation: light up the hovered commit's node and the lines arriving
    // at it, dim every unrelated branch path, and echo the focus on the cards.
    function applyGraphFocus(container, commitId) {
      const layer = container?.querySelector('.git-graph-layer');
      const body = container?.querySelector('.git-repo-body');
      if (!layer || !body) return;
      container.__graphFocusId = commitId || null;

      layer.classList.toggle('has-focus', Boolean(commitId));
      body.classList.toggle('has-focus', Boolean(commitId));

      layer.querySelectorAll('.is-focus').forEach((el) => el.classList.remove('is-focus'));
      body.querySelectorAll('.git-commit-row.is-focus').forEach((el) => el.classList.remove('is-focus'));
      if (!commitId) return;

      layer.querySelectorAll(`[data-commit="${commitId}"]`).forEach((el) => el.classList.add('is-focus'));
      const row = body.querySelector(`.git-commit-row[data-commit-id="${commitId}"]`);
      if (row) row.classList.add('is-focus');
    }

    function setGraphViewMode(container, mode) {
      const safeMode = mode === 'gallery' ? 'gallery' : 'timeline';
      container.dataset.graphView = safeMode;

      container.querySelectorAll('.git-view-toggle-btn').forEach((btn) => {
        const active = btn.dataset.graphViewMode === safeMode;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });

      try { localStorage.setItem(GRAPH_VIEW_KEY, safeMode); } catch (error) { /* storage disabled */ }

      // Card rows reflow between the two layouts (graph rail vs. plain grid), so
      // node/line coordinates only make sense once Timeline is visible again.
      if (safeMode === 'timeline') scheduleGraphPaint(container);
    }

    function scheduleGraphPaint(container) {
      const paint = () => paintLearningGraph(container);
      requestAnimationFrame(() => requestAnimationFrame(paint));
      if (document.fonts?.ready) document.fonts.ready.then(paint).catch(() => {});
      if (container.__learningGraphObserver) container.__learningGraphObserver.disconnect();
      if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => paint());
        const body = container.querySelector('.git-repo-body');
        if (body) observer.observe(body);
        container.__learningGraphObserver = observer;
      }
      window.addEventListener('resize', paint, { passive: true });
    }

    function createLinkedCommitAction(commit) {
      if (commit.linkedAchievement) {
        const achievement = (data.achievements || []).find((item) => item.title === commit.linkedAchievement);
        if (achievement) {
          const btn = create('button', 'button button-secondary git-commit-action', 'Open evidence');
          btn.type = 'button';
          btn.addEventListener('click', () => openAchievementModal(achievement));
          return btn;
        }
      }

      if (commit.linkedProject) {
        const project = (data.projects || []).find((item) => item.title === commit.linkedProject);
        if (project) {
          // The legacy #projects section is folded into the evidence surface, so
          // scrolling there lands on a zero-height node. Open the modal instead.
          const btn = create('button', 'button button-secondary git-commit-action', 'View project');
          btn.type = 'button';
          btn.addEventListener('click', () => openProjectModal(project));
          return btn;
        }
      }
      return null;
    }

    function openCommitDetailsModal(commit, repo) {
      const dialog = $(SELECTORS.achievementModal);
      const content = $(SELECTORS.modalContent);
      if (!dialog || !content || !commit) return;

      dialog.classList.remove('modal-school-portfolio');
      dialog.classList.add('modal-wide');
      const closeButton = dialog.querySelector('.modal-close');
      if (closeButton) closeButton.setAttribute('aria-label', 'Close commit details');
      content.replaceChildren();

      const branch = (repo.branches || []).find((item) => item.id === commit.branch);

      const header = create('div', 'modal-header git-commit-detail-header');
      header.append(create('p', 'card-kicker', `commit ${commit.shortSha || commit.sha || commit.id}`));
      header.append(create('h2', '', commit.title || 'Commit details'));
      header.append(create('p', 'git-commit-message', commit.message || 'chore: updated learning record'));
      if (commit.summary) header.append(create('p', 'modal-summary', commit.summary));

      const meta = create('dl', 'git-commit-detail-meta');
      const addMeta = (label, value) => {
        if (!value || (Array.isArray(value) && !value.length)) return;
        const row = create('div', 'git-commit-detail-row');
        row.append(create('dt', '', label));
        row.append(create('dd', '', Array.isArray(value) ? value.join(', ') : String(value)));
        meta.append(row);
      };

      addMeta('SHA', commit.sha || commit.id);
      addMeta('Author', commit.author || 'Jaron Chew');
      addMeta('Email', commit.email || data.profile?.contact?.email);
      addMeta('Date', commit.date);
      addMeta('Branch', branch?.label || commit.branch);
      addMeta('Type', commit.type);
      addMeta('Refs', commit.refs);
      addMeta('Parent', commit.parent);
      addMeta('Merge parents', commit.mergeParents);

      const stats = create('div', 'git-commit-stats');
      stats.append(create('span', 'git-stat-chip', `${commit.filesChanged || 0} files changed`));
      stats.append(create('span', 'git-stat-chip git-stat-add', `+${commit.additions || 0}`));
      stats.append(create('span', 'git-stat-chip git-stat-del', `-${commit.deletions || 0}`));

      const filesSection = create('section', 'git-changed-files');
      filesSection.append(create('h3', '', 'Changed files'));
      const fileList = create('div', 'git-file-list');
      const files = Array.isArray(commit.changedFiles) ? commit.changedFiles : [];

      if (!files.length) {
        fileList.append(create('p', 'git-empty-state', 'No changed file details added for this learning commit yet.'));
      } else {
        files.forEach((file) => {
          const item = create('article', 'git-file-row');
          item.dataset.status = file.status || 'modified';
          const top = create('div', 'git-file-row-top');
          top.append(create('span', 'git-file-status', file.status || 'modified'));
          top.append(create('code', 'git-file-path', file.path || 'unknown-file'));
          if (file.additions != null || file.deletions != null) {
            top.append(create('span', 'git-file-diffstat', `+${file.additions || 0} -${file.deletions || 0}`));
          }
          item.append(top);
          if (file.note || file.summary) item.append(create('p', 'git-file-summary', file.note || file.summary));
          fileList.append(item);
        });
      }
      filesSection.append(fileList);

      const disclaimer = create('p', 'git-symbolic-note', 'This is a symbolic learning-repository view: SHAs, stats, and file paths represent portfolio evidence, not a real Git history.');

      const actions = create('div', 'git-commit-detail-actions');
      const copySha = create('button', 'button button-secondary', 'Copy SHA');
      copySha.type = 'button';
      copySha.addEventListener('click', () => {
        navigator.clipboard?.writeText(commit.sha || commit.id);
        showEditorToast('Commit SHA copied');
      });
      actions.append(copySha);
      const linkedAction = createLinkedCommitAction(commit);
      if (linkedAction) actions.append(linkedAction);

      content.append(header, meta, stats, filesSection, disclaimer, actions);
      openModalDialog(dialog);
    }

    function createGitCommitCard(commit, repo, tagLabel, colorFor) {
      const card = create('article', 'git-commit-card reveal');
      card.dataset.commitId = commit.id;
      card.dataset.branch = commit.branch;

      const branch = (repo.branches || []).find((item) => item.id === commit.branch);
      const color = colorFor ? colorFor(commit.branch) : (branch?.color || getBranchColor(commit.branch));

      const meta = create('div', 'git-commit-meta');

      const branchPill = create('span', 'git-branch-pill', branch?.label || commit.branch);
      branchPill.style.setProperty('--branch-color', color);
      meta.append(branchPill);

      if (tagLabel) {
        const tagPill = create('span', 'git-tag-pill', `tag: ${slugify(tagLabel)}`);
        tagPill.style.setProperty('--branch-color', color);
        meta.append(tagPill);
      }

      if (commit.type) {
        meta.append(create('span', 'git-commit-type', commit.type));
      }

      if (commit.date) {
        meta.append(create('span', 'git-commit-date', commit.date));
      }

      if (commit.shortSha || commit.sha) {
        meta.append(create('span', 'git-commit-sha', commit.shortSha || commit.sha));
      }

      card.append(meta);
      card.append(create('h3', '', commit.title || 'Untitled commit'));
      card.append(create('p', 'git-commit-message', commit.message || 'chore: updated learning record'));

      if (commit.summary) {
        card.append(create('p', 'git-commit-summary', commit.summary));
      }

      if (Array.isArray(commit.mergeParents) && commit.mergeParents.length) {
        const mergeNote = create('p', 'git-merge-note', `Merge commit • ${commit.mergeParents.length} incoming path${commit.mergeParents.length > 1 ? 's' : ''}`);
        card.append(mergeNote);
      }

      const action = createLinkedCommitAction(commit);
      if (action) card.append(action);

      const detailsBtn = create('button', 'button button-secondary git-commit-action', 'View commit details');
      detailsBtn.type = 'button';
      detailsBtn.addEventListener('click', () => openCommitDetailsModal(commit, repo));
      card.append(detailsBtn);

      return card;
    }

    // Maps commit id -> chapter label for the commits that "A Map of Me" annotates.
    function buildTagAnchorMap() {
      const anchors = new Map();
      (data.personalMap?.cards || []).forEach((card, index) => {
        const commitId = card.anchorCommit || JOURNEY_TAG_ANCHORS[index];
        if (commitId) anchors.set(commitId, card.label || `chapter-${index + 1}`);
      });
      return anchors;
    }

    // Maps commit id -> the reflections attached to it, like `git log --notes`.
    function buildNotesByCommit() {
      const byCommit = new Map();
      (data.reflections || []).forEach((reflection, index) => {
        const commitId = reflection.noteOn || REFLECTION_NOTE_ANCHORS[index];
        if (!commitId) return;
        if (!byCommit.has(commitId)) byCommit.set(commitId, []);
        byCommit.get(commitId).push({ reflection, index });
      });
      return byCommit;
    }

    // Rendered inside the commit card, indented, the way `git log --notes` prints
    // a "Notes:" block beneath the commit it belongs to.
    function createAttachedNote({ reflection, index }) {
      const note = create('div', 'git-note-attached');
      note.id = `reflection-${slugify(reflection.title)}`;

      const head = create('div', 'git-note-head');
      head.append(create('span', 'git-note-command', 'Notes:'));
      head.append(create('span', 'git-note-ref', `refs/notes/${slugify(reflection.title)}`));
      note.append(head);

      note.append(create('h4', 'git-note-title', reflection.title, `reflections.${index}.title`));
      note.append(create('p', 'git-note-body', reflection.body, `reflections.${index}.body`));
      return note;
    }

    function renderLearningRepositoryTimeline() {
      const container = $('#achievementTimeline');
      if (!container) return;

      const repo = buildLearningRepositoryState();
      const commits = repo.commits || [];
      const laneMap = assignBranchLanes(commits, repo.branches);
      const rows = buildCommitGraphRows(commits, laneMap);
      const branchById = new Map((repo.branches || []).map((branch) => [branch.id, branch]));
      const tagAnchors = buildTagAnchorMap();
      const notesByCommit = buildNotesByCommit();
      const colorFor = (branchId) => branchById.get(branchId)?.color || getBranchColor(branchId);

      container.className = 'git-learning-repo';
      container.replaceChildren();
      container.__learningGraph = { rows, laneMap, colorFor, tagAnchors };

      let storedGraphView = 'timeline';
      try { storedGraphView = localStorage.getItem(GRAPH_VIEW_KEY) || 'timeline'; } catch (error) { /* storage disabled */ }
      container.dataset.graphView = storedGraphView === 'gallery' ? 'gallery' : 'timeline';

      const toolbar = create('div', 'git-repo-toolbar');
      const titleWrap = create('div', 'git-repo-title-wrap');
      titleWrap.append(create('span', 'git-repo-title', repo.title || 'Learning Repository'));
      titleWrap.append(create('span', 'git-repo-subtitle', repo.intro || 'A Git-style learning history'));
      const count = create('span', 'git-repo-count', `${commits.length} commits`);

      // Timeline shows the branch graph with connector lines; Gallery drops the
      // graph for a plain responsive card grid — useful for a dense recap slide.
      const graphViewToggle = create('div', 'git-view-toggle');
      graphViewToggle.setAttribute('role', 'group');
      graphViewToggle.setAttribute('aria-label', 'Graph display mode');
      [['timeline', 'Timeline'], ['gallery', 'Gallery']].forEach(([mode, label]) => {
        const btn = create('button', 'git-view-toggle-btn', label);
        btn.type = 'button';
        btn.dataset.graphViewMode = mode;
        const active = container.dataset.graphView === mode;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
        btn.addEventListener('click', () => setGraphViewMode(container, mode));
        graphViewToggle.append(btn);
      });

      toolbar.append(titleWrap, graphViewToggle, count);
      container.append(toolbar);

      const branchLegend = create('div', 'git-branch-legend');
      (repo.branches || []).forEach((branch) => {
        const pill = create('span', 'git-legend-pill', branch.label || branch.id);
        pill.style.setProperty('--branch-color', colorFor(branch.id));
        branchLegend.append(pill);
      });
      container.append(branchLegend);

      const body = create('div', 'git-repo-body');
      const layer = createSvgElement('svg', { class: 'git-graph-layer', 'aria-hidden': 'true', focusable: 'false' });
      body.append(layer);

      // Hover isolation: focus follows the pointer from card to card; leaving the
      // graph area clears it. Delegated so repaints never duplicate listeners.
      body.addEventListener('mouseover', (event) => {
        const rowEl = event.target.closest('.git-commit-row');
        const id = rowEl ? rowEl.dataset.commitId : null;
        if (id !== container.__graphFocusId) applyGraphFocus(container, id);
      });
      body.addEventListener('mouseleave', () => applyGraphFocus(container, null));

      rows.forEach((row) => {
        const rowEl = create('div', 'git-commit-row');
        rowEl.dataset.commitId = row.commit.id;
        rowEl.dataset.branch = row.commit.branch;
        const card = createGitCommitCard(row.commit, repo, tagAnchors.get(row.commit.id), colorFor);
        (notesByCommit.get(row.commit.id) || []).forEach((entry) => card.append(createAttachedNote(entry)));
        rowEl.append(card);
        body.append(rowEl);
      });

      container.append(body);
      if (typeof refreshReveal === 'function') refreshReveal(container);
      scheduleGraphPaint(container);
    }

    function drawCards() {
      if (!cards) return;
      cards.replaceChildren();
      const query = (search?.value || "").trim().toLowerCase();
      const visibleAchievements = achievements.filter((achievement) => {
        const categoryMatch = activeCategory === "All" || achievement.category === activeCategory;
        if (!query) return categoryMatch;
        const text = [achievement.title, achievement.category, achievement.summary, achievement.organisation, achievement.fullDescription, achievement.applicantSignal, achievement.eaeRelevance].filter(Boolean).join(" ").toLowerCase();
        return categoryMatch && text.includes(query);
      });

      if (resultCount) {
        resultCount.textContent = `${visibleAchievements.length} of ${achievements.length} cards shown`;
      }

      if (!visibleAchievements.length) {
        const empty = create("article", "achievement-empty");
        empty.append(create("h3", "", "No achievement cards match this view"));
        empty.append(create("p", "", "Try a different category or search term."));
        cards.append(empty);
        return;
      }

      visibleAchievements.forEach((achievement, index) => {
        const card = createAchievementCard(achievement);
        card.classList.add("is-visible");
        if (index === 0 && activeCategory === "All" && !query) {
          card.classList.add("featured-achievement");
        }
        cards.append(card);
      });

      refreshReveal(cards);
    }

    if (cards) cards.replaceChildren();
    if (timeline) timeline.replaceChildren();

    renderLearningRepositoryTimeline();

    drawFilters();
    drawCards();
    if (search) search.oninput = drawCards;
  }

  function createAchievementCard(achievement) {
    const originalIndex = data.achievements.indexOf(achievement);
    const card = create("article", "achievement-card evidence-first-card reveal");

    // Band 1 — the proof itself. The certificate or photo leads the card so a
    // reviewer sees evidence before reading any claim about it.
    card.append(createAchievementEvidenceBand(achievement));

    // Band 2 — the details that identify and frame that proof.
    const details = create("div", "evidence-details");

    const cat = create("p", "card-kicker", achievement.category);
    cat.dataset.editPath = `achievements.${originalIndex}.category`;
    details.append(cat);

    const title = create("h3", "", achievement.title);
    title.dataset.editPath = `achievements.${originalIndex}.title`;
    details.append(title);

    if (achievement.organisation) {
      const org = create("p", "organisation-line", achievement.organisation);
      org.dataset.editPath = `achievements.${originalIndex}.organisation`;
      details.append(org);
    }

    const date = create("p", "date-line", achievement.date);
    date.dataset.editPath = `achievements.${originalIndex}.date`;
    details.append(date);

    const summary = create("p", "evidence-summary", achievement.summary);
    summary.dataset.editPath = `achievements.${originalIndex}.summary`;
    details.append(summary);

    if (achievement.applicantSignal) {
      const sig = create("p", "achievement-signal", achievement.applicantSignal);
      sig.dataset.editPath = `achievements.${originalIndex}.applicantSignal`;
      details.append(sig);
    }
    card.append(details);

    // Band 3 — how the work was actually done. Reflection and learning outcome
    // stay in the modal so the grid stays scannable.
    if (achievement.fullDescription) {
      const method = create("div", "evidence-method");
      method.append(create("h4", "evidence-band-label", LABELS.howIDidIt));
      const methodBody = create("p", "", achievement.fullDescription);
      methodBody.dataset.editPath = `achievements.${originalIndex}.fullDescription`;
      method.append(methodBody);
      card.append(method);
    }

    const button = create("button", "button button-secondary modal-trigger-btn", "View details");
    button.type = "button";
    button.addEventListener("click", () => openAchievementModal(achievement));
    card.append(button);
    return card;
  }

  function createAchievementEvidenceBand(achievement) {
    const band = create("div", "evidence-media");
    const image = typeof achievement.image === "string" ? achievement.image.trim() : "";
    const certificate = typeof achievement.certificate === "string" ? achievement.certificate.trim() : "";
    // A photo of the work outranks the certificate as the lead visual; the
    // certificate leads when that is the only proof on file.
    const lead = image || certificate;
    const secondary = image && certificate ? certificate : "";

    if (lead) {
      band.append(createEvidenceFrame(achievement, lead, lead === image ? "photo" : "certificate"));
      if (secondary) {
        const thumbnails = create("div", "evidence-media-thumbnails");
        thumbnails.append(createEvidenceThumb(achievement, secondary, "certificate"));
        band.append(thumbnails);
      }
    } else {
      band.classList.add("evidence-media--empty");
      const placeholder = create("div", "evidence-media-placeholder");
      placeholder.append(create("span", "evidence-media-kicker", achievement.category || "Evidence"));
      placeholder.append(create("strong", "", achievement.title || "Evidence pending"));
      placeholder.append(
        create("p", "", "Add a certificate, photo, or demo screenshot to make this entry visual evidence.")
      );
      band.append(placeholder);
    }

    band.append(createEvidenceStatusStrip(achievement));
    return band;
  }

  function createEvidenceFrame(achievement, src, kind) {
    const frame = create("button", "evidence-media-frame");
    frame.type = "button";
    frame.setAttribute("aria-label", `View ${achievement.title} ${kind} at full size`);
    frame.addEventListener("click", () =>
      openMediaViewerModal(src, `${achievement.title} ${kind}`)
    );

    const img = document.createElement("img");
    img.src = src;
    img.alt = `${achievement.title} ${kind}`;
    img.className = "evidence-media-img";
    img.loading = "lazy";
    img.decoding = "async";
    frame.append(img);

    frame.append(create("span", "evidence-media-badge", kind === "certificate" ? "Certificate" : "Photo"));
    frame.append(create("span", "evidence-media-zoom", "View full size"));
    return frame;
  }

  function createEvidenceThumb(achievement, src, kind) {
    const thumb = create("button", "evidence-media-thumb");
    thumb.type = "button";
    thumb.setAttribute("aria-label", `View ${achievement.title} ${kind} at full size`);
    thumb.addEventListener("click", () =>
      openMediaViewerModal(src, `${achievement.title} ${kind}`)
    );
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${achievement.title} ${kind}`;
    img.loading = "lazy";
    img.decoding = "async";
    thumb.append(img);
    return thumb;
  }

  function createEvidenceStatusStrip(achievement) {
    const strip = create("div", "achievement-evidence-strip");
    strip.append(
      create(
        "span",
        achievement.image ? "evidence-chip evidence-chip-ready" : "evidence-chip",
        achievement.image ? "Image available" : "No image available"
      )
    );
    strip.append(
      create(
        "span",
        achievement.certificate ? "evidence-chip evidence-chip-ready" : "evidence-chip",
        achievement.certificate ? "Certificate available" : "No certificate available"
      )
    );
    return strip;
  }

  function openAchievementModal(achievement) {
    const originalIndex = data.achievements.indexOf(achievement);
    const dialog = $(SELECTORS.achievementModal);
    const content = $(SELECTORS.modalContent);
    dialog.classList.remove("modal-wide", "modal-school-portfolio");
    const closeButton = dialog.querySelector(".modal-close");
    if (closeButton) closeButton.setAttribute("aria-label", "Close achievement details");
    content.replaceChildren();

    const header = create("div", "modal-header");

    const cat = create("p", "card-kicker", achievement.category);
    cat.dataset.editPath = `achievements.${originalIndex}.category`;
    header.append(cat);

    const title = create("h2", "", achievement.title);
    title.dataset.editPath = `achievements.${originalIndex}.title`;
    header.append(title);

    if (achievement.organisation) {
      const org = create("p", "organisation-line", achievement.organisation);
      org.dataset.editPath = `achievements.${originalIndex}.organisation`;
      header.append(org);
    }

    const date = create("p", "date-line", achievement.date);
    date.dataset.editPath = `achievements.${originalIndex}.date`;
    header.append(date);

    const summary = create("p", "modal-summary", achievement.summary);
    summary.dataset.editPath = `achievements.${originalIndex}.summary`;
    header.append(summary);

    const media = create("div", "modal-media-grid");
    if (achievement.image && achievement.image.trim() !== "") {
      media.append(createMediaBlock(achievement.image, "Achievement image", "Add your photo here"));
    }
    if (achievement.certificate && achievement.certificate.trim() !== "") {
      media.append(
        createMediaBlock(achievement.certificate, "Certificate image", "Certificate placeholder")
      );
    }

    const details = create("div", "modal-detail-grid");
    if (achievement.applicantSignal) {
      const sigDetail = createDetail("What this shows about me", achievement.applicantSignal, "modal-detail modal-detail-highlight");
      const p = sigDetail.querySelector("p") || sigDetail;
      p.dataset.editPath = `achievements.${originalIndex}.applicantSignal`;
      details.append(sigDetail);
    }
    if (achievement.eaeRelevance) {
      const relevanceDetail = createDetail("Why it matters for EAE", achievement.eaeRelevance, "modal-detail modal-detail-highlight");
      const p = relevanceDetail.querySelector("p") || relevanceDetail;
      p.dataset.editPath = `achievements.${originalIndex}.eaeRelevance`;
      details.append(relevanceDetail);
    }

    const descDetail = createDetail("Full description", achievement.fullDescription);
    const descP = descDetail.querySelector("p") || descDetail;
    descP.dataset.editPath = `achievements.${originalIndex}.fullDescription`;
    details.append(descDetail);

    if (achievement.reflection) {
      const refDetail = createDetail("Reflection", achievement.reflection);
      const refP = refDetail.querySelector("p") || refDetail;
      refP.dataset.editPath = `achievements.${originalIndex}.reflection`;
      details.append(refDetail);
    }

    const outcomeDetail = createDetail("Learning outcome", achievement.learningOutcome);
    const outcomeP = outcomeDetail.querySelector("p") || outcomeDetail;
    outcomeP.dataset.editPath = `achievements.${originalIndex}.learningOutcome`;
    details.append(outcomeDetail);

    if (media.children.length > 0) {
      content.append(header, summary, media, details);
    } else {
      content.append(header, summary, details);
    }

    if (document.body.classList.contains('live-editing-active')) {
      content.querySelectorAll('[data-edit-path]').forEach(el => {
        el.contentEditable = 'true';
      });
    }

    openModalDialog(dialog);
  }

  // ==========================================================================
  // IN-APP MULTI-MEDIA & SPREADSHEET VIEWER MODULE
  // ==========================================================================

  function detectMediaType(url) {
    if (!url || typeof url !== 'string') return 'image';
    const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
    if (cleanUrl.endsWith('.drawio') || cleanUrl.includes('draw.io')) {
      return 'drawio';
    }
    if (cleanUrl.includes('canva.com/design') || cleanUrl.includes('docs.google.com/presentation') || cleanUrl.includes('slides')) {
      return 'slides';
    }
    if (cleanUrl.endsWith('.csv') || cleanUrl.endsWith('.tsv') || cleanUrl.endsWith('.xlsx') || cleanUrl.endsWith('.xls') || cleanUrl.includes('spreadsheet')) {
      return 'spreadsheet';
    }
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.ogv')) {
      return 'video';
    }
    if (cleanUrl.endsWith('.mp3') || cleanUrl.endsWith('.wav') || cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.m4a')) {
      return 'audio';
    }
    if (cleanUrl.endsWith('.pdf')) {
      return 'pdf';
    }
    if (cleanUrl.endsWith('.docx') || cleanUrl.endsWith('.pptx') || cleanUrl.endsWith('.txt') || cleanUrl.endsWith('.md')) {
      return 'document';
    }
    return 'image';
  }

  function createDrawioViewer(src, alt) {
    const container = create("div", "media-drawio-container");
    const toolbar = create("div", "drawio-toolbar");

    const titleBadge = create("span", "drawio-title-badge", `📐 ${alt || "Draw.io Flowchart"}`);

    const tabDiagramBtn = create("button", "text-button drawio-tab-btn active", "📊 Interactive Flowchart");
    const tabCodeBtn = create("button", "text-button drawio-tab-btn", "💻 Diagram Logic");
    const downloadBtn = create("a", "text-button drawio-download-btn", "📥 Download .drawio");

    tabDiagramBtn.type = "button";
    tabCodeBtn.type = "button";
    downloadBtn.href = src;
    downloadBtn.download = src.split('/').pop() || "diagram.drawio";
    downloadBtn.target = "_blank";

    toolbar.append(titleBadge, tabDiagramBtn, tabCodeBtn, downloadBtn);
    container.append(toolbar);

    const diagramWrap = create("div", "drawio-diagram-wrap");
    const codeWrap = create("div", "drawio-code-wrap");
    codeWrap.style.display = "none";

    container.append(diagramWrap, codeWrap);

    tabDiagramBtn.addEventListener("click", () => {
      tabDiagramBtn.classList.add("active");
      tabCodeBtn.classList.remove("active");
      diagramWrap.style.display = "block";
      codeWrap.style.display = "none";
    });

    tabCodeBtn.addEventListener("click", () => {
      tabCodeBtn.classList.add("active");
      tabDiagramBtn.classList.remove("active");
      diagramWrap.style.display = "none";
      codeWrap.style.display = "block";
    });

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((xmlText) => {
        let mermaidCode = "";
        const mermaidMatch = xmlText.match(/mermaidData="([^"]+)"/);
        if (mermaidMatch && mermaidMatch[1]) {
          try {
            const parsedJson = JSON.parse(mermaidMatch[1].replace(/&quot;/g, '"'));
            mermaidCode = parsedJson.data || "";
          } catch(e) {
            mermaidCode = mermaidMatch[1].replace(/&quot;/g, '"');
          }
        }

        const pre = document.createElement("pre");
        pre.className = "drawio-code-pre";
        pre.textContent = mermaidCode || xmlText.slice(0, 3000) + "\n... [XML Data Truncated]";
        codeWrap.append(pre);

        const canvas = create("div", "drawio-canvas-view");
        const iframe = document.createElement("iframe");
        iframe.className = "drawio-iframe";
        iframe.src = `https://viewer.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=${encodeURIComponent(alt || "Drawio Flowchart")}#R${encodeURIComponent(xmlText)}`;
        iframe.title = alt || "Draw.io Flowchart Diagram";
        iframe.allowFullscreen = true;

        canvas.append(iframe);
        diagramWrap.append(canvas);
      })
      .catch((err) => {
        console.warn("Could not load Draw.io XML:", err);
        diagramWrap.append(create("p", "drawio-notice", `Draw.io diagram file linked (${src.split('/').pop()}). Click "Download .drawio" to inspect.`));
      });

    return container;
  }

  function createSlidesViewer(src, alt) {
    const container = create("div", "media-slides-container");

    let embedUrl = src;
    if (src.includes("canva.com/design/") && !src.includes("embed")) {
      embedUrl = `${src}${src.includes("?") ? "&" : "?"}embed`;
    }

    const toolbar = create("div", "slides-toolbar");
    const badge = create("span", "slides-title-badge", `📊 ${alt || "Presentation Slides"}`);
    const fullScreenBtn = create("button", "text-button slides-fullscreen-btn", "⛶ Fullscreen");
    fullScreenBtn.type = "button";

    toolbar.append(badge, fullScreenBtn);
    container.append(toolbar);

    const iframeWrap = create("div", "slides-iframe-wrap");
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.className = "media-slides-iframe";
    iframe.allowFullscreen = true;
    iframe.allow = "fullscreen; autoplay; encrypted-media";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.title = alt || "Presentation Slides";

    iframeWrap.append(iframe);
    container.append(iframeWrap);

    fullScreenBtn.addEventListener("click", () => {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      }
    });

    return container;
  }

  function parseCsvText(text) {
    const lines = text.split(/\r\n|\n/);
    const rows = [];
    for (let line of lines) {
      if (!line.trim()) continue;
      const row = [];
      let insideQuote = false;
      let currentVal = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (insideQuote && line[i + 1] === '"') {
            currentVal += '"';
            i++;
          } else {
            insideQuote = !insideQuote;
          }
        } else if ((char === ',' || char === '\t') && !insideQuote) {
          row.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim());
      rows.push(row);
    }
    if (rows.length === 0) return { headers: [], data: [] };
    return { headers: rows[0], data: rows.slice(1) };
  }

  function createSpreadsheetViewer(src, alt, fallback) {
    const container = create("div", "media-spreadsheet-container");
    const toolbar = create("div", "spreadsheet-toolbar");

    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "spreadsheet-search-input";
    searchInput.placeholder = "🔍 Search spreadsheet rows...";
    searchInput.setAttribute("aria-label", "Search spreadsheet rows");

    const statsBadge = create("span", "spreadsheet-stats-badge", "Loading data...");

    const downloadBtn = create("a", "text-button spreadsheet-download-btn", "📥 Download CSV");
    downloadBtn.href = src;
    downloadBtn.download = src.split('/').pop() || "data.csv";
    downloadBtn.target = "_blank";

    toolbar.append(searchInput, statsBadge, downloadBtn);
    container.append(toolbar);

    const tableWrapper = create("div", "spreadsheet-table-wrapper");
    const table = create("table", "spreadsheet-table");
    tableWrapper.append(table);
    container.append(tableWrapper);

    const renderTableContent = (parsed) => {
      table.replaceChildren();
      if (!parsed.headers || parsed.headers.length === 0) {
        statsBadge.textContent = "No structured spreadsheet data found";
        return;
      }

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      const lineNoHeader = document.createElement("th");
      lineNoHeader.className = "spreadsheet-col-line";
      lineNoHeader.textContent = "#";
      headerRow.append(lineNoHeader);

      parsed.headers.forEach((headerText, colIdx) => {
        const th = document.createElement("th");
        th.textContent = headerText || `Col ${colIdx + 1}`;
        th.setAttribute("scope", "col");
        headerRow.append(th);
      });
      thead.append(headerRow);
      table.append(thead);

      const tbody = document.createElement("tbody");
      table.append(tbody);

      const renderRows = (rowList) => {
        tbody.replaceChildren();
        statsBadge.textContent = `Showing ${rowList.length} of ${parsed.data.length} rows`;
        rowList.forEach((row, rowIdx) => {
          const tr = document.createElement("tr");

          const lineTd = document.createElement("td");
          lineTd.className = "spreadsheet-line-num";
          lineTd.textContent = rowIdx + 1;
          tr.append(lineTd);

          parsed.headers.forEach((_, colIdx) => {
            const td = document.createElement("td");
            td.textContent = row[colIdx] !== undefined ? row[colIdx] : "";
            tr.append(td);
          });
          tbody.append(tr);
        });
      };

      renderRows(parsed.data);

      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          renderRows(parsed.data);
          return;
        }
        const filtered = parsed.data.filter((row) =>
          row.some((cell) => String(cell).toLowerCase().includes(query))
        );
        renderRows(filtered);
      });
    };

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((csvText) => {
        const parsed = parseCsvText(csvText);
        renderTableContent(parsed);
      })
      .catch((err) => {
        console.warn("Could not fetch CSV directly:", err);
        fetch("docs/FLL_Mission_Data.csv")
          .then(res => res.text())
          .then(csvText => renderTableContent(parseCsvText(csvText)))
          .catch(() => {
            statsBadge.textContent = "Spreadsheet ready for download";
            tableWrapper.append(create("p", "spreadsheet-error-notice", `Spreadsheet asset linked (${src}). Click "Download CSV" to inspect.`));
          });
      });

    return container;
  }

  /* ==========================================================================
   * FLL MULTI-TECH ANALYTICS GRAPH COMPONENT
   * Combines Spreadsheets, O-Level Math, Matplotlib, Google Cloud & APIs
   * ========================================================================== */

  function createFLLMultiTechGraphComponent(project) {
    const container = create("div", "fll-graph-container");
    container.setAttribute("aria-label", "FLL Multi-Tech Analytics Graph");

    const header = create("div", "fll-graph-header");
    const badge = create("span", "fll-graph-title-badge", "⚡ Multi-Tech Analytics Engine");

    const toolbar = create("div", "fll-graph-toolbar");
    const btnTrajectory = create("button", "fll-graph-btn active", "🗺️ Trajectory Map (O-Lvl Math)");
    const btnGear = create("button", "fll-graph-btn", "⚙️ Gear Ratio Torque vs Speed");
    const btnPipeline = create("button", "fll-graph-btn", "☁️ GCP & API Data Pipeline");

    btnTrajectory.type = "button";
    btnGear.type = "button";
    btnPipeline.type = "button";

    toolbar.append(btnTrajectory, btnGear, btnPipeline);
    header.append(badge, toolbar);
    container.append(header);

    const canvasWrap = create("div", "fll-graph-canvas-wrap");
    const tooltip = create("div", "fll-graph-tooltip");
    canvasWrap.append(tooltip);

    let activeMode = "trajectory";

    function appendTooltipRows(container, rows) {
      rows.forEach((row) => {
        const p = document.createElement("p");
        if (row.label) {
          const strong = document.createElement("strong");
          strong.textContent = `${row.label}: `;
          p.append(strong);
        }
        p.append(document.createTextNode(String(row.value || "")));
        container.append(p);
      });
    }

    function showTooltip(x, y, title, contentRows) {
      tooltip.replaceChildren();
      const h5 = document.createElement("h5");
      h5.textContent = title;
      tooltip.append(h5);
      const div = document.createElement("div");
      if (Array.isArray(contentRows)) {
        appendTooltipRows(div, contentRows);
      } else if (contentRows instanceof Node) {
        div.append(contentRows);
      } else if (typeof contentRows === "string") {
        const p = document.createElement("p");
        p.textContent = contentRows;
        div.append(p);
      }
      tooltip.append(div);

      const wrapRect = canvasWrap.getBoundingClientRect();
      let posX = x + 12;
      let posY = y - 10;
      if (posX + 240 > wrapRect.width) posX = x - 250;
      if (posY + 120 > wrapRect.height) posY = y - 100;
      if (posX < 8) posX = 8;
      if (posY < 8) posY = 8;

      tooltip.style.left = `${posX}px`;
      tooltip.style.top = `${posY}px`;
      tooltip.classList.add("visible");
    }

    function hideTooltip() {
      tooltip.classList.remove("visible");
    }

    function renderSvgGraph(mode) {
      const existingSvg = canvasWrap.querySelector("svg");
      if (existingSvg) existingSvg.remove();
      hideTooltip();

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class", "fll-graph-svg");
      svg.setAttribute("viewBox", "0 0 600 360");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

      if (mode === "trajectory") {
        const defs = document.createElementNS(svgNS, "defs");
        defs.innerHTML = `
          <linearGradient id="pathGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="1" />
            <stop offset="100%" stop-color="#818cf8" stop-opacity="0.8" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        `;
        svg.append(defs);

        for (let x = 40; x < 600; x += 40) {
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", x); line.setAttribute("y1", 0);
          line.setAttribute("x2", x); line.setAttribute("y2", 360);
          line.setAttribute("stroke", "rgba(255,255,255,0.04)");
          line.setAttribute("stroke-width", "1");
          svg.append(line);
        }
        for (let y = 40; y < 360; y += 40) {
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", 0); line.setAttribute("y1", y);
          line.setAttribute("x2", 600); line.setAttribute("y2", y);
          line.setAttribute("stroke", "rgba(255,255,255,0.04)");
          line.setAttribute("stroke-width", "1");
          svg.append(line);
        }

        const homeRect = document.createElementNS(svgNS, "rect");
        homeRect.setAttribute("x", "10"); homeRect.setAttribute("y", "260");
        homeRect.setAttribute("width", "100"); homeRect.setAttribute("height", "90");
        homeRect.setAttribute("fill", "rgba(56,189,248,0.08)");
        homeRect.setAttribute("stroke", "rgba(56,189,248,0.4)");
        homeRect.setAttribute("stroke-dasharray", "4,4");
        homeRect.setAttribute("rx", "6");
        svg.append(homeRect);

        const homeText = document.createElementNS(svgNS, "text");
        homeText.setAttribute("x", "60"); homeText.setAttribute("y", "310");
        homeText.setAttribute("fill", "#38bdf8");
        homeText.setAttribute("font-size", "11");
        homeText.setAttribute("font-weight", "bold");
        homeText.setAttribute("text-anchor", "middle");
        homeText.textContent = "HOME (0,0)";
        svg.append(homeText);

        const nodes = [
          { id: "M00", name: "Launch Area", x: 60, y: 300, pts: 20, math: "Start Pose: (0,0), θ = 0°" },
          { id: "M01/M02", name: "Surface Brushing & Map Reveal", x: 200, y: 220, pts: 30, math: "d = √(80²+80²) = 113.1cm, θ = 45°" },
          { id: "M03", name: "Mineshaft Explorer", x: 130, y: 170, pts: 40, math: "Arc Turn: Δθ = -90°, Radius = 25cm" },
          { id: "M04", name: "Careful Recovery", x: 310, y: 220, pts: 40, math: "Straight Alignment: θ = arctan2(80,100)" },
          { id: "M07", name: "Heavy Lifting (Millstone)", x: 470, y: 210, pts: 30, math: "Torque Mode 1:2.5 Gear Boost" },
          { id: "M12", name: "Salvage Operation", x: 550, y: 220, pts: 30, math: "Linear Pull: Force = 110 N·cm" },
          { id: "M13", name: "Forum Collection", x: 230, y: 110, pts: 35, math: "Carry & Place Return Route" }
        ];

        const pathPoints = nodes.map(n => `${n.x},${n.y}`).join(" L ");
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", `M ${pathPoints}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "url(#pathGlow)");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("filter", "url(#glowFilter)");
        path.setAttribute("stroke-dasharray", "6,3");
        svg.append(path);

        const callout = document.createElementNS(svgNS, "text");
        callout.setAttribute("x", "300"); callout.setAttribute("y", "35");
        callout.setAttribute("fill", "#f59e0b");
        callout.setAttribute("font-size", "11");
        callout.setAttribute("font-weight", "600");
        callout.setAttribute("text-anchor", "middle");
        callout.textContent = "📐 O-Level Math Vector: d = √(Δx² + Δy²), θ = arctan2(Δy, Δx)";
        svg.append(callout);

        nodes.forEach((n) => {
          const group = document.createElementNS(svgNS, "g");
          group.style.cursor = "pointer";

          const circleBg = document.createElementNS(svgNS, "circle");
          circleBg.setAttribute("cx", n.x); circleBg.setAttribute("cy", n.y);
          circleBg.setAttribute("r", "14");
          circleBg.setAttribute("fill", "var(--theme-surface)");
          circleBg.setAttribute("stroke", "var(--theme-accent-cyan)");
          circleBg.setAttribute("stroke-width", "2");

          const text = document.createElementNS(svgNS, "text");
          text.setAttribute("x", n.x); text.setAttribute("y", n.y + 4);
          text.setAttribute("fill", "#e2e8f0");
          text.setAttribute("font-size", "9");
          text.setAttribute("font-weight", "bold");
          text.setAttribute("text-anchor", "middle");
          text.textContent = n.id;

          group.append(circleBg, text);

          group.addEventListener("mousemove", (e) => {
            const rect = canvasWrap.getBoundingClientRect();
            showTooltip(
              e.clientX - rect.left,
              e.clientY - rect.top,
              `${n.id}: ${n.name}`,
              [
                { label: "Points", value: `+${n.pts} pts` },
                { label: "Math Model", value: n.math },
                { label: "Field Coords", value: `(${(n.x * 0.33) | 0}cm, ${((360 - n.y) * 0.33) | 0}cm)` }
              ]
            );
          });
          group.addEventListener("mouseleave", hideTooltip);

          svg.append(group);
        });

      } else if (mode === "gearratio") {
        const defs = document.createElementNS(svgNS, "defs");
        defs.innerHTML = `
          <linearGradient id="torqueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#ef4444" stop-opacity="0.1" />
          </linearGradient>
        `;
        svg.append(defs);

        const headerText = document.createElementNS(svgNS, "text");
        headerText.setAttribute("x", "300"); headerText.setAttribute("y", "28");
        headerText.setAttribute("fill", "#38bdf8");
        headerText.setAttribute("font-size", "12");
        headerText.setAttribute("font-weight", "bold");
        headerText.setAttribute("text-anchor", "middle");
        headerText.textContent = "⚙️ Kinematics & Gear Ratio Math: P = T · ω  |  T₁ω₁ = T₂ω₂  |  v = ω r";
        svg.append(headerText);

        const xAxis = document.createElementNS(svgNS, "line");
        xAxis.setAttribute("x1", "60"); xAxis.setAttribute("y1", "300");
        xAxis.setAttribute("x2", "540"); xAxis.setAttribute("y2", "300");
        xAxis.setAttribute("stroke", "#64748b"); xAxis.setAttribute("stroke-width", "2");
        svg.append(xAxis);

        const yAxisLeft = document.createElementNS(svgNS, "line");
        yAxisLeft.setAttribute("x1", "60"); yAxisLeft.setAttribute("y1", "50");
        yAxisLeft.setAttribute("x2", "60"); yAxisLeft.setAttribute("y2", "300");
        yAxisLeft.setAttribute("stroke", "#f59e0b"); yAxisLeft.setAttribute("stroke-width", "2");
        svg.append(yAxisLeft);

        const yAxisRight = document.createElementNS(svgNS, "line");
        yAxisRight.setAttribute("x1", "540"); yAxisRight.setAttribute("y1", "50");
        yAxisRight.setAttribute("x2", "540"); yAxisRight.setAttribute("y2", "300");
        yAxisRight.setAttribute("stroke", "#38bdf8"); yAxisRight.setAttribute("stroke-width", "2");
        svg.append(yAxisRight);

        const xLabel = document.createElementNS(svgNS, "text");
        xLabel.setAttribute("x", "300"); xLabel.setAttribute("y", "335");
        xLabel.setAttribute("fill", "#cbd5e1"); xLabel.setAttribute("font-size", "11");
        xLabel.setAttribute("text-anchor", "middle");
        xLabel.textContent = "Motor Angular Velocity ω (RPM)";
        svg.append(xLabel);

        const yLabelL = document.createElementNS(svgNS, "text");
        yLabelL.setAttribute("x", "20"); yLabelL.setAttribute("y", "175");
        yLabelL.setAttribute("fill", "#f59e0b"); yLabelL.setAttribute("font-size", "11");
        yLabelL.setAttribute("transform", "rotate(-90 20,175)");
        yLabelL.setAttribute("text-anchor", "middle");
        yLabelL.textContent = "Torque T (N·cm)";
        svg.append(yLabelL);

        const yLabelR = document.createElementNS(svgNS, "text");
        yLabelR.setAttribute("x", "580"); yLabelR.setAttribute("y", "175");
        yLabelR.setAttribute("fill", "#38bdf8"); yLabelR.setAttribute("font-size", "11");
        yLabelR.setAttribute("transform", "rotate(90 580,175)");
        yLabelR.setAttribute("text-anchor", "middle");
        yLabelR.textContent = "Linear Velocity v (cm/s)";
        svg.append(yLabelR);

        const torquePath = document.createElementNS(svgNS, "path");
        torquePath.setAttribute("d", "M 60,80 Q 200,100 320,160 T 540,280");
        torquePath.setAttribute("fill", "none");
        torquePath.setAttribute("stroke", "#f59e0b");
        torquePath.setAttribute("stroke-width", "3");
        svg.append(torquePath);

        const speedPath = document.createElementNS(svgNS, "path");
        speedPath.setAttribute("d", "M 60,260 Q 240,180 400,100 T 540,70");
        speedPath.setAttribute("fill", "none");
        speedPath.setAttribute("stroke", "#38bdf8");
        speedPath.setAttribute("stroke-width", "3");
        speedPath.setAttribute("stroke-dasharray", "5,3");
        svg.append(speedPath);

        const gearPoints = [
          { x: 140, y: 100, mode: "Torque Mode (1:2.5)", rpm: 80, torque: "110 N·cm", speed: "17.0 cm/s", detail: "M07 Heavy Millstone Lift & M12 Ship Salvage" },
          { x: 380, y: 110, mode: "Speed Mode (1:1)", rpm: 220, torque: "44 N·cm", speed: "42.5 cm/s", detail: "M01 Brushing & M03 Mineshaft Tunnel Sweep" }
        ];

        gearPoints.forEach(p => {
          const dot = document.createElementNS(svgNS, "circle");
          dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y);
          dot.setAttribute("r", "7");
          dot.setAttribute("fill", p.mode.includes("Torque") ? "#f59e0b" : "#38bdf8");
          dot.setAttribute("stroke", "#ffffff");
          dot.setAttribute("stroke-width", "2");
          dot.style.cursor = "pointer";

          dot.addEventListener("mousemove", (e) => {
            const rect = canvasWrap.getBoundingClientRect();
            showTooltip(
              e.clientX - rect.left,
              e.clientY - rect.top,
              p.mode,
              [
                { label: "Motor Speed", value: `${p.rpm} RPM` },
                { label: "Torque Output", value: p.torque },
                { label: "Linear Velocity", value: p.speed },
                { label: "Mission Application", value: p.detail }
              ]
            );
          });
          dot.addEventListener("mouseleave", hideTooltip);

          svg.append(dot);
        });

      } else if (mode === "pipeline") {
        const headerText = document.createElementNS(svgNS, "text");
        headerText.setAttribute("x", "300"); headerText.setAttribute("y", "28");
        headerText.setAttribute("fill", "#38bdf8");
        headerText.setAttribute("font-size", "12");
        headerText.setAttribute("font-weight", "bold");
        headerText.setAttribute("text-anchor", "middle");
        headerText.textContent = "☁️ Google Cloud & REST API Automation Pipeline";
        svg.append(headerText);

        const pipelineNodes = [
          { x: 70, y: 170, title: "Spreadsheet", desc: "docs/FLL_Mission_Data.csv", icon: "📊", tech: "Google Sheets" },
          { x: 190, y: 170, title: "Sheets API", desc: "REST Telemetry Stream", icon: "🌐", tech: "Google API" },
          { x: 310, y: 170, title: "Google Cloud", desc: "Storage & BigQuery", icon: "☁️", tech: "GCP Platform" },
          { x: 430, y: 170, title: "Matplotlib", desc: "Python Analytics", icon: "🐍", tech: "Python 3" },
          { x: 535, y: 170, title: "Portfolio", desc: "Interactive Dashboard", icon: "🚀", tech: "EAE Dashboard" }
        ];

        for (let i = 0; i < pipelineNodes.length - 1; i++) {
          const n1 = pipelineNodes[i];
          const n2 = pipelineNodes[i + 1];

          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", n1.x + 35); line.setAttribute("y1", n1.y);
          line.setAttribute("x2", n2.x - 35); line.setAttribute("y2", n2.y);
          line.setAttribute("stroke", "#38bdf8");
          line.setAttribute("stroke-width", "2");
          line.setAttribute("stroke-dasharray", "4,3");
          svg.append(line);
        }

        pipelineNodes.forEach((n) => {
          const group = document.createElementNS(svgNS, "g");
          group.style.cursor = "pointer";

          const rect = document.createElementNS(svgNS, "rect");
          rect.setAttribute("x", n.x - 35); rect.setAttribute("y", n.y - 45);
          rect.setAttribute("width", "70"); rect.setAttribute("height", "90");
          rect.setAttribute("fill", "var(--theme-surface)");
          rect.setAttribute("stroke", "var(--theme-accent-cyan)");
          rect.setAttribute("stroke-width", "1.5");
          rect.setAttribute("rx", "8");

          const icon = document.createElementNS(svgNS, "text");
          icon.setAttribute("x", n.x); icon.setAttribute("y", n.y - 12);
          icon.setAttribute("font-size", "20");
          icon.setAttribute("text-anchor", "middle");
          icon.textContent = n.icon;

          const title = document.createElementNS(svgNS, "text");
          title.setAttribute("x", n.x); title.setAttribute("y", n.y + 12);
          title.setAttribute("fill", "#e2e8f0");
          title.setAttribute("font-size", "10");
          title.setAttribute("font-weight", "bold");
          title.setAttribute("text-anchor", "middle");
          title.textContent = n.title;

          const tech = document.createElementNS(svgNS, "text");
          tech.setAttribute("x", n.x); tech.setAttribute("y", n.y + 28);
          tech.setAttribute("fill", "#38bdf8");
          tech.setAttribute("font-size", "8");
          tech.setAttribute("text-anchor", "middle");
          tech.textContent = n.tech;

          group.append(rect, icon, title, tech);

          group.addEventListener("mousemove", (e) => {
            const wrapRect = canvasWrap.getBoundingClientRect();
            showTooltip(
              e.clientX - wrapRect.left,
              e.clientY - wrapRect.top,
              `${n.icon} ${n.title} (${n.tech})`,
              [
                { label: "Role", value: n.desc },
                { label: "Integration", value: "Synchronizes field data into automated Matplotlib plots and O-level math trajectory calculations." },
                { label: "Status", value: "Connected (200 OK)" }
              ]
            );
          });
          group.addEventListener("mouseleave", hideTooltip);

          svg.append(group);
        });
      }

      canvasWrap.append(svg);
    }

    const updateButtons = (newMode) => {
      activeMode = newMode;
      btnTrajectory.classList.toggle("active", newMode === "trajectory");
      btnGear.classList.toggle("active", newMode === "gearratio");
      btnPipeline.classList.toggle("active", newMode === "pipeline");
      renderSvgGraph(newMode);
    };

    btnTrajectory.addEventListener("click", () => updateButtons("trajectory"));
    btnGear.addEventListener("click", () => updateButtons("gearratio"));
    btnPipeline.addEventListener("click", () => updateButtons("pipeline"));

    const footerStrip = create("div", "fll-telemetry-strip");
    const buildTelemetryBadge = (label, value) => {
      const badge = create("span", "fll-telemetry-badge");
      badge.append(document.createTextNode(`${label}: `));
      badge.append(create("strong", "", value));
      return badge;
    };
    footerStrip.append(
      buildTelemetryBadge("📁 Rows", "40 Runs"),
      buildTelemetryBadge("📐 Math", "O-Lvl Kinematics"),
      buildTelemetryBadge("🐍 Plotter", "Matplotlib"),
      buildTelemetryBadge("☁️ Pipeline", "GCP & API")
    );

    container.append(canvasWrap, footerStrip);
    renderSvgGraph("trajectory");

    return container;
  }

  function createVideoViewer(src, alt) {
    const wrap = create("div", "media-video-wrapper");
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.className = "media-video-element";
    video.setAttribute("aria-label", alt || "Video preview");

    const controlsBar = create("div", "media-player-controls-bar");
    const titleSpan = create("span", "media-player-title", alt || "Video Demo");
    const downloadBtn = create("a", "text-button media-download-btn", "📥 Download Video");
    downloadBtn.href = src;
    downloadBtn.download = src.split('/').pop() || "video.webm";
    downloadBtn.target = "_blank";

    controlsBar.append(titleSpan, downloadBtn);
    wrap.append(video, controlsBar);
    return wrap;
  }

  function createAudioViewer(src, alt) {
    const wrap = create("div", "media-audio-wrapper");
    const titleSpan = create("p", "media-player-title", `🎵 ${alt || "Audio track"}`);
    const audio = document.createElement("audio");
    audio.src = src;
    audio.controls = true;
    audio.className = "media-audio-element";

    const downloadBtn = create("a", "text-button media-download-btn", "📥 Download Audio");
    downloadBtn.href = src;
    downloadBtn.download = src.split('/').pop() || "audio.mp3";
    downloadBtn.target = "_blank";

    wrap.append(titleSpan, audio, downloadBtn);
    return wrap;
  }

  function createPdfViewer(src, alt) {
    const wrap = create("div", "media-pdf-wrapper");
    const object = document.createElement("object");
    object.data = src;
    object.type = "application/pdf";
    object.className = "media-pdf-object";

    const fallbackText = create("p", "", "PDF preview loading or unavailable in embedded mode.");
    const downloadBtn = create("a", "text-button media-download-btn", "📄 Download / View PDF");
    downloadBtn.href = src;
    downloadBtn.target = "_blank";

    object.append(fallbackText, downloadBtn);

    const toolbar = create("div", "media-player-controls-bar");
    toolbar.append(create("span", "media-player-title", `📄 ${alt || "PDF Document"}`), downloadBtn.cloneNode(true));
    wrap.append(toolbar, object);
    return wrap;
  }

  function createDocumentViewer(src, alt) {
    const wrap = create("div", "media-document-wrapper");
    const icon = create("div", "media-document-icon", "📄");
    const title = create("h3", "media-document-title", alt || "Document File");
    const desc = create("p", "media-document-desc", `File reference: ${src.split('/').pop()}`);
    const downloadBtn = create("a", "primary-button media-download-btn", "📥 Open / Download File");
    downloadBtn.href = src;
    downloadBtn.target = "_blank";

    wrap.append(icon, title, desc, downloadBtn);
    return wrap;
  }

  function createImageViewer(src, alt, fallback) {
    const block = create("figure", "media-block media-image-wrapper");
    if (!src) {
      block.append(create("span", "image-placeholder", fallback || "Image unavailable"));
      return block;
    }

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || "Image preview";
    img.className = "lightbox-image";
    img.loading = "lazy";

    const toolbar = create("div", "lightbox-toolbar");
    let zoomLevel = 1;
    let rotation = 0;

    const applyTransform = () => {
      img.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
      img.style.transition = "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
    };

    const zoomInBtn = create("button", "lightbox-btn", "🔍+");
    zoomInBtn.type = "button";
    zoomInBtn.setAttribute("aria-label", "Zoom in image");
    zoomInBtn.addEventListener("click", () => {
      zoomLevel = Math.min(zoomLevel + 0.25, 3);
      applyTransform();
    });

    const zoomOutBtn = create("button", "lightbox-btn", "🔍-");
    zoomOutBtn.type = "button";
    zoomOutBtn.setAttribute("aria-label", "Zoom out image");
    zoomOutBtn.addEventListener("click", () => {
      zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
      applyTransform();
    });

    const resetBtn = create("button", "lightbox-btn", "↺ Reset");
    resetBtn.type = "button";
    resetBtn.setAttribute("aria-label", "Reset zoom and rotation");
    resetBtn.addEventListener("click", () => {
      zoomLevel = 1;
      rotation = 0;
      applyTransform();
    });

    const rotateBtn = create("button", "lightbox-btn", "↻ 90°");
    rotateBtn.type = "button";
    rotateBtn.setAttribute("aria-label", "Rotate image 90 degrees");
    rotateBtn.addEventListener("click", () => {
      rotation = (rotation + 90) % 360;
      applyTransform();
    });

    const downloadBtn = create("a", "lightbox-btn lightbox-btn-primary", "📥 Download");
    downloadBtn.href = src;
    downloadBtn.download = src.split('/').pop() || "image.png";
    downloadBtn.target = "_blank";

    toolbar.append(zoomInBtn, zoomOutBtn, resetBtn, rotateBtn, downloadBtn);
    block.append(img, toolbar);
    return block;
  }

  function createMediaBlock(src, alt, fallback) {
    const type = detectMediaType(src);
    if (type === 'drawio') {
      return createDrawioViewer(src, alt);
    }
    if (type === 'slides') {
      return createSlidesViewer(src, alt);
    }
    if (type === 'spreadsheet') {
      return createSpreadsheetViewer(src, alt, fallback);
    }
    if (type === 'video') {
      return createVideoViewer(src, alt);
    }
    if (type === 'audio') {
      return createAudioViewer(src, alt);
    }
    if (type === 'pdf') {
      return createPdfViewer(src, alt);
    }
    if (type === 'document') {
      return createDocumentViewer(src, alt);
    }
    return createImageViewer(src, alt, fallback);
  }

  function createDetail(label, value, className = "modal-detail") {
    const detail = create("section", className);
    detail.append(create("h3", "", label));
    detail.append(create("p", "", value));
    return detail;
  }

  function openProjectModal(project) {
    const dialog = $(SELECTORS.achievementModal);
    const content = $(SELECTORS.modalContent);
    if (!dialog || !content || !project) return;

    dialog.classList.remove("modal-school-portfolio");
    dialog.classList.add("modal-wide");
    const closeButton = dialog.querySelector(".modal-close");
    if (closeButton) closeButton.setAttribute("aria-label", "Close project details");
    content.replaceChildren();

    const header = create("div", "modal-header");
    header.append(create("p", "card-kicker", project.category || "Project"));
    header.append(create("h2", "", project.title || "Project details"));
    if (project.status) header.append(create("p", "date-line", project.status));
    if (project.snapshotSummary || project.problem) {
      header.append(create("p", "modal-summary", project.snapshotSummary || project.problem));
    }

    const media = create("div", "modal-media-grid");
    const images = [];
    if (project.image) images.push(project.image);
    (Array.isArray(project.images) ? project.images : []).forEach((src) => {
      if (src && !images.includes(src)) images.push(src);
    });
    images.slice(0, 3).forEach((src, index) => {
      media.append(createMediaBlock(src, `${project.title} image ${index + 1}`, "Project image unavailable"));
    });
    if (project.optionalVideo) media.append(createMediaBlock(project.optionalVideo, `${project.title} video demo`, "Project video unavailable"));
    if (project.spreadsheet) media.append(createMediaBlock(project.spreadsheet, `${project.title} spreadsheet`, "Spreadsheet unavailable"));

    const details = create("div", "modal-detail-grid");
    [
      ["Problem", project.problem],
      ["Proposed solution", project.proposedSolution],
      ["My role", project.myRole],
      ["Technologies used", project.technologiesUsed],
      ["Development journey", project.developmentJourney],
      ["Outcome", project.outcome],
      ["Lessons learned", project.lessonsLearned],
      ["EAE connection", project.eaeConnection]
    ].forEach(([label, value]) => {
      if (!value) return;
      details.append(createDetail(label, Array.isArray(value) ? value.join(", ") : value));
    });

    if (media.children.length) content.append(header, media, details);
    else content.append(header, details);

    openModalDialog(dialog);
  }

  function renderGoals() {
    renderGoalList("#shortTermGoals", data.futureGoals?.shortTerm || []);
    renderGoalList("#longTermGoals", data.futureGoals?.longTerm || []);

    const timelineContainer = $("#futureDirectionTimeline");
    if (timelineContainer && Array.isArray(data.futureGoals?.timelineMilestones)) {
      timelineContainer.replaceChildren();
      const timelineWrap = create("div", "timeline-container timeline-wrap");
      const timelineEl = create("div", "timeline future-vertical-timeline");

      (data.futureGoals.timelineMilestones || []).forEach((m, index) => {
        const item = create("div", `timeline-item ${index % 2 === 0 ? "left" : "right"} reveal`);
        const content = create("div", "timeline-content");

        const top = create("div", "future-roadmap-top");
        top.append(create("span", "future-step-badge", m.badge || `Step ${index + 1}`));
        if (m.icon) top.append(create("span", "future-icon", m.icon));
        content.append(top);

        if (m.date) content.append(create("p", "date-line", m.date));
        if (m.phase) content.append(create("p", "card-kicker", m.phase));
        content.append(create("h3", "", m.title));
        content.append(create("p", "", m.description));

        item.append(content);
        timelineEl.append(item);
      });

      timelineWrap.append(timelineEl);
      timelineContainer.append(timelineWrap);
    }
  }

  function renderGoalList(selector, goals) {
    const list = $(selector);
    if (!list) return;
    list.replaceChildren();
    const safeGoals = Array.isArray(goals) ? goals : [];
    safeGoals.forEach((goal) => {
      list.append(create("li", "", goal));
    });
  }

  function renderOptionalSections() {
    const wrapper = $("#optionalSections");
    const grid = $("#optionalGrid");
    if (!wrapper || !grid) return;

    const sections = data.hiddenSections || {};
    const visibleSections = Object.values(sections).filter((section) => section.entries?.length);

    if (!visibleSections.length) {
      wrapper.hidden = true;
      return;
    }

    wrapper.hidden = false;
    grid.replaceChildren();
    visibleSections.forEach((section) => {
      const card = create("article", "small-card reveal");
      card.append(create("h3", "", section.title));
      const list = create("ul", "compact-list");

      section.entries.forEach((entry) => {
        if (typeof entry === "string") {
          list.append(create("li", "", entry));
        } else if (typeof entry === "object" && entry !== null) {
          const li = create("li", "optional-entry");

          const header = create("div", "optional-entry-header");
          const roleTitleStr = entry.role ? `${entry.role} — ${entry.title}` : entry.title;
          const roleTitle = create("h4", "", roleTitleStr);
          const dateSpan = create("span", "optional-entry-date", entry.date || entry.duration || "");
          header.append(roleTitle, dateSpan);
          li.append(header);

          if (entry.organisation) {
            li.append(create("p", "optional-entry-org", entry.organisation));
          }

          const desc = entry.description || entry.responsibilities;
          if (desc) {
            li.append(create("p", "optional-entry-desc", desc));
          }

          if (entry.impact) {
            const impactPara = create("p", "optional-entry-impact");
            impactPara.append(create("strong", "", "Impact:"), ` ${entry.impact}`);
            li.append(impactPara);
          }

          if (entry.reflection) {
            const reflectionPara = create("p", "optional-entry-reflection");
            reflectionPara.append(create("strong", "", "Reflection:"), ` ${entry.reflection}`);
            li.append(reflectionPara);
          }

          if (entry.imagePath) {
            const img = create("img", "optional-entry-img cert-thumbnail");
            img.src = entry.imagePath;
            img.alt = entry.title;
            img.loading = "lazy";
            img.addEventListener("click", () => {
              openFullImageModal(entry.imagePath, entry.role ? `${entry.role} — ${entry.title}` : entry.title);
            });
            li.append(img);
          }

          list.append(li);
        }
      });

      card.append(list);
      grid.append(card);
    });
  }

  /* Custom Sections: Render lightweight custom sections stored in data.customSections */
  function renderCustomSections() {
    const main = $("#main");
    if (!main) return;
    const custom = data.customSections || [];

    custom.forEach((sec, idx) => {
      // Ensure stable id
      if (!sec.id) sec.id = `custom-${Date.now().toString(36)}-${idx}`;
      const id = sec.id;
      let el = document.getElementById(id);
      if (!el) {
        el = create('section', 'section custom-section');
        el.id = id;
        main.appendChild(el);
      }
      // Build content depending on type
      el.replaceChildren();
      const heading = create('div', 'section-heading');
      heading.append(create('p', 'section-label', sec.label || 'Custom Section'));
      heading.append(create('h2', '', sec.title || (`Custom ${idx + 1}`)));
      el.append(heading);

      // click to select this section for in-editor wiring
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        // clear previous selection
        document.querySelectorAll('.custom-section.is-selected').forEach(c => c.classList.remove('is-selected'));
        el.classList.add('is-selected');
        window._eaeEditorState.selectedSectionId = id;
        showSaveNotification(`Selected section ${sec.title || id}`);
      });
      // restore selection if matches
      if (window._eaeEditorState.selectedSectionId === id) {
        el.classList.add('is-selected');
      }

      if (sec.type === 'hero') {
        const inner = create('div', 'hero-compact');
        if (sec.image) {
          const fig = create('figure', 'hero-figure');
          const img = document.createElement('img');
          img.src = sec.image;
          img.alt = sec.imageAlt || sec.title || 'Hero image';
          fig.append(img);
          inner.append(fig);
        }
        inner.append(create('p', 'section-lede', sec.body || ''));
        el.append(inner);
      } else if (sec.type === 'text-image') {
        const wrap = create('div', 'text-image-wrap');
        const img = create('div', 'text-image-img');
        if (sec.image) {
          const imgel = document.createElement('img');
          imgel.src = sec.image;
          imgel.alt = sec.imageAlt || sec.title || '';
          img.append(imgel);
        }
        const copy = create('div', 'text-image-copy');
        copy.append(create('p', '', sec.body || ''));
        wrap.append(img, copy);
        el.append(wrap);
      } else if (sec.type === 'gallery') {
        const grid = create('div', 'gallery-grid');
        (sec.images || []).forEach((src) => {
          const figure = create('figure', 'gallery-item');
          const im = document.createElement('img');
          im.src = src;
          im.alt = sec.title || 'Gallery image';
          figure.append(im);
          grid.append(figure);
        });
        el.append(grid);
      } else if (sec.type === 'cta') {
        const banner = create('div', 'cta-banner');
        banner.append(create('p', 'cta-title', sec.ctaTitle || 'Call to action'));
        const btn = create('a', 'button button-primary', sec.ctaLabel || 'Learn more');
        btn.href = sec.ctaHref || '#';
        banner.append(btn);
        el.append(banner);
      } else if (sec.type === 'embed') {
        const wrap = create('div', 'embed-wrap');
        if (sec.embedUrl) {
          const iframe = document.createElement('iframe');
          iframe.src = sec.embedUrl;
          iframe.loading = 'lazy';
          iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
          iframe.style.width = '100%';
          iframe.style.height = sec.height || '360px';
          iframe.title = sec.title || 'Embedded content';
          wrap.append(iframe);
        } else {
          wrap.append(create('p', '', 'No embed URL provided'));
        }
        el.append(wrap);
      } else if (sec.type === 'faq') {
        const faq = create('div', 'faq-list');
        (sec.items || []).forEach((qa, qIdx) => {
          const det = document.createElement('details');
          const summ = document.createElement('summary');
          summ.textContent = qa.q || `Question ${qIdx + 1}`;
          const ans = create('div', 'faq-answer', qa.a || '');
          det.append(summ, ans);
          faq.append(det);
        });
        el.append(faq);
      } else {
        // generic body
        el.append(create('p', '', sec.body || ''));
      }
    });
  }

  // Insert asset helper: finds a custom section by id and inserts asset URL
  function insertAssetToSection(assetUrl, sectionId) {
    if (!assetUrl) return false;
    const custom = data.customSections || [];
    const sec = custom.find(s => s.id === sectionId) || custom[custom.length - 1];
    if (!sec) return false;
    // Push undo snapshot
    pushUndoSnapshot('Insert asset into section');
    if (sec.type === 'gallery') {
      sec.images = sec.images || [];
      sec.images.push(assetUrl);
    } else if (sec.type === 'text-image' || sec.type === 'hero') {
      sec.image = assetUrl;
    } else if (sec.type === 'cta') {
      sec.image = assetUrl;
    } else {
      // fallback: add to images array
      sec.images = sec.images || [];
      sec.images.push(assetUrl);
    }
    // Reveal export button if present in DOM
    const expBtnEl = document.getElementById('exportDataBtn');
    if (expBtnEl) expBtnEl.style.display = 'block';
    createVersionSnapshot('Inserted asset into section');
    saveToServer('Inserted asset into section');
    render();
    return true;
  }

  // Simple image optimization: create derivative at max width 1200px and return dataURL
  function generateOptimizedImage(dataUrl, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const w = Math.min(maxWidth, img.width);
        const h = Math.round(w / ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(e);
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;
    });
  }

  // Crop/focal point modal
  function openCropModalForAsset(asset) {
    let modal = document.getElementById('eae-crop-modal');
    if (!modal) {
      modal = create('dialog', 'crop-modal');
      modal.id = 'eae-crop-modal';
      const card = create('div', 'crop-card');
      const imgWrap = create('div', 'crop-image-wrap');
      const img = document.createElement('img'); img.id = 'cropImage'; img.alt = 'Crop preview'; img.style.maxWidth = '100%';
      imgWrap.append(img);
      const controls = create('div', 'crop-controls');
      const applyBtn = create('button', 'button button-primary', 'Apply crop');
      const cancelBtn = create('button', 'button', 'Cancel');
      controls.append(applyBtn, cancelBtn);
      card.append(imgWrap, controls);
      modal.append(card);
      document.body.append(modal);
      cancelBtn.addEventListener('click', () => { try { modal.close(); } catch(e){ modal.removeAttribute('open'); } });
      applyBtn.addEventListener('click', async () => {
        const imgEl = document.getElementById('cropImage');
        if (!imgEl) return;
        try {
          const out = await generateOptimizedImage(imgEl.src, 1200, 0.8);
          // store optimized derivative on asset
          asset.optimized = out;
          createVersionSnapshot('Cropped/Optimized asset');
          saveToServer('Cropped asset');
          loadAssets();
          try { modal.close(); } catch(e){ modal.removeAttribute('open'); }
        } catch (e) {
          console.error('Failed to optimize image', e);
        }
      });
    }
    const imgEl = document.getElementById('cropImage');
    imgEl.src = asset.url;
    try { modal.showModal(); } catch(e){ modal.setAttribute('open', ''); }
  }

  // Undo stack (session-scoped)
  function pushUndoSnapshot(label) {
    const sizeOf = (value) => {
      if (typeof TextEncoder === 'function') {
        return new TextEncoder().encode(value).length;
      }
      return value.length;
    };
    const MAX_UNDO_BYTES = 4 * 1024 * 1024;
    try {
      const stack = JSON.parse(sessionStorage.getItem('eaeUndoStack') || '[]');
      const snapshotObj = { ts: new Date().toISOString(), label: label || 'Change', data: JSON.parse(JSON.stringify(data)) };
      const snapshotStr = JSON.stringify(snapshotObj);
      if (sizeOf(snapshotStr) > MAX_UNDO_BYTES) return;
      stack.push(snapshotObj);
      while (stack.length > 0 && sizeOf(JSON.stringify(stack)) > MAX_UNDO_BYTES) {
        stack.shift();
      }
      sessionStorage.setItem('eaeUndoStack', JSON.stringify(stack));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        sessionStorage.removeItem('eaeUndoStack');
      } else {
        console.error('pushUndoSnapshot failed', e);
      }
    }
  }

  function undoLast() {
    try {
      const stack = JSON.parse(sessionStorage.getItem('eaeUndoStack') || '[]');
      if (!stack.length) return false;
      const last = stack.pop();
      sessionStorage.setItem('eaeUndoStack', JSON.stringify(stack));
      // restore
      Object.keys(data).forEach(k => delete data[k]);
      Object.assign(data, JSON.parse(JSON.stringify(last.data)));
      render();
      showSaveNotification('Undo: ' + (last.label || 'Change'));
      return true;
    } catch (e) { console.error('undo failed', e); return false; }
  }

  // Expose APIs for automated tests and advanced usage
  window.eaeAdminAPI = window.eaeAdminAPI || {};
  window.eaeAdminAPI.insertAssetToSection = insertAssetToSection;
  window.eaeAdminAPI.generateOptimizedImage = generateOptimizedImage;
  window.eaeAdminAPI.openCropModalForAsset = openCropModalForAsset;
  window.eaeAdminAPI.pushUndoSnapshot = pushUndoSnapshot;
  window.eaeAdminAPI.undoLast = undoLast;
  window.eaeAdminAPI.buildEvidenceIndex = buildEvidenceIndex;

  // Top-level versioning helpers (safe if live editor DOM not present)
  function createVersionSnapshot(label) {
    try {
      const versions = JSON.parse(localStorage.getItem(STORAGE_KEYS.versions) || '[]');
      versions.unshift({ ts: new Date().toISOString(), label: label || 'Snapshot', data: JSON.parse(JSON.stringify(data)) });
      localStorage.setItem(STORAGE_KEYS.versions, JSON.stringify(versions.slice(0, 20)));
      // update any visible versions list
      const listEl = document.querySelector(SELECTORS.versionsList);
      if (listEl) renderVersionsList();
    } catch (e) {
      console.error('Failed to create version snapshot', e);
    }
  }

  function renderVersionsList() {
    const versionsListEl = document.querySelector(SELECTORS.versionsList);
    if (!versionsListEl) return;
    const versions = JSON.parse(localStorage.getItem(STORAGE_KEYS.versions) || '[]');
    versionsListEl.replaceChildren();
    if (!versions.length) {
      versionsListEl.append(create('p', '', 'No local versions yet'));
      return;
    }
    versions.forEach((v, i) => {
      const row = create('div', 'version-row');
      row.append(create('span', 'version-ts', new Date(v.ts).toLocaleString()));
      row.append(create('span', 'version-label', v.label));
      const restore = create('button', 'button', 'Restore'); restore.type='button';
      restore.addEventListener('click', () => {
        if (!confirm('Restore this version? This will replace current draft.')) return;
        Object.keys(data).forEach(k => delete data[k]);
        Object.assign(data, JSON.parse(JSON.stringify(v.data)));
        render();
        const expBtn = document.getElementById('exportDataBtn'); if (expBtn) expBtn.style.display = 'block';
        showSaveNotification('Restored version');
      });
      row.append(restore);
      versionsListEl.append(row);
    });
  }

  function setupModal() {
    const dialog = document.getElementById("achievementModal");
    if (!dialog) return;
    if (dialog.dataset.modalInitialized === "true") return;
    dialog.dataset.modalInitialized = "true";
    const close = dialog.querySelector(".modal-close");
    if (close) {
      close.addEventListener("click", () => {
        closeModalDialog(dialog);
      });
    }

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeModalDialog(dialog);
      }
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) {
        event.preventDefault();
        closeModalDialog(dialog);
        return;
      }
      if (event.key === "Tab" && dialog.open) {
        const focusables = getFocusableElements(dialog);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  function setupNavigation() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;

    const toggle = document.querySelector(SELECTORS.navToggle);
    const header = $(SELECTORS.siteHeader);
    const headerLinks = Array.from(nav.querySelectorAll('a[data-section]'));
    const navSections = headerLinks
      .map((link) => document.getElementById(link.dataset.section))
      .filter(Boolean);

    const onScroll = () => {
      header?.classList.toggle('is-elevated', window.scrollY > 8);

      let activeId = navSections[0]?.id;
      navSections.forEach((section) => {
        const box = section.getBoundingClientRect();
        if (box.top <= 200 && box.bottom > 100) activeId = section.id;
      });

      headerLinks.forEach((link) => {
        const isActive = link.dataset.section === activeId;
        link.classList.toggle('is-active', isActive);
        link.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    onScroll();

    headerLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.getElementById(link.dataset.section);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });

    if (navigationSetupDone) return;
    navigationSetupDone = true;

    if (toggle) {
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('is-open', !expanded);
      });
    }

    nav.addEventListener('click', (event) => {
      if (event.target.matches('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        closeMoreMenu();
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) closeMoreMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMoreMenu();
    });
  }

  function setupScrollProgress() {
    const bar = $(SELECTORS.scrollProgressBar);
    const container = $(SELECTORS.scrollProgress);
    if (!bar) return;

    let ticking = false;

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(0, scrollHeight - viewportHeight);
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const clamped = Math.min(1, Math.max(0, progress));
      bar.style.transform = `scaleX(${clamped})`;
      container?.setAttribute('aria-valuenow', String(Math.round(clamped * 100)));
      ticking = false;
    };

    updateProgress();

    if (scrollProgressSetupDone) return;
    scrollProgressSetupDone = true;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  function setupPrintMode() {
    const printButton = $(SELECTORS.printPortfolio);
    if (!printButton) return;

    const expandProjectDetails = () => {
      document.querySelectorAll('.project-details').forEach((details) => {
        details.open = true;
      });
    };

    if (printModeSetupDone) return;
    printModeSetupDone = true;

    printButton.addEventListener('click', () => {
      expandProjectDetails();
      window.print();
    });

    window.addEventListener('beforeprint', expandProjectDetails);
  }

  let revealObserver = null;

  function refreshReveal(root = document) {
    const scope = root === document ? document : root;
    const revealItems = scope.querySelectorAll
      ? scope.querySelectorAll(".reveal:not(.is-visible), .section-heading:not(.is-visible)")
      : [];

    if (!revealItems.length) return;

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
      );
    }

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  function setupReveal() {
    refreshReveal();
  }

  function applySectionVisibility() {
    const visibilityConfig = data.sectionVisibility || {};
    document.querySelectorAll("section").forEach(sec => {
      if (sec.id && visibilityConfig[sec.id]) {
        sec.style.display = "none";
      } else if (sec.id) {
        sec.style.display = "";
      }
    });
  }

  function applySectionOrder() {
    const order = data.sectionOrder || ["about", "philosophy", "why-cybersecurity", "learning-useful", "timeline", "reflections", "projects", "achievements", "hobbies", "applications", "goals"];
    const main = $("#main");
    if (!main) return;
    // Only top-level sections take part in ordering — nested ones (Reflection Journal
    // inside the Technical Growth Journey) must stay inside their parent.
    const sections = Array.from(main.querySelectorAll(":scope > section"));
    const sectionMap = {};
    sections.forEach(sec => {
      if (sec.id) {
        sectionMap[sec.id] = sec;
      }
    });
    order.forEach(id => {
      const sec = sectionMap[id];
      if (sec) {
        main.appendChild(sec);
      }
    });
    sections.forEach(sec => {
      if (sec.id && !order.includes(sec.id)) {
        main.appendChild(sec);
      }
    });
  }

  function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === undefined) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  function saveToServer(changeDesc) {
    if (window.location.protocol === 'file:') {
      console.log("Running via file protocol, auto-save to disk is disabled. Use the Export data.js button to manually save.");
      return;
    }
    // Same-origin and relative: an absolute http://localhost:3000 URL is blocked by
    // this page's own CSP (connect-src 'self') whenever it is served from 127.0.0.1
    // or any other host, which silently broke saving to disk.
    fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        console.log("Changes successfully saved to data.js!");
        showSaveNotification(changeDesc ? `Saved: ${changeDesc}` : "Changes saved directly to disk");
      } else {
        console.error("Server failed to save:", resData.error);
      }
    })
    .catch(err => {
      console.error("Network error saving changes:", err);
    });
  }

  function showSaveNotification(message) {
    let toast = document.querySelector(".live-editor-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "live-editor-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      toast.style = "position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(60, 169, 232, 0.95); color: #070b16; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; z-index: 1001; transition: opacity 0.3s ease; pointer-events: none; box-shadow: 0 4px 12px rgba(60, 169, 232, 0.3);";
      const toastHost = document.querySelector("#main") || document.body;
      toastHost.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 2000);
  }

  function isAdminAuthenticated() {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function validateAdminToken() {
    const params = new URLSearchParams(window.location.search);
    const wantsAdmin = params.get("admin") === "1" || params.get("admin") === "true";

    if (isAdminAuthenticated()) return true;

    if (wantsAdmin) {
      showAdminPinPrompt();
    }

    return false;
  }

  function showAdminPinPrompt() {
    if (document.getElementById("adminPinOverlay")) return;

    const overlay = create("div", "admin-pin-overlay");
    overlay.id = "adminPinOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "adminPinTitle");

    const card = create("div", "admin-pin-card");

    const title = create("h2", "", "Enter Editor PIN");
    title.id = "adminPinTitle";

    const desc = create("p", "", "Enter the 4-digit PIN to unlock the portfolio editor on this device.");

    const input = document.createElement("input");
    input.type = "password";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.maxLength = 4;
    input.className = "admin-pin-input";
    input.setAttribute("aria-label", "4-digit admin PIN");
    input.placeholder = "••••";

    const error = create("p", "admin-pin-error");
    error.setAttribute("aria-live", "polite");

    const actions = create("div", "admin-pin-actions");

    const unlock = create("button", "button button-primary", "Unlock editor");
    unlock.type = "button";

    const cancel = create("button", "button button-secondary", "Cancel");
    cancel.type = "button";

    function tryUnlock() {
      if (input.value === ADMIN_PIN) {
        try {
          localStorage.setItem(ADMIN_AUTH_KEY, "true");
        } catch (storageError) { /* storage disabled */ }
        overlay.remove();
        initializeEditorModules();
        setupLiveEditor();
        showEditorToast("Editor unlocked");
      } else {
        error.textContent = "Incorrect PIN. Try again.";
        input.value = "";
        input.focus();
      }
    }

    unlock.addEventListener("click", tryUnlock);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        tryUnlock();
      }
      if (event.key === "Escape") overlay.remove();
    });
    cancel.addEventListener("click", () => overlay.remove());

    actions.append(unlock, cancel);
    card.append(title, desc, input, error, actions);
    overlay.append(card);
    document.body.append(overlay);

    setTimeout(() => input.focus(), 0);
  }

  function showEditorToast(message) {
    let toast = document.querySelector(".editor-toast-banner");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "editor-toast-banner";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = `✨ ${message}`;
    toast.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function setupLiveEditor() {
    if (!validateAdminToken()) return;
    if ($(".live-editor-sidebar")) return;

    // Create Same-Position FAB Pair (Open FAB & Close FAB)
    const fab = create("button", "live-editor-fab", "🛠️");
    fab.setAttribute("aria-label", "Open live portfolio editor");
    fab.setAttribute("title", "Open live portfolio editor (Ctrl+Shift+E)");

    const closeFab = create("button", "live-editor-close-fab", "✖");
    closeFab.setAttribute("aria-label", "Close live portfolio editor");
    closeFab.setAttribute("title", "Close live portfolio editor");
    closeFab.tabIndex = -1;

    document.body.append(fab, closeFab);

    // Create Sidebar
    const sidebar = create("aside", "live-editor-sidebar");
    sidebar.setAttribute("aria-label", "Live Portfolio Editor");

    const header = create("div", "sidebar-header");
    header.append(create("h3", "", "No-code editor"));
    const closeBtn = create("button", "sidebar-close-btn", "✖");
    closeBtn.setAttribute("aria-label", "Close editor panel");
    header.append(closeBtn);

    const content = create("div", "sidebar-content");

    const introBlock = create("div", "editor-control-group");
    introBlock.append(create("h4", "", "No-code editor"));
    introBlock.append(create("p", "control-description", "Jump to the sections that matter most, then edit content inline without touching the source files."));
    content.append(introBlock);

    const workflowSummary = create("div", "editor-workflow-card");
    const statusPill = create("span", "editor-status-pill", "Admin mode ready");
    statusPill.id = "editorStatusPill";
    workflowSummary.append(statusPill);
    workflowSummary.append(create("p", "control-description", "Use the workflow shortcuts below to edit copy, reorder sections, add content blocks, and preview the layout."));
    content.append(workflowSummary);

    // Undo/Redo Controls
    const undoRedoGroup = create("div", "editor-control-group");
    undoRedoGroup.append(create("h4", "", "History"));
    const undoRedoRow = create("div", "editor-undo-redo-row");

    const undoBtn = create("button", "button button-secondary undo-btn", "↶ Undo");
    undoBtn.id = "undoBtn";
    undoBtn.type = "button";
    undoBtn.title = "Undo last change (Ctrl+Z)";
    undoBtn.addEventListener("click", performUndo);
    undoRedoRow.append(undoBtn);

    const redoBtn = create("button", "button button-secondary redo-btn", "↷ Redo");
    redoBtn.id = "redoBtn";
    redoBtn.type = "button";
    redoBtn.title = "Redo last undone change (Ctrl+Shift+Z)";
    redoBtn.addEventListener("click", performRedo);
    undoRedoRow.append(redoBtn);

    undoRedoGroup.append(undoRedoRow);
    undoRedoGroup.append(create("p", "control-description", "Undo/Redo history is automatically saved. Use keyboard shortcuts: Ctrl+Z to undo, Ctrl+Shift+Z to redo."));
    content.append(undoRedoGroup);

    const quickNavGroup = create("div", "editor-control-group");
    quickNavGroup.append(create("h4", "", "Quick jumps"));
    const quickJumpRow = create("div", "editor-quick-jumps");
    EDITOR_QUICK_JUMPS.forEach(([label, target]) => {
      const jumpBtn = create("button", "button button-secondary quick-jump-btn", label);
      jumpBtn.type = "button";
      jumpBtn.addEventListener("click", () => {
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      quickJumpRow.append(jumpBtn);
    });
    quickNavGroup.append(quickJumpRow);
    content.append(quickNavGroup);

    // Visibility: Reflection Journal ("Growth") — lets the presenter fold the
    // journal away without deleting content. Persists through export/save via
    // data.sectionVisibility, the same mechanism the other sections use.
    const reflectionVisGroup = create("div", "editor-control-group");
    reflectionVisGroup.append(create("h4", "", "Section visibility"));
    const reflectionSwitch = create("label", "switch-container");
    reflectionSwitch.append(create("span", "", "Show Reflection Journal"));
    const reflectionInput = document.createElement("input");
    reflectionInput.type = "checkbox";
    reflectionInput.id = "reflectionVisibilityToggle";
    data.sectionVisibility = data.sectionVisibility || {};
    reflectionInput.checked = !data.sectionVisibility.reflections;
    reflectionSwitch.append(reflectionInput, create("span", "switch-slider"));
    reflectionVisGroup.append(reflectionSwitch);
    reflectionVisGroup.append(create("p", "control-description", "Hide or show the Reflection Journal (Growth) section. Export or save data.js to keep the setting."));
    reflectionInput.addEventListener("change", () => {
      data.sectionVisibility = data.sectionVisibility || {};
      if (reflectionInput.checked) delete data.sectionVisibility.reflections;
      else data.sectionVisibility.reflections = true;
      applySectionVisibility();
      renderNav();
      showEditorToast(reflectionInput.checked ? "Reflection Journal shown" : "Reflection Journal hidden");
    });
    content.append(reflectionVisGroup);

    // A labelled on/off switch. Both editing modes are built from this so the
    // markup contract (.switch-container / .switch-slider) stays identical.
    function buildSwitch(id, label, description) {
      const group = create("div", "editor-control-group");
      const wrap = create("label", "switch-container");
      wrap.append(create("span", "", label));
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      wrap.append(input, create("span", "switch-slider"));
      group.append(wrap, create("p", "control-description", description));
      return { group, input };
    }

    const editText = buildSwitch(
      "toggleEditModeBtn",
      "Edit Text Inline",
      "Click and edit text directly on the page. Changes save automatically when you click away."
    );
    const reorder = buildSwitch(
      "toggleReorderModeBtn",
      "Shift Sections",
      "Use Up/Down controls on sections to swap their layout sequence."
    );
    const group1 = editText.group;
    const input1 = editText.input;
    const group2 = reorder.group;
    const input2 = reorder.input;

    // Actions Group
    const actions = create("div", "admin-actions");
    const adminBtn = create("button", "button button-secondary", "Advanced Admin Editor");
    adminBtn.id = "adminDataBtn";
    adminBtn.style.width = "100%";
    adminBtn.style.marginTop = "12px";
    actions.append(adminBtn);

    const exportBtn = create("button", "button button-primary", "Export data.js");
    exportBtn.id = "exportDataBtn";
    exportBtn.style.display = "none";
    exportBtn.style.width = "100%";
    exportBtn.style.marginTop = "12px";
    actions.append(exportBtn);

    const lockEditorBtn = create("button", "button button-secondary", "Lock editor");
    lockEditorBtn.type = "button";
    lockEditorBtn.style.width = "100%";
    lockEditorBtn.style.marginTop = "12px";
    lockEditorBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      } catch (error) { /* storage disabled */ }
      document.body.classList.remove("admin-mode", "live-editing-active");
      document.querySelector(".live-editor-sidebar")?.remove();
      document.querySelector(".live-editor-fab")?.remove();
      document.querySelector(".live-editor-close-fab")?.remove();
      showEditorToast("Editor locked");
    });
    actions.append(lockEditorBtn);

    // Templates / Insert Section
    const templatesGroup = create('div', 'editor-control-group');
    templatesGroup.append(create('h4', '', 'Insert Section'));
    const templateSelect = document.createElement('select');
    templateSelect.className = 'template-select';
    templateSelect.setAttribute('aria-label', 'Select a section template');
    [['hero','Hero (large header)'], ['text-image','Text + Image'], ['cta','Call to action'], ['embed','Embed (URL)'], ['faq','FAQ / Collapsible']].forEach(([val,label]) => {
      const opt = document.createElement('option'); opt.value = val; opt.textContent = label; templateSelect.append(opt);
    });
    const addTemplateBtn = create('button', 'button button-secondary', 'Add section');
    addTemplateBtn.type = 'button';
    templatesGroup.append(templateSelect, addTemplateBtn);

    // Theme editor
    const themeGroup = create('div', 'editor-control-group');
    themeGroup.append(create('h4', '', 'Theme tokens'));
    const themePrimary = create('label', '', 'Primary color'); themePrimary.htmlFor = 'editorPrimaryColor';
    const inputPrimary = document.createElement('input'); inputPrimary.type = 'color'; inputPrimary.id = 'editorPrimaryColor'; inputPrimary.value = (data.theme?.colors?.primary) || '#1b74ab'; themePrimary.append(inputPrimary);
    const themeAccent = create('label', '', 'Accent color'); themeAccent.htmlFor = 'editorAccentColor';
    const inputAccent = document.createElement('input'); inputAccent.type = 'color'; inputAccent.id = 'editorAccentColor'; inputAccent.value = (data.theme?.colors?.accent) || '#6b5bd1'; themeAccent.append(inputAccent);
    const themeBg = create('label', '', 'Background'); themeBg.htmlFor = 'editorBgColor';
    const inputBg = document.createElement('input'); inputBg.type = 'color'; inputBg.id = 'editorBgColor'; inputBg.value = (data.theme?.colors?.background) || '#0b1525'; themeBg.append(inputBg);
    themeGroup.append(themePrimary, themeAccent, themeBg);

    // Preview modes
    const previewGroup = create('div', 'editor-control-group');
    previewGroup.append(create('h4', '', 'Preview'));
    const previewDesktop = create('button', 'button', 'Desktop'); previewDesktop.type = 'button';
    const previewTablet = create('button', 'button', 'Tablet'); previewTablet.type = 'button';
    const previewMobile = create('button', 'button', 'Mobile'); previewMobile.type = 'button';
    previewGroup.append(previewDesktop, previewTablet, previewMobile);

    // Asset uploader & library
    const assetsGroup = create('div', 'editor-control-group');
    assetsGroup.append(create('h4', '', 'Asset library (images)'));
    const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.setAttribute('aria-label', 'Upload an image to the asset library');
    const assetList = create('div', 'asset-list');
    assetsGroup.append(fileInput, assetList);

    // Versions / publish controls
    const versionsGroup = create('div', 'editor-control-group');
    versionsGroup.append(create('h4', '', 'Versions & Publish'));
    const publishBtn = create('button', 'button button-primary', data.sitePublished ? 'Unpublish' : 'Publish');
    publishBtn.type = 'button';
    publishBtn.id = 'publishBtn';
    const versionsList = create('div', 'versions-list');
    versionsGroup.append(publishBtn, versionsList);

    // The panel used to be one long scroll. Grouping it into collapsible task
    // sections keeps the editing controls reachable without hunting.
    function addPanel(title, groups, open = false) {
      const panel = document.createElement("details");
      panel.className = "editor-panel";
      panel.open = open;
      const summary = document.createElement("summary");
      summary.className = "editor-panel-summary";
      summary.textContent = title;
      panel.append(summary, ...groups);
      content.append(panel);
    }

    addPanel("Content", [group1, templatesGroup], true);
    addPanel("Layout", [group2, previewGroup]);
    addPanel("Design", [themeGroup]);
    addPanel("Assets", [assetsGroup]);
    addPanel("Versions & publish", [versionsGroup, actions]);

    sidebar.append(header, content);
    document.body.appendChild(sidebar);

    // Open/Close toggle with same-position controls
    const toggleEditor = (open) => {
      const isOpen = open !== undefined ? open : !sidebar.classList.contains("is-open");
      sidebar.classList.toggle("is-open", isOpen);
      sidebar.setAttribute("aria-hidden", isOpen ? "false" : "true");
      fab.setAttribute("aria-expanded", isOpen ? "true" : "false");
      fab.classList.toggle("is-replaced", isOpen);
      fab.style.display = isOpen ? "none" : "flex";

      closeFab.classList.toggle("is-visible", isOpen);
      closeFab.setAttribute("aria-hidden", isOpen ? "false" : "true");
      closeFab.tabIndex = isOpen ? 0 : -1;

      if (isOpen) {
        document.body.classList.add("admin-mode");
        syncEditorOppositeTheme();
        showEditorToast("Live portfolio editor active");
        closeFab.focus();
      } else {
        document.body.classList.remove("admin-mode");
        fab.focus();
      }
    };

    fab.addEventListener("click", () => toggleEditor(true));
    closeFab.addEventListener("click", () => toggleEditor(false));
    closeBtn.addEventListener("click", () => toggleEditor(false));

    // Global Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+E / Cmd+Shift+E: Open/close editor
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        toggleEditor();
      }
      // Escape: Close editor
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
        toggleEditor(false);
      }
      // Ctrl+Z / Cmd+Z: Undo (when editor is open)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && sidebar.classList.contains("is-open")) {
        e.preventDefault();
        performUndo();
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z: Redo (when editor is open)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "z" || e.key === "Z") && sidebar.classList.contains("is-open")) {
        e.preventDefault();
        performRedo();
      }
    });

    let textEditingActive = false;
    let sectionShiftingActive = false;

    function setEditorStatus(message, tone = "ready") {
      const pill = document.getElementById("editorStatusPill");
      if (!pill) return;
      pill.textContent = message;
      pill.dataset.tone = tone;
    }

    setEditorStatus("Admin mode ready • choose a workflow", "ready");

    // Event listeners
    input1.addEventListener("change", () => {
      textEditingActive = input1.checked;
      if (textEditingActive) {
        document.body.classList.add("live-editing-active");
        setEditorStatus("Inline editing active • click any editable text", "active");
        document.querySelectorAll("[data-edit-path]").forEach(el => {
          el.contentEditable = "true";
          el.addEventListener("blur", handleTextBlur);
        });
      } else {
        if (!sectionShiftingActive) {
          document.body.classList.remove("live-editing-active");
          setEditorStatus("Admin mode ready • choose a workflow", "ready");
        }
        document.querySelectorAll("[data-edit-path]").forEach(el => {
          el.removeAttribute("contenteditable");
          el.removeEventListener("blur", handleTextBlur);
        });
      }
    });

    input2.addEventListener("change", () => {
      sectionShiftingActive = input2.checked;
      if (sectionShiftingActive) {
        document.body.classList.add("live-editing-active");
        setEditorStatus("Section reorder mode active • use the move buttons", "active");
        const main = $("#main");
        if (main) {
          const sections = Array.from(main.querySelectorAll(":scope > section"));
          sections.forEach(sec => {
            if (!sec.id) return;
            let controls = sec.querySelector(".section-edit-controls");
            if (!controls) {
              controls = create("div", "section-edit-controls");

              const upBtn = create("button", "", "▲ Move Up");
              upBtn.type = "button";
              upBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const prev = sec.previousElementSibling;
                if (prev && prev.tagName === "SECTION") {
                  sec.parentNode.insertBefore(sec, prev);
                  updateSectionOrder();
                }
              });

              const downBtn = create("button", "", "▼ Move Down");
              downBtn.type = "button";
              downBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const next = sec.nextElementSibling;
                if (next && next.tagName === "SECTION") {
                  sec.parentNode.insertBefore(next, sec);
                  updateSectionOrder();
                }
              });

              controls.append(upBtn, downBtn);
              sec.appendChild(controls);
            }
            controls.style.display = "flex";
          });
        }
      } else {
        if (!textEditingActive) {
          document.body.classList.remove("live-editing-active");
          setEditorStatus("Admin mode ready • choose a workflow", "ready");
        }
        document.querySelectorAll(".section-edit-controls").forEach(controls => {
          controls.style.display = "none";
        });
      }
    });

    adminBtn.addEventListener("click", showAdvancedAdminModal);
    exportBtn.addEventListener("click", showExportModal);

    // Add Template handler
    addTemplateBtn.addEventListener('click', () => {
      const type = templateSelect.value;
      data.customSections = data.customSections || [];
      const newSection = { type };
      if (type === 'hero') {
        newSection.title = 'New hero';
        newSection.body = 'A short subtitle or intro.';
      } else if (type === 'text-image') {
        newSection.title = 'Text and image';
        newSection.body = 'Write your descriptive text here.';
        newSection.image = '';
      } else if (type === 'embed') {
        newSection.title = 'Embedded content';
        newSection.embedUrl = '';
        newSection.height = '360px';
      } else if (type === 'faq') {
        newSection.title = 'Frequently asked questions';
        newSection.items = [{ q: 'Question 1', a: 'Answer 1' }];
      } else if (type === 'cta') {
        newSection.title = 'Call to action';
        newSection.ctaTitle = 'Ready to learn more?';
        newSection.ctaLabel = 'Contact me';
        newSection.ctaHref = '#';
      }
      data.customSections.push(newSection);
      // remember last added for quick-insert
      window._eaeEditorState.lastAddedSectionId = newSection.id;
      // Insert into ordering after projects section by default
      data.sectionOrder = data.sectionOrder || [];
      const insertAfter = 'projects';
      const idx = data.sectionOrder.indexOf(insertAfter);
      const newId = newSection.id || `custom-${Date.now().toString(36)}`;
      newSection.id = newId;
      if (idx === -1) data.sectionOrder.push(newSection.id);
      else data.sectionOrder.splice(idx + 1, 0, newSection.id);
      render();
      exportBtn.style.display = 'block';
      setEditorStatus('New section added • personalize it next', 'success');
      saveToServer('Added custom section');
      createVersionSnapshot('Added custom section');
    });

    // Theme change handlers
    function applyThemeTokens() {
      data.theme = data.theme || {};
      data.theme.colors = data.theme.colors || {};
      data.theme.colors.primary = inputPrimary.value;
      data.theme.colors.accent = inputAccent.value;
      data.theme.colors.background = inputBg.value;
      document.documentElement.style.setProperty('--theme-accent-cyan', data.theme.colors.primary);
      document.documentElement.style.setProperty('--theme-accent-purple', data.theme.colors.accent);
      document.documentElement.style.setProperty('--theme-bg', data.theme.colors.background);
      // Keep legacy aliases synchronized for older component styles.
      document.documentElement.style.setProperty('--blue-500', data.theme.colors.primary);
      document.documentElement.style.setProperty('--purple-700', data.theme.colors.accent);
      document.documentElement.style.setProperty('--paper', data.theme.colors.background);
      exportBtn.style.display = 'block';
      saveToServer('Updated theme tokens');
    }
    inputPrimary.addEventListener('change', applyThemeTokens);
    inputAccent.addEventListener('change', applyThemeTokens);
    inputBg.addEventListener('change', applyThemeTokens);

    // Preview handlers
    function setPreview(mode) {
      document.body.classList.remove('preview-desktop','preview-tablet','preview-mobile');
      document.body.classList.add(`preview-${mode}`);
    }
    previewDesktop.addEventListener('click', () => setPreview('desktop'));
    previewTablet.addEventListener('click', () => setPreview('tablet'));
    previewMobile.addEventListener('click', () => setPreview('mobile'));

    // Enable drag-and-drop for custom sections when reorder mode is on
    function enableCustomDrag(enabled) {
      const main = $('#main');
      if (!main) return;
      const items = Array.from(main.querySelectorAll('section.custom-section'));
      items.forEach(item => {
        item.draggable = !!enabled;
        if (enabled) {
          item.addEventListener('dragstart', dragStartHandler);
          item.addEventListener('dragover', dragOverHandler);
          item.addEventListener('drop', dropHandler);
        } else {
          item.removeEventListener('dragstart', dragStartHandler);
          item.removeEventListener('dragover', dragOverHandler);
          item.removeEventListener('drop', dropHandler);
        }
      });
    }

    let dragSrc = null;
    function dragStartHandler(e) {
      dragSrc = e.currentTarget;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragSrc.id); } catch (err) {}
    }
    function dragOverHandler(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
    function dropHandler(e) {
      e.preventDefault();
      const target = e.currentTarget;
      if (!dragSrc || dragSrc === target) return;
      const main = $('#main');
      main.insertBefore(dragSrc, target.nextElementSibling);
      // update ordering
      updateSectionOrder();
    }

    // Hook into existing section shift toggle to enable drag for custom sections
    input2.addEventListener('change', () => {
      const enabled = input2.checked;
      enableCustomDrag(enabled);
    });

    // Asset upload handling
    function loadAssets() {
      data.uploadedAssets = data.uploadedAssets || [];
      assetList.replaceChildren();
      (data.uploadedAssets || []).forEach((asset, i) => {
        const thumb = create('div', 'asset-thumb');
        thumb.dataset.assetId = asset.id || `asset-${i}`;
        const img = document.createElement('img'); img.src = asset.url; img.alt = asset.name || `asset-${i}`;
        const actions = create('div', 'asset-actions');
        const copyBtn = create('button', 'button', 'Copy URL'); copyBtn.type='button';
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(asset.url);
          showSaveNotification('Copied asset URL to clipboard');
        });
        actions.append(copyBtn);
        thumb.append(img, actions);
        assetList.append(thumb);
      });
    }

    fileInput.addEventListener('change', (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        data.uploadedAssets = data.uploadedAssets || [];
        const asset = { id: `asset-${Date.now().toString(36)}`, name: f.name, url: reader.result };
        data.uploadedAssets.push(asset);
        exportBtn.style.display = 'block';
        saveToServer('Uploaded asset');
        createVersionSnapshot('Uploaded asset');
        loadAssets();
      };
      reader.readAsDataURL(f);
    });
    loadAssets();

    // Enhance asset list thumbnails with click-to-insert and crop options
    function enhanceAssetInteractions() {
      const thumbs = assetList.querySelectorAll('.asset-thumb');
      thumbs.forEach((thumb) => {
        const img = thumb.querySelector('img');
        const aid = thumb.dataset.assetId;
        const asset = (data.uploadedAssets || []).find(a => a.id === aid);
        if (!img || !asset) return;
        img.style.cursor = 'pointer';
        img.onclick = null;
        img.addEventListener('click', (e) => {
          // If a section is selected, insert there
          const selected = window._eaeEditorState.selectedSectionId || window._eaeEditorState.lastAddedSectionId;
          if (selected) {
            insertAssetToSection(asset.optimized || asset.url, selected);
            showSaveNotification('Inserted asset into selected section');
            return;
          }
          // otherwise, open crop/modal for preview and allow copy
          openCropModalForAsset(asset);
        });
        // Add right-click menu to copy URL
        thumb.oncontextmenu = null;
        thumb.addEventListener('contextmenu', (ev) => {
          ev.preventDefault();
          navigator.clipboard.writeText(asset.optimized || asset.url);
          showSaveNotification('Copied asset URL to clipboard');
        });
      });
    }
    // Use top-level version helpers and refresh the visible sidebar list
    renderVersionsList();

    // Publish handling
    publishBtn.addEventListener('click', () => {
      data.sitePublished = !data.sitePublished;
      if (data.sitePublished) {
        // Save a published snapshot
        localStorage.setItem(STORAGE_KEYS.publishedSnapshot, JSON.stringify({ ts: new Date().toISOString(), data: data }));
        publishBtn.textContent = 'Unpublish';
        showSaveNotification('Site published (local snapshot)');
        setEditorStatus('Published locally • share the snapshot when ready', 'success');
        saveToServer('Published site snapshot');
      } else {
        localStorage.removeItem(STORAGE_KEYS.publishedSnapshot);
        publishBtn.textContent = 'Publish';
        showSaveNotification('Site unpublished');
        setEditorStatus('Draft mode • edits stay local until you publish', 'ready');
        saveToServer('Unpublished site');
      }
      createVersionSnapshot(data.sitePublished ? 'Published site' : 'Unpublished site');
    });

    function handleTextBlur(e) {
      const el = e.target;
      const path = el.dataset.editPath;
      if (!path) return;

      const val = el.textContent.trim();
      setNestedValue(data, path, val);
      exportBtn.style.display = "block";
      saveToServer("Text updated");
    }

    function updateSectionOrder() {
      const main = $("#main");
      if (!main) return;
      const sections = Array.from(main.querySelectorAll("section"));
      data.sectionOrder = sections.map(sec => sec.id).filter(Boolean);
      exportBtn.style.display = "block";
      saveToServer("Section order updated");
    }
  }

  function showExportModal() {
    const dialog = $(SELECTORS.achievementModal);
    const content = $(SELECTORS.modalContent);
    if (!dialog || !content) return;

    content.replaceChildren();

    const header = create("header", "modal-header");
    header.append(create("h2", "", "Export data.js"));

    const intro = create("p", "section-lede", "Your live changes have been saved to memory. Copy the exported JavaScript code below and paste it into your data.js file, or click download to save it.");

    const textarea = create("textarea", "json-editor");
    textarea.style = "width: 100%; height: 350px; font-family: monospace; font-size: 0.85rem; padding: 12px; margin-top: 12px; background: #ffffff; color: #000000; border: 1px solid var(--blue-500); border-radius: 6px;";
    textarea.spellcheck = false;

    const exportedCode = `(function () {\n  window.PORTFOLIO_DATA = ${JSON.stringify(data, null, 2)};\n})();\n`;
    textarea.value = exportedCode;

    const actions = create("div", "admin-actions");
    actions.style = "display: flex; gap: 8px; margin-top: 12px;";

    const copyBtn = create("button", "button button-primary", "Copy to Clipboard");
    copyBtn.addEventListener("click", () => {
      textarea.select();
      navigator.clipboard.writeText(textarea.value);
      copyBtn.textContent = "Copied!";
      setTimeout(() => copyBtn.textContent = "Copy to Clipboard", 2000);
    });

    const downloadBtn = create("button", "button button-secondary", "Download data.js");
    downloadBtn.addEventListener("click", () => {
      const blob = new Blob([textarea.value], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    actions.append(copyBtn, downloadBtn);
    content.append(header, intro, textarea, actions);

    openModalDialog(dialog);
  }

  function showAdvancedAdminModal() {
    const dialog = $(SELECTORS.achievementModal);
    const content = $(SELECTORS.modalContent);
    if (!dialog || !content) return;

    content.replaceChildren();

    const header = create("header", "modal-header");
    header.append(create("h2", "", "Advanced Admin Editor"));

    const intro = create("p", "section-lede", "Edit all data fields manually. Changes will apply immediately to the page.");

    const container = create("div", "admin-grid");
    container.style = "display: flex; flex-direction: column; gap: 24px; text-align: left;";

    function createField(label, path, multiline) {
      const wrapper = create("label", "field");
      wrapper.style = "display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;";
      const text = create("span", "", label);
      text.style.fontWeight = "bold";
      const input = document.createElement(multiline ? "textarea" : "input");
      input.className = "json-editor"; // Reuse styling
      if(multiline) {
          input.style.height = "100px";
          input.style.fontFamily = "inherit";
      }
      input.dataset.path = path;

      const val = path.split(".").reduce((target, key) => target?.[key], data);
      input.value = val || "";

      wrapper.append(text, input);
      return wrapper;
    }

    const quickForm = create("form", "admin-form");

    const fieldsDef = [
      { section: "Quick fields" },
      { label: "Name", path: "profile.name" },
      { label: "Headline", path: "profile.headline" },
      { label: "Identity line", path: "profile.identityLine" },
      { label: "Subheadline", path: "profile.subheadline", multi: true },
      { label: "Intro", path: "profile.intro", multi: true },
      { label: "Personal signature", path: "profile.personalSignature", multi: true },
      { label: "How I want people to remember me", path: "profile.rememberMe", multi: true },
      { label: "Photo caption", path: "profile.photoCaption" },
      { label: "Brand statement", path: "profile.brandStatement", multi: true },
      { section: "Personal journey" },
      { label: "Life entry title", path: "lifeEntry.title" },
      { label: "Life entry intro", path: "lifeEntry.intro", multi: true },
      { label: "Life entry doorway line", path: "lifeEntry.doorway", multi: true },
      { label: "Personal map title", path: "personalMap.title" },
      { label: "Personal map intro", path: "personalMap.intro", multi: true },
      { label: "Personal map note", path: "personalMap.note", multi: true },
      { section: "Reader-facing summaries" },
      { label: "Evidence deck intro", path: "evidenceDeck.intro", multi: true },
      { section: "UI Labels" },
      { label: "Nav About", path: "uiLabels.navAbout" },
      { label: "Nav Evidence", path: "uiLabels.navEvidence" },
      { label: "Nav Projects", path: "uiLabels.navProjects" },
      { label: "Nav Achievements", path: "uiLabels.navAchievements" },
      { label: "Nav Applications", path: "uiLabels.navApplications" },
      { label: "Evidence Deck Title", path: "uiLabels.evidenceOverviewTitle" },
      { label: "Evidence Deck Intro", path: "uiLabels.evidenceOverviewIntro", multi: true }
    ];

    fieldsDef.forEach(f => {
      if (f.section) {
        const h3 = create("h3", "", f.section);
        h3.style.marginTop = "24px";
        h3.style.borderBottom = "1px solid #334155";
        h3.style.paddingBottom = "8px";
        quickForm.append(h3);
      } else {
        quickForm.append(createField(f.label, f.path, f.multi));
      }
    });

    const appSection = create("h3", "", "Target applications");
    appSection.style.marginTop = "24px";
    appSection.style.borderBottom = "1px solid #334155";
    appSection.style.paddingBottom = "8px";
    quickForm.append(appSection);

    (data.targetApplications || []).forEach((app, idx) => {
      quickForm.append(create("h4", "", app.institution));
      quickForm.append(createField("Target course", `targetApplications.${idx}.targetCourse`));
      quickForm.append(createField("Why this school/course", `targetApplications.${idx}.whyThisSchool`, true));
    });

    const projSection = create("h3", "", "Featured project signals");
    projSection.style.marginTop = "24px";
    projSection.style.borderBottom = "1px solid #334155";
    projSection.style.paddingBottom = "8px";
    quickForm.append(projSection);

    (data.projects || []).forEach((proj, idx) => {
      quickForm.append(create("h4", "", proj.title));
      quickForm.append(createField("Portfolio signal", `projects.${idx}.portfolioSignal`, true));
      quickForm.append(createField("EAE connection", `projects.${idx}.eaeConnection`, true));
      quickForm.append(createField("Evidence status", `projects.${idx}.evidenceStatus`, true));
    });

    const achSection = create("h3", "", "Achievement EAE signals");
    achSection.style.marginTop = "24px";
    achSection.style.borderBottom = "1px solid #334155";
    achSection.style.paddingBottom = "8px";
    quickForm.append(achSection);

    (data.achievements || []).forEach((ach, idx) => {
      quickForm.append(create("h4", "", ach.title));
      quickForm.append(createField("What this shows about me", `achievements.${idx}.applicantSignal`, true));
      quickForm.append(createField("Why it matters for EAE", `achievements.${idx}.eaeRelevance`, true));
    });

    const jsonSection = create("div");
    jsonSection.append(create("h3", "", "Full Data (Editable JSON)"));
    const jsonEditor = create("textarea", "json-editor");
    jsonEditor.style = "width: 100%; height: 300px; font-family: monospace; font-size: 0.85rem; padding: 12px; margin-top: 12px; background: #ffffff; color: #000000; border: 1px solid var(--blue-500); border-radius: 6px;";
    jsonEditor.spellcheck = false;
    jsonEditor.value = JSON.stringify(data, null, 2);
    jsonSection.append(jsonEditor);
    container.append(quickForm, jsonSection);

    const actions = create("div", "admin-actions");
    actions.style = "display: flex; gap: 8px; margin-top: 24px; position: sticky; bottom: 0; background: var(--bg); padding: 12px 0;";

    const applyFormBtn = create("button", "button button-primary", "Apply Form Edits");
    applyFormBtn.type = "button";
    applyFormBtn.addEventListener("click", () => {
      quickForm.querySelectorAll("[data-path]").forEach(input => {
        const keys = input.dataset.path.split(".");
        const last = keys.pop();
        const target = keys.reduce((cursor, key) => cursor[key], data);
        target[last] = input.value;
      });
      jsonEditor.value = JSON.stringify(data, null, 2);
      render();
      exportBtn.style.display = "block";
      if (typeof saveToServer === "function") saveToServer("Applied Advanced Form edits");
      dialog.close();
    });

    const applyJsonBtn = create("button", "button button-secondary", "Apply JSON Edits");
    applyJsonBtn.type = "button";
    applyJsonBtn.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(jsonEditor.value);
        Object.assign(data, parsed);
        quickForm.querySelectorAll("[data-path]").forEach(input => {
          const val = input.dataset.path.split(".").reduce((t, k) => t?.[k], data);
          input.value = val || "";
        });
        render();
        exportBtn.style.display = "block";
        if (typeof saveToServer === "function") saveToServer("Applied JSON edits");
        dialog.close();
      } catch (e) {
        alert("Invalid JSON!");
      }
    });

    actions.append(applyFormBtn, applyJsonBtn);
    content.append(header, intro, container, actions);

    openModalDialog(dialog);
  }

  function syncEditorOppositeTheme() {
    const sidebar = document.querySelector(".live-editor-sidebar");
    if (!sidebar) return;
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';

    // Always apply the opposite class
    if (currentTheme === 'light') {
      sidebar.classList.remove('editor-opposite-light');
      sidebar.classList.add('editor-opposite-dark');
    } else {
      sidebar.classList.remove('editor-opposite-dark');
      sidebar.classList.add('editor-opposite-light');
    }
  }

  function setupThemeToggle() {
    const btn = $(SELECTORS.themeToggle);
    const editorBtn = $("#editorToggle");

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    syncEditorOppositeTheme();

    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme') || 'dark';
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
        syncEditorOppositeTheme();
      });
    }

    if (editorBtn) {
      editorBtn.addEventListener('click', () => {
        if (!document.querySelector(".live-editor-sidebar")) {
          setupLiveEditor(true);
        }
        const sidebar = document.querySelector(".live-editor-sidebar");
        const fab = document.querySelector(".live-editor-fab");
        if (sidebar) {
          sidebar.classList.toggle("is-open");
          const isOpen = sidebar.classList.contains("is-open");
          if (fab) {
            fab.classList.toggle("is-active", isOpen);
            fab.textContent = isOpen ? "✖" : "🛠️";
          }
          if (isOpen) {
            document.body.classList.add("admin-mode");
            syncEditorOppositeTheme();
          } else {
            document.body.classList.remove("admin-mode");
          }
        }
      });
    }
  }

  function renderHobbies() {
    const grid = $("#hobbiesGrid");
    const filters = $("#hobbiesFilters");
    const hobbiesData = data.hobbies || {};
    const entries = Array.isArray(hobbiesData.entries) ? hobbiesData.entries : [];
    if (!grid) return;

    const categories = ["All", ...new Set(entries.map((item) => item.category || "General"))];
    let activeCategory = "All";

    function drawFilters() {
      if (!filters) return;
      renderFilterButtons(
        filters,
        categories,
        (cat) => cat === activeCategory,
        (cat) => { activeCategory = cat; drawFilters(); drawCards(); }
      );
    }

    function drawCards() {
      grid.replaceChildren();
      const filtered = entries.filter((item) => activeCategory === "All" || item.category === activeCategory);

      if (filtered.length === 0) {
        grid.append(create("p", "empty-state", "No hobbies found matching category."));
        return;
      }

      filtered.forEach((hobby) => {
        const card = create("article", "hobby-card");

        if (hobby.image && hobby.image.trim() !== "") {
          const imgFrame = create("div", "hobby-card-image");
          const img = document.createElement("img");
          img.src = hobby.image;
          img.alt = hobby.title;
          img.loading = "lazy";
          imgFrame.append(img);
          card.append(imgFrame);
        } else {
          const iconMap = {
            "OS & File Systems": "💻",
            "Linux & Systems": "🐧",
            "Artificial Intelligence": "🤖",
            "Physics & Curiosity": "🔭",
            "Engineering": "⚙️"
          };
          const icon = iconMap[hobby.category] || "🚀";
          const iconHeader = create("div", "hobby-card-icon-header");
          iconHeader.append(create("span", "hobby-icon-emoji", icon));
          card.append(iconHeader);
        }

        if (hobby.category) {
          card.append(create("span", "hobby-category-badge", hobby.category));
        }

        card.append(create("h3", "hobby-card-title", hobby.title));
        card.append(create("p", "hobby-card-desc", hobby.description));

        if (hobby.takeaway) {
          card.append(create("div", "hobby-takeaway", `Takeaway: ${hobby.takeaway}`));
        }

        if (Array.isArray(hobby.tags) && hobby.tags.length > 0) {
          const tagsWrap = create("div", "hobby-tags");
          hobby.tags.forEach((tag) => {
            tagsWrap.append(create("span", "hobby-tag-pill", `#${tag}`));
          });
          card.append(tagsWrap);
        }

        grid.append(card);
      });
    }

    drawFilters();
    drawCards();
  }

  /* ==========================================================================
   * SECTION 4: DOM INITIALIZATION & APPLICATION LIFECYCLE RENDER
   * ========================================================================== */
  function render() {
    setupThemeToggle();
    renderNav();
    applySectionVisibility();
    renderCustomSections();
    applySectionOrder();
    renderHero();
    renderPhilosophy();
    renderWhyCybersecurity();
    renderLearningUseful();
    renderLifeEntry();
    renderJourneyChapters();
    renderProjects();
    renderCodeShowcase();
    renderApplications();
    renderAchievements();
    // After renderAchievements(), which materialises data.learningRepository that
    // the note index reads commit titles from.
    renderReflections();
    renderHobbies();
    renderGoals();
    renderOptionalSections();
    setupModal();
    setupSchoolPortfolioIntegration();
    setupNavigation();
    setupChromeHeight();
    setupSectionTabs();
    setupScrollProgress();
    setupPrintMode();
    setupReveal();
    setupHintTooltips();
    setupLiveEditor();
    initializeEditorModules();
    setupAccessibilitySidebar();
    setupEvidenceIsland();
    applyInitialHash();
  }

  // The browser resolves #section while parsing, but rendering then re-parents
  // sections and fills them with content, which moves the anchor. Re-apply it once
  // the final layout exists so returning from the school portfolio lands correctly.
  function applyInitialHash() {
    const id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return;
    const settle = () => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    };
    requestAnimationFrame(() => requestAnimationFrame(settle));
    window.addEventListener("load", () => setTimeout(settle, 120), { once: true });
  }

  function setupAccessibilitySidebar() {
    const fab       = $('#a11yToggleFab');
    const sidebar   = $('#a11ySidebar');
    const closeBtn  = $('#a11yCloseBtn');
    if (!fab || !sidebar) return;
    if (sidebar.dataset.a11yInitialized === 'true') return;
    sidebar.dataset.a11yInitialized = 'true';

    // ── Curated font library (loaded from Google Fonts + CDN) ─────────────
    const FONT_LIBRARY = [
      { family: 'Inter',                label: 'Inter',              tag: 'UI Default',     recommended: true,  css: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      { family: 'Space Grotesk',        label: 'Space\nGrotesk',     tag: 'Tech',           recommended: true,  css: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' },
      { family: 'OpenDyslexic',         label: 'OpenDyslexic',       tag: 'Dyslexia',       recommended: true,  css: null /* CDN pre-loaded */ },
      { family: 'Atkinson Hyperlegible', label: 'Atkinson\nHyperlegible', tag: 'Low Vision', recommended: true,  css: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap' },
      { family: 'Lexend',               label: 'Lexend',             tag: 'Reading',        recommended: true,  css: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap' },
      { family: 'Comic Neue',           label: 'Comic Neue',         tag: 'Casual',         recommended: false, css: 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap' },
      { family: 'Nunito',               label: 'Nunito',             tag: 'Rounded',        recommended: false, css: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap' },
      { family: 'Georgia',              label: 'Georgia',            tag: 'Serif',          recommended: false, css: null /* system font */ },
    ];

    // Track current font selection
    let currentFont = localStorage.getItem('eae_a11y_font') || 'Inter';

    // Utility: inject a Google Font link tag (idempotent)
    function ensureFontLoaded(cssUrl) {
      if (!cssUrl) return;
      const existing = document.querySelector(`link[href="${cssUrl}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
      }
    }

    // Apply font to entire site via CSS variable
    function applyFont(family, persistKey) {
      const fontStack = `'${family}', sans-serif`;
      document.documentElement.style.setProperty('--a11y-font-override', fontStack);
      // Backward compat: keep dyslexic-mode class for OpenDyslexic
      document.body.classList.toggle('dyslexic-mode', family === 'OpenDyslexic');
      if (persistKey !== false) {
        localStorage.setItem('eae_a11y_font', family);
      }
      currentFont = family;
      // Update grid active state
      document.querySelectorAll('.a11y-font-card').forEach(card => {
        const isActive = card.dataset.fontFamily === family;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    // ── Build font grid ──────────────────────────────────────────────────
    const grid = $('#fontPickerGrid');
    if (grid) {
      FONT_LIBRARY.forEach(font => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'a11y-font-card';
        card.dataset.fontFamily = font.family;
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-checked', font.family === currentFont ? 'true' : 'false');
        card.setAttribute('aria-label', `${font.label.replace('\n', ' ')} font${font.recommended ? ' (recommended)' : ''}`);
        if (font.family === currentFont) card.classList.add('is-active');
        // Render the name in its own typeface if the font family can be set inline
        const nameEl = document.createElement('span');
        nameEl.className = 'a11y-font-card-name';
        nameEl.textContent = font.label;
        nameEl.style.fontFamily = `'${font.family}', Inter, 'OpenDyslexic', sans-serif`;
        const tagEl = document.createElement('span');
        tagEl.className = 'a11y-font-card-tag';
        tagEl.textContent = font.tag;
        card.appendChild(nameEl);
        card.appendChild(tagEl);
        if (font.recommended) {
          const badge = document.createElement('span');
          badge.className = 'a11y-font-card-badge';
          badge.textContent = 'Rec';
          badge.setAttribute('aria-hidden', 'true');
          card.appendChild(badge);
        }
        card.addEventListener('click', () => {
          ensureFontLoaded(font.css);
          applyFont(font.family);
        });
        grid.appendChild(card);
      });
    }

    // ── Google Font search ───────────────────────────────────────────────
    const fontSearchInput  = $('#fontSearchInput');
    const fontSearchBtn    = $('#fontSearchBtn');
    const fontSearchStatus = $('#fontSearchStatus');

    function applySearchedFont() {
      const raw = fontSearchInput ? fontSearchInput.value.trim() : '';
      if (!raw) return;
      // Normalise: "Roboto Mono" → "Roboto+Mono"
      const encoded = encodeURIComponent(raw).replace(/%20/g, '+');
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`;
      ensureFontLoaded(cssUrl);
      // Give the browser a tick to parse the new stylesheet
      setTimeout(() => {
        applyFont(raw);
        if (fontSearchStatus) {
          fontSearchStatus.textContent = `✓ "${raw}" applied. If the font name was invalid it will fall back to the default.`;
        }
        if (fontSearchInput) fontSearchInput.value = '';
      }, 400);
    }

    if (fontSearchBtn) fontSearchBtn.addEventListener('click', applySearchedFont);
    if (fontSearchInput) {
      fontSearchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); applySearchedFont(); }
      });
    }

    // Restore persisted font on load
    if (currentFont) {
      const found = FONT_LIBRARY.find(f => f.family === currentFont);
      if (found) {
        ensureFontLoaded(found.css);
        applyFont(currentFont, false);
      } else {
        // Custom searched font
        const encoded = encodeURIComponent(currentFont).replace(/%20/g, '+');
        ensureFontLoaded(`https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`);
        applyFont(currentFont, false);
      }
    }

    // ── Text size slider ─────────────────────────────────────────────────
    const textSizeRange   = $('#textSizeRange');
    const textSizeDisplay = $('#textSizeDisplay');
    const savedTextSize   = parseFloat(localStorage.getItem('eae_a11y_textsize') || '100');
    if (textSizeRange) {
      textSizeRange.value = savedTextSize;
      document.documentElement.style.fontSize = `${savedTextSize}%`;
      if (textSizeDisplay) textSizeDisplay.textContent = `${savedTextSize}%`;
      textSizeRange.addEventListener('input', () => {
        const v = parseFloat(textSizeRange.value);
        document.documentElement.style.fontSize = `${v}%`;
        if (textSizeDisplay) textSizeDisplay.textContent = `${v}%`;
        localStorage.setItem('eae_a11y_textsize', v);
        updateSliderTrack(textSizeRange);
      });
      updateSliderTrack(textSizeRange);
    }

    // ── Line spacing slider ──────────────────────────────────────────────
    const lineSpacingRange   = $('#lineSpacingRange');
    const lineSpacingDisplay = $('#lineSpacingDisplay');
    const savedLineSpacing   = parseFloat(localStorage.getItem('eae_a11y_linespacing') || '1.6');
    if (lineSpacingRange) {
      lineSpacingRange.value = savedLineSpacing;
      document.body.style.lineHeight = savedLineSpacing;
      if (lineSpacingDisplay) lineSpacingDisplay.textContent = `${savedLineSpacing.toFixed(1)}×`;
      lineSpacingRange.addEventListener('input', () => {
        const v = parseFloat(lineSpacingRange.value);
        document.body.style.lineHeight = v;
        if (lineSpacingDisplay) lineSpacingDisplay.textContent = `${v.toFixed(1)}×`;
        localStorage.setItem('eae_a11y_linespacing', v);
        updateSliderTrack(lineSpacingRange);
      });
      updateSliderTrack(lineSpacingRange);
    }

    // ── Letter spacing slider ────────────────────────────────────────────
    const letterSpacingRange   = $('#letterSpacingRange');
    const letterSpacingDisplay = $('#letterSpacingDisplay');
    const savedLetterSpacing   = parseFloat(localStorage.getItem('eae_a11y_letterspacing') || '0');
    if (letterSpacingRange) {
      letterSpacingRange.value = savedLetterSpacing;
      document.body.style.letterSpacing = `${savedLetterSpacing}em`;
      if (letterSpacingDisplay) letterSpacingDisplay.textContent = `${savedLetterSpacing}em`;
      letterSpacingRange.addEventListener('input', () => {
        const v = parseFloat(letterSpacingRange.value);
        document.body.style.letterSpacing = `${v}em`;
        if (letterSpacingDisplay) letterSpacingDisplay.textContent = `${parseFloat(v.toFixed(2))}em`;
        localStorage.setItem('eae_a11y_letterspacing', v);
        updateSliderTrack(letterSpacingRange);
      });
      updateSliderTrack(letterSpacingRange);
    }

    // Utility: update range track fill colour
    function updateSliderTrack(input) {
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const val = parseFloat(input.value);
      const pct = ((val - min) / (max - min)) * 100;
      input.style.background =
        `linear-gradient(to right, var(--theme-accent-cyan) ${pct}%, var(--theme-border) ${pct}%)`;
    }

    // ── High contrast ────────────────────────────────────────────────────
    const highContrastToggle = $('#highContrastToggle');
    if (highContrastToggle) {
      const saved = localStorage.getItem('eae_a11y_highcontrast') === 'true';
      highContrastToggle.checked = saved;
      if (saved) document.body.classList.add('high-contrast-mode');
      highContrastToggle.addEventListener('change', e => {
        document.body.classList.toggle('high-contrast-mode', e.target.checked);
        localStorage.setItem('eae_a11y_highcontrast', e.target.checked);
      });
    }

    // ── Saturation boost ─────────────────────────────────────────────────
    const saturationToggle = $('#saturationToggle');
    if (saturationToggle) {
      const saved = localStorage.getItem('eae_a11y_saturation') === 'true';
      saturationToggle.checked = saved;
      if (saved) document.body.classList.add('saturation-boost-mode');
      saturationToggle.addEventListener('change', e => {
        document.body.classList.toggle('saturation-boost-mode', e.target.checked);
        localStorage.setItem('eae_a11y_saturation', e.target.checked);
      });
    }

    // ── Colour blind filters ─────────────────────────────────────────────
    const cbRadios = document.querySelectorAll('[name="colorblindFilter"]');
    const savedCb  = localStorage.getItem('eae_a11y_colorblind') || 'none';
    cbRadios.forEach(radio => {
      if (radio.value === savedCb) radio.checked = true;
      radio.addEventListener('change', () => {
        const v = radio.value;
        if (v === 'none') {
          document.body.removeAttribute('data-colorblind');
        } else {
          document.body.setAttribute('data-colorblind', v);
        }
        localStorage.setItem('eae_a11y_colorblind', v);
      });
    });
    if (savedCb && savedCb !== 'none') {
      document.body.setAttribute('data-colorblind', savedCb);
    }

    // ── Reduce motion ────────────────────────────────────────────────────
    const reduceMotionToggle = $('#reduceMotionToggle');
    if (reduceMotionToggle) {
      // Also respect OS preference
      const osReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saved = localStorage.getItem('eae_a11y_reducemotion') === 'true' || osReduceMotion;
      reduceMotionToggle.checked = saved;
      if (saved) document.body.classList.add('reduce-motion-mode');
      reduceMotionToggle.addEventListener('change', e => {
        document.body.classList.toggle('reduce-motion-mode', e.target.checked);
        localStorage.setItem('eae_a11y_reducemotion', e.target.checked);
      });
    }

    // ── Focus highlight ──────────────────────────────────────────────────
    const focusHighlightToggle = $('#focusHighlightToggle');
    if (focusHighlightToggle) {
      const saved = localStorage.getItem('eae_a11y_focushighlight') === 'true';
      focusHighlightToggle.checked = saved;
      if (saved) document.body.classList.add('focus-highlight-mode');
      focusHighlightToggle.addEventListener('change', e => {
        document.body.classList.toggle('focus-highlight-mode', e.target.checked);
        localStorage.setItem('eae_a11y_focushighlight', e.target.checked);
      });
    }

    // ── Reading guide ────────────────────────────────────────────────────
    const readingGuideToggle = $('#readingGuideToggle');
    const readingGuideEl     = $('#readingGuide');
    if (readingGuideToggle && readingGuideEl) {
      const saved = localStorage.getItem('eae_a11y_readingguide') === 'true';
      readingGuideToggle.checked = saved;
      if (saved) document.body.classList.add('reading-guide-mode');
      readingGuideToggle.addEventListener('change', e => {
        document.body.classList.toggle('reading-guide-mode', e.target.checked);
        localStorage.setItem('eae_a11y_readingguide', e.target.checked);
      });
      document.addEventListener('mousemove', e => {
        if (document.body.classList.contains('reading-guide-mode')) {
          readingGuideEl.style.top = `${e.clientY - 18}px`;
        }
      });
    }

    // ── Cursor size ──────────────────────────────────────────────────────
    const cursorRadios = document.querySelectorAll('[name="cursorSize"]');
    const savedCursor  = localStorage.getItem('eae_a11y_cursor') || 'normal';
    cursorRadios.forEach(radio => {
      if (radio.value === savedCursor) radio.checked = true;
      radio.addEventListener('change', () => {
        const v = radio.value;
        if (v === 'normal') {
          document.body.removeAttribute('data-cursor');
        } else {
          document.body.setAttribute('data-cursor', v);
        }
        localStorage.setItem('eae_a11y_cursor', v);
      });
    });
    if (savedCursor !== 'normal') {
      document.body.setAttribute('data-cursor', savedCursor);
    }

    // ── Reset all ────────────────────────────────────────────────────────
    const resetBtn = $('#a11yResetAll');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Reset font
        applyFont('Inter');
        document.documentElement.style.removeProperty('--a11y-font-override');
        document.body.classList.remove('dyslexic-mode');

        // Reset text size
        document.documentElement.style.fontSize = '100%';
        if (textSizeRange) { textSizeRange.value = 100; updateSliderTrack(textSizeRange); }
        if (textSizeDisplay) textSizeDisplay.textContent = '100%';

        // Reset line spacing
        document.body.style.lineHeight = '1.6';
        if (lineSpacingRange) { lineSpacingRange.value = 1.6; updateSliderTrack(lineSpacingRange); }
        if (lineSpacingDisplay) lineSpacingDisplay.textContent = '1.6×';

        // Reset letter spacing
        document.body.style.letterSpacing = '0';
        if (letterSpacingRange) { letterSpacingRange.value = 0; updateSliderTrack(letterSpacingRange); }
        if (letterSpacingDisplay) letterSpacingDisplay.textContent = '0em';

        // Reset toggles
        document.body.classList.remove('high-contrast-mode', 'saturation-boost-mode',
          'reduce-motion-mode', 'focus-highlight-mode', 'reading-guide-mode');
        if (highContrastToggle) highContrastToggle.checked = false;
        if (saturationToggle) saturationToggle.checked = false;
        if (reduceMotionToggle) reduceMotionToggle.checked = false;
        if (focusHighlightToggle) focusHighlightToggle.checked = false;
        if (readingGuideToggle) readingGuideToggle.checked = false;

        // Reset colour blind
        document.body.removeAttribute('data-colorblind');
        cbRadios.forEach(r => { r.checked = r.value === 'none'; });

        // Reset cursor
        document.body.removeAttribute('data-cursor');
        cursorRadios.forEach(r => { r.checked = r.value === 'normal'; });

        // Clear localStorage
        const keys = [
          'eae_a11y_font','eae_a11y_dyslexic','eae_a11y_textsize',
          'eae_a11y_linespacing','eae_a11y_letterspacing','eae_a11y_highcontrast',
          'eae_a11y_saturation','eae_a11y_colorblind','eae_a11y_reducemotion',
          'eae_a11y_focushighlight','eae_a11y_readingguide','eae_a11y_cursor'
        ];
        keys.forEach(k => localStorage.removeItem(k));

        // Reapply Inter as default
        const defaultStack = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        document.documentElement.style.setProperty('--a11y-font-override', defaultStack);
      });
    }

    // ── Foldable Accordion Vertical Tabs ───────────────────────────────────
    const sectionHeaders = sidebar.querySelectorAll('.a11y-section-header');
    sectionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        const section = header.closest('.a11y-section');
        if (section) {
          section.classList.toggle('is-collapsed', isExpanded);
        }
      });
    });

    // ── Sidebar open / close with same-position controls ──────────────────
    const toggleSidebar = (open) => {
      sidebar.classList.toggle('is-open', open);
      sidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      fab.classList.toggle('is-replaced', open);
      fab.setAttribute('aria-hidden', open ? 'true' : 'false');
      fab.tabIndex = open ? -1 : 0;

      if (closeBtn) {
        closeBtn.classList.toggle('is-visible', open);
        closeBtn.setAttribute('aria-hidden', open ? 'false' : 'true');
        closeBtn.tabIndex = open ? 0 : -1;
      }

      if (open) {
        const firstFocusable = closeBtn || sidebar.querySelector('.a11y-section-header, button, input, [role="radio"]');
        if (firstFocusable) firstFocusable.focus();
      } else {
        fab.focus();
      }
    };

    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sidebar.classList.contains('is-open');
      toggleSidebar(!isOpen);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar(false);
        fab.focus();
      });
    }

    // Close on Escape key, including when the fixed close button is focused.
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        toggleSidebar(false);
      }
    });

    // Close when clicking outside the sidebar
    document.addEventListener('click', e => {
      if (!sidebar.classList.contains('is-open')) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (!path.includes(sidebar) && !path.includes(fab) && !path.includes(closeBtn)) {
        toggleSidebar(false);
      }
    }, { capture: false });

    // ── Backward-compat: honour legacy dyslexic preference if set ────────
    const legacyDyslexic = localStorage.getItem('eae_a11y_dyslexic');
    if (legacyDyslexic === 'true' && !localStorage.getItem('eae_a11y_font')) {
      applyFont('OpenDyslexic');
    }
  }

  function setupSectionTabs() {
    const tabPills = document.querySelectorAll('.section-tab-pill');
    const sections = document.querySelectorAll('main section[id]');
    if (!tabPills.length || !sections.length) return;

    tabPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const targetId = pill.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetSection = document.querySelector(targetId);
          if (targetSection) {
            e.preventDefault();
            targetSection.scrollIntoView({ behavior: 'smooth' });
            tabPills.forEach(p => {
              p.classList.remove('is-active');
              p.setAttribute('aria-selected', 'false');
            });
            pill.classList.add('is-active');
            pill.setAttribute('aria-selected', 'true');
            pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      });
    });

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          tabPills.forEach(pill => {
            const isMatch = pill.getAttribute('href') === `#${id}`;
            pill.classList.toggle('is-active', isMatch);
            pill.setAttribute('aria-selected', isMatch ? 'true' : 'false');
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
