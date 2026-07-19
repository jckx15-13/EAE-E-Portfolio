import re

with open("style.css", "r") as f:
    content = f.read()

# Remove the old block first
content = re.sub(r'/\* ──+\n   ADMIN THEME FORCING[\s\S]*$', '', content)

# Append the new clean block
new_block = """/* ─────────────────────────────────────────────────────────────────────────
   ADMIN THEME FORCING
   ───────────────────────────────────────────────────────────────────────── */
.theme-admin {
  background: var(--white) !important;
  color: var(--navy-950) !important;
}

/* Force all text elements inside the admin theme to be dark */
.theme-admin * {
  color: var(--navy-950);
}

/* Specific elements that need to remain white or lighter */
.theme-admin button:not(.sidebar-close-btn):not(.admin-secondary),
.theme-admin .button {
  color: var(--white) !important;
}

.theme-admin .admin-secondary,
.theme-admin .sidebar-close-btn {
  color: var(--navy-950) !important;
}

.theme-admin .control-description,
.theme-admin .text-muted {
  color: var(--grey-700) !important;
}

.theme-admin input,
.theme-admin textarea,
.theme-admin .json-editor {
  background: var(--white) !important;
  color: var(--navy-950) !important;
  border: 1px solid var(--grey-300) !important;
}
"""

with open("style.css", "w") as f:
    f.write(content + new_block)

