# 🔄 NEW CONVERSATION HANDOFF BRIEF

**Copy this entire message to start a new conversation with Claude:**

---

Hi Claude! I need you to continue working on my **FLL 2026 UNEARTHED Strategy Engine** project. Here's the complete context:

## 📍 Project Info

**What it is:**  
A Python/matplotlib application for planning FIRST LEGO League 2026 robot strategies. It visualizes the competition field, syncs mission data with Google Sheets, and includes path optimization.

**Location:**  
`C:\Users\jaron\OneDrive - Ministry of Education (M365 T&L)\Documents\First LEGO League 2026 [FLL]\Simulation Testing\`

**Python:**  
`C:\Users\jaron\AppData\Local\Programs\Python\Python314\python.exe`

**Git:**  
Local repo on branch `seed`, commit: `"FLL 2026 UNEARTHED strategy engine v5:baseline"`, no remote.

## 📁 Key Files

```
Simulation Testing/
├── path_simulation.py          ← Core engine (modules 0-5)
├── launcher.py                 ← Entry point (module 6)
├── cloud_settings.json         ← Google Cloud config
│
../[FLL]/                        ← Parent folder
├── calibration.json
├── service_account.json
├── fll_map.png
└── FLL_Mission_Data.xlsx
```

## 🎯 What Works

- ✅ Matplotlib UI with mission dots, buttons, timer
- ✅ Google Sheets sync (background thread)
- ✅ Mission selection (click to toggle)
- ✅ Match timer (150 seconds)
- ✅ Offline Excel fallback

## 🔴 Critical Issues (In Progress)

### 1. **dpi crash on window resize**
- **Cause:** `fig.text()` being recreated in `_setup_axes()` every redraw
- **Fix:** Create text artists ONCE in `__init__`, update with `.set_text()` only

### 2. **Screen blinking during sync**
- **Cause:** Background thread calling `_render_missions()` directly (not thread-safe)
- **Fix:** Async queue pattern: `sync thread → queue.put() → main thread timer → queue.get() → render`

## 🎨 Enhancements Needed

3. **Mat dimensions box** - Show real FLL mat: 2019mm × 1137mm (contrasting color)
4. **Start zone markers** - Red box (left) and blue box (right) at y=0
5. **Brighten field map** - Current map too dark, boost brightness 30%
6. **UI alignment** - Professional polish, perfect spacing
7. **Toddler-level comments** - Every section explained in simple language
8. **Submodule naming** - Rename "Module X" → "Submodule X"

## 🏗️ Architecture Requirements

**Part 1: Display Engine** (must work standalone)
- Mission visualization, sync, UI, timer

**Part 2: PathOptimizer** (completely isolated)
- Can be deleted without breaking Part 1
- Guards: `_PART2_AVAILABLE` flag, `try/except ImportError`

**Threading Pattern:**
```
Sync Thread → queue.put(data) → Main Thread Timer → queue.get() → _render_missions()
```

**Rendering Rules:**
1. `ax.cla()` + `_setup_axes()` for every redraw (never `art.remove()`)
2. `fig.text()` created ONCE in `__init__`, updated with `.set_text()`
3. `set_xlim/ylim` ONLY in `_setup_axes()`
4. Background threads NEVER call render methods

## 📐 Field Specs

- **Field:** 240 × 120 cm (corner-origin, bottom-left = 0,0)
- **Mat:** 2019mm × 1137mm real dimensions
- **Start zones:** Red (x:0-80, y:0-20), Blue (x:160-240, y:0-20)
- **Robot:** Starts at (120, 0), back against wall
- **Coords:** Google Sheets uses center-origin → convert: `field_x = sheet_x + 120`, `field_y = sheet_y + 60`

## 🚧 What Happened

**Last session:**  
Claude was producing a **complete rewrite of `path_simulation.py`** with all fixes above when the response was cut off. The new file was NOT delivered yet.

## ✅ What I Need Now

Please produce the **complete rewritten `path_simulation.py`** that includes:

1. ✅ Async queue pattern (fix blinking)
2. ✅ `fig.text()` in `__init__` only (fix dpi crash)
3. ✅ Mat dimensions box (2019×1137mm, contrasting color)
4. ✅ Red/blue start zone visualization
5. ✅ Brightened field map (30% brightness boost)
6. ✅ Robot start indicator (center bottom, back-against-wall)
7. ✅ Toddler-level comments (explain EVERY section)
8. ✅ Perfect UI alignment
9. ✅ Submodule naming convention
10. ✅ Part 2 fully isolated (deletable without breaking Part 1)

**Deliverable:**  
Complete new `path_simulation.py` file ready to replace the existing one.

---

**That's all the context! Ready to continue?**
