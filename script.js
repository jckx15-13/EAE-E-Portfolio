(function () {
  const data = window.PORTFOLIO_DATA || {};
  const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const STORAGE_KEYS = {
    uploads: 'eaePortfolioUploads',
    viewMode: 'eaePortfolioViewModeV2',
    versions: 'eaePortfolioVersions',
    publishedSnapshot: 'eaePublishedSnapshot',
  };
  const SELECTORS = {
    achievementModal: '#achievementModal',
    modalContent: '#modalContent',
    main: '#main',
    siteChrome: '.site-chrome',
    siteHeader: '.site-header',
    navToggle: '.nav-toggle',
    siteNav: '#siteNav',
    scrollProgressBar: '#scrollProgressBar',
    scrollProgress: '.scroll-progress',
    printPortfolio: '#printPortfolio',
    versionsList: '.versions-list',
  };
  const LABELS = {
    featuredProject: 'Featured Project',
    readCaseStudyDetails: 'Read case study details',
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
  let modalLastActiveElement = null;
  let navigationSetupDone = false;
  let scrollProgressSetupDone = false;
  let printModeSetupDone = false;
  let chromeHeightSetupDone = false;
  let chromeHeightObserver = null;

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

  function parseTimelineDate(value) {
    if (!value) return 0;
    const normalized = String(value)
      .replace(/–/g, '-')
      .replace(/\s*\-\s*/g, '-')
      .replace(/\s+to\s+/gi, '-')
      .trim();
    const yearMatch = normalized.match(/(19|20)\d{2}/g);
    if (yearMatch && yearMatch.length) {
      return Number(yearMatch[0]);
    }
    const parsed = Date.parse(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  /* Assign left/right classes to timeline items to create alternating layout */
  function assignTimelineSides() {
    const timeline = document.getElementById('achievementTimeline');
    if (!timeline) return;
    const items = Array.from(timeline.querySelectorAll('.timeline-item'));
    items.forEach((it, i) => {
      it.classList.remove('left','right');
      // alternate sides, center important ones (featured) on full-width small screens handled via CSS
      if (i % 2 === 0) it.classList.add('left'); else it.classList.add('right');
    });
  }

  // Editor runtime state for selection, last added section, and undo
  window._eaeEditorState = window._eaeEditorState || {
    selectedSectionId: null,
    lastAddedSectionId: null,
    undoStack: []
  };

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
    ["Best Projects", "best-projects"],
    ["Journey", "timeline"],
    ["Reflection", "reflections"],
    ["Gallery", "projects"],
    ["Library", "achievements"],
    ["Course Fit", "applications"],
    ["Goals", "goals"],
  ];
  const primaryNavIds = new Set([
    "about",
    "philosophy",
    "why-cybersecurity",
    "best-projects",
    "timeline",
    "reflections",
    "gallery",
    "library",
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
    if (!container || !data.eaeSnapshot || !Array.isArray(data.eaeSnapshot.cards)) return;
    container.replaceChildren();
    const grid = create("div", "eae-snapshot-grid");
    (data.eaeSnapshot.cards || []).forEach((item, index) => {
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

  function appendList(container, items, className = "") {
    container.replaceChildren();
    (items || []).forEach((item) => {
      const pill = create("span", className, item);
      container.appendChild(pill);
    });
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
    nav.replaceChildren();
    const secondaryLinks = [];
    const visibilityConfig = data.sectionVisibility || {};

    navItems.forEach(([label, id]) => {
      if (visibilityConfig[id]) return;

      if (primaryNavIds.has(id)) {
        const link = create("a", "", label, `uiLabels.nav${label}`);
        link.href = `#${id}`;
        link.dataset.section = id;
        nav.appendChild(link);
      } else {
        secondaryLinks.push([label, id]);
      }

    });

    if (secondaryLinks.length) {
      const more = create("details", "nav-more");
      more.append(create("summary", "nav-more-summary", data.uiLabels?.navMore || "More", "uiLabels.navMore"));
      const panel = create("div", "nav-more-panel");
      secondaryLinks.forEach(([label, id]) => {
        const link = create("a", "", label, `uiLabels.nav${label}`);
        link.href = `#${id}`;
        link.dataset.section = id;
        panel.append(link);
      });
      more.append(panel);
      nav.append(more);
    }
  }

  function renderHero() {
    document.title = data.meta?.title || "Student EAE Portfolio";
    setText("#brandName", data.profile?.shortName || "EAE Portfolio", "profile.shortName");
    setText("#heroName", data.profile?.name || "", "profile.name");
    setText("#heroTitle", data.profile?.headline || "", "profile.headline");
    setText("#heroIdentityLine", data.profile?.identityLine || "", "profile.identityLine");
    setText("#heroSubtitle", data.profile?.subheadline || "", "profile.subheadline");
    setText("#heroIntro", data.profile?.intro || "", "profile.intro");
    setText("#heroSignature", data.profile?.personalSignature || "", "profile.personalSignature");
    setText("#heroRememberMe", data.profile?.rememberMe || "", "profile.rememberMe");
    setText("#heroPhotoCaption", data.profile?.photoCaption || "", "profile.photoCaption");
    setText("#brandStatement", data.profile?.brandStatement || "", "profile.brandStatement");
    setText("#profileName", data.profile?.name || "", "profile.name");
    setText("#profileIntro", data.profile?.intro || "", "profile.intro");
    setText(".skip-link", data.uiLabels?.skipLink || "Skip to content", "uiLabels.skipLink");
    setText("#view-cards", data.uiLabels?.viewCards || "Cards", "uiLabels.viewCards");
    setText("#view-timeline", data.uiLabels?.viewTimeline || "Timeline", "uiLabels.viewTimeline");
    setText("#view-story", data.uiLabels?.viewStory || "Story", "uiLabels.viewStory");
    setText("#heroBtnPrimary", data.uiLabels?.heroBtnPrimary || "View strongest projects", "uiLabels.heroBtnPrimary");
    setText("#heroBtnSecondary", data.uiLabels?.heroBtnSecondary || "View evidence timeline", "uiLabels.heroBtnSecondary");
    setText("#heroBtnApplications", data.uiLabels?.heroBtnApplications || "View EAE direction", "uiLabels.heroBtnApplications");
    
    const heroBtnPrimary = $("#heroBtnPrimary");
    if (heroBtnPrimary) heroBtnPrimary.href = "#best-projects";
    const heroBtnSecondary = $("#heroBtnSecondary");
    if (heroBtnSecondary) heroBtnSecondary.href = "#timeline";
    const heroBtnApplications = $("#heroBtnApplications");
    if (heroBtnApplications) heroBtnApplications.href = "#applications";

    setText("#personalQualitiesTitle", data.uiLabels?.personalQualitiesTitle || "Personal qualities", "uiLabels.personalQualitiesTitle");
    setText("#journeyMilestonesLabel", data.uiLabels?.journeyMilestonesLabel || "Journey Milestones", "uiLabels.journeyMilestonesLabel");
    setText("#evidenceOverviewLabel", data.uiLabels?.evidenceOverviewLabel || "Evidence Overview", "uiLabels.evidenceOverviewLabel");
    setText("#achievementFlowLabel", data.uiLabels?.achievementFlowLabel || "Achievement Flow", "uiLabels.achievementFlowLabel");
    setText("#achievementFlowTitle", data.uiLabels?.achievementFlowTitle || "How Each Achievement Builds Into the Next", "uiLabels.achievementFlowTitle");
    setText("#workLabel", data.uiLabels?.workLabel || "Work", "uiLabels.workLabel");
    setText("#projectsTitle", data.uiLabels?.projectsTitle || "Featured Projects", "uiLabels.projectsTitle");
    setText("#projectsLede", data.uiLabels?.projectsLede || "Case studies are written to show the problem, approach, role, technologies, development journey, outcome, and learning.", "uiLabels.projectsLede");
    setText("#evidenceLibraryLabel", data.uiLabels?.evidenceLibraryLabel || "Evidence Library", "uiLabels.evidenceLibraryLabel");
    setText("#achievementStoryTitle", data.uiLabels?.achievementStoryTitle || "Achievement Story", "uiLabels.achievementStoryTitle");
    setText("#achievementStoryLede", data.uiLabels?.achievementStoryLede || "These cards support the flow above. Open each one for the fuller description, reflection, learning outcome, images, and certificates.", "uiLabels.achievementStoryLede");
    setText("#timelineTitle", data.uiLabels?.timelineTitle || "Timeline", "uiLabels.timelineTitle");
    setText("#directionLabel", data.uiLabels?.directionLabel || "Direction", "uiLabels.directionLabel");
    setText("#goalsTitle", data.uiLabels?.goalsTitle || "Future Goals", "uiLabels.goalsTitle");
    setText("#goalsShortTerm", data.uiLabels?.goalsShortTerm || "Short-term", "uiLabels.goalsShortTerm");
    setText("#goalsLongTerm", data.uiLabels?.goalsLongTerm || "Long-term", "uiLabels.goalsLongTerm");
    setText("#applicationsLabel", data.uiLabels?.applicationsLabel || "Applications", "uiLabels.applicationsLabel");
    setText("#applicationsTitle", data.uiLabels?.applicationsTitle || "Target EAE Applications", "uiLabels.applicationsTitle");
    setText("#applicationsLede", data.uiLabels?.applicationsLede || "Institution-specific notes stay editable so the portfolio can support both Singapore Polytechnic and Ngee Ann Polytechnic without making unconfirmed course claims.", "uiLabels.applicationsLede");
    setText("#footerText", data.uiLabels?.footerText || "Jaron Chew's EAE portfolio: projects, evidence, reflection, and direction.", "uiLabels.footerText");
    setText("#printPortfolio", data.uiLabels?.footerPrintBtn || "Print portfolio", "uiLabels.footerPrintBtn");



    const heroProfileImage = $("#heroProfileImage");
    if (heroProfileImage && data.profile?.profileImage) {
      heroProfileImage.src = data.profile.profileImage;
      heroProfileImage.alt = data.profile?.profileImageAlt || `Photo related to ${data.profile?.name || "Jaron Chew"}`;
      heroProfileImage.fetchPriority = "high";
    }

    const heroImage = $("#heroImage");
    if (heroImage && data.profile?.heroImage) {
      heroImage.src = data.profile.heroImage;
      heroImage.alt = "Abstract technology visual for the portfolio";
    }

    const profileImage = $("#profileImage");
    if (profileImage && data.profile?.profileImage) {
      profileImage.src = data.profile.profileImage;
      profileImage.alt = data.profile?.profileImageAlt || `Photo related to ${data.profile?.name || "Jaron Chew"}`;
      profileImage.loading = "lazy";
    }

    appendList($("#focusAreas"), data.profile?.focusAreas, "focus-item");

    buildCards($("#journeyMarkers"), data.profile?.journeyMarkers, "profile.journeyMarkers", {
      cardClass: "journey-marker",
      elements: [
        { tag: "strong", key: "value", hasEditPath: true },
        { tag: "span", key: "label", hasEditPath: true }
      ]
    });
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

    // Render personal map cards
    const mapGrid = $("#personalMapCards");
    if (mapGrid) {
      mapGrid.replaceChildren();
      (data.personalMap?.cards || []).forEach((item, index) => {
        const card = create("article", "personal-map-card reveal");
        const top = create("div", "personal-map-card-top");
        top.append(create("span", "personal-map-index", String(index + 1).padStart(2, "0")));
        top.append(create("p", "card-kicker", item.label, `personalMap.cards.${index}.label`));
        card.append(top);
        card.append(create("h3", "", item.title, `personalMap.cards.${index}.title`));
        card.append(create("p", "", item.body, `personalMap.cards.${index}.body`));
        if (item.evidence) {
          card.append(create("p", "personal-map-evidence", item.evidence));
        }
        mapGrid.append(card);
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



  function renderLifeEntry() {
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


  function renderEvidenceOverview() {
    setText("#evidenceOverviewTitle", data.uiLabels?.evidenceOverviewTitle || "My Evidence at a Glance", "uiLabels.evidenceOverviewTitle");
    setText("#evidenceOverviewIntro", data.uiLabels?.evidenceOverviewIntro || "A consolidated view of my personal map (structured goals) and evidence deck (proof of capabilities). Use the tabs below to switch between them.", "uiLabels.evidenceOverviewIntro");

    const mapGrid = $("#personalMapCards");
    const deckGrid = $("#evidenceDeckCards");

    if (mapGrid) {
      mapGrid.replaceChildren();
      (data.personalMap?.cards || []).forEach((item, index) => {
        const card = create("article", "personal-map-card reveal");
        const top = create("div", "personal-map-card-top");
        top.append(create("span", "personal-map-index", String(index + 1).padStart(2, "0")));
        top.append(create("p", "card-kicker", item.label, `personalMap.cards.${index}.label`));
        card.append(top);
        card.append(create("h3", "", item.title, `personalMap.cards.${index}.title`));
        card.append(create("p", "", item.body, `personalMap.cards.${index}.body`));
        card.append(create("p", "personal-map-evidence", item.evidence));
        mapGrid.append(card);
      });
    }

    if (deckGrid) {
      deckGrid.replaceChildren();
      (data.evidenceDeck?.cards || []).forEach((item, index) => {
        const card = create("article", "evidence-card reveal");
        const top = create("div", "evidence-card-top");
        top.append(create("p", "card-kicker", item.label, `evidenceDeck.cards.${index}.label`));
        card.append(top);
        card.append(create("h3", "", item.title, `evidenceDeck.cards.${index}.title`));
        card.append(create("p", "evidence-summary", item.summary));

        const list = create("ul", "evidence-proof-list");
        (item.proofPoints || []).forEach((point) => {
          list.append(create("li", "", point));
        });
        card.append(list);

        const next = create("p", "evidence-next", item.nextStep);
        card.append(next);

        if (item.linkTarget && item.linkLabel) {
          const link = create("a", "evidence-link", item.linkLabel);
          link.href = item.linkTarget;
          card.append(link);
        }

        deckGrid.append(card);
      });
    }

    // Tabs setup
    const tabs = document.querySelectorAll(".evidence-tab");
    tabs.forEach(tab => {
      // Remove old listeners to avoid duplicates
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);

      newTab.addEventListener("click", () => {
        document.querySelectorAll(".evidence-tab").forEach(t => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        newTab.classList.add("is-active");
        newTab.setAttribute("aria-selected", "true");

        const targetTab = newTab.dataset.tab;
        if (targetTab === "map") {
          if (mapGrid) mapGrid.hidden = false;
          if (deckGrid) deckGrid.hidden = true;
        } else {
          if (mapGrid) mapGrid.hidden = true;
          if (deckGrid) deckGrid.hidden = false;
        }
      });
    });
  }

  function hasPlaceholderText(value) {
    if (typeof value !== "string") return false;
    const text = value.toLowerCase();
    return value.includes("[") || text.includes("to be confirmed") || text.includes("confirm exact");
  }

  function renderAchievementFlow() {
    setText("#achievementFlowIntro", data.achievementFlow?.intro || "", "achievementFlow.intro");
    const flow = $("#achievementFlow");
    flow.replaceChildren();
    const achievementsByTitle = new Map(
      (data.achievements || []).map((achievement) => [achievement.title, achievement])
    );

    (data.achievementFlow?.steps || []).forEach((step, index) => {
      const item = create("article", "flow-step reveal");
      const marker = create("div", "flow-step-marker");
      marker.append(create("span", "", String(index + 1).padStart(2, "0")));

      const body = create("div", "flow-step-body");
      const top = create("div", "flow-step-top");
      top.append(create("p", "card-kicker", step.stage));
      top.append(create("p", "date-line", step.period));
      body.append(top);
      body.append(create("h3", "", step.title));

      const proof = create("div", "flow-copy-block");
      proof.append(create("h4", "", "What it shows"));
      proof.append(create("p", "", step.whatItShows));
      body.append(proof);

      const meaning = create("div", "flow-copy-block flow-meaning");
      meaning.append(create("h4", "", "What it means to me"));
      meaning.append(create("p", "", step.personalMeaning));
      body.append(meaning);

      const linkedAchievement = achievementsByTitle.get(step.linkedAchievement);
      if (linkedAchievement) {
        const button = create("button", "text-button", "Open evidence");
        button.type = "button";
        button.addEventListener("click", () => openAchievementModal(linkedAchievement));
        body.append(button);
      }

      item.append(marker, body);
      flow.append(item);
    });
  }

  function renderReflections() {
    const grid = document.getElementById('reflectionList');
    if (!grid) return;
    grid.replaceChildren();
    (data.reflections || []).forEach((reflection) => {
      const card = create('article', 'reflection-card reveal');
      card.append(create('h3', '', reflection.title));
      card.append(create('p', '', reflection.body));
      grid.append(card);
    });
  }

  let viewModeInitialized = false;
  let currentViewMode = "story";

  function setupViewModeToggleOnce() {
    if (viewModeInitialized) return;
    viewModeInitialized = true;

    const pills = document.querySelectorAll('.view-mode-pill');
    currentViewMode = localStorage.getItem(STORAGE_KEYS.viewMode) || 'cards';

    pills.forEach(pill => {
      const active = pill.dataset.mode === currentViewMode;
      pill.classList.toggle('is-active', active);
      pill.setAttribute('aria-selected', String(active));

      pill.addEventListener('click', () => {
        const mode = pill.dataset.mode;
        if (mode === currentViewMode) return;
        currentViewMode = mode;
        localStorage.setItem(STORAGE_KEYS.viewMode, mode);

        pills.forEach(p => {
          const act = p.dataset.mode === mode;
          p.classList.toggle('is-active', act);
          p.setAttribute('aria-selected', String(act));
        });

        document.body.dataset.viewMode = mode;
        document.body.classList.remove('story-mode', 'timeline-mode', 'cards-mode');
        document.body.classList.add(`${mode}-mode`);

        const mainEl = document.getElementById('main'); if (mainEl) mainEl.setAttribute('aria-labelledby', 'view-' + mode);

        // Re-render view-mode-aware sections
        renderProjects();
        renderAchievements();
      });
    });

    document.body.dataset.viewMode = currentViewMode;
    document.body.classList.remove('story-mode', 'timeline-mode', 'cards-mode');
    document.body.classList.add(`${currentViewMode}-mode`);
    const mainEl = document.getElementById('main'); if (mainEl) mainEl.setAttribute('aria-labelledby', 'view-' + currentViewMode);
  }

  let viewModeBarObserver = null;
  let viewModeBarSections = [];
  function updateViewModeBarVisibility(isVisible) {
    const bar = document.querySelector('.view-mode-bar');
    if (!bar) return;
    bar.classList.toggle('is-active', Boolean(isVisible));
    bar.setAttribute('aria-hidden', String(!isVisible));
    bar.querySelectorAll('.view-mode-pill').forEach((pill) => {
      if (isVisible) {
        pill.removeAttribute('tabindex');
      } else {
        pill.setAttribute('tabindex', '-1');
      }
    });
  }

  function setupViewModeBarVisibility() {
    if (viewModeBarObserver) return;
    const bar = document.querySelector('.view-mode-bar');
    if (!bar) return;
    const selectors = ['#projects', '#achievements', '#reflections'];
    viewModeBarSections = selectors.map((sel) => document.querySelector(sel)).filter(Boolean);
    if (!viewModeBarSections.length) {
      updateViewModeBarVisibility(false);
      return;
    }

    viewModeBarObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.dataset.viewModeSectionVisible = String(
            entry.isIntersecting && entry.intersectionRatio > 0.1
          );
        });
        const anyVisible = viewModeBarSections.some(
          (section) => section.dataset.viewModeSectionVisible === 'true'
        );
        updateViewModeBarVisibility(anyVisible);
      },
      {
        root: null,
        rootMargin: '-84px 0px -20px 0px',
        threshold: [0.1],
      }
    );
    viewModeBarSections.forEach((section) => viewModeBarObserver.observe(section));
    updateViewModeBarVisibility(
      viewModeBarSections.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      })
    );
  }

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
    if (project.slidesEmbedUrl) {
      const embed = project.slidesEmbedUrl.trim();
      if (embed.includes("canva.com/design/") && !embed.includes("embed")) {
        return `${embed}${embed.includes("?") ? "&" : "?"}embed`;
      }
      return embed;
    }
    if (typeof project.slides === "string") {
      const slides = project.slides.trim();
      if (slides.includes("canva.com/design/")) {
        return slides.includes("embed") ? slides : `${slides}${slides.includes("?") ? "&" : "?"}embed`;
      }
    }
    return "";
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

  function openFullImageModal(src, alt) {
    const dialog = $("#achievementModal");
    const content = $("#modalContent");
    if (!dialog || !content) return;

    content.replaceChildren();
    const header = create("div", "modal-header");
    header.append(create("h2", "", alt || "Image preview"));
    const media = create("div", "modal-media-grid");
    media.append(createMediaBlock(src, alt || "Image preview", "Image unavailable"));
    content.append(header, media);

    openModalDialog(dialog);
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
          thumbnail.alt = "";
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

  function renderProjects() {
    const filters = $('#projectFilters');
    const grid = $('#projectsGrid');
    if (!grid) return;
    const projects = Array.isArray(data.projects)
      ? data.projects.filter((project) => project && typeof project === 'object')
      : [];
    const categories = ['All', ...new Set(projects.map((project) => project.category || 'Uncategorized'))];
    let activeCategory = 'All';
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

      const modeOrder = PROJECT_MODE_ORDER[currentViewMode] || null;

      filteredProjects.sort((a, b) => {
        const highlightDiff = Number(Boolean(b.highlighted)) - Number(Boolean(a.highlighted));
        if (highlightDiff !== 0) return highlightDiff;

        if (!modeOrder) return 0;

        const idxA = modeOrder.indexOf(a.title);
        const idxB = modeOrder.indexOf(b.title);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });

      filteredProjects.forEach((project, index) => {
        const originalIndex = data.projects.indexOf(project);
        const article = create('article', 'project-card reveal');
        
        // Featured projects specifically go to the featured grid if they are highlighted
        const targetGrid = (project.highlighted && featuredGrid) ? featuredGrid : grid;
        if (!targetGrid) return;

        if (currentViewMode === 'timeline') {
          // Featured projects in "Best Projects" section should NOT have timeline markers
          if (targetGrid !== featuredGrid) {
            article.classList.add('timeline-card-node');
          }
        } else if (currentViewMode === 'story') {
          article.classList.add('story-card-node');

          if (index > 0) {
            const prevProject = filteredProjects[index - 1];
            if (project.carriedForward && project.carriedForward.fromProject === prevProject.title) {
              const connector = create('div', 'story-connector reveal');
              connector.innerHTML = `
                <div class="story-connector-line"></div>
                <div class="carried-forward-callout">
                  <span class="carried-forward-badge">What I carried forward</span>
                  <p class="carried-forward-text">${project.carriedForward.lesson}</p>
                </div>
                <div class="story-connector-line"></div>
              `;
              grid.appendChild(connector);
            } else {
              const spacer = create('div', 'story-track-spacer reveal');
              spacer.innerHTML = `<span class="track-label">Next Track: Engineering & Prototyping</span>`;
              grid.appendChild(spacer);
            }
          }
        }

        const slidesEmbedUrl = resolveSlidesEmbedUrl(project);
        const videoPath = typeof project.optionalVideo === 'string' ? project.optionalVideo.trim() : '';
        const hasEmbeddedVideo = /\.(webm|mp4|ogg)$/i.test(videoPath);
        const media = create('div', 'project-media');
        const mediaImages = projectMedia(project);
        let leadImage = mediaImages[0];

        if (project.highlighted) {
          article.classList.add('project-card--highlighted');
          const highlightBadge = create('span', 'project-highlight-badge', LABELS.featuredProject);
          article.append(highlightBadge);
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
            const slidesLink = document.createElement('a');
            slidesLink.className = 'project-slides-link';
            slidesLink.href = project.slides;
            slidesLink.target = '_blank';
            slidesLink.rel = 'noopener noreferrer';
            slidesLink.textContent = data.uiLabels?.projectSlidesBtn || 'Open slides in a new tab';
          slidesLink.dataset.editPath = 'uiLabels.projectSlidesBtn';
            media.append(slidesLink);
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
        article.append(media);

        const body = create('div', 'project-body');
        const meta = create('div', 'meta-row');

        const catSpan = create('span', '', project.category);
        catSpan.dataset.editPath = `projects.${originalIndex}.category`;
        meta.append(catSpan);

        const statusSpan = create('span', '', project.status);
        statusSpan.dataset.editPath = `projects.${originalIndex}.status`;
        meta.append(statusSpan);

        body.append(meta);

        const titleH3 = create('h3', '', project.title);
        titleH3.dataset.editPath = `projects.${originalIndex}.title`;
        body.append(titleH3);

        body.append(createProjectInsight(project));
        body.append(createProjectTechStrip(projectTechs(project)));

        const fields = [
          ['Problem', projectText(project, 'problem'), `projects.${originalIndex}.problem`],
          ['Solution', projectText(project, 'solution', 'proposedSolution'), `projects.${originalIndex}.proposedSolution`],
          ['Role', projectText(project, 'role', 'myRole'), `projects.${originalIndex}.myRole`],
          [
            'Technologies Used',
            projectTechs(project).length ? projectTechs(project).join(', ') : 'Add technologies here',
            `projects.${originalIndex}.technologiesUsed`
          ],
          ['Journey', projectText(project, 'journey', 'developmentJourney'), `projects.${originalIndex}.developmentJourney`],
          ['Outcome', project.outcome, `projects.${originalIndex}.outcome`],
          ['Lessons Learned', projectText(project, 'lessons', 'lessonsLearned'), `projects.${originalIndex}.lessonsLearned`],
          ['Images', leadImage ? 'Evidence added' : 'Add project image here', `projects.${originalIndex}.image`],
          ['Optional Video', hasEmbeddedVideo ? 'Playable demo embedded above' : project.optionalVideo, `projects.${originalIndex}.optionalVideo`],
        ];

        const details = create('details', 'project-details');
        const summary = create('summary', 'project-details-summary', LABELS.readCaseStudyDetails);
        details.append(summary);
        const detailBody = create('div', 'project-details-body');
        appendCaseRows(detailBody, fields);
        details.append(detailBody);
        body.append(details);

        article.append(body);
        if (targetGrid) targetGrid.append(article);
      });

      if (grid) refreshReveal(grid);
      if (featuredGrid) refreshReveal(featuredGrid);
    }

    drawFilters();
    drawProjects();
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
    const timelineWrap = $(".timeline-wrap");
    const filters = $("#achievementFilters");
    const search = $("#achievementSearch");
    const resultCount = $("#achievementResultCount");
    const achievements = Array.isArray(data.achievements)
      ? data.achievements.filter((achievement) => achievement && typeof achievement === "object")
      : [];
    const categories = ["All", ...new Set(achievements.map((achievement) => achievement.category || "Uncategorized"))];
    let activeCategory = "All";

    if (cards && timelineWrap) {
      if (currentViewMode === "timeline") {
        cards.style.display = "none";
        timelineWrap.style.display = "block";
      } else {
        cards.style.display = "";
        timelineWrap.style.display = "none";
      }
    }

    function drawFilters() {
      if (!filters) return;
      renderFilterButtons(
        filters,
        categories,
        (cat) => cat === activeCategory,
        (cat) => { activeCategory = cat; drawFilters(); drawCards(); }
      );
    }

    function achievementMatchesSearch(achievement, query) {
      if (!query) return true;
      const searchable = [
        achievement.title,
        achievement.date,
        achievement.category,
        achievement.summary,
        achievement.fullDescription,
        achievement.applicantSignal,
        achievement.eaeRelevance,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    }

    function drawCards() {
      if (!cards) return;
      cards.replaceChildren();
      const query = (search?.value || "").trim().toLowerCase();
      const visibleAchievements = achievements.filter((achievement) => {
        const categoryMatch = activeCategory === "All" || achievement.category === activeCategory;
        return categoryMatch && achievementMatchesSearch(achievement, query);
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

    const timelineAchievements = [...achievements].sort((a, b) => {
      const aDate = parseTimelineDate(a.date);
      const bDate = parseTimelineDate(b.date);
      return aDate - bDate || String(a.title || '').localeCompare(String(b.title || ''));
    });

    timelineAchievements.forEach((achievement, index) => {
      const item = create("article", "timeline-item reveal");
      item.setAttribute("role", "button");
      item.tabIndex = 0;
      item.setAttribute("aria-label", `Open ${achievement.title} evidence`);
      item.addEventListener("click", () => openAchievementModal(achievement));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openAchievementModal(achievement);
        }
      });
      item.append(create("span", "timeline-dot"));
      const content = create("div", "");
      content.append(create("p", "date-line", achievement.date));
      content.append(create("h4", "", achievement.title));
      
      if (achievement.summary) {
        content.append(create("p", "", achievement.summary));
      }

      // Merge data from achievementFlow if matches by title
      const flowStep = (data.achievementFlow?.steps || []).find(s => s.linkedAchievement === achievement.title || s.title === achievement.title);
      if (flowStep) {
        if (flowStep.whatItShows) {
          const proof = create("div", "flow-copy-block");
          proof.append(create("h5", "", "What it shows"));
          proof.append(create("p", "", flowStep.whatItShows));
          content.append(proof);
        }
        if (flowStep.personalMeaning) {
          const meaning = create("div", "flow-copy-block flow-meaning");
          meaning.append(create("h5", "", "What it means to me"));
          meaning.append(create("p", "", flowStep.personalMeaning));
          content.append(meaning);
        }
      } else if (achievement.applicantSignal) {
        const signal = create("p", "achievement-signal", achievement.applicantSignal);
        signal.textContent = `${achievement.applicantSignal.substring(0, 130)}${
          achievement.applicantSignal.length > 130 ? "..." : ""
        }`;
        content.append(signal);
      }
      item.append(content);
      if (timeline) timeline.append(item);
    });

    refreshReveal(timeline);

    // make the timeline follow the centered spine layout and alternate sides
    if (timeline) {
      timeline.classList.add('timeline');
      // assign left/right classes
      assignTimelineSides();
    }

    // build a small year filter bar for the timeline (inside timelineWrap)
    try {
      const wrap = document.querySelector('.timeline-wrap');
      if (wrap) {
        let bar = wrap.querySelector('.timeline-filter-bar');
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'timeline-filter-bar';
          wrap.insertBefore(bar, wrap.firstElementChild.nextElementSibling || wrap.firstChild);
        }
        bar.replaceChildren();
        const years = new Set();
        (achievements || []).forEach(a => {
          const m = (a.date || '').match(/(19|20)\d{2}/);
          if (m) years.add(m[0]);
        });
        const yearArray = Array.from(years).sort((a,b) => b - a);
        const allPill = create('button', 'filter-pill is-active', 'All'); allPill.type='button';
        bar.append(allPill);
        allPill.addEventListener('click', () => {
          bar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('is-active'));
          allPill.classList.add('is-active');
          document.querySelectorAll('#achievementTimeline .timeline-item').forEach(it => it.style.display = '');
        });
        yearArray.forEach(y => {
          const pill = create('button', 'filter-pill', y);
          pill.type = 'button';
          pill.addEventListener('click', () => {
            bar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('is-active'));
            pill.classList.add('is-active');
            document.querySelectorAll('#achievementTimeline .timeline-item').forEach(it => {
              const d = (it.querySelector('.date-line') || {}).textContent || '';
              if (d.includes(y)) it.style.display = ''; else it.style.display = 'none';
            });
          });
          bar.append(pill);
        });
      }
    } catch (e) { console.warn('timeline filter build failed', e); }

    drawFilters();
    drawCards();
    if (search) search.oninput = drawCards;
  }

  function createAchievementCard(achievement) {
    const originalIndex = data.achievements.indexOf(achievement);
    const card = create("article", "achievement-card reveal");

    const cat = create("p", "card-kicker", achievement.category);
    cat.dataset.editPath = `achievements.${originalIndex}.category`;
    card.append(cat);

    const title = create("h3", "", achievement.title);
    title.dataset.editPath = `achievements.${originalIndex}.title`;
    card.append(title);

    const date = create("p", "date-line", achievement.date);
    date.dataset.editPath = `achievements.${originalIndex}.date`;
    card.append(date);

    const summary = create("p", "", achievement.summary);
    summary.dataset.editPath = `achievements.${originalIndex}.summary`;
    card.append(summary);

    if (achievement.applicantSignal) {
      const sig = create("p", "achievement-signal", achievement.applicantSignal);
      sig.dataset.editPath = `achievements.${originalIndex}.applicantSignal`;
      card.append(sig);
    }
    card.append(createEvidenceStatusStrip(achievement));

    const button = create("button", "text-button", "View details");
    button.type = "button";
    button.addEventListener("click", () => openAchievementModal(achievement));
    card.append(button);
    return card;
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

    const refDetail = createDetail("Reflection", achievement.reflection);
    const refP = refDetail.querySelector("p") || refDetail;
    refP.dataset.editPath = `achievements.${originalIndex}.reflection`;
    details.append(refDetail);

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

  function createMediaBlock(src, alt, fallback) {
    const block = create("figure", "media-block");
    if (src) {
      const image = document.createElement("img");
      image.src = src;
      image.alt = alt;
      block.append(image);
    } else {
      block.append(create("span", "image-placeholder", fallback));
    }
    return block;
  }

  function createDetail(label, value, className = "modal-detail") {
    const detail = create("section", className);
    detail.append(create("h3", "", label));
    detail.append(create("p", "", value));
    return detail;
  }

  function renderGoals() {
    renderGoalList("#shortTermGoals", data.futureGoals?.shortTerm || []);
    renderGoalList("#longTermGoals", data.futureGoals?.longTerm || []);
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
    try {
      const stack = JSON.parse(sessionStorage.getItem('eaeUndoStack') || '[]');
      stack.push({ ts: new Date().toISOString(), label: label || 'Change', data: JSON.parse(JSON.stringify(data)) });
      // limit 30
      sessionStorage.setItem('eaeUndoStack', JSON.stringify(stack.slice(-30)));
    } catch (e) { console.error('pushUndoSnapshot failed', e); }
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
    const toggle = document.querySelector(SELECTORS.navToggle);
    const nav = document.getElementById('siteNav');
    if (!nav || !toggle) return;

    const header = $(SELECTORS.siteHeader);
    const headerLinks = Array.from(nav.querySelectorAll('a[data-section]'));
    const more = $('.nav-more', nav);
    const navSections = headerLinks
      .map((link) => document.getElementById(link.dataset.section))
      .filter(Boolean);

    const closeMoreMenu = () => {
      nav.querySelectorAll('details').forEach((details) => {
        details.open = false;
      });
    };

    const onScroll = () => {
      header?.classList.toggle('is-elevated', window.scrollY > 8);

      let activeId = navSections[0]?.id;
      navSections.forEach((section) => {
        const box = section.getBoundingClientRect();
        if (box.top <= 180 && box.bottom > 180) activeId = section.id;
      });

      headerLinks.forEach((link) => {
        const isActive = link.dataset.section === activeId;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      more?.classList.toggle(
        'has-active-child',
        headerLinks.some((link) => link.classList.contains('is-active') && !primaryNavIds.has(link.dataset.section))
      );
    };

    onScroll();

    if (navigationSetupDone) return;
    navigationSetupDone = true;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });

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
    const order = data.sectionOrder || ["about", "achievement-flow", "projects", "achievements", "goals", "applications"];
    const main = $("#main");
    if (!main) return;
    const sections = Array.from(main.querySelectorAll("section"));
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
    fetch('http://localhost:3000/api/save', {
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

  function setupLiveEditor() {
    // Hide editor from public view unless admin=true is in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('admin')) return;
    
    document.body.classList.add('admin-mode');

    if ($(".live-editor-sidebar")) return;

    // Create FAB
    const fab = create("button", "live-editor-fab", "🛠️");
    fab.setAttribute("aria-label", "Open live portfolio editor");
    document.body.appendChild(fab);

    // Create Sidebar
    const sidebar = create("aside", "live-editor-sidebar theme-admin");
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

    const quickNavGroup = create("div", "editor-control-group");
    quickNavGroup.append(create("h4", "", "Quick jumps"));
    [
      ["Hero", "#about"],
      ["Best projects", "#best-projects"],
      ["Technical journey", "#timeline"],
      ["Course fit", "#applications"]
    ].forEach(([label, target]) => {
      const jumpBtn = create("button", "button button-secondary quick-jump-btn", label);
      jumpBtn.type = "button";
      jumpBtn.addEventListener("click", () => {
        const targetEl = document.querySelector(target);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      quickNavGroup.append(jumpBtn);
    });
    content.append(quickNavGroup);

    // Switch 1: Edit Text
    const group1 = create("div", "editor-control-group");
    const label1 = create("label", "switch-container");
    label1.append(create("span", "", "Edit Text Inline"));
    const input1 = document.createElement("input");
    input1.type = "checkbox";
    input1.id = "toggleEditModeBtn";
    const slider1 = create("span", "switch-slider");
    label1.append(input1, slider1);
    group1.append(label1);
    group1.append(create("p", "control-description", "Click and edit text directly on the page. Changes save automatically when you click away."));

    // Switch 2: Shift Sections
    const group2 = create("div", "editor-control-group");
    const label2 = create("label", "switch-container");
    label2.append(create("span", "", "Shift Sections"));
    const input2 = document.createElement("input");
    input2.type = "checkbox";
    input2.id = "toggleReorderModeBtn";
    const slider2 = create("span", "switch-slider");
    label2.append(input2, slider2);
    group2.append(label2);
    group2.append(create("p", "control-description", "Use Up/Down controls on sections to swap their layout sequence."));

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

    content.append(group1, group2);

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
    const themePrimary = create('label', '', 'Primary color');
    const inputPrimary = document.createElement('input'); inputPrimary.type = 'color'; inputPrimary.value = (data.theme?.colors?.primary) || '#1b74ab'; themePrimary.append(inputPrimary);
    const themeAccent = create('label', '', 'Accent color');
    const inputAccent = document.createElement('input'); inputAccent.type = 'color'; inputAccent.value = (data.theme?.colors?.accent) || '#6b5bd1'; themeAccent.append(inputAccent);
    const themeBg = create('label', '', 'Background');
    const inputBg = document.createElement('input'); inputBg.type = 'color'; inputBg.value = (data.theme?.colors?.background) || '#0b1525'; themeBg.append(inputBg);
    themeGroup.append(themePrimary, themeAccent, themeBg);

    // Preview modes
    const previewGroup = create('div', 'editor-control-group');
    previewGroup.append(create('h4', '', 'Preview'));
    const previewDesktop = create('button', 'button', 'Desktop'); previewDesktop.type = 'button';
    const previewTablet = create('button', 'button', 'Tablet'); previewTablet.type = 'button';
    const previewMobile = create('button', 'button', 'Mobile'); previewMobile.type = 'button';
    previewGroup.append(previewDesktop, previewTablet, previewMobile);

    content.append(templatesGroup, themeGroup, previewGroup, actions);

    // Asset uploader & library
    const assetsGroup = create('div', 'editor-control-group');
    assetsGroup.append(create('h4', '', 'Asset library (images)'));
    const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.setAttribute('aria-label', 'Upload an image to the asset library');
    const assetList = create('div', 'asset-list');
    assetsGroup.append(fileInput, assetList);
    content.append(assetsGroup);

    // Versions / publish controls
    const versionsGroup = create('div', 'editor-control-group');
    versionsGroup.append(create('h4', '', 'Versions & Publish'));
    const publishBtn = create('button', 'button button-primary', data.sitePublished ? 'Unpublish' : 'Publish');
    publishBtn.type = 'button';
    publishBtn.id = 'publishBtn';
    const versionsList = create('div', 'versions-list');
    versionsGroup.append(publishBtn, versionsList);
    content.append(versionsGroup);
    sidebar.append(header, content);
    document.body.appendChild(sidebar);

    // Open/Close toggle
    fab.addEventListener("click", () => {
      sidebar.classList.toggle("is-open");
      fab.classList.toggle("is-active");
      fab.textContent = sidebar.classList.contains("is-open") ? "✖" : "🛠️";
    });

    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("is-open");
      fab.classList.remove("is-active");
      fab.textContent = "🛠️";
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
          const sections = Array.from(main.querySelectorAll("section"));
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
      data.theme = data.theme || { colors: {} };
      data.theme.colors.primary = inputPrimary.value;
      data.theme.colors.accent = inputAccent.value;
      data.theme.colors.background = inputBg.value;
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

  function render() {
    setupViewModeToggleOnce();
    setupViewModeBarVisibility();
    renderNav();
    applySectionVisibility();
    renderCustomSections();
    applySectionOrder();
    renderHero();
    renderPhilosophy();
    renderWhyCybersecurity();
    renderReflections();
    renderProjects();
    renderApplications();
    renderAchievements();
    renderGoals();
    renderOptionalSections();
    setupModal();
    setupNavigation();
    setupChromeHeight();
    setupViewModeBarVisibility();
    setupScrollProgress();
    setupPrintMode();
    setupReveal();
    setupHintTooltips();
    setupLiveEditor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
