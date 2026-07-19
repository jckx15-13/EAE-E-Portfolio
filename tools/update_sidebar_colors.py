import re

with open("style.css", "r") as f:
    content = f.read()

# Update sidebar background and color
content = content.replace(
    "background: rgba(10, 18, 34, 0.96);",
    "background: var(--white);\n  color: var(--navy-950);"
)
# Update sidebar borders to be dark instead of light
content = content.replace(
    "border-left: 1px solid rgba(60, 169, 232, 0.2);",
    "border-left: 1px solid var(--grey-300);"
)
content = content.replace(
    "border-bottom: 1px solid rgba(255, 255, 255, 0.08);",
    "border-bottom: 1px solid var(--grey-300);"
)
# Update any text colors that might be explicitly light in the sidebar
content = content.replace(
    "color: rgba(255, 255, 255, 0.6);",
    "color: var(--grey-600);"
)

with open("style.css", "w") as f:
    f.write(content)

print("Updated style.css")
