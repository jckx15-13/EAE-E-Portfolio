import json
import re

with open("data.js", "r") as f:
    content = f.read()

match = re.search(r"window\.PORTFOLIO_DATA\s*=\s*(\{.*?\});\s*\}\)\(\);", content, re.DOTALL)
if match:
    json_str = match.group(1)
    data = json.loads(json_str)
    
    data["uiLabels"].update({
        "achievementFlowLabel": "Achievement Flow",
        "achievementFlowTitle": "How Each Achievement Builds Into the Next",
        "workLabel": "Work",
        "projectsTitle": "Featured Projects",
        "projectsLede": "Case studies are written to show the problem, approach, role, technologies, development journey, outcome, and learning.",
        "evidenceLibraryLabel": "Evidence Library",
        "achievementStoryTitle": "Achievement Story",
        "achievementStoryLede": "These cards support the flow above. Open each one for the fuller description, reflection, learning outcome, images, and certificates.",
        "timelineTitle": "Timeline",
        "directionLabel": "Direction",
        "goalsTitle": "Future Goals",
        "goalsShortTerm": "Short-term",
        "goalsLongTerm": "Long-term",
        "applicationsLabel": "Applications",
        "applicationsTitle": "Target EAE Applications",
        "applicationsLede": "Institution-specific notes stay editable so the portfolio can support both Singapore Polytechnic and Ngee Ann Polytechnic without making unconfirmed course claims.",
        "footerText": "Jaron Chew's EAE portfolio: projects, evidence, reflection, and direction.",
        "footerPrintBtn": "Print portfolio"
    })
    
    new_json_str = json.dumps(data, indent=2)
    new_content = content[:match.start(1)] + new_json_str + content[match.end(1):]
    
    with open("data.js", "w") as f:
        f.write(new_content)

# Update script.js to call setText on these
with open("script.js", "r") as f:
    script_content = f.read()

setText_calls = """
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
"""

script_content = script_content.replace(
    'setText("#evidenceOverviewLabel", data.uiLabels?.evidenceOverviewLabel || "Evidence Overview", "uiLabels.evidenceOverviewLabel");',
    'setText("#evidenceOverviewLabel", data.uiLabels?.evidenceOverviewLabel || "Evidence Overview", "uiLabels.evidenceOverviewLabel");' + setText_calls
)

with open("script.js", "w") as f:
    f.write(script_content)

# Update index.html to add IDs so setText can find them
with open("index.html", "r") as f:
    html = f.read()

html = html.replace('<p class="section-label">Achievement Flow</p>', '<p id="achievementFlowLabel" class="section-label">Achievement Flow</p>')
html = html.replace('<h2>How Each Achievement Builds Into the Next</h2>', '<h2 id="achievementFlowTitle">How Each Achievement Builds Into the Next</h2>')
html = html.replace('<p class="section-label">Work</p>', '<p id="workLabel" class="section-label">Work</p>')
html = html.replace('<h2>Featured Projects</h2>', '<h2 id="projectsTitle">Featured Projects</h2>')
html = html.replace('<p class="section-lede">\n            Case studies are written to show the problem, approach, role,\n            technologies, development journey, outcome, and learning.\n          </p>', '<p id="projectsLede" class="section-lede">\n            Case studies are written to show the problem, approach, role,\n            technologies, development journey, outcome, and learning.\n          </p>')
html = html.replace('<p class="section-label">Evidence Library</p>', '<p id="evidenceLibraryLabel" class="section-label">Evidence Library</p>')
html = html.replace('<h2>Achievement Story</h2>', '<h2 id="achievementStoryTitle">Achievement Story</h2>')
html = html.replace('<p class="section-lede">\n            These cards support the flow above. Open each one for the fuller\n            description, reflection, learning outcome, images, and certificates.\n          </p>', '<p id="achievementStoryLede" class="section-lede">\n            These cards support the flow above. Open each one for the fuller\n            description, reflection, learning outcome, images, and certificates.\n          </p>')
html = html.replace('<h3 class="mini-heading">Timeline</h3>', '<h3 id="timelineTitle" class="mini-heading">Timeline</h3>')
html = html.replace('<p class="section-label">Direction</p>', '<p id="directionLabel" class="section-label">Direction</p>')
html = html.replace('<h2>Future Goals</h2>', '<h2 id="goalsTitle">Future Goals</h2>')
html = html.replace('<h3>Short-term</h3>', '<h3 id="goalsShortTerm">Short-term</h3>')
html = html.replace('<h3>Long-term</h3>', '<h3 id="goalsLongTerm">Long-term</h3>')
html = html.replace('<p class="section-label">Applications</p>', '<p id="applicationsLabel" class="section-label">Applications</p>')
html = html.replace('<h2>Target EAE Applications</h2>', '<h2 id="applicationsTitle">Target EAE Applications</h2>')
html = html.replace('<p class="section-lede">\n            Institution-specific notes stay editable so the portfolio can support\n            both Singapore Polytechnic and Ngee Ann Polytechnic without making\n            unconfirmed course claims.\n          </p>', '<p id="applicationsLede" class="section-lede">\n            Institution-specific notes stay editable so the portfolio can support\n            both Singapore Polytechnic and Ngee Ann Polytechnic without making\n            unconfirmed course claims.\n          </p>')
html = html.replace('<p>Jaron Chew\'s EAE portfolio: projects, evidence, reflection, and direction.</p>', '<p id="footerText">Jaron Chew\'s EAE portfolio: projects, evidence, reflection, and direction.</p>')


with open("index.html", "w") as f:
    f.write(html)
print("Updated UI Texts 2")
