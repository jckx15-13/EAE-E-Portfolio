import re

with open("script.js", "r") as f:
    content = f.read()

# 1. Update create() signature
content = content.replace("function create(tag, className, text) {", "function create(tag, className, text, editPath) {")

content = re.sub(
    r"(\s*element\.textContent = text;\n\s*markPlaceholder\(element, text\);\n)",
    r"\1      if (editPath) element.dataset.editPath = editPath;\n",
    content
)

# 2. Update renderNav
content = content.replace(
    'const link = create("a", "", label);',
    'const link = create("a", "", label, `uiLabels.nav${label}`);'
)
content = content.replace(
    'more.append(create("summary", "nav-more-summary", "More"));',
    'more.append(create("summary", "nav-more-summary", data.uiLabels?.navMore || "More", "uiLabels.navMore"));'
)

# 3. Update renderLifeEntry
content = content.replace(
    'setText("#lifeEntryTitle", data.lifeEntry?.title || "");',
    'setText("#lifeEntryTitle", data.lifeEntry?.title || "", "lifeEntry.title");'
)
content = content.replace(
    'setText("#lifeEntryIntro", data.lifeEntry?.intro || "");',
    'setText("#lifeEntryIntro", data.lifeEntry?.intro || "", "lifeEntry.intro");'
)
content = content.replace(
    'setText("#lifeEntryDoorway", data.lifeEntry?.doorway || "");',
    'setText("#lifeEntryDoorway", data.lifeEntry?.doorway || "", "lifeEntry.doorway");'
)
content = content.replace(
    'card.append(create("h3", "", chapter.title));',
    'card.append(create("h3", "", chapter.title, `lifeChapters.${index}.title`));'
)
content = content.replace(
    'card.append(create("p", "", chapter.body));',
    'card.append(create("p", "", chapter.body, `lifeChapters.${index}.body`));'
)

# 4. renderEvidenceOverview
content = content.replace(
    'setText("#evidenceOverviewTitle", "My Evidence at a Glance");',
    'setText("#evidenceOverviewTitle", data.uiLabels?.evidenceOverviewTitle || "My Evidence at a Glance", "uiLabels.evidenceOverviewTitle");'
)
content = content.replace(
    'const introText = "A consolidated view of my personal map (structured goals) and evidence deck (proof of capabilities). Use the tabs below to switch between them.";\n    setText("#evidenceOverviewIntro", introText);',
    'setText("#evidenceOverviewIntro", data.uiLabels?.evidenceOverviewIntro || "A consolidated view of my personal map (structured goals) and evidence deck (proof of capabilities). Use the tabs below to switch between them.", "uiLabels.evidenceOverviewIntro");'
)
content = content.replace(
    'btnMap.textContent = "Personal Map";',
    'btnMap.textContent = data.uiLabels?.tabPersonalMap || "Personal Map";\n    btnMap.dataset.editPath = "uiLabels.tabPersonalMap";'
)
content = content.replace(
    'btnDeck.textContent = "Evidence Deck";',
    'btnDeck.textContent = data.uiLabels?.tabEvidenceDeck || "Evidence Deck";\n    btnDeck.dataset.editPath = "uiLabels.tabEvidenceDeck";'
)
content = content.replace(
    'card.append(create("h3", "", item.title));',
    'card.append(create("h3", "", item.title, `personalMap.${index}.title`));'
)
content = content.replace(
    'card.append(create("p", "", item.body));',
    'card.append(create("p", "", item.body, `personalMap.${index}.body`));'
)

# 5. renderAbout
content = content.replace(
    'const card = create("article", "small-card");\n      card.append(create("h3", "", strength.title));\n      card.append(create("p", "", strength.body));',
    'const card = create("article", "small-card");\n      card.append(create("h3", "", strength.title, `aboutMe.strengths.${index}.title`));\n      card.append(create("p", "", strength.body, `aboutMe.strengths.${index}.body`));'
)
content = content.replace(
    'card.append(create("h3", "", phil.title));\n      card.append(create("p", "", phil.body));',
    'card.append(create("h3", "", phil.title, `aboutMe.philosophies.${index}.title`));\n      card.append(create("p", "", phil.body, `aboutMe.philosophies.${index}.body`));'
)
content = content.replace(
    'card.append(create("h3", "", skill.title));\n      card.append(create("p", "", skill.body));',
    'card.append(create("h3", "", skill.title, `aboutMe.skills.${index}.title`));\n      card.append(create("p", "", skill.body, `aboutMe.skills.${index}.body`));'
)
content = content.replace(
    'card.append(create("h3", "", passion.title));\n      card.append(create("p", "", passion.body));',
    'card.append(create("h3", "", passion.title, `aboutMe.passions.${index}.title`));\n      card.append(create("p", "", passion.body, `aboutMe.passions.${index}.body`));'
)

# 6. renderAchievementFlow
content = content.replace(
    'setText("#achievementFlowIntro", data.achievementFlow?.intro || "");',
    'setText("#achievementFlowIntro", data.achievementFlow?.intro || "", "achievementFlow.intro");'
)
content = content.replace(
    'card.append(create("h3", "", item.title));\n        card.append(create("p", "", item.body));',
    'card.append(create("h3", "", item.title, `achievementFlow.items.${index}.title`));\n        card.append(create("p", "", item.body, `achievementFlow.items.${index}.body`));'
)

# 7. renderProjects
content = content.replace(
    'catLabel.append(create("strong", "", "Category:"));',
    'catLabel.append(create("strong", "", (data.uiLabels?.projectCategoryLabel || "Category") + ":", "uiLabels.projectCategoryLabel"));'
)
content = content.replace(
    'statusLabel.append(create("strong", "", "Status:"));',
    'statusLabel.append(create("strong", "", (data.uiLabels?.projectStatusLabel || "Status") + ":", "uiLabels.projectStatusLabel"));'
)
content = content.replace(
    'liveLink.textContent = "View live project";',
    'liveLink.textContent = data.uiLabels?.projectViewLiveBtn || "View live project";\n          liveLink.dataset.editPath = "uiLabels.projectViewLiveBtn";'
)
content = content.replace(
    'sourceLink.textContent = "View source code";',
    'sourceLink.textContent = data.uiLabels?.projectSourceBtn || "View source code";\n          sourceLink.dataset.editPath = "uiLabels.projectSourceBtn";'
)
content = content.replace(
    'videoLink.textContent = "Watch video";',
    'videoLink.textContent = data.uiLabels?.projectVideoBtn || "Watch video";\n          videoLink.dataset.editPath = "uiLabels.projectVideoBtn";'
)
content = content.replace(
    'slidesLink.textContent = "Open slides in a new tab";',
    'slidesLink.textContent = data.uiLabels?.projectSlidesBtn || "Open slides in a new tab";\n          slidesLink.dataset.editPath = "uiLabels.projectSlidesBtn";'
)

# 8. renderAchievements
content = content.replace(
    'catLabel.append(create("strong", "", "Type:"));',
    'catLabel.append(create("strong", "", (data.uiLabels?.achievementCategoryLabel || "Type") + ":", "uiLabels.achievementCategoryLabel"));'
)
content = content.replace(
    'orgLabel.append(create("strong", "", "Organisation:"));',
    'orgLabel.append(create("strong", "", (data.uiLabels?.achievementOrgLabel || "Organisation") + ":", "uiLabels.achievementOrgLabel"));'
)

# 9. Edit showAdvancedAdminModal to add uiLabels support
content = content.replace(
    '{ section: "Reader-facing summaries" },',
    '{ section: "Reader-facing summaries" },\n      { label: "Evidence deck intro", path: "evidenceDeck.intro", multi: true },\n      { section: "UI Labels" },\n      { label: "Nav About", path: "uiLabels.navAbout" },\n      { label: "Nav Evidence", path: "uiLabels.navEvidence" },\n      { label: "Nav Projects", path: "uiLabels.navProjects" },\n      { label: "Nav Achievements", path: "uiLabels.navAchievements" },\n      { label: "Nav Applications", path: "uiLabels.navApplications" },\n      { label: "Evidence Deck Title", path: "uiLabels.evidenceOverviewTitle" },\n      { label: "Evidence Deck Intro", path: "uiLabels.evidenceOverviewIntro", multi: true }'
)

with open("script.js", "w") as f:
    f.write(content)
print("Updated script.js")
