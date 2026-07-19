import re

with open("style.css", "r") as f:
    content = f.read()

# .sidebar-header h3
content = content.replace(
    ".sidebar-header h3 {\n  margin: 0;\n  font-size: 1.2rem;\n  color: var(--white);",
    ".sidebar-header h3 {\n  margin: 0;\n  font-size: 1.2rem;\n  color: var(--navy-950);"
)

# .sidebar-close-btn:hover
content = content.replace(
    ".sidebar-close-btn:hover {\n  color: var(--white);\n}",
    ".sidebar-close-btn:hover {\n  color: var(--navy-950);\n}"
)

# .control-description
content = content.replace(
    ".control-description {\n  font-size: 0.75rem;\n  color: rgba(255, 255, 255, 0.5);",
    ".control-description {\n  font-size: 0.75rem;\n  color: var(--grey-600);"
)

# .switch-container
content = content.replace(
    ".switch-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  color: var(--white);",
    ".switch-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  color: var(--navy-950);"
)

# .switch-slider
content = content.replace(
    ".switch-slider {\n  position: relative;\n  width: 44px;\n  height: 24px;\n  background-color: rgba(255, 255, 255, 0.1);",
    ".switch-slider {\n  position: relative;\n  width: 44px;\n  height: 24px;\n  background-color: var(--grey-300);"
)

# .switch-slider:before
content = content.replace(
    ".switch-slider:before {\n  position: absolute;\n  content: \"\";\n  height: 18px;\n  width: 18px;\n  left: 3px;\n  bottom: 3px;\n  background-color: white;",
    ".switch-slider:before {\n  position: absolute;\n  content: \"\";\n  height: 18px;\n  width: 18px;\n  left: 3px;\n  bottom: 3px;\n  background-color: var(--white);\n  box-shadow: 0 1px 3px rgba(0,0,0,0.2);"
)

with open("style.css", "w") as f:
    f.write(content)

print("Updated style.css")
