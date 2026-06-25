(function () {
  const data = window.PORTFOLIO_DATA || {};

  const navItems = [
    ["Life", "life"],
    ["Guide", "reader-guide"],
    ["Map", "personal-map"],
    ["Proof", "evidence-deck"],
    ["Ready", "readiness"],
    ["About", "about"],
    ["Flow", "achievement-flow"],
    ["Projects", "projects"],
    ["Applications", "applications"],
    ["Interview", "interview"],
    ["Achievements", "achievements"],
    ["Journey", "journey"],
    ["Coding", "coding"],
    ["Robotics", "robotics"],
    ["Reflections", "reflections"],
    ["Certifications", "certifications"],
    ["Goals", "goals"],
  ];
  const primaryNavIds = new Set([
    "life",
    "evidence-deck",
    "projects",
    "applications",
    "interview",
  ]);

  const $ = (selector, root = document) => root.querySelector(selector);

  function create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) {
      element.textContent = text;
      markPlaceholder(element, text);
    }
    return element;
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

  function setText(selector, value) {
    const element = $(selector);
    if (!element) return;
    element.textContent = value || "";
    markPlaceholder(element, value || "");
  }

  function appendList(container, items, className = "") {
    container.replaceChildren();
    (items || []).forEach((item) => {
      const pill = create("span", className, item);
      container.appendChild(pill);
    });
  }

  function renderNav() {
    const nav = $("#siteNav");
    const rail = $("#journeyRailDots");
    nav.replaceChildren();
    rail?.replaceChildren();
    const secondaryLinks = [];

    navItems.forEach(([label, id]) => {
      if (primaryNavIds.has(id)) {
        const link = create("a", "", label);
        link.href = `#${id}`;
        link.dataset.section = id;
        nav.appendChild(link);
      } else {
        secondaryLinks.push([label, id]);
      }

      if (rail) {
        const dot = create("a", "journey-rail-dot");
        dot.href = `#${id}`;
        dot.setAttribute("aria-label", label);
        dot.dataset.section = id;
        dot.append(create("span", "journey-rail-label", label));
        rail.appendChild(dot);
      }
    });

    if (secondaryLinks.length) {
      const more = create("details", "nav-more");
      more.append(create("summary", "nav-more-summary", "More"));
      const panel = create("div", "nav-more-panel");
      secondaryLinks.forEach(([label, id]) => {
        const link = create("a", "", label);
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
    setText("#brandName", data.profile?.shortName || "EAE Portfolio");
    setText("#heroName", data.profile?.name || "");
    setText("#heroTitle", data.profile?.headline || "");
    setText("#heroIdentityLine", data.profile?.identityLine || "");
    setText("#heroSubtitle", data.profile?.subheadline || "");
    setText("#heroIntro", data.profile?.intro || "");
    setText("#heroSignature", data.profile?.personalSignature || "");
    setText("#heroRememberMe", data.profile?.rememberMe || "");
    setText("#heroPhotoCaption", data.profile?.photoCaption || "");
    setText("#brandStatement", data.profile?.brandStatement || "");
    setText("#profileName", data.profile?.name || "");
    setText("#profileIntro", data.profile?.intro || "");

    const heroProfileImage = $("#heroProfileImage");
    if (heroProfileImage && data.profile?.profileImage) {
      heroProfileImage.src = data.profile.profileImage;
      heroProfileImage.alt = "Profile placeholder";
    }

    const heroImage = $("#heroImage");
    if (heroImage && data.profile?.heroImage) {
      heroImage.src = data.profile.heroImage;
      heroImage.alt = "Abstract technology visual for the portfolio";
    }

    const profileImage = $("#profileImage");
    if (profileImage && data.profile?.profileImage) {
      profileImage.src = data.profile.profileImage;
      profileImage.alt = "Profile placeholder";
    }

    appendList($("#focusAreas"), data.profile?.focusAreas, "focus-item");

    const markers = $("#journeyMarkers");
    markers.replaceChildren();
    (data.profile?.journeyMarkers || []).forEach((marker) => {
      const card = create("article", "journey-marker");
      card.append(create("strong", "", marker.value));
      card.append(create("span", "", marker.label));
      markers.append(card);
    });
  }

  function renderAbout() {
    const patternGrid = $("#learningPattern");
    patternGrid.replaceChildren();
    (data.about?.learningPattern || []).forEach((item) => {
      const card = create("article", "pattern-card reveal");
      card.append(create("span", "pattern-index", item.title.slice(0, 1)));
      card.append(create("h4", "", item.title));
      card.append(create("p", "", item.body));
      patternGrid.append(card);
    });

    const snapshotGrid = $("#personalSnapshot");
    snapshotGrid.replaceChildren();
    (data.about?.snapshot || []).forEach((item) => {
      const card = create("article", "snapshot-card reveal");
      card.append(create("h3", "", item.title));
      card.append(create("p", "", item.body));
      snapshotGrid.append(card);
    });

    appendList($("#valuesList"), data.about?.values, "tag");

    const strengthsGrid = $("#strengthsGrid");
    strengthsGrid.replaceChildren();
    (data.about?.strengths || []).forEach((strength) => {
      const card = create("article", "small-card");
      card.append(create("h4", "", strength.title));
      card.append(create("p", "", strength.body));
      strengthsGrid.append(card);
    });
  }

  function renderLifeEntry() {
    setText("#lifeEntryTitle", data.lifeEntry?.title || "");
    setText("#lifeEntryIntro", data.lifeEntry?.intro || "");
    setText("#lifeEntryDoorway", data.lifeEntry?.doorway || "");

    const chapters = $("#lifeChapters");
    chapters.replaceChildren();
    (data.lifeEntry?.chapters || []).forEach((chapter, index) => {
      const card = create("article", "life-chapter reveal");
      card.append(create("span", "life-chapter-number", String(index + 1).padStart(2, "0")));
      card.append(create("p", "card-kicker", chapter.anchor));
      card.append(create("h3", "", chapter.title));
      card.append(create("p", "", chapter.body));
      chapters.append(card);
    });
  }

  function renderReaderGuide() {
    setText("#readerGuideTitle", data.readerGuide?.title || "");
    setText("#readerGuideIntro", data.readerGuide?.intro || "");

    const grid = $("#readerGuideCards");
    grid.replaceChildren();
    (data.readerGuide?.cards || []).forEach((item, index) => {
      const card = create("article", "reader-guide-card reveal");
      card.append(create("span", "reader-guide-number", String(index + 1).padStart(2, "0")));
      card.append(create("p", "card-kicker", item.label));
      card.append(create("h3", "", item.title));
      card.append(create("p", "", item.body));
      if (item.linkTarget && item.linkLabel) {
        const link = create("a", "reader-guide-link", item.linkLabel);
        link.href = item.linkTarget;
        card.append(link);
      }
      grid.append(card);
    });
  }

  function renderPersonalMap() {
    setText("#personalMapTitle", data.personalMap?.title || "");
    setText("#personalMapIntro", data.personalMap?.intro || "");
    setText("#personalMapNote", data.personalMap?.note || "");

    const grid = $("#personalMapCards");
    grid.replaceChildren();
    (data.personalMap?.cards || []).forEach((item, index) => {
      const card = create("article", "personal-map-card reveal");
      const top = create("div", "personal-map-card-top");
      top.append(create("span", "personal-map-index", String(index + 1).padStart(2, "0")));
      top.append(create("p", "card-kicker", item.label));
      card.append(top);
      card.append(create("h3", "", item.title));
      card.append(create("p", "", item.body));
      card.append(create("p", "personal-map-evidence", item.evidence));
      grid.append(card);
    });
  }

  function renderEvidenceDeck() {
    setText("#evidenceDeckTitle", data.evidenceDeck?.title || "");
    setText("#evidenceDeckIntro", data.evidenceDeck?.intro || "");

    const grid = $("#evidenceDeckCards");
    grid.replaceChildren();
    (data.evidenceDeck?.cards || []).forEach((item) => {
      const card = create("article", "evidence-card reveal");
      const top = create("div", "evidence-card-top");
      top.append(create("p", "card-kicker", item.label));
      card.append(top);
      card.append(create("h3", "", item.title));
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

      grid.append(card);
    });
  }

  function renderReadiness() {
    const grid = $("#readinessCards");
    grid.replaceChildren();

    const projects = data.projects || [];
    const achievements = data.achievements || [];
    const certifications = data.certifications || [];
    const applications = data.targetApplications || [];
    const projectMediaReady = projects.filter((project) => {
      const videoPath = typeof project.optionalVideo === "string" ? project.optionalVideo.trim() : "";
      return Boolean(project.images?.[0]) || /\.(webm|mp4|ogg)$/i.test(videoPath);
    }).length;
    const achievementImagesReady = achievements.filter((achievement) => achievement.image).length;
    const certificatesReady = achievements.filter((achievement) => achievement.certificate).length;
    const certificationPlaceholders = certifications.filter((item) =>
      hasPlaceholderText([item.issuer, item.date, item.evidence].join(" "))
    ).length;
    const applicationPlaceholders = applications.filter((application) =>
      hasPlaceholderText(
        [application.targetCourse, application.whyThisSchool, ...(application.evidenceToShow || [])].join(" ")
      )
    ).length;

    const cards = [
      {
        label: "Project media",
        value: `${projectMediaReady}/${projects.length}`,
        title: "Projects with visual evidence",
        body:
          projectMediaReady === projects.length
            ? "Every featured project has visual media."
            : "Add screenshots or demo media to projects that still rely on placeholder visuals.",
      },
      {
        label: "Achievement images",
        value: `${achievementImagesReady}/${achievements.length}`,
        title: "Achievement photos added",
        body:
          achievementImagesReady === achievements.length
            ? "Every achievement has an image attached."
            : "Achievement cards are ready for photos, screenshots, or supporting visuals.",
      },
      {
        label: "Certificates",
        value: `${certificatesReady}/${achievements.length}`,
        title: "Certificates attached",
        body:
          certificatesReady === achievements.length
            ? "Every achievement has certificate evidence attached."
            : "Certificate placeholders remain visible until the real files are added.",
      },
      {
        label: "Confirm details",
        value: `${certificationPlaceholders + applicationPlaceholders}`,
        title: "Sections still needing confirmation",
        body:
          certificationPlaceholders + applicationPlaceholders === 0
            ? "Certification and application details no longer contain placeholders."
            : "Provider names, dates, exact course details, and school-specific reasons still need final checking.",
      },
    ];

    cards.forEach((item) => {
      const card = create("article", "readiness-card reveal");
      card.append(create("p", "card-kicker", item.label));
      card.append(create("strong", "readiness-value", item.value));
      card.append(create("h3", "", item.title));
      card.append(create("p", "", item.body));
      grid.append(card);
    });
  }

  function hasPlaceholderText(value) {
    if (typeof value !== "string") return false;
    const text = value.toLowerCase();
    return value.includes("[") || text.includes("to be confirmed") || text.includes("confirm exact");
  }

  function renderAchievementFlow() {
    setText("#achievementFlowIntro", data.achievementFlow?.intro || "");
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

  function renderProjects() {
    const filters = $("#projectFilters");
    const grid = $("#projectsGrid");
    const projects = data.projects || [];
    const categories = ["All", ...new Set(projects.map((project) => project.category))];
    let activeCategory = "All";

    function drawFilters() {
      filters.replaceChildren();
      categories.forEach((category) => {
        const button = create("button", "filter-button", category);
        button.type = "button";
        button.setAttribute("aria-pressed", String(category === activeCategory));
        button.addEventListener("click", () => {
          activeCategory = category;
          drawFilters();
          drawProjects();
        });
        filters.append(button);
      });
    }

    function drawProjects() {
      grid.replaceChildren();
      projects
        .filter((project) => activeCategory === "All" || project.category === activeCategory)
        .forEach((project) => {
          const article = create("article", "project-card reveal");
          const videoPath = typeof project.optionalVideo === "string" ? project.optionalVideo.trim() : "";
          const hasEmbeddedVideo = /\.(webm|mp4|ogg)$/i.test(videoPath);
          const media = create("div", "project-media");
          if (project.images?.[0]) {
            const image = document.createElement("img");
            image.src = project.images[0];
            image.alt = `${project.title} project image`;
            media.append(image);
          } else if (hasEmbeddedVideo) {
            const video = document.createElement("video");
            video.src = videoPath;
            video.controls = true;
            video.preload = "metadata";
            video.muted = true;
            video.playsInline = true;
            video.setAttribute("aria-label", `${project.title} demo video`);
            media.append(video);
          } else {
            media.append(createProjectPlaceholder(project));
          }
          article.append(media);

          const body = create("div", "project-body");
          const meta = create("div", "meta-row");
          meta.append(create("span", "", project.category));
          meta.append(create("span", "", project.status));
          body.append(meta);
          body.append(create("h3", "", project.title));
          body.append(createProjectInsight(project));
          body.append(createProjectTechStrip(project.technologiesUsed || []));

          const fields = [
            ["Problem", project.problem],
            ["Proposed Solution", project.proposedSolution],
            ["My Role", project.myRole],
            ["Technologies Used", (project.technologiesUsed || []).join(", ")],
            ["Development Journey", project.developmentJourney],
            ["Outcome", project.outcome],
            ["Lessons Learned", project.lessonsLearned],
            ["Images", project.images?.length ? project.images.join(", ") : "Add project image here"],
            ["Optional Video", hasEmbeddedVideo ? "Playable demo embedded above" : project.optionalVideo],
          ];

          const details = create("details", "project-details");
          const summary = create("summary", "project-details-summary", "Read case study details");
          details.append(summary);
          const detailBody = create("div", "project-details-body");
          fields.forEach(([label, value]) => {
            const row = create("div", "case-row");
            row.append(create("dt", "", label));
            row.append(create("dd", "", value));
            detailBody.append(row);
          });
          details.append(detailBody);
          body.append(details);

          article.append(body);
          grid.append(article);
        });
    }

    drawFilters();
    drawProjects();
  }

  function createProjectInsight(project) {
    const insight = create("div", "project-insight");
    const signal = create("section", "project-insight-card");
    signal.append(create("h4", "", "What this proves"));
    signal.append(create("p", "", project.portfolioSignal || "Add the strongest applicant signal for this project."));
    insight.append(signal);

    const connection = create("section", "project-insight-card");
    connection.append(create("h4", "", "EAE connection"));
    connection.append(create("p", "", project.eaeConnection || "Add how this project connects to the target course or school."));
    insight.append(connection);

    if (project.evidenceStatus) {
      const status = create("p", "project-evidence-status", project.evidenceStatus);
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
    grid.replaceChildren();
    (data.targetApplications || []).forEach((application) => {
      const card = create("article", "application-card reveal");
      const top = create("div", "application-top");
      top.append(create("span", "application-mark", application.shortName));
      top.append(create("h3", "", application.institution));

      card.append(top);
      card.append(create("p", "application-course", application.targetCourse));
      card.append(create("p", "", application.whyThisSchool));

      const list = create("ul", "compact-list");
      (application.evidenceToShow || []).forEach((item) => {
        const li = create("li", "", item);
        list.append(li);
      });
      card.append(list);
      grid.append(card);
    });
  }

  function renderInterviewCards() {
    setText("#interviewTitle", data.interviewCards?.title || "");
    setText("#interviewIntro", data.interviewCards?.intro || "");

    const grid = $("#interviewCards");
    grid.replaceChildren();
    (data.interviewCards?.cards || []).forEach((item, index) => {
      const card = create("article", "interview-card reveal");
      const top = create("div", "interview-card-top");
      top.append(create("span", "interview-index", String(index + 1).padStart(2, "0")));
      top.append(create("p", "card-kicker", "Interview prompt"));
      card.append(top);
      card.append(create("h3", "", item.prompt));
      card.append(create("p", "interview-answer", item.answer));
      const evidence = create("div", "interview-evidence");
      evidence.append(create("h4", "", "Evidence to point to"));
      evidence.append(create("p", "", item.evidence));
      card.append(evidence);
      grid.append(card);
    });
  }

  function renderAchievements() {
    const cards = $("#achievementCards");
    const timeline = $("#achievementTimeline");
    const filters = $("#achievementFilters");
    const search = $("#achievementSearch");
    const resultCount = $("#achievementResultCount");
    const achievements = data.achievements || [];
    const categories = ["All", ...new Set(achievements.map((achievement) => achievement.category))];
    let activeCategory = "All";

    function drawFilters() {
      filters.replaceChildren();
      categories.forEach((category) => {
        const button = create("button", "filter-button", category);
        button.type = "button";
        button.setAttribute("aria-pressed", String(category === activeCategory));
        button.addEventListener("click", () => {
          activeCategory = category;
          drawFilters();
          drawCards();
        });
        filters.append(button);
      });
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
    }

    cards.replaceChildren();
    timeline.replaceChildren();

    achievements.forEach((achievement) => {
      const item = create("article", "timeline-item reveal");
      item.append(create("span", "timeline-dot"));
      const content = create("div", "");
      content.append(create("p", "date-line", achievement.date));
      content.append(create("h4", "", achievement.title));
      content.append(create("p", "", achievement.summary));
      item.append(content);
      timeline.append(item);
    });

    drawFilters();
    drawCards();
    search?.addEventListener("input", drawCards);
  }

  function createAchievementCard(achievement) {
    const card = create("article", "achievement-card reveal");
    card.append(create("p", "card-kicker", achievement.category));
    card.append(create("h3", "", achievement.title));
    card.append(create("p", "date-line", achievement.date));
    card.append(create("p", "", achievement.summary));
    if (achievement.applicantSignal) {
      card.append(create("p", "achievement-signal", achievement.applicantSignal));
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
        achievement.image ? "Image added" : "Image pending"
      )
    );
    strip.append(
      create(
        "span",
        achievement.certificate ? "evidence-chip evidence-chip-ready" : "evidence-chip",
        achievement.certificate ? "Certificate added" : "Certificate pending"
      )
    );
    return strip;
  }

  function openAchievementModal(achievement) {
    const dialog = $("#achievementModal");
    const content = $("#modalContent");
    content.replaceChildren();

    const header = create("div", "modal-header");
    header.append(create("p", "card-kicker", achievement.category));
    header.append(create("h2", "", achievement.title));
    header.append(create("p", "date-line", achievement.date));

    const summary = create("p", "modal-summary", achievement.summary);

    const media = create("div", "modal-media-grid");
    media.append(createMediaBlock(achievement.image, "Achievement image", "Add your photo here"));
    media.append(
      createMediaBlock(achievement.certificate, "Certificate image", "Certificate placeholder")
    );

    const details = create("div", "modal-detail-grid");
    if (achievement.applicantSignal) {
      details.append(createDetail("What this shows about me", achievement.applicantSignal, "modal-detail modal-detail-highlight"));
    }
    if (achievement.eaeRelevance) {
      details.append(createDetail("Why it matters for EAE", achievement.eaeRelevance, "modal-detail modal-detail-highlight"));
    }
    details.append(createDetail("Full description", achievement.fullDescription));
    details.append(createDetail("Reflection", achievement.reflection));
    details.append(createDetail("Learning outcome", achievement.learningOutcome));

    content.append(header, summary, media, details);

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
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

  function renderCompetitionJourney() {
    const list = $("#competitionList");
    list.replaceChildren();
    (data.competitionJourney || []).forEach((entry) => {
      const item = create("article", "journey-item reveal");
      item.append(create("p", "date-line", entry.date));
      item.append(create("h3", "", entry.title));
      item.append(create("p", "", entry.body));
      list.append(item);
    });
  }

  function renderCoding() {
    setText("#codingSummary", data.coding?.summary || "");
    const grid = $("#codingGrid");
    grid.replaceChildren();
    (data.coding?.areas || []).forEach((area) => {
      const card = create("article", "small-card reveal");
      card.append(create("h3", "", area.title));
      card.append(create("p", "", area.body));
      grid.append(card);
    });

    const programmeGrid = $("#coderProgrammeGrid");
    programmeGrid?.replaceChildren();
    (data.coding?.coderProgramme || []).forEach((item) => {
      const card = create("article", "learning-path-card reveal");
      const top = create("div", "learning-card-top");
      top.append(create("span", "learning-level", item.level));
      top.append(create("span", "learning-meta", item.levels));
      card.append(top);
      card.append(create("h3", "", item.level));
      card.append(create("p", "", item.summary));

      card.append(create("p", "learning-evidence", item.portfolioEvidence));
      const details = create("details", "learning-details");
      details.append(create("summary", "learning-details-summary", "View programme details"));
      const detailBody = create("div", "learning-details-body");
      appendChipSection(detailBody, "Focus", item.focus);
      appendChipSection(detailBody, "Modules", item.modules);
      appendChipSection(detailBody, "Programming", item.programmingConcepts);
      appendChipSection(detailBody, "Problem solving", item.problemSolving);
      details.append(detailBody);
      card.append(details);
      card.append(create("p", "source-note", item.source));
      programmeGrid?.append(card);
    });

    const skillsGrid = $("#skillsFutureGrid");
    skillsGrid?.replaceChildren();
    (data.coding?.skillsFutureAlignment || []).forEach((skill) => {
      const card = create("article", "skill-alignment-card reveal");
      card.append(create("h3", "", skill.title));
      card.append(create("p", "", skill.body));
      const details = create("details", "learning-details");
      details.append(create("summary", "learning-details-summary", "Why this fits my portfolio"));
      const detailBody = create("div", "learning-details-body");
      detailBody.append(create("p", "learning-evidence", skill.whyItFits));
      details.append(detailBody);
      card.append(details);
      card.append(create("p", "source-note", skill.source));
      skillsGrid?.append(card);
    });
  }

  function appendChipSection(card, title, items) {
    if (!items?.length) return;
    const section = create("div", "learning-card-section");
    section.append(create("h4", "", title));
    const chips = create("div", "detail-chip-list");
    items.forEach((item) => chips.append(create("span", "detail-chip", item)));
    section.append(chips);
    card.append(section);
  }

  function renderRobotics() {
    setText("#roboticsSummary", data.robotics?.summary || "");
    const list = $("#roboticsHighlights");
    list.replaceChildren();
    (data.robotics?.highlights || []).forEach((highlight) => {
      const item = create("p", "check-item", highlight);
      list.append(item);
    });
  }

  function renderReflections() {
    const grid = $("#reflectionList");
    grid.replaceChildren();
    (data.reflections || []).forEach((reflection) => {
      const card = create("article", "reflection-card reveal");
      card.append(create("h3", "", reflection.title));
      card.append(create("p", "", reflection.body));
      grid.append(card);
    });
  }

  function renderCertifications() {
    const grid = $("#certificationGrid");
    grid.replaceChildren();
    (data.certifications || []).forEach((certification) => {
      const card = create("article", "cert-card reveal");
      card.append(create("h3", "", certification.title));
      card.append(create("p", "", certification.issuer));
      card.append(create("p", "date-line", certification.date));
      card.append(create("p", "", certification.evidence));
      grid.append(card);
    });
  }

  function renderGoals() {
    renderGoalList("#shortTermGoals", data.futureGoals?.shortTerm || []);
    renderGoalList("#longTermGoals", data.futureGoals?.longTerm || []);
  }

  function renderGoalList(selector, goals) {
    const list = $(selector);
    list.replaceChildren();
    goals.forEach((goal) => {
      list.append(create("li", "", goal));
    });
  }

  function renderOptionalSections() {
    const wrapper = $("#optionalSections");
    const grid = $("#optionalGrid");
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
        list.append(create("li", "", entry));
      });
      card.append(list);
      grid.append(card);
    });
  }

  function setupModal() {
    const dialog = $("#achievementModal");
    const close = $(".modal-close", dialog);
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) dialog.close();
    });
  }

  function setupNavigation() {
    const toggle = $(".nav-toggle");
    const nav = $("#siteNav");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        nav.querySelectorAll("details").forEach((details) => {
          details.open = false;
        });
      }
    });

    const header = $(".site-header");
    const headerLinks = Array.from(nav.querySelectorAll("a[data-section]"));
    const more = $(".nav-more", nav);
    const railLinks = Array.from(document.querySelectorAll(".journey-rail-dot"));
    const railSections = railLinks
      .map((link) => document.getElementById(link.dataset.section))
      .filter(Boolean);

    const closeMoreMenu = () => {
      nav.querySelectorAll("details").forEach((details) => {
        details.open = false;
      });
    };

    const onScroll = () => {
      header.classList.toggle("is-elevated", window.scrollY > 8);

      let activeId = railSections[0]?.id;
      railSections.forEach((section) => {
        const box = section.getBoundingClientRect();
        if (box.top <= 180 && box.bottom > 180) activeId = section.id;
      });

      railLinks.forEach((link) => {
        const isActive = link.dataset.section === activeId;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      headerLinks.forEach((link) => {
        const isActive = link.dataset.section === activeId;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      more?.classList.toggle(
        "has-active-child",
        headerLinks.some((link) => link.classList.contains("is-active") && !primaryNavIds.has(link.dataset.section))
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) closeMoreMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMoreMenu();
    });
  }

  function setupScrollProgress() {
    const bar = $("#scrollProgressBar");
    if (!bar) return;

    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  function setupPrintMode() {
    const printButton = $("#printPortfolio");
    const expandProjectDetails = () => {
      document.querySelectorAll(".project-details").forEach((details) => {
        details.open = true;
      });
    };

    printButton?.addEventListener("click", () => {
      expandProjectDetails();
      window.print();
    });

    window.addEventListener("beforeprint", expandProjectDetails);
  }

  function setupReveal() {
    const revealItems = document.querySelectorAll(".reveal, .section-heading");
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function render() {
    renderNav();
    renderHero();
    renderLifeEntry();
    renderReaderGuide();
    renderPersonalMap();
    renderEvidenceDeck();
    renderReadiness();
    renderAbout();
    renderAchievementFlow();
    renderProjects();
    renderApplications();
    renderInterviewCards();
    renderAchievements();
    renderCompetitionJourney();
    renderCoding();
    renderRobotics();
    renderReflections();
    renderCertifications();
    renderGoals();
    renderOptionalSections();
    setupModal();
    setupNavigation();
    setupScrollProgress();
    setupPrintMode();
    setupReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
