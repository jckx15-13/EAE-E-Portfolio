# FLL 2026 UNEARTHED — AI Continuation Prompt
# Paste this entire document into a new chat to resume exactly where we left off.

---

## PROJECT IDENTITY

**Name:** FLL 2026 UNEARTHED — Mission Command Suite  
**Stack:** Python 3.14, Tkinter, Matplotlib, PIL, NumPy, bleak (optional)  
**Architecture:** MVC — 9-file desktop application  
**Theme:** Honkai: Star Rail × Herta × Silver Wolf visual design  
**Target users:** FLL robotics teams, ages 9–16

---

## FILE INVENTORY & CURRENT VERSIONS

| File | Version | Role |
|------|---------|------|
| `path_simulation.py` | v50.3.0 | Model — all domain logic, FLLBrain, TSP, physics |
| `tactical_hud.py` | v50.6.0 | View — Matplotlib field map, animations, tools |
| `mission_editor.py` | v49.5.0 | View/Controller — mission CRUD, drag-drop, attachments |
| `fll_engine.py` | v3.5.0 | View/Controller — HSR UI, match timer, competition tab |
| `diagnostic_dashboard.py` | v50.1.0 | View — 7-tab diagnostics, RAM/CPU sparklines |
| `launcher.py` | v50.2.0 | Controller — MVC boot, view routing via place()+lift() |
| `spike_code_merger.py` | v49.0.0 | CLI — CSV → Pybricks MicroPython codegen |
| `Fll_command_engine.py` | v50.1.0 | Alternate entry point (merged view) |
| `config.py` | v2.0.0 | Shared constants |

**Supporting files:** `calibration.json`, `cloud_settings.json`, `fll_map.png`

---

## CRITICAL BUG HISTORY (ALL FIXED)

### Fixed in previous sessions:
- **BUG-LAUNCH-001/002** — `logging.getlogging` typo; `self.logging` shadowed stdlib
- **BUG-ENG-001** — `PracticeTracker.log_run()` → `add_run(RunResult(...))`
- **BUG-ME-001/002/003** — `matplotlib.pyplot` in destroy(); Tkinter mock in tests
- **BUG-DIAG-001** — SparklineGraph `self._w` shadowed `tk.Canvas._w` (Python 3.14)
- **BUG-PATH-001** — `from __future__ import annotations` must be line 1
- **BUG-PATH-002** — `RectangleObstacle.collides_with_segment` only checked start point
- **BUG-CMD-001** — bare `legacy` variable used before `self._legacy`
- **CRASH-003** — ToolTip TclError on non-text widgets
- **VIEW-BUG** — `TacticalHUD` and `MissionEditor` frames never placed into container
  → Fixed: `.place(relx=0, rely=0, relwidth=1, relheight=1)` after each frame creation
- **DIAG-BUG** — `ttk.Progressbar(length=300)` crashes Python 3.14 pack()
  → Fixed: removed `length=` kwarg, use `pack(fill=tk.X)` instead
- **O09-BUG** — `safe_path("../../etc/passwd")` didn't raise on Windows Python 3.14
  → Fixed: raw string normalisation BEFORE `Path()` construction
- **FLL-ENGINE-BUG** — `_round_number` used in `_competition_tab()` before `__init__` set it
  → Fixed: state vars moved before `_build_main_area()`

---

## HSR COLOUR SYSTEM (both TacticalHUD + MissionEditor)

```python
BG          = "#0B0D1A"   # void-black base
PANEL       = "#111425"   # surface panels
SURFACE_HI  = "#181C35"   # elevated cards
DOCK_TITLE  = "#0D0F1F"   # header strips
TEXT        = "#E8E4F0"   # primary text (never pure #FFF)
SUBTEXT     = "#8A86A0"   # secondary text
DISABLED    = "#3D3A50"   # disabled state
ACCENT      = "#9B6DFF"   # Silver Wolf purple
ACCENT_SOFT = "#C4A8FF"   # SW hover
ICE         = "#00D4FF"   # Herta ice blue
ICE_SOFT    = "#80EAFF"   # Herta hover
GOLD        = "#FFD740"   # HSR rarity gold
SUCCESS     = "#00E676"   # route fits
WARN        = "#FFAB40"   # time warning
DANGER      = "#FF4466"   # over-time / collision
```

---

## FIELD DIMENSIONS (official FLL 2026)

- Table interior: 240 × 120 cm
- Mat: 201.9 × 113.7 cm at position (MAT_X=19.05, MAT_Y=3.15)
- Home zones: Left x∈[0,80] y∈[0,20] | Right x∈[160,240] y∈[0,20]
- `calibration.json`: `{"x_min":-18.0,"x_max":216.0,"y_min":-22.0,"y_max":157.5}`

---

## MISSION COORDINATES (official, confirmed)

| Mid | Name | x | y |
|-----|------|---|---|
| M01 | Surface Brushing | 80.0 | 80.0 |
| M02 | Map Reveal | 55.0 | 85.0 |
| M03 | Mineshaft Explorer | 40.0 | 60.0 |
| M04 | Careful Recovery | 100.0 | 80.0 |
| M05 | Who Lived Here? | 120.0 | 100.0 |
| M06 | Forge | 140.0 | 80.0 |
| M07 | Heavy Lifting | 155.0 | 75.0 |
| M08 | Silo | 165.0 | 60.0 |
| M09 | What's on Sale? | 120.0 | 45.0 |
| M10 | Tip the Scales | 100.0 | 45.0 |
| M11 | Angler Artifacts | 185.0 | 40.0 |
| M12 | Salvage Operation | 185.0 | 80.0 |
| M13 | Statue Rebuild | 55.0 | 40.0 |
| M14 | Forum (always last) | 75.0 | 40.0 |
| M15 | Site Marking | 20.0 | 10.0 |

---

## FEATURE ROADMAP STATUS

**Total implemented: 253 / 3000**

### Sessions completed:
| Session | File | Features | Running total |
|---------|------|---------|---------------|
| Baseline | all | 106 | 106 |
| Session 1 | path_simulation.py | 47 | 153 |
| Session 2 | tactical_hud.py | 29 | 182 |
| Session 3 | fll_engine.py | 32 | 214 |
| Session 4 | mission_editor.py | 19 | 233 |
| Session 5 | all (sync/theme/diag) | 20 | 253 |

### Session 5 features:
- **BUG-SYNC-001 FIXED**: MissionSyncManager rewritten with real gspread integration
- **BUG-SYNC-002 FIXED**: push_payload no longer calls sheet.clear() (was wiping data)
- Mission dataclass: added start_x/y, end_x/y, approach_angle, precision_req fields
- MissionSyncManager: xlsx export/import fallback (openpyxl)
- launcher.py: Silver Wolf HSR theme replaces Catppuccin Mocha
- launcher.py: SYNC button in status bar
- tactical_hud.py: SYNC button in top bar
- diagnostic_dashboard.py: CPU sparkline (J08), process memory (J09)
- diagnostic_dashboard.py: Cloud sync status panel
- diagnostic_dashboard.py: Performance Timeline tab (J18) with rolling graphs
- framework_adapter.py: CodeEmitter class for structured Pybricks code generation

### Features implemented (by code):
**path_simulation.py (Session 1):**
B10-B16, B18, B21-B22, B24, B31, B33-B34, B40-B41, B43-B44,
C14-C17, C22-C29, C31-C32, C41, C43, F13-F18, F23-F24,
L06-L15, M03-M05, O06-O09

**tactical_hud.py (Session 2):**
A11-A22, A24, A26-A28, B15, B23, B25-B26, B29,
K08, K11-K12, K15, K17-K18, K20, K22-K23

**fll_engine.py (Session 3):**
G07-G16, G31-G32, F10, F13-F15, K09, K14, K16, K28-K29,
T02-T03, T06-T08, T10-T14, T16-T17

**mission_editor.py (Session 4):**
C11-C13, C19-C21, D01-D05, D07, N05-N07, O06, O08

### Next sessions planned:
| Session | File | Count | Features |
|---------|------|-------|---------|
| Session 6 | `spike_code_merger.py` | 21 | E09-E14, E16-E30 |
| Session 7 | `launcher.py` + `config.py` | 20 | K13, K19, T09, T12, T15, N03-N04, N09, R06-R10, I05, I12, N26-N28, G11, R11 |
| Session 8+ | See MASTER_DOCUMENT_UPDATE_2.md | 2000 | U01-U50 through AT01-AT50 |

---

## ARCHITECTURE RULES (NEVER BREAK THESE)

1. `from __future__ import annotations` **must be line 1** of every file
2. **Never** `self.logging` (shadows stdlib) — always `self.logger`
3. **Never** `logging.getlogging(...)` — correct is `logging.getLogger(...)`
4. **Never** assign `logging = logging.getLogger(...)` in a function body
5. **Never** `matplotlib.pyplot` in any View file — use `fig.clf()` in `destroy()`
6. `DiagnosticsDashboard` must remain `tk.Frame` (not Toplevel)
7. **Never** `PracticeTracker.log_run(...)` — method is `add_run(RunResult(...))`
8. **Never** `MagicMock()` as Tkinter widget parent in tests — use real `tk.Tk()`
9. `TacticalHUD` and `MissionEditor` frames require `.place(relx=0, rely=0, relwidth=1, relheight=1)` in launcher
10. `SparklineGraph` must NOT use `self._w` or `self._h` (shadows `tk.Canvas._w`)
11. **MVC contract:** `path_simulation.py` imports nothing from Tkinter/Matplotlib
12. All new features must have a unit test
13. `from __future__ import annotations` on line 1 — verified by AST parse before delivery

---

## SYSTEM_PROMPT RULES (from SYSTEM_PROMPT.md v51.0.0)

- Every file delivered must pass `ast.parse()` before output
- Recursive self-critique required: at least 100 good + 100 bad items when asked
- Feature checklist pattern: `("label", "pattern_in_source")` verified programmatically
- Changelog and `__version__` must be bumped with every change
- All `after()` IDs must be cancelled in `destroy()`

---

## BUGS FIXED THIS SESSION

| ID | File | Fix |
|----|------|-----|
| BUG-SYNC-001 | path_simulation.py | MissionSyncManager was a stub — rewritten with real gspread auth |
| BUG-SYNC-002 | path_simulation.py | push_payload called sheet.clear() wiping all data — now uses targeted range update |

## KNOWN OPEN ISSUES (not yet fixed)

| ID | File | Issue |
|----|------|-------|
| STYLE-001 | tactical_hud.py | ToolTip `<Destroy>` binding missing — orphaned tooltips |
| B001 | tactical_hud.py | `TacticalTheme.BORDER = "rgba(...)"` — invalid Tkinter colour |
| B017 | tactical_hud.py | `_setup_field` resets map alpha to 0.6, ignoring CalibrationTab value |
| B029 | tactical_hud.py | `_replay_last_route` calls `optimize_route()` not `_replay_history` |
| B052 | tactical_hud.py | `_set_field_theme` uses `_minor` attribute that doesn't exist on mpl lines |
| B063 | tactical_hud.py | `_build_stacked_bar` referenced in AnalyticsTab but not implemented |

---

## HOW TO RESUME

Say one of these to continue:

- **"session 5 — diagnostic_dashboard"** — 25 features: J06-J20, J28, J37-J42, F19-F22, P05
- **"session 6 — spike_code_merger"** — 21 features: E09-E14, E16-E30
- **"session 7 — launcher + config"** — 20 features: K13, K19, N03-N09, R06-R10, I05, I12, N26-N28
- **"fix [bug ID]"** — fix a specific known issue
- **"continue feature roadmap"** — pick next batch automatically

---

## SW×HERTA COLOUR PALETTE (from path_simulation.py class SW)

```python
VOID="#06040F", BASE="#0D0820", PANEL="#130E2E", SURFACE="#1C1540"
PURPLE="#7B2FFF", VIOLET="#9B6DFF", PURPLE_DIM="#3D1680", GLITCH="#C060FF"
ICE="#00D4FF", ICE_DIM="#0080AA", ICE_PALE="#B8F0FF", PUPPET="#8EC5D6"
HACK="#00FF88", HACK_DIM="#00883C", GOLD="#FFD700", GOLD_DIM="#AA8C00"
DANGER="#FF3366", WARN="#FFAA00", TEXT="#E0D4FF", SUBTEXT="#7A6EA8"
BORDER="#2D1B60", BORDER_ACT="#7B2FFF", CIRCUIT="#160E38"
```

---

## TOKEN SCORE TABLE (FLL 2026 non-linear)

```python
TOKEN_SCORE = {6: 50, 5: 50, 4: 35, 3: 25, 2: 15, 1: 10, 0: 0}
```

M03+M04 are a COMBO — visited once for 70 pts. M14 (Forum) is always last.

---

## WHAT WAS DONE THIS FINAL SESSION

1. **diagnostic_dashboard.py** — Fixed `self._w` → `self._width` / `self._h` → `self._height` in `SparklineGraph` (was shadowing `tk.Canvas._w`, causing `TclError: bad argument "300"` in Python 3.14)

2. **tactical_hud.py** — Complete HSR redesign:
   - `TacticalTheme` replaced with authentic HSR palette (void-black, SW purple, Herta ice)
   - `bind_hover` upgraded with `hover_fg` parameter
   - CalibrationTab: all 4 params now have range sliders (Scale 0.1–3.0, Shift ±50cm)
   - Opacity slider fully wired to `map_imshow.set_alpha()` — was broken
   - `_apply_calib` now handles opacity + scale + shift + brightness in one call
   - Field map: void-black background, SW purple boundary, Herta cyan mat
   - Route colours: ICE=fits, DANGER=overtime, WARN=collision
   - Tab buttons: HSR dark base with luminous active state
   - Dock headers with ◈/◎/✦ glyphs and per-section accent colours
   - Top bar with 1px luminous accent border line
   - `_SELF_CRITIQUE` dict with 100 good + 100 bad items

3. **mission_editor.py** — Session 4 (19 features):
   - WorkspaceTheme replaced with HSR palette
   - C11-C13: cloud sync, manual sync, Excel fallback
   - C19-C21: drag-drop reorder, duplicate, bulk nudge
   - D01-D08: full attachment profile system (create, save/load JSON, assign, conflict detect, exchange planning, schedule display)
   - N05-N07: font scaling (0.8–1.4×), high-contrast, Okabe-Ito colourblind palette
   - O06/O08: form input validation with length limits

4. **fll_engine.py** — Fixed `_round_number` AttributeError (state vars moved before `_build_main_area()`)
