import json
import re

with open("data.js", "r") as f:
    content = f.read()

match = re.search(r"window\.PORTFOLIO_DATA\s*=\s*(\{.*?\});\s*\}\)\(\);", content, re.DOTALL)
if match:
    json_str = match.group(1)
    data = json.loads(json_str)
    
    if "uiLabels" not in data:
        data["uiLabels"] = {}
        
    data["uiLabels"].update({
        "skipLink": "Skip to content",
        "viewCards": "Cards",
        "viewTimeline": "Timeline",
        "viewStory": "Story",
        "heroBtnPrimary": "View projects",
        "heroBtnSecondary": "View achievements",
        "personalQualitiesTitle": "Personal qualities",
        "journeyMilestonesLabel": "Journey Milestones",
        "evidenceOverviewLabel": "Evidence Overview"
    })
    
    new_json_str = json.dumps(data, indent=2)
    new_content = content[:match.start(1)] + new_json_str + content[match.end(1):]
    
    with open("data.js", "w") as f:
        f.write(new_content)

# Update script.js to call setText on these
with open("script.js", "r") as f:
    script_content = f.read()

setText_calls = """
    setText(".skip-link", data.uiLabels?.skipLink || "Skip to content", "uiLabels.skipLink");
    setText("#view-cards", data.uiLabels?.viewCards || "Cards", "uiLabels.viewCards");
    setText("#view-timeline", data.uiLabels?.viewTimeline || "Timeline", "uiLabels.viewTimeline");
    setText("#view-story", data.uiLabels?.viewStory || "Story", "uiLabels.viewStory");
    setText("#heroBtnPrimary", data.uiLabels?.heroBtnPrimary || "View projects", "uiLabels.heroBtnPrimary");
    setText("#heroBtnSecondary", data.uiLabels?.heroBtnSecondary || "View achievements", "uiLabels.heroBtnSecondary");
    setText("#personalQualitiesTitle", data.uiLabels?.personalQualitiesTitle || "Personal qualities", "uiLabels.personalQualitiesTitle");
    setText("#journeyMilestonesLabel", data.uiLabels?.journeyMilestonesLabel || "Journey Milestones", "uiLabels.journeyMilestonesLabel");
    setText("#evidenceOverviewLabel", data.uiLabels?.evidenceOverviewLabel || "Evidence Overview", "uiLabels.evidenceOverviewLabel");
"""

# Insert into renderHero for now, or just after renderHero
script_content = script_content.replace(
    'setText("#profileIntro", data.profile?.intro || "", "profile.intro");',
    'setText("#profileIntro", data.profile?.intro || "", "profile.intro");' + setText_calls
)

with open("script.js", "w") as f:
    f.write(script_content)

# Update index.html to add IDs so setText can find them
with open("index.html", "r") as f:
    html = f.read()

html = html.replace('<a class="button button-primary" href="#projects">', '<a id="heroBtnPrimary" class="button button-primary" href="#projects">')
html = html.replace('<a class="button button-secondary" href="#achievements">', '<a id="heroBtnSecondary" class="button button-secondary" href="#achievements">')
html = html.replace('<h2 class="mini-heading">Personal qualities</h2>', '<h2 id="personalQualitiesTitle" class="mini-heading">Personal qualities</h2>')
html = html.replace('<p class="section-label">Journey Milestones</p>', '<p id="journeyMilestonesLabel" class="section-label">Journey Milestones</p>')
html = html.replace('<p class="section-label">Evidence Overview</p>', '<p id="evidenceOverviewLabel" class="section-label">Evidence Overview</p>')

with open("index.html", "w") as f:
    f.write(html)
print("Updated UI Texts")
