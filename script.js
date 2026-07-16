(function () {
  const data = window.PORTFOLIO_DATA || {};

  // Override with local uploads if available
  (function overrideWithLocalUploads() {
    const uploadStorageKey = 'eaePortfolioUploads';
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
    ["Projects", "projects"],
    ["Achievements", "achievements"],
    ["Applications", "applications"],
    ["Journey", "life"],
    ["Evidence", "evidence-overview"],
    ["Goals", "goals"],
  ];
  const primaryNavIds = new Set([
    "about",
    "projects",
    "achievements",
    "applications",
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

  function setText(selector, value, editPath = "") {
    const element = $(selector);
    if (!element) return;
    element.textContent = value || "";
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

  function renderNav() {
    const nav = $("#siteNav");
    nav.replaceChildren();
    const secondaryLinks = [];
    const visibilityConfig = data.sectionVisibility || {};

    navItems.forEach(([label, id]) => {
      if (visibilityConfig[id]) return;

      if (primaryNavIds.has(id)) {
        const link = create("a", "", label);
        link.href = `#${id}`;
        link.dataset.section = id;
        nav.appendChild(link);
      } else {
        secondaryLinks.push([label, id]);
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


  function renderEvidenceOverview() {
    setText("#evidenceOverviewTitle", "My Evidence at a Glance");
    const introText = "A consolidated view of my personal map (structured goals) and evidence deck (proof of capabilities). Use the tabs below to switch between them.";
    setText("#evidenceOverviewIntro", introText);

    const mapGrid = $("#personalMapCards");
    const deckGrid = $("#evidenceDeckCards");

    if (mapGrid) {
      mapGrid.replaceChildren();
      (data.personalMap?.cards || []).forEach((item, index) => {
        const card = create("article", "personal-map-card reveal");
        const top = create("div", "personal-map-card-top");
        top.append(create("span", "personal-map-index", String(index + 1).padStart(2, "0")));
        top.append(create("p", "card-kicker", item.label));
        card.append(top);
        card.append(create("h3", "", item.title));
        card.append(create("p", "", item.body));
        card.append(create("p", "personal-map-evidence", item.evidence));
        mapGrid.append(card);
      });
    }

    if (deckGrid) {
      deckGrid.replaceChildren();
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

  let viewModeInitialized = false;
  let currentViewMode = "story";

  function setupViewModeToggleOnce() {
    if (viewModeInitialized) return;
    viewModeInitialized = true;

    const pills = document.querySelectorAll(".view-mode-pill");
    currentViewMode = localStorage.getItem("eaePortfolioViewModeV2") || "cards";
    
    pills.forEach(pill => {
      const active = pill.dataset.mode === currentViewMode;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-selected", String(active));
      
      pill.addEventListener("click", () => {
        const mode = pill.dataset.mode;
        if (mode === currentViewMode) return;
        currentViewMode = mode;
        localStorage.setItem("eaePortfolioViewModeV2", mode);
        
        pills.forEach(p => {
          const act = p.dataset.mode === mode;
          p.classList.toggle("is-active", act);
          p.setAttribute("aria-selected", String(act));
        });
        
        document.body.dataset.viewMode = mode;
        
        // Re-render view-mode-aware sections
        renderProjects();
        renderAchievements();
        renderCertifications();
        renderCoding();
      });
    });
    
    document.body.dataset.viewMode = currentViewMode;
  }

  function setupHintTooltips() {
    const triggers = document.querySelectorAll(".hint-trigger");
    triggers.forEach(trigger => {
      let tooltip = null;
      
      const showTooltip = () => {
        if (tooltip) return;
        const hintText = trigger.dataset.hint;
        tooltip = create("div", "hint-tooltip", hintText);
        document.body.appendChild(tooltip);
        
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
        temp.classList.remove("is-active");
        setTimeout(() => temp.remove(), 200);
      };
      
      trigger.addEventListener("mouseenter", showTooltip);
      trigger.addEventListener("mouseleave", hideTooltip);
      trigger.addEventListener("focus", showTooltip);
      trigger.addEventListener("blur", hideTooltip);
    });
  }

  function renderProjects() {
    const filters = $("#projectFilters");
    const grid = $("#projectsGrid");
    const projects = data.projects || [];
    const categories = ["All", ...new Set(projects.map((project) => project.category))];
    let activeCategory = "All";
    const projectText = (project, primary, fallback) =>
      project[primary] ??
      (fallback ? project[fallback] : undefined);
    const projectTechs = (project) => {
      const technologies = project.technologies ?? project.technologiesUsed;
      if (Array.isArray(technologies)) return technologies.filter(Boolean);
      return typeof technologies === "string"
        ? technologies.split(",").map((item) => item.trim()).filter(Boolean)
        : [];
    };
    const projectMedia = (project) => Array.isArray(project.images) ? project.images : [];

    function drawFilters() {
      if (!filters) return;
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
      
      let filteredProjects = projects.filter(
        (project) => activeCategory === "All" || project.category === activeCategory
      );
      
      if (currentViewMode === "story") {
        const storyOrder = [
          "Kodecoon Project Journey",
          "PyCon Hackathon & SkillQuest (Cybersecurity & Career Education)",
          "Personal Student Portfolio Website",
          "SPD Caregiver & Admin Event Portal Prototype",
          "FLL 2026 Unearthed Robot Design & Planning",
          "3D Design & Mechanical Prototyping (Thingiverse Creations)"
        ];
        filteredProjects.sort((a, b) => {
          let idxA = storyOrder.indexOf(a.title);
          let idxB = storyOrder.indexOf(b.title);
          if (idxA === -1) idxA = 99;
          if (idxB === -1) idxB = 99;
          return idxA - idxB;
        });
      } else if (currentViewMode === "timeline") {
        const timelineOrder = [
          "Kodecoon Project Journey",
          "FLL 2026 Unearthed Robot Design & Planning",
          "PyCon Hackathon & SkillQuest (Cybersecurity & Career Education)",
          "Personal Student Portfolio Website",
          "SPD Caregiver & Admin Event Portal Prototype",
          "3D Design & Mechanical Prototyping (Thingiverse Creations)"
        ];
        filteredProjects.sort((a, b) => {
          let idxA = timelineOrder.indexOf(a.title);
          let idxB = timelineOrder.indexOf(b.title);
          if (idxA === -1) idxA = 99;
          if (idxB === -1) idxB = 99;
          return idxA - idxB;
        });
      }

      filteredProjects.forEach((project, index) => {
        const originalIndex = data.projects.indexOf(project);
        const article = create("article", "project-card reveal");
        
        if (currentViewMode === "timeline") {
          article.classList.add("timeline-card-node");
        } else if (currentViewMode === "story") {
          article.classList.add("story-card-node");
          
          if (index > 0) {
            const prevProject = filteredProjects[index - 1];
            if (project.carriedForward && project.carriedForward.fromProject === prevProject.title) {
              const connector = create("div", "story-connector reveal");
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
              const spacer = create("div", "story-track-spacer reveal");
              spacer.innerHTML = `<span class="track-label">Next Track: Engineering & Prototyping</span>`;
              grid.appendChild(spacer);
            }
          }
        }

        const slidesEmbedUrl = project.slidesEmbedUrl;
        const videoPath = typeof project.optionalVideo === "string" ? project.optionalVideo.trim() : "";
        const hasEmbeddedVideo = /\.(webm|mp4|ogg)$/i.test(videoPath);
        const media = create("div", "project-media");
        
        if (project.highlighted) {
          article.classList.add("project-card--highlighted");
          const highlightBadge = create("span", "project-highlight-badge", "Highlighted Project");
          article.append(highlightBadge);
        }

        if (slidesEmbedUrl) {
          const iframeContainer = create("div", "project-media-iframe-wrap");
          iframeContainer.style = "position: relative; width: 100%; height: 0; padding-top: 56.25%; overflow: hidden; border-radius: 8px;";
          const iframe = document.createElement("iframe");
          iframe.src = slidesEmbedUrl;
          iframe.loading = "lazy";
          iframe.style = "position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;";
          iframe.allowFullscreen = true;
          iframe.allow = "fullscreen";
          iframeContainer.append(iframe);
          media.append(iframeContainer);
        } else {
          const mediaImages = projectMedia(project);
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
          if (hasEmbeddedVideo) {
            const video = document.createElement("video");
            video.src = videoPath;
            video.controls = true;
            video.preload = "metadata";
            video.muted = true;
            video.playsInline = true;
            video.setAttribute("aria-label", `${project.title} demo video`);
            media.append(video);
          }
          if (!leadImage && !hasEmbeddedVideo) {
            media.append(createProjectPlaceholder(project));
          }
        }
        article.append(media);

        const body = create("div", "project-body");
        const meta = create("div", "meta-row");
        
        const catSpan = create("span", "", project.category);
        catSpan.dataset.editPath = `projects.${originalIndex}.category`;
        meta.append(catSpan);
        
        const statusSpan = create("span", "", project.status);
        statusSpan.dataset.editPath = `projects.${originalIndex}.status`;
        meta.append(statusSpan);
        
        body.append(meta);
        
        const titleH3 = create("h3", "", project.title);
        titleH3.dataset.editPath = `projects.${originalIndex}.title`;
        body.append(titleH3);
        
        body.append(createProjectInsight(project));
        body.append(createProjectTechStrip(projectTechs(project)));

        const fields = [
          ["Problem", projectText(project, "problem"), `projects.${originalIndex}.problem`],
          ["Solution", projectText(project, "solution", "proposedSolution"), `projects.${originalIndex}.proposedSolution`],
          ["Role", projectText(project, "role", "myRole"), `projects.${originalIndex}.myRole`],
          [
            "Technologies Used",
            projectTechs(project).length ? projectTechs(project).join(", ") : "Add technologies here",
            `projects.${originalIndex}.technologiesUsed`
          ],
          ["Journey", projectText(project, "journey", "developmentJourney"), `projects.${originalIndex}.developmentJourney`],
          ["Outcome", project.outcome, `projects.${originalIndex}.outcome`],
          ["Lessons Learned", projectText(project, "lessons", "lessonsLearned"), `projects.${originalIndex}.lessonsLearned`],
          ["Images", leadImage ? "Evidence added" : "Add project image here", `projects.${originalIndex}.image`],
          ["Optional Video", hasEmbeddedVideo ? "Playable demo embedded above" : project.optionalVideo, `projects.${originalIndex}.optionalVideo`],
        ];

        const details = create("details", "project-details");
        const summary = create("summary", "project-details-summary", "Read case study details");
        details.append(summary);
        const detailBody = create("div", "project-details-body");
        fields.forEach(([label, value, path]) => {
          const row = create("div", "case-row");
          row.append(create("dt", "", label));
          const dd = create("dd", "", value);
          if (path) dd.dataset.editPath = path;
          row.append(dd);
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
    const achievements = data.achievements || [];
    const categories = ["All", ...new Set(achievements.map((achievement) => achievement.category))];
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
    }

    if (cards) cards.replaceChildren();
    if (timeline) timeline.replaceChildren();

    achievements.forEach((achievement, index) => {
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
      content.append(create("p", "", achievement.summary));
      item.append(content);
      if (achievement.applicantSignal) {
        const signal = create("p", "achievement-signal", achievement.applicantSignal);
        signal.textContent = `${achievement.applicantSignal.substring(0, 130)}${
          achievement.applicantSignal.length > 130 ? "..." : ""
        }`;
        content.append(signal);
      }
      if (timeline) timeline.append(item);
    });

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
    const originalIndex = data.achievements.indexOf(achievement);
    const dialog = $("#achievementModal");
    const content = $("#modalContent");
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
    const navSections = headerLinks
      .map((link) => document.getElementById(link.dataset.section))
      .filter(Boolean);

    const closeMoreMenu = () => {
      nav.querySelectorAll("details").forEach((details) => {
        details.open = false;
      });
    };

    const onScroll = () => {
      header.classList.toggle("is-elevated", window.scrollY > 8);

      let activeId = navSections[0]?.id;
      navSections.forEach((section) => {
        const box = section.getBoundingClientRect();
        if (box.top <= 180 && box.bottom > 180) activeId = section.id;
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
    const container = $(".scroll-progress");
    if (!bar) return;

    let ticking = false;

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(0, scrollHeight - viewportHeight);
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const clamped = Math.min(1, Math.max(0, progress));
      bar.style.transform = `scaleX(${clamped})`;
      container?.setAttribute("aria-valuenow", String(Math.round(clamped * 100)));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
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

  function setupLiveEditor() {
    if ($(".live-editor-panel")) return;
    
    const toggleBtn = create("button", "live-editor-toggle", "🛠️ Live Editor");
    toggleBtn.style = "position: fixed; bottom: 24px; right: 24px; z-index: 1001; background: var(--blue-500); color: #fff; border: none; padding: 10px 16px; border-radius: 20px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(60, 169, 232, 0.4); transition: all 0.2s ease;";
    document.body.appendChild(toggleBtn);

    const panel = create("div", "live-editor-panel");
    panel.style.display = "none"; // Start hidden
    const title = create("span", "", "Live Editor");
    title.style = "color: var(--blue-500); font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;";
    
    const editTextBtn = create("button", "live-editor-btn", "Edit Text");
    editTextBtn.id = "toggleEditModeBtn";
    
    const shiftSectionsBtn = create("button", "live-editor-btn", "Shift Sections");
    shiftSectionsBtn.id = "toggleReorderModeBtn";
    
    const exportBtn = create("button", "live-editor-btn btn-action", "Export data.js");
    exportBtn.id = "exportDataBtn";
    exportBtn.style.display = "none";
    
    panel.append(title, editTextBtn, shiftSectionsBtn, exportBtn);
    document.body.appendChild(panel);
    
    toggleBtn.addEventListener("click", () => {
      if (panel.style.display === "none") {
        panel.style.display = "flex";
        toggleBtn.textContent = "✖ Close Editor";
        toggleBtn.style.background = "var(--navy-800)";
      } else {
        panel.style.display = "none";
        toggleBtn.textContent = "🛠️ Live Editor";
        toggleBtn.style.background = "var(--blue-500)";
      }
    });
    
    let textEditingActive = false;
    let sectionShiftingActive = false;
    
    editTextBtn.addEventListener("click", () => {
      textEditingActive = !textEditingActive;
      if (textEditingActive) {
        editTextBtn.classList.add("btn-active");
        document.body.classList.add("live-editing-active");
        
        document.querySelectorAll("[data-edit-path]").forEach(el => {
          el.contentEditable = "true";
          el.addEventListener("blur", handleTextBlur);
        });
      } else {
        editTextBtn.classList.remove("btn-active");
        if (!sectionShiftingActive) {
          document.body.classList.remove("live-editing-active");
        }
        document.querySelectorAll("[data-edit-path]").forEach(el => {
          el.removeAttribute("contenteditable");
          el.removeEventListener("blur", handleTextBlur);
        });
      }
    });
    
    shiftSectionsBtn.addEventListener("click", () => {
      sectionShiftingActive = !sectionShiftingActive;
      if (sectionShiftingActive) {
        shiftSectionsBtn.classList.add("btn-active");
        document.body.classList.add("live-editing-active");
        
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
        shiftSectionsBtn.classList.remove("btn-active");
        if (!textEditingActive) {
          document.body.classList.remove("live-editing-active");
        }
        
        document.querySelectorAll(".section-edit-controls").forEach(controls => {
          controls.style.display = "none";
        });
      }
    });
    
    exportBtn.addEventListener("click", showExportModal);
    
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

    function saveToServer(changeDesc) {
      if (window.location.protocol === 'file:') {
        console.log("Running via file protocol, auto-save to disk is disabled. Use the Export data.js button to manually save.");
        return;
      }
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
        toast.style = "position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(60, 169, 232, 0.95); color: #070b16; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; z-index: 1001; transition: opacity 0.3s ease; pointer-events: none; box-shadow: 0 4px 12px rgba(60, 169, 232, 0.3);";
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.opacity = "0";
      }, 2000);
    }
  }

  function showExportModal() {
    const dialog = $("#achievementModal");
    const content = $("#modalContent");
    if (!dialog || !content) return;
    
    content.replaceChildren();
    
    const header = create("header", "modal-header");
    header.append(create("h2", "", "Export data.js"));
    
    const intro = create("p", "section-lede", "Your live changes have been saved to memory. Copy the exported JavaScript code below and paste it into your data.js file, or click download to save it.");
    
    const textarea = create("textarea", "json-editor");
    textarea.style = "width: 100%; height: 350px; font-family: monospace; font-size: 0.85rem; padding: 12px; margin-top: 12px; background: #0c1424; color: #fff; border: 1px solid var(--blue-500); border-radius: 6px;";
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
    
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function render() {
    setupViewModeToggleOnce();
    renderNav();
    applySectionVisibility();
    applySectionOrder();
    renderHero();
    renderLifeEntry();
    renderEvidenceOverview();
    renderAbout();
    renderAchievementFlow();
    renderProjects();
    renderApplications();
    renderAchievements();
    renderGoals();
    renderOptionalSections();
    setupModal();
    setupNavigation();
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
