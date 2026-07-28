#!/usr/bin/env python3
"""Migrate archived Google Sites exports into a data module for the React app.

Deterministic: every heading, paragraph and image is copied verbatim from the
export. Nothing is paraphrased, summarised or invented.
"""
import html
import json
import os
import re
import shutil
import sys
from urllib.parse import unquote

ROOT = "/home/admin/Documents/EAE-Portfolio/School_E-Portfolio"
EXPORTS = os.path.join(ROOT, "archived_exports")
PUBLIC_MEDIA = os.path.join(ROOT, "public", "school-media")
NAV = os.path.join(ROOT, "src", "utils", "navigationData.js")

# Nav/chrome text that Google Sites repeats on every page; not page content.
BOILERPLATE = {
    "skip to main content", "skip to navigation", "jarons e-portfolio",
    "report abuse", "page details", "page updated", "google sites",
}


def read_pages():
    """Pull {file,label,path} records straight out of navigationData.js."""
    src = open(NAV, encoding="utf-8").read()
    pages = []
    for m in re.finditer(r"\{\s*file:\s*'([^']+)'\s*,\s*label:\s*'([^']*)'[^}]*?path:\s*'([^']+)'", src):
        pages.append({"file": m.group(1), "label": m.group(2), "path": m.group(3)})
    return pages


def clean(fragment):
    """Tags out, entities decoded, whitespace collapsed."""
    txt = re.sub(r"(?s)<[^>]+>", "", fragment)
    txt = html.unescape(txt)
    txt = txt.replace("\xa0", " ")
    return re.sub(r"\s+", " ", txt).strip()


def extract(path):
    """Ordered content blocks: headings, paragraphs, images."""
    raw = open(path, encoding="utf-8", errors="ignore").read()
    body = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", raw)

    # Collected by document position and merged, so an <img> nested inside a
    # <p> is still emitted instead of being swallowed by the paragraph match.
    found = []

    for m in re.finditer(r"(?is)<img[^>]+>", body):
        src = re.search(r"""src=["']([^"']+)["']""", m.group(0))
        if not src:
            continue
        alt = re.search(r"""alt=["']([^"']*)["']""", m.group(0))
        found.append((m.start(), {
            "type": "image",
            "src": unquote(src.group(1)),
            "alt": html.unescape(alt.group(1)).strip() if alt else "",
        }))

    for m in re.finditer(r"(?is)<h([1-6])[^>]*>(.*?)</h\1>", body):
        found.append((m.start(), {
            "type": "heading",
            "text": clean(m.group(2)),
            "level": min(int(m.group(1)) + 1, 4),  # h1 in export -> h2 on page
        }))

    for m in re.finditer(r"(?is)<p[^>]*>(.*?)</p>", body):
        found.append((m.start(), {"type": "paragraph", "text": clean(m.group(1))}))

    # Google Sites also uses bare divs for some copy blocks.
    for m in re.finditer(r"(?is)<div[^>]*>([^<]{25,})</div>", body):
        found.append((m.start(), {"type": "paragraph", "text": clean(m.group(1))}))

    found.sort(key=lambda item: item[0])

    blocks = []
    seen = set()
    for _pos, block in found:
        if block["type"] == "image":
            if block["src"] in seen:
                continue
            seen.add(block["src"])
            blocks.append(block)
            continue

        text = block.get("text", "")
        if not text or text.lower() in BOILERPLATE:
            continue
        # The repeated site-wide navigation blob.
        if len(text) > 400 and "S1-Term 1" in text and "Secondary 4" in text:
            continue
        if text in seen:
            continue
        seen.add(text)
        blocks.append(block)

    return blocks


def copy_media(blocks):
    """Copy referenced images into public/ and rewrite src to a served path."""
    copied = 0
    missing = []
    for b in blocks:
        if b["type"] != "image":
            continue
        rel = b["src"]
        if rel.startswith(("http://", "https://", "data:")):
            b["external"] = True
            continue
        source = os.path.join(ROOT, rel)
        if not os.path.isfile(source):
            missing.append(rel)
            b["missing"] = True
            continue
        dest = os.path.join(PUBLIC_MEDIA, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if not os.path.exists(dest):
            shutil.copy2(source, dest)
            copied += 1
        b["src"] = "school-media/" + rel.replace(os.sep, "/")
    return copied, missing


def main():
    pages = read_pages()
    content = {}
    total_copied = 0
    report = []
    all_missing = []

    for page in pages:
        export_path = os.path.join(EXPORTS, page["file"])
        if not os.path.isfile(export_path):
            report.append((page["path"], "MISSING EXPORT", page["file"], 0, 0))
            continue

        blocks = extract(export_path)
        copied, missing = copy_media(blocks)
        total_copied += copied
        all_missing.extend(missing)

        # Drop images that could not be found on disk.
        blocks = [b for b in blocks if not b.get("missing")]

        content[page["path"]] = {"title": page["label"], "blocks": blocks}
        texts = sum(1 for b in blocks if b["type"] in ("heading", "paragraph"))
        imgs = sum(1 for b in blocks if b["type"] == "image")
        report.append((page["path"], "ok", page["file"], texts, imgs))

    out = os.path.join(ROOT, "src", "content", "schoolContent.js")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(
            "// AUTO-GENERATED from archived_exports/ by tools/migrate_school.py\n"
            "// Content is copied verbatim from the original Google Sites export.\n"
            "// Edit the export and re-run the script rather than hand-editing here.\n\n"
            "export const SCHOOL_CONTENT = "
        )
        json.dump(content, fh, ensure_ascii=False, indent=2)
        fh.write("\n\nexport default SCHOOL_CONTENT\n")

    print(f"pages written : {len(content)}")
    print(f"images copied : {total_copied}")
    if all_missing:
        print(f"images missing: {len(all_missing)} (first 5: {all_missing[:5]})")
    print(f"output        : {out}\n")
    print(f"{'route':<24}{'status':<16}{'text':>6}{'img':>6}")
    for path, status, _f, texts, imgs in report:
        print(f"{path:<24}{status:<16}{texts:>6}{imgs:>6}")

    unmapped = set(os.listdir(EXPORTS)) - {p["file"] for p in pages}
    unmapped = sorted(f for f in unmapped if f.endswith(".html") and f != "index.html")
    if unmapped:
        print("\nExports with no route in navigationData.js:")
        for f in unmapped:
            print("  -", f)


if __name__ == "__main__":
    sys.exit(main())
