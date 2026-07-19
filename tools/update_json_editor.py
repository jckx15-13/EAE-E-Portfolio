import re

with open("style.css", "r") as f:
    content = f.read()

content = content.replace(
    ".json-editor {\n  min-height: 520px;\n  font-family:\n    \"Cascadia Code\", \"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace;\n  font-size: 0.9rem;\n  line-height: 1.5;\n}",
    ".json-editor {\n  min-height: 520px;\n  font-family:\n    \"Cascadia Code\", \"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace;\n  font-size: 0.9rem;\n  line-height: 1.5;\n  background: var(--white);\n  color: var(--navy-950);\n}"
)

with open("style.css", "w") as f:
    f.write(content)
