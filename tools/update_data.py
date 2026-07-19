import json
import re

with open("data.js", "r") as f:
    content = f.read()

# Extract JSON
match = re.search(r"window\.PORTFOLIO_DATA\s*=\s*(\{.*?\});\s*\}\)\(\);", content, re.DOTALL)
if match:
    json_str = match.group(1)
    data = json.loads(json_str)
    
    data["uiLabels"] = {
        "navAbout": "About",
        "navEvidence": "Evidence",
        "navProjects": "Projects",
        "navAchievements": "Achievements",
        "navApplications": "Goals",
        "navMore": "More",
        "heroCta": "Explore my work",
        "lifeEntryDoorwayStart": "At first it was about...",
        "lifeEntryDoorwayEnd": "...but now it's about so much more.",
        "evidenceOverviewTitle": "My Evidence at a Glance",
        "evidenceOverviewIntro": "A consolidated view of my personal map (structured goals) and evidence deck (proof of capabilities). Use the tabs below to switch between them.",
        "tabPersonalMap": "Personal Map",
        "tabEvidenceDeck": "Evidence Deck",
        "mapTitle": "What I stand for",
        "deckTitle": "Key activities and proof",
        "aboutTitle": "Who I am",
        "aboutStrengthSubtitle": "What I am good at",
        "aboutPhilosophySubtitle": "How I approach things",
        "achievementFlowTitle": "How I got here",
        "projectsTitle": "What I built",
        "projectsIntro": "Curiosity turned into practical, working systems. These projects demonstrate my hands-on problem solving skills.",
        "projectCategoryLabel": "Category",
        "projectStatusLabel": "Status",
        "projectViewLiveBtn": "View live project",
        "projectSourceBtn": "View source code",
        "projectVideoBtn": "Watch video",
        "projectSlidesBtn": "Open slides in a new tab",
        "projectEvidenceBtn": "View certificate / proof",
        "projectSignalLabel": "What this shows:",
        "projectEaeLabel": "EAE relevance:",
        "projectEvidenceStatusLabel": "Evidence:",
        "applicationsTitle": "Where I am going",
        "applicationsIntro": "How my skills align with my goals.",
        "applicationCourseLabel": "Course:",
        "applicationWhyLabel": "Why this course:",
        "achievementsTitle": "What I've done",
        "achievementsIntro": "Extracurricular proof of my drive and competence.",
        "achievementCategoryLabel": "Type",
        "achievementOrgLabel": "Organisation",
        "achievementSignalLabel": "What this shows about me",
        "achievementEaeLabel": "Why this matters for EAE",
        "achievementReflectionTitle": "My Reflection",
        "achievementOutcomeTitle": "Learning Outcome",
        "footerCopyright": "EAE Portfolio. Built with curiosity.",
        "footerBackToTop": "Back to top",
        "liveEditorBtn": "🛠️",
        "liveEditorTitle": "Portfolio Editor",
        "liveEditorTextInline": "Edit Text Inline",
        "liveEditorTextDesc": "Click and edit text directly on the page. Changes save automatically when you click away.",
        "liveEditorShift": "Shift Sections",
        "liveEditorShiftDesc": "Use Up/Down controls on sections to swap their layout sequence.",
        "liveEditorExport": "Export data.js"
    }
    
    new_json_str = json.dumps(data, indent=2)
    new_content = content[:match.start(1)] + new_json_str + content[match.end(1):]
    
    with open("data.js", "w") as f:
        f.write(new_content)
    print("Updated data.js")
