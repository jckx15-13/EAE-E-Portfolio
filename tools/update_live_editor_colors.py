import re

with open("style.css", "r") as f:
    content = f.read()

# Update .live-editor-section-toggle
content = content.replace(
    """  background: rgba(10, 18, 34, 0.8);
  border: 1px solid #4AAEDE;
  color: #fff;""",
    """  background: var(--white);
  border: 1px solid var(--navy-950);
  color: var(--navy-950);"""
)

# Update .live-editor-img-overlay
content = content.replace(
    """  background: rgba(10, 18, 34, 0.7);
  color: white;""",
    """  background: rgba(255, 255, 255, 0.9);
  color: var(--navy-950);"""
)

with open("style.css", "w") as f:
    f.write(content)

print("Updated live editor colors")
