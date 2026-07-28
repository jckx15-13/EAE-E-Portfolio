# FLL 2026 UNEARTHED — Master Project Document
**Version:** v49.0.0 | **Last Updated:** March 2026 | **Status:** Active Development

> This is the single source of truth for the entire project. It replaces:
> README.md · ARCHITECTURE.md · FIELD_SPECS.md · PROJECT_STATUS.md ·
> TODO.md · HANDOFF_BRIEF.md · CHANGELOG.md · REQUIREMENTS.txt

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Quick Start](#2-quick-start)
3. [File Structure](#3-file-structure)
4. [Architecture](#4-architecture)
5. [Field Specifications](#5-field-specifications)
6. [UI Design System — Honkai Star Rail Theme](#6-ui-design-system--honkai-star-rail-theme)
7. [Animation Framework](#7-animation-framework)
8. [Physical Attachment & Mission Solving System](#8-physical-attachment--mission-solving-system)
9. [UX & Window Behaviour Rules](#9-ux--window-behaviour-rules)
10. [1000 Feature Roadmap](#10-1000-feature-roadmap)
11. [Bug Tracker](#11-bug-tracker)
12. [Changelog](#12-changelog)
13. [Dependencies](#13-dependencies)
14. [Framework Integration Hooks](#14-framework-integration-hooks)
15. [Development Guidelines](#15-development-guidelines)
16. [Testing Strategy](#16-testing-strategy)
17. [Deployment](#17-deployment)
18. [Handoff Brief](#18-handoff-brief)

---

## 1. PROJECT OVERVIEW

**What it is:**
A production-grade Python desktop application for planning, simulating, and
executing FIRST Lego League 2026 UNEARTHED robot strategies. It runs entirely
offline on school laptops, visualizes the competition field, solves the
mission routing problem, generates Pybricks deployment scripts, manages
physical robot attachments, and provides real-time match analytics.

**Target users:**
- FLL student teams (ages 9–16)
- Coaches and mentors
- Competition referees (read-only spectator mode)

**Technology stack:**
Python 3.10+ · Tkinter + ttk · Matplotlib (OOP, TkAgg) · NumPy · Pandas ·
Pillow · optional gspread (cloud sync) · optional bleak (Bluetooth)

---

## 2. QUICK START

```bash
# Install dependencies
pip install -r REQUIREMENTS.txt

# Run the application
python launcher.py

# Run a specific module's test suite
python path_simulation.py test
python spike_code_merger.py test
python diagnostic_dashboard.py test
```

**Controls:**
| Action | How |
|--------|-----|
| Toggle mission on/off | Click the dot on the field map |
| Sync Google Sheets | SYNC NOW button |
| Start match timer | [T] START button |
| Save calibration | SAVE ✓ button |
| Open diagnostics | Ctrl+D |
| Undo / Redo | Ctrl+Z / Ctrl+Y |
| Switch to editor | MISSION EDITOR button |
| Switch to HUD | OVERWATCH button |

---

## 3. FILE STRUCTURE

```
Simulation Testing/             ← Working directory
├── launcher.py                 v47.0.0  MVC Controller, entry point
├── tactical_hud.py             v48.0.0  View: field map, route, animation
├── mission_editor.py           v47.2.0  View+Controller: mission CRUD
├── path_simulation.py          v49.0.0  Model: FLLBrain, TSP, domain logic
├── diagnostic_dashboard.py     v47.1.0  Auxiliary: profiler, node graph
├── spike_code_merger.py        v48.0.0  Headless CLI: CSV→Pybricks compiler
├── config.py                   v1.1.0   Shared constants, themes, fonts
├── cloud_settings.json                  Google Cloud project config
├── calibration.json                     Viewport offset calibration
├── runtime_stats.json                   Auto-generated performance data
└── logs/
    └── launcher.log                     Rotating application log

../[FLL]/                       ← Parent folder (outside repo)
├── service_account.json        ← Google OAuth credentials (NEVER commit)
├── fll_map.png                 ← Field background image
├── fll-challenge-unearthed-wireframe.pdf
├── FLL_Mission_Data.xlsx       ← Offline fallback data
└── attachments/                ← NEW: attachment profiles folder
    ├── arm_push.json
    ├── forklift.json
    └── spinner.json
```

---

## 4. ARCHITECTURE

### 4.1 MVC Layer Contract

```
┌─────────────────────────────────────────────────────────┐
│  MODEL — path_simulation.py                             │
│  Zero GUI imports. Pure Python. Fully testable.         │
│  Emits events via brain.ui_queue (thread-safe).         │
└─────────────────────────────────────────────────────────┘
              ↕  brain.ui_queue  (queue.Queue)
┌─────────────────────────────────────────────────────────┐
│  CONTROLLER — launcher.py                               │
│  Only file that imports both Model and Views.           │
│  Polls ui_queue, routes messages, manages lifecycle.    │
└─────────────────────────────────────────────────────────┘
              ↕  method calls on tk.Frame subclasses
┌─────────────────────────────────────────────────────────┐
│  VIEW — tactical_hud.py / mission_editor.py             │
│  All Tkinter widgets and Matplotlib figures.            │
│  Never mutates model directly.                          │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Threading Model

```
┌──────────────────────────────────────────┐
│ DAEMON THREADS                           │
│  BluetoothTelemetryManager._worker()     │
│  MissionSyncManager.run_sync_loop()      │
│  FLLBrain.ThreadPoolExecutor workers     │
│                                          │
│  → NEVER touch any Tkinter widget        │
│  → ONLY push to brain.ui_queue           │
└──────────────────────────────────────────┘
                    ↓  queue.Queue
┌──────────────────────────────────────────┐
│ MAIN THREAD (Tkinter event loop)         │
│  launcher._poll_async_queue()            │
│    runs every 16ms (active) / 250ms idle │
│    → dispatches to view public APIs      │
│    → NEVER walks widget tree             │
└──────────────────────────────────────────┘
```

### 4.3 Rendering Rules

1. **Never call `_render_missions()` from a background thread.**
   Background threads push to `brain.ui_queue`; the main thread polls.

2. **`ax.cla()` + `_setup_axes()` for every redraw.**
   Do not use `art.remove()` — matplotlib artist removal is fragile.

3. **`fig.text()` created ONCE in `__init__`, updated with `.set_text()` only.**
   Recreating text artists on every redraw causes dpi crash on window resize.

4. **`set_xlim/ylim` ONLY in `_setup_axes()`.**
   Prevents coordinate system jitter during redraws.

5. **True blitting for the scrubber animation.**
   Use `copy_from_bbox` + `restore_region` + `blit` — never full `draw()`.

### 4.4 Module Hierarchy

```
path_simulation.py  (Model — all domain logic)
├─ Submodule 0: Core Config & Constants
│   ├─ APP_VERSION, FIELD_X_MAX/Y_MAX, ROBOT_HOME_X/Y
│   ├─ TerminalColors (TC)
│   └─ format_time_dynamic / format_duration (alias)
├─ Submodule 1: Custom Exceptions
│   └─ CoreEngineError → SecurityValidationError → OutOfBoundsError …
├─ Submodule 2: Profiling & Logging
│   └─ RuntimeStatisticsCollector (timed decorator + record_and_print)
├─ Submodule 3: Calibration Engine
│   ├─ FieldCalibrationProfile (dataclass)
│   └─ CalibrationManager (JSON persistence)
├─ Submodule 4: Security & Sanitization
│   └─ SecuritySanitizer
├─ Submodule 5: Domain Data Classes
│   ├─ Mission, Sortie, AttachmentProfile, MissionState
│   ├─ RouteStatistics, Obstacle variants
│   └─ MissionSyncManager
├─ Submodule 6: Path Planning
│   ├─ AStarPlanner
│   ├─ KinematicCostCalculator
│   ├─ _tsp_held_karp (exact, ≤12 missions)
│   ├─ _tsp_nearest_neighbor_2opt (heuristic)
│   └─ RoutingEngine
├─ Submodule 7: Code Generation
│   └─ CodeGenerationFactory (Pybricks / EV3 / SPIKE3)
└─ Submodule 8: FLLBrain (master model)
    ├─ brain.get_missions() / optimize_route() / undo() / redo()
    ├─ brain.ui_queue  ← only cross-thread communication channel
    └─ brain.shutdown()

tactical_hud.py  (View — read-only field dashboard)
mission_editor.py  (View+Controller — mission CRUD, map clicks)
diagnostic_dashboard.py  (Auxiliary View — profiler, node graph)
spike_code_merger.py  (CLI — CSV → Pybricks script)
launcher.py  (MVC Controller — entry point)
config.py  (Shared constants — theme, fonts, geometry)
```

### 4.5 Part 1 / Part 2 Isolation

**Part 1 (Display Engine)** must work when `scipy` / `networkx` are absent.

**Part 2 (Path Optimizer)** guards:
```python
try:
    from scipy.spatial.distance import cdist
    from networkx import minimum_spanning_tree
    _PART2_AVAILABLE = True
except ImportError:
    _PART2_AVAILABLE = False
```
All Part 2 code checks `if _PART2_AVAILABLE` before executing.
Deleting Part 2 entirely: Part 1 continues without errors.

---

## 5. FIELD SPECIFICATIONS

### 5.1 Physical Dimensions

| Item | Measurement |
|------|-------------|
| Competition mat | 2019 mm × 1137 mm |
| Playing field | 2400 mm × 1200 mm (240 cm × 120 cm) |
| 1 field unit | 1 cm |
| Origin | Bottom-left corner (0, 0) |
| Top-right | (240, 120) |
| Field diagonal | ≈ 268.3 cm |

### 5.2 Coordinate System

```
     y
     ↑
120  ┌─────────────────────────────────────┐
     │           Field (240 × 120 cm)      │
 60  │              (120, 60)              │
     │                 ●                   │
  0  └─────────────────────────────────────┘ → x
     0                                   240
```

### 5.3 Coordinate Conversion (Google Sheets ↔ Field)

Google Sheets uses center-origin; the engine uses corner-origin.

```python
field_x = sheet_x + 120   # shift right by half width
field_y = sheet_y + 60    # shift up by half height

sheet_x = field_x - 120
sheet_y = field_y - 60
```

### 5.4 Start Zones

| Zone | X range | Y range | Color |
|------|---------|---------|-------|
| Red (left) | 0–80 | 0–20 | rgba(1, 0, 0, 0.2) |
| Blue (right) | 160–240 | 0–20 | rgba(0, 0, 1, 0.2) |

Robot starts with back touching y=0 wall, entirely within chosen zone.
Default robot home: (20, 20).

### 5.5 Mat Visualization Overlay

```python
mat_width  = 201.9   # 2019mm → cm
mat_height = 113.7   # 1137mm → cm
mat_x = (240 - mat_width)  / 2  # = 19.05 cm
mat_y = (120 - mat_height) / 2  # = 3.15 cm
# Rectangle: bottom-left (19.05, 3.15), size 201.9 × 113.7
```

### 5.6 Robot Kinematics

| Parameter | Value |
|-----------|-------|
| Straight speed (avg) | 40 cm/s |
| Straight speed (slow/precise) | 20 cm/s |
| Straight speed (sprint) | 60 cm/s |
| 90° turn time | ≈ 0.5 s |
| 180° turn time | ≈ 1.0 s |
| Braking distance | ≈ 5 cm |
| Match duration | 150 s |
| Wheel diameter (SPIKE Prime) | 56 mm |
| Axle track (SPIKE Prime) | 117 mm |

### 5.7 Grid Lines

- Major: every 30 cm (0, 30, 60, 90, 120, 150, 180, 210, 240)
- Minor: every 10 cm

### 5.8 Calibration File

`calibration.json` — aligns background image to coordinate system:
```json
{ "x_min": -18.0, "x_max": 216.0, "y_min": -22.0, "y_max": 157.5 }
```

---

## 6. UI DESIGN SYSTEM — HONKAI STAR RAIL THEME

### 6.1 Design Philosophy

The UI adopts the aesthetic language of **Honkai: Star Rail's** in-game
interface: deep navy/void blacks with luminous cerulean accents, subtle
hexagonal and circuit-trace motifs, sharp geometric borders with glowing
edge highlights, and an overall feel of "military tactical computer meets
sci-fi express train."

This is *not* a copy of the game UI — it is an *interpretation* of its
visual grammar applied to a functional FLL strategy tool.

### 6.2 Colour Palette

```python
# ── Primary backgrounds ─────────────────────────────────────────────
HSR_VOID          = "#0A0C14"   # Deepest background (void black)
HSR_BASE          = "#0F1420"   # Base surface
HSR_PANEL         = "#141B2D"   # Panel/card background
HSR_SURFACE       = "#1C2438"   # Raised surface (buttons at rest)
HSR_SURFACE_HIGH  = "#243044"   # Elevated surface (hover)

# ── Accent / glow ───────────────────────────────────────────────────
HSR_CERULEAN      = "#4FC3F7"   # Primary accent — light blue
HSR_CERULEAN_DIM  = "#1E88E5"   # Secondary accent
HSR_CERULEAN_GLOW = "#80D8FF"   # Glow/highlight variant
HSR_GOLD          = "#FFD54F"   # Points / score / reward
HSR_GOLD_DIM      = "#FFA000"   # Subdued gold

# ── Status colours ──────────────────────────────────────────────────
HSR_SUCCESS       = "#69F0AE"   # Confirmed / active
HSR_WARN          = "#FFB300"   # Warning / near-limit
HSR_DANGER        = "#EF5350"   # Error / over-limit
HSR_MAUVE         = "#CE93D8"   # Scrubber ghost / secondary info

# ── Text ────────────────────────────────────────────────────────────
HSR_TEXT          = "#E8EAF6"   # Primary text
HSR_SUBTEXT       = "#90A4AE"   # Labels, secondary info
HSR_DISABLED      = "#546E7A"   # Greyed-out elements

# ── Borders and lines ───────────────────────────────────────────────
HSR_BORDER        = "#263248"   # Default border
HSR_BORDER_ACTIVE = "#4FC3F7"   # Active / focused border (glows)
HSR_CIRCUIT       = "#1A2540"   # Circuit trace pattern colour
```

### 6.3 Typography

```python
# Cross-platform font stack (platform_font() from config.py)
FONT_DISPLAY   = platform_font(16, bold=True)   # Screen titles
FONT_HEADING   = platform_font(12, bold=True)   # Section headers
FONT_BODY      = platform_font(10)              # Body text
FONT_CAPTION   = platform_font(9)               # Small labels
FONT_MONO      = platform_font(10, mono=True)   # Code, coordinates
FONT_TIMER     = platform_font(28, bold=True)   # Match countdown
```

### 6.4 Widget Styling Rules

**Borders:**
All panels use a 1px `HSR_BORDER` outline. Active/focused widgets
upgrade to `HSR_BORDER_ACTIVE` with a subtle outer glow simulated
by a 2px shadow frame in `HSR_CERULEAN_DIM` at 40% opacity.

**Buttons:**
- Rest: `HSR_SURFACE` background, `HSR_CERULEAN` text
- Hover: `HSR_SURFACE_HIGH` background + `HSR_CERULEAN_GLOW` border
- Press: brief flash to `HSR_CERULEAN` background + `HSR_VOID` text
- Disabled: `HSR_SURFACE` + `HSR_DISABLED` text

**Tab bar:**
Active tab: bottom border 2px `HSR_CERULEAN`, text `HSR_CERULEAN_GLOW`
Inactive tab: no border, text `HSR_SUBTEXT`
Hover: text `HSR_TEXT`, subtle 1px bottom border

**Mission dots on field map:**
- Selected: `HSR_CERULEAN_GLOW` with outer glow ring (alpha circle)
- Deselected: `HSR_DANGER` dim
- Hovered: scale up 20% + brighter colour
- Robot home: `HSR_GOLD` triangle marker

**Field map background:**
Brightness boost to 35% (1.35 multiplier), then apply a subtle
`HSR_VOID` vignette overlay at 15% opacity to make mission markers
pop against the field image.

**Status bar:**
`HSR_VOID` background, `HSR_CIRCUIT` hairline top border,
left text `HSR_SUBTEXT`, right text `HSR_CERULEAN` (clock).

### 6.5 Decorative Motifs

**Corner brackets:** Every dock panel has geometric corner marks:
```
╔═ TACTICAL OVERWATCH ═══════════════════╗
║                                        ║
╚════════════════════════════════════════╝
```
Rendered as `tk.Canvas` lines in `HSR_CERULEAN_DIM`.

**Scan-line overlay:** A very subtle horizontal line pattern
(1px `HSR_BORDER` every 4px, 5% opacity) over the Matplotlib canvas
frame — gives a retro-CRT feel consistent with the game's UI.

**Hex grid pattern:** The right-side control panel background
shows a faint hexagonal grid at 3% opacity in `HSR_CIRCUIT`.

### 6.6 Dark Title Bar (Windows)

```python
import ctypes
hwnd = ctypes.windll.user32.GetParent(root.winfo_id())
ctypes.windll.dwmapi.DwmSetWindowAttribute(hwnd, 20,
    ctypes.byref(ctypes.c_int(1)), ctypes.sizeof(ctypes.c_int))
```

---

## 7. ANIMATION FRAMEWORK

### 7.1 Principles

All animations use `widget.after()` — never `time.sleep()`. Every
animation is a lightweight state machine with three phases:
**enter → hold → exit**, each with configurable duration and easing.

### 7.2 Easing Functions

```python
def ease_out_cubic(t: float) -> float:
    """t in [0,1] → smooth deceleration."""
    return 1 - (1 - t) ** 3

def ease_in_out_quad(t: float) -> float:
    return 2*t*t if t < 0.5 else 1 - (-2*t + 2)**2 / 2

def ease_spring(t: float, damping: float = 0.3) -> float:
    """Slight overshoot then settle — good for panel slides."""
    import math
    return 1 - math.exp(-damping * t * 10) * math.cos(t * math.pi * 3)
```

### 7.3 Animation Classes

**`FadeTransition`** — cross-fade between views.
Both frames overlaid; opacity of outgoing frame decays from 1→0 over
200ms via scheduled `wm_attributes("-alpha", ...)` on a Toplevel proxy.

**`SlidePanel`** — side panel slide in/out.
Panel starts at `x = -panel_width`, animates to `x = 0` via
`place(x=current_x)` updates every 16ms. Uses `ease_out_cubic`.

**`PulseGlow`** — mission dot "breathing" highlight.
Selected mission dots pulse their alpha between 0.6→1.0→0.6 on a
2-second cycle. Implemented as a continuous `after(50, ...)` loop
that updates `scatter.set_alpha()` then calls `canvas.draw_idle()`.

**`CountdownFlash`** — timer colour transitions.
At 30s: text transitions from `HSR_SUCCESS` → `HSR_WARN` over 1s.
At 10s: text transitions `HSR_WARN` → `HSR_DANGER` with 500ms flash.

**`ProgressBar` sweep** — loading screen percentage fill.
The custom progress bar draws a filled rectangle that grows right
via `canvas.coords(rect_id, 0, 0, width * pct, height)` on each frame.

**`TabSlideIndicator`** — active tab bottom-border slide.
When switching tabs, the 2px `HSR_CERULEAN` bottom line slides
horizontally from old tab position to new over 150ms.

**`RouteDrawAnimation`** — path lines draw sequentially.
When `optimize_route()` completes, the arrows connecting missions
are drawn one by one (each in 80ms) rather than appearing instantly,
giving a "calculating route" feel.

**`NodeGraphBuild`** — diagnostic graph nodes appear with a pop.
Each node scales from 0→1.1→1.0 using `ease_spring` as the graph
refreshes, so the viewer can track which nodes are new.

**`SplashScreen`** — boot progress with animated logo.
3-second window with progress bar and rotating hexagonal motif.

### 7.4 Window Size Lock (Critical UX Rule)

**Problem:** switching from HUD to Mission Editor resizes the window.
**Solution:** `pack_forget()` / `pack()` is replaced with a fixed-size
frame stack. Both views are instantiated at startup and stacked on top
of each other using `place(x=0, y=0, relwidth=1, relheight=1)`.
Switching views lifts one frame to the top with `.lift()` and optionally
applies a FadeTransition. **The root window geometry never changes.**

```python
# In FLLUnifiedApp.__init__:
self.frame_stack = tk.Frame(self.container, bg=HSR_BASE)
self.frame_stack.pack(fill=tk.BOTH, expand=True)

# Both views placed at full size
self.frames["HUD"].place(in_=self.frame_stack,
                          x=0, y=0, relwidth=1, relheight=1)
self.frames["EDITOR"].place(in_=self.frame_stack,
                             x=0, y=0, relwidth=1, relheight=1)

# Switching: just lift, with optional fade
def show_hud(self):
    self.frames["HUD"].lift()
    # optionally: FadeTransition(outgoing=self.frames["EDITOR"],
    #                            incoming=self.frames["HUD"])
```

---

## 8. PHYSICAL ATTACHMENT & MISSION SOLVING SYSTEM

### 8.1 The Attachment Problem

FLL robots use interchangeable physical attachments — arms, forks,
spinners, pushers — each with:
- A mounting position on the robot (front, rear, left, right)
- A trigger mechanism (motor port, manual push, gravity drop)
- A physical footprint (width × height × depth in cm)
- A deployment time (how long the attachment takes to actuate)
- An energy cost (battery drain estimate)
- A mission dependency (which missions this attachment can complete)

The software must model these as first-class objects, plan which
attachment to mount for each mission, and flag scheduling conflicts
where two required attachments cannot coexist on the robot.

### 8.2 `AttachmentProfile` Data Model

```python
@dataclass(slots=True)
class AttachmentProfile:
    id: str                        # unique slug, e.g. "arm_push_v2"
    name: str                      # human name, e.g. "Push Arm v2"
    mount_point: str               # "front" | "rear" | "left" | "right"
    motor_port: str | None         # "Port.C" or None (passive)
    deploy_time_sec: float         # time to actuate
    retract_time_sec: float        # time to retract
    footprint_cm: tuple[float,float,float]  # (W, H, D)
    mass_g: float                  # gram weight (affects robot balance)
    compatible_missions: list[str]  # mission IDs this attachment handles
    conflicts_with: list[str]       # attachment IDs that cannot coexist
    pybricks_snippet: str           # generated code fragment
    photo_path: str | None          # optional photo of physical part
    notes: str                      # freetext notes for the team
```

### 8.3 Attachment Planner

The `AttachmentPlanner` class in `path_simulation.py`:
1. Reads all `AttachmentProfile` objects from the `attachments/` folder.
2. For each mission in the optimised route, determines which attachment
   is needed.
3. Identifies **exchange points** — positions in the route where the
   robot returns to base to swap attachments.
4. Minimises total exchange trips (an NP-hard bin-packing variant solved
   with a greedy grouping algorithm).
5. Outputs an **Attachment Schedule** — an ordered list of:
   `{mission_group, attachment_to_mount, exchange_at_step, estimated_time}`.

### 8.4 Physical Conflict Detection

Two attachments conflict if:
- `mount_point` overlap (two front attachments simultaneously)
- Combined footprint exceeds robot size limit (25 cm × 25 cm × 25 cm
  per FLL rules)
- One attachment is listed in the other's `conflicts_with` list

The UI shows conflicts as red badges in the Mission Editor's attachment
panel. The route optimiser penalises routes that require more attachment
swaps by adding `EXCHANGE_TIME_PENALTY_SEC = 15.0` per swap to the
time cost function.

### 8.5 Mission Solving Advisor

Each `Mission` object stores:
- `mission_type`: `"push" | "pull" | "lift" | "drop" | "interact" | "navigate"`
- `approach_vector`: preferred angle of approach in degrees
- `precision_required`: `"high" | "medium" | "low"`
- `scoring_condition`: human-readable string describing what must happen
- `common_failure_modes`: list of strings describing typical failure reasons
- `success_probability`: float 0–1, learned from historical run data
- `recommended_attachment`: ID of the best known attachment

The Mission Solving Advisor panel (in `mission_editor.py`, DEPLOY tab)
shows per-mission guidance:
```
[M04] BRIDGE BUILDER
  Type       : Lift
  Attachment : Forklift v1
  Approach   : 45° (northeast)
  Precision  : High
  Est. time  : 4.2 s
  Success %  : 87%
  ⚠ Failure: "overshoot on Y axis — reduce speed to 200mm/s last 5cm"
```

### 8.6 Run History & Learning

After each practice run (or after entering a competition result), the
team logs the outcome:
```python
brain.log_run_result(
    run_id = "run_042",
    total_points = 185,
    missions_completed = ["M01","M03","M04","M07"],
    time_used_sec = 142.3,
    notes = "M04 failed — arm caught on edge"
)
```

`RuntimeStatisticsCollector` aggregates these into `runtime_stats.json`
and the UI surfaces:
- Points per mission (bar chart in Analytics tab)
- Time efficiency per run (line chart)
- Most-failed missions (ranked list)
- Predicted score for current route plan (live estimate)

---

## 9. UX & WINDOW BEHAVIOUR RULES

### 9.1 Window Size Consistency

**Rule:** The root window must never change dimensions when switching views.

**Implementation:** All views use `place()` with `relwidth=1, relheight=1`
on a shared `frame_stack` container. `pack()` and `pack_forget()` are
prohibited for view switching. See Section 7.4 for code.

**Minimum size:** 1024 × 600 px (enforced by `root.minsize()`).
**Default size:** 85% of screen dimensions.
**Resize:** Fully responsive — all panels use `grid(weight=1)`.

### 9.2 Responsive Layout Rules

- `grid_columnconfigure(n, weight=1)` on every resizable row/column.
- No hardcoded pixel widths/heights except minimum thresholds.
- Matplotlib canvas DPI = `winfo_fpixels('1i') / 100` (device-aware).
- Text truncation with `…` for labels when space is tight —
  never overflow or clip silently.

### 9.3 Interaction Feedback Rules

Every interactive element must give feedback within 16ms:

| Trigger | Response |
|---------|----------|
| Button hover | Background colour change + cursor `hand2` |
| Button click | Press animation (50ms colour flash) |
| Mission dot hover | Scale up 20%, show tooltip with mission name + points |
| Mission dot click | Immediate visual toggle + `ding` sound (optional) |
| Map drag | Live crosshair cursor + coordinate readout in status bar |
| Long operation (>500ms) | Indeterminate progress bar + disable all buttons |
| Error | Shake animation on the affected widget (3 cycles, 100ms each) |
| Undo/Redo | Brief flash on changed elements |

### 9.4 Tooltip Rules

`ToolTip.show()` must:
1. Wrap `widget.bbox("insert")` in `try/except TclError` with `(0,0,0,0)` fallback.
2. Appear after 500ms hover delay.
3. Dismiss on `<Leave>`, `<ButtonPress>`, or `<Destroy>`.
4. Respect screen boundaries — if tooltip would go off-screen right, it flips left.
5. Style: `HSR_PANEL` background, `HSR_BORDER_ACTIVE` border, `HSR_TEXT` text.

### 9.5 Focus & Keyboard Navigation

- Tab order follows top-to-bottom, left-to-right visual layout.
- All buttons reachable by keyboard (no mouse-only actions).
- `Escape` dismisses any open dialog, tooltip, or expanded panel.
- `F5` refreshes (re-runs route optimisation + re-renders field).

### 9.6 Status Bar Content

Left → right:
`[filename] · [row count] missions · [route distance] cm · [est. time] s · [memory] MB`
Right-aligned: `[clock]`

---

## 10. 1000 FEATURE ROADMAP

> Features are grouped into 20 themes of 50 each.
> Priority tiers: 🔴 P0 (next sprint) · 🟡 P1 (this quarter) · 🟢 P2 (backlog)

---

### THEME A — FIELD VISUALISATION (50 features)

🔴 A01. Real FLL mat overlay box (2019 × 1137 mm, dashed orange border)
🔴 A02. Red start zone shading (x:0–80, y:0–20, 20% opacity)
🔴 A03. Blue start zone shading (x:160–240, y:0–20, 20% opacity)
🔴 A04. Robot home position marker (gold triangle at home coords)
🔴 A05. Field map brightness slider (0.5×–2.0× real-time adjustment)
🔴 A06. Field map contrast slider
🔴 A07. Major grid lines every 30 cm (dark, alpha 0.4)
🔴 A08. Minor grid lines every 10 cm (light, alpha 0.2)
🔴 A09. Grid toggle button (show/hide)
🔴 A10. Coordinate tooltip on mouse hover (live x, y readout)
🟡 A11. Mission dot label toggle (show/hide mission names on field)
🟡 A12. Mission dot size scaling (small/medium/large)
🟡 A13. Radar coverage rings (30 cm radius around each selected mission)
🟡 A14. Mission dot click-through to editor form (direct edit on click)
🟡 A15. Field map rotation (0°, 90°, 180°, 270°)
🟡 A16. Mirror field horizontally (for blue alliance view)
🟡 A17. Mirror field vertically
🟡 A18. Zoom in/out on field map (mouse scroll)
🟡 A19. Pan field map (middle-mouse drag)
🟡 A20. Reset zoom/pan button
🟡 A21. Rulers along X and Y axes (tick marks with cm labels)
🟡 A22. Measurement tool (click two points, show distance + heading)
🟡 A23. Area measurement tool (polygon draw, show area in cm²)
🟡 A24. Obstacle zone drawing (click to place rectangle/circle obstacles)
🟡 A25. Obstacle transparency toggle
🟢 A26. Field background theme toggle (photo / schematic / blank)
🟢 A27. Night mode field (dark map for low-light team rooms)
🟢 A28. High-contrast mode (for colourblind team members)
🟢 A29. Print field diagram to PDF with mission labels
🟢 A30. Export field screenshot (PNG, SVG, PDF) at user-chosen DPI
🟢 A31. Bookmarked field views (save/restore zoom+pan positions)
🟢 A32. Field annotation layer (freehand draw with stylus/mouse)
🟢 A33. Annotation eraser
🟢 A34. Multiple annotation layers (one per run attempt)
🟢 A35. 3D field view toggle (isometric projection of mission heights)
🟢 A36. Mission height encoding (z-axis represented by dot size)
🟢 A37. Heatmap overlay (most-visited field zones by route history)
🟢 A38. Path frequency map (line thickness by how often each segment used)
🟢 A39. Field mini-map in corner (thumbnail showing full field during zoom)
🟢 A40. Grid snap mode for mission placement (snap to 5 cm grid)
🟢 A41. Team colour themes (red alliance / blue alliance colour coding)
🟢 A42. Score zone highlighting (colour field zones by achievable points)
🟢 A43. Time zone highlighting (colour zones by travel time from home)
🟢 A44. Risk zone highlighting (colour zones by obstacle density)
🟢 A45. Quadrant labels (Q1 top-right … Q4 bottom-left)
🟢 A46. Distance circle tool (click point, drag to show range circle)
🟢 A47. Field PDF import drag-and-drop (auto-calibrate to standard dims)
🟢 A48. Multi-field view (practice field vs competition field side by side)
🟢 A49. Field change history (show how missions moved between sessions)
🟢 A50. Live field image from overhead USB camera (OpenCV integration)

---

### THEME B — ROUTE OPTIMISATION (50 features)

🔴 B01. Nearest-neighbour TSP with 2-opt improvement
🔴 B02. Held-Karp exact TSP for ≤12 missions
🔴 B03. Route total distance display (cm)
🔴 B04. Route estimated time display (seconds)
🔴 B05. Route total achievable points display
🔴 B06. Fits-in-time indicator (green/red badge — does route fit 150 s?)
🔴 B07. Route arrow animation (sequential draw, 80ms per segment)
🔴 B08. Robot ghost animation along route (scrubber dot)
🔴 B09. Scrubber timeline (drag to any point in the route)
🟡 B10. Multi-run route planning (run 1 → base → run 2 → base)
🟡 B11. Attachment exchange cost modelling (add 15 s per swap)
🟡 B12. Route segments coloured by time remaining at that point
🟡 B13. Optimise by points (maximise score, ignore time if fits)
🟡 B14. Optimise by time (fastest possible route)
🟡 B15. Optimise by reliability (prefer high-success-rate missions)
🟡 B16. Weighted multi-objective optimisation (slider: time↔points↔reliability)
🟡 B17. A* obstacle avoidance (route automatically navigates around obstacles)
🟡 B18. Forbidden zone support (mark zones robot must avoid)
🟡 B19. Approach angle constraint per mission (robot must arrive from set direction)
🟡 B20. Home base return constraint (robot must return before time limit)
🟡 B21. Mandatory mission support (flag missions as "must complete")
🟡 B22. Mission priority ordering (drag to re-sequence, optimizer respects order)
🟡 B23. Route comparison mode (show 2 routes side by side)
🟡 B24. Route sensitivity analysis (how much does 1 cm change affect time?)
🟡 B25. Export route as CSV (mission name, x, y, arrival time, points)
🟡 B26. Export route as JSON
🟡 B27. Route sharing via QR code (encode route as compact string)
🟡 B28. Import route from QR code scan
🟡 B29. Route replay from run history (re-show any previous route)
🟡 B30. Route diff (show what changed between two route versions)
🟢 B31. Simulated annealing TSP variant (better for large mission sets)
🟢 B32. Genetic algorithm TSP (slow but optimal for ≥16 missions)
🟢 B33. Probabilistic scoring (route expected points considering failure %)
🟢 B34. Monte Carlo simulation (run route 1000 times, show score distribution)
🟢 B35. Adaptive route during match (suggest re-routing if a mission fails)
🟢 B36. Parallel route computation (compute top-5 routes simultaneously)
🟢 B37. Route "what-if" mode (temporarily add/remove missions, see impact)
🟢 B38. Route constraint templates (save/load constraint presets)
🟢 B39. Route lock mode (lock current route, prevent accidental changes)
🟢 B40. Route naming and tagging (save as "Conservative", "Aggressive", etc.)
🟢 B41. Route library (store up to 20 named routes per session)
🟢 B42. Route statistics export (PDF report with charts)
🟢 B43. Time window constraints (mission X must be completed before t=90s)
🟢 B44. Dependency constraints (mission B requires mission A to be done first)
🟢 B45. Fuel/battery model (route rejected if estimated power exceeds threshold)
🟢 B46. Route execution risk score (composite reliability score 0–100)
🟢 B47. Head-to-head comparison (two team routes on same field simultaneously)
🟢 B48. Route narration mode (text description of each segment)
🟢 B49. Route voice readout (text-to-speech step-by-step)
🟢 B50. Route QR code for tablet display at competition

---

### THEME C — MISSION MANAGEMENT (50 features)

🔴 C01. Add mission via form (name, x, y, points, time)
🔴 C02. Add mission via map click (click on field to place)
🔴 C03. Delete mission with confirmation dialog
🔴 C04. Edit mission inline in accordion list
🔴 C05. Undo/redo for all mission changes (memento stack)
🔴 C06. Mission selection toggle (click dot to include/exclude from route)
🔴 C07. Select all / deselect all
🔴 C08. Inverse selection
🔴 C09. CSV import (name, x, y, points, time columns)
🔴 C10. CSV export of current mission set
🟡 C11. Google Sheets sync (background daemon, 5 s interval)
🟡 C12. Manual sync button
🟡 C13. Offline fallback to Excel file
🟡 C14. Mission search by name (filter accordion list)
🟡 C15. Mission sort by name / points / distance / time
🟡 C16. Mission colour coding by category (navigate / interact / deploy)
🟡 C17. Mission notes field (freetext, per mission)
🟡 C18. Mission photo attachment (link to image of physical mission model)
🟡 C19. Drag-and-drop mission reordering in accordion list
🟡 C20. Mission duplicate (copy existing mission to new position)
🟡 C21. Bulk coordinate nudge (shift all selected missions by ΔX, ΔY)
🟡 C22. Mission grouping by run (group into Run 1 / Run 2 / Run 3)
🟡 C23. Mission status tracking (planned / attempted / completed / failed)
🟡 C24. Mission completion rate display (% success over practice runs)
🟡 C25. Mission point contribution chart (bar chart in Analytics tab)
🟢 C26. Mission template library (import standard FLL 2026 missions)
🟢 C27. Mission validation (warn if coordinates outside field bounds)
🟢 C28. Mission conflict detection (two missions at same location)
🟢 C29. Mission merge (combine two partial missions into one)
🟢 C30. Mission split (divide a complex mission into sub-tasks)
🟢 C31. Mission dependency tree view (show which missions depend on others)
🟢 C32. Mission time estimate from robot kinematics (auto-calculate)
🟢 C33. Mission approach direction input (for approach vector planning)
🟢 C34. Mission precision requirement tag (high/medium/low)
🟢 C35. Mission scoring condition (text description of what triggers points)
🟢 C36. Mission failure modes library (common failure reasons)
🟢 C37. Mission season archive (import missions from previous FLL seasons)
🟢 C38. Mission import from FLL official challenge card (OCR/manual)
🟢 C39. Mission print card (A4 reference sheet with all mission details)
🟢 C40. Mission QR code (encode mission details for tablet reference)
🟢 C41. Mission difficulty rating (1–5 stars, team assigns)
🟢 C42. Mission fun rating (team morale metric)
🟢 C43. Mission time window constraint (must complete in first 90 seconds)
🟢 C44. Mission repeatability flag (can this mission be attempted twice?)
🟢 C45. Mission partial credit (model missions that give partial points)
🟢 C46. Mission co-location bonus (bonus points for completing nearby missions)
🟢 C47. Mission unlock dependency (completing A unlocks B)
🟢 C48. Referee scoring rubric import (official challenge PDF parsing)
🟢 C49. Mission archive / unarchive (hide completed missions from active view)
🟢 C50. Mission changelog (track who changed what and when)

---

### THEME D — PHYSICAL ATTACHMENT SYSTEM (50 features)

🔴 D01. Attachment profile creator (name, mount, motor port, deploy time)
🔴 D02. Attachment profile JSON save/load
🔴 D03. Attachment-to-mission assignment (mark which attachment does each mission)
🔴 D04. Attachment conflict detector (two attachments on same mount)
🔴 D05. Attachment exchange point planner (where to return to base for swap)
🔴 D06. Exchange time cost in route optimiser (15 s per swap default)
🔴 D07. Attachment schedule display (ordered list of mount/dismount steps)
🔴 D08. Pybricks code snippet per attachment (auto-inserted in generated script)
🟡 D09. Attachment footprint dimension input (W × H × D in cm)
🟡 D10. Robot size limit validation (warn if attachments exceed 25 cm cube)
🟡 D11. Attachment mass input (affects balance/turning calculations)
🟡 D12. Attachment photo viewer (display team photo of physical attachment)
🟡 D13. Attachment notes field (build notes, lessons learned)
🟡 D14. Attachment version history (v1, v2 iterations of same design)
🟡 D15. Attachment compatibility matrix (table showing which missions each fits)
🟡 D16. Attachment library (shared bank of saved profiles)
🟡 D17. Attachment QR code (scan to load profile on another device)
🟡 D18. Attachment print card (reference sheet for team to use at competition)
🟡 D19. Motor port assignment validation (each port used only once)
🟡 D20. Passive attachment support (gravity-drop, no motor port)
🟢 D21. Attachment rehearsal mode (step through attachment exchange procedure)
🟢 D22. Attachment change timer (stopwatch for team to practice exchanges)
🟢 D23. Attachment diagram editor (simple ASCII art or SVG diagram)
🟢 D24. LEGO part count estimator (rough beam/pin count per attachment)
🟢 D25. Attachment weight calculator (LEGO part database lookup)
🟢 D26. Centre-of-mass estimator (with all attachments mounted)
🟢 D27. Turning radius adjustment (heavier robot turns wider)
🟢 D28. Attachment colour coding in route (route segments coloured by attachment)
🟢 D29. Attachment swap visualisation on field map (base visits shown)
🟢 D30. Attachment success rate tracking (per attachment, per mission)
🟢 D31. Attachment reliability score (composite based on run history)
🟢 D32. Attachment improvement suggestions (based on failure modes)
🟢 D33. Attachment 3D model import (OBJ/STL viewer, optional)
🟢 D34. Attachment simulation (physics-based arm movement preview)
🟢 D35. Attachment trigger timing editor (precisely tune motor timing)
🟢 D36. Attachment pre-inspection checklist (ensure rules compliance)
🟢 D37. Attachment rules compliance checker (size, weight, materials)
🟢 D38. Attachment material library (beam, angle, connector types)
🟢 D39. LEGO build instructions export (step-by-step BrickLink/LDD format)
🟢 D40. Attachment comparison tool (side by side two attachment versions)
🟢 D41. Attachment test log (record test results per attachment design)
🟢 D42. Optimal motor speed recommendation per mission
🟢 D43. Attachment warm-up sequence (stretch motors before first use)
🟢 D44. Attachment calibration routine generator (auto-align code)
🟢 D45. Gear ratio calculator (for motorised attachments)
🟢 D46. Torque requirement estimator (for push/lift missions)
🟢 D47. Attachment backup plan (if primary fails, what attachment to use)
🟢 D48. Attachment export to spike_code_merger (auto-include in deploy script)
🟢 D49. Attachment library sync across devices (cloud backup)
🟢 D50. Attachment contribution to score (points per attachment design)

---

### THEME E — CODE GENERATION (50 features)

🔴 E01. Pybricks MicroPython script generation (full deploy script)
🔴 E02. Odometry reset injection (every N cm or M commands)
🔴 E03. Motor stall try/except wrappers in generated code
🔴 E04. CLI interface (--csv, --out, --dry-run, --home)
🔴 E05. utf-8-sig CSV reading (Windows BOM stripping)
🔴 E06. Regex coordinate validation (reject non-numeric cells)
🔴 E07. Atomic file write (temp file + rename, no corrupt saves)
🔴 E08. ev3dev output format (alternative target)
🟡 E09. SPIKE 3 Scratch XML block generation
🟡 E10. Code preview in UnifiedCodeTab (syntax-highlighted, read-only)
🟡 E11. Direct export to file (save dialog)
🟡 E12. Copy generated code to clipboard
🟡 E13. Generated code line count display
🟡 E14. Estimated execution time display (from kinematics)
🟡 E15. Code diff view (show what changed from last generation)
🟡 E16. Attachment code injection (insert attachment snippets at right waypoints)
🟡 E17. Odometry threshold configurator (UI slider)
🟡 E18. Speed override per segment (slow down for high-precision missions)
🟡 E19. PID tuning parameters in generated code (configurable)
🟡 E20. Gyro calibration sequence at start of generated script
🟢 E21. Sound feedback in generated code (beep on arrival at each mission)
🟢 E22. LED colour changes in generated code (colour by mission type)
🟢 E23. Emergency stop handler in generated code
🟢 E24. Battery voltage check at start of generated script
🟢 E25. Hub button start trigger (wait for button press before run)
🟢 E26. Multi-run code generation (run 1, return, swap, run 2)
🟢 E27. Code generation presets (conservative/standard/aggressive speed profiles)
🟢 E28. Generated code version header (who generated, when, route hash)
🟢 E29. Code rollback (revert to previously generated version)
🟢 E30. Code signing (append hash for integrity check)
🟢 E31. LLSP3 archive packaging (bundle generated code into SPIKE 3 project file)
🟢 E32. EV3Lab file generation
🟢 E33. MicroPython REPL paste format (chunked for REPL buffer limits)
🟢 E34. Code simulation mode (step through generated code with field animation)
🟢 E35. Execution trace logging (robot logs position to JSON during run)
🟢 E36. Code generation from attachment schedule (full mission run with swaps)
🟢 E37. Test stub generation (unit tests for each movement function)
🟢 E38. Configuration constants extraction (robot-specific params in one block)
🟢 E39. Multi-robot code generation (two robots, coordinated)
🟢 E40. Code documentation generation (HTML/Markdown docs from generated code)
🟢 E41. Dynamic PID tuning (adjust PID from run data, regenerate)
🟢 E42. Heading correction injection (gyro recalibration at key waypoints)
🟢 E43. Colour sensor triggers in generated code
🟢 E44. Ultrasonic distance stop in generated code
🟢 E45. Touch sensor alignment in generated code
🟢 E46. Code minification (compact version for memory-limited hubs)
🟢 E47. Code obfuscation (prevent other teams reading deploy scripts)
🟢 E48. QR code of generated script for quick scan/transfer
🟢 E49. Cloud upload of generated script (auto-push to team repo)
🟢 E50. Script versioning (SemVer tags on generated files)

---

### THEME F — ANALYTICS & SCORING (50 features)

🔴 F01. Current route score display (total achievable points)
🔴 F02. Estimated route time display
🔴 F03. Time remaining after route (budget surplus/deficit in seconds)
🔴 F04. Points per second efficiency metric
🔴 F05. Route fits-in-time badge (green ✓ / red ✗)
🟡 F06. Mission point contribution bar chart
🟡 F07. Score progression over practice sessions (line chart)
🟡 F08. Time distribution pie chart (time per mission vs travel)
🟡 F09. Run history table (date, points, time, missions)
🟡 F10. Personal best score display
🟡 F11. Score prediction with confidence interval
🟡 F12. Score vs time scatter plot across all runs
🟡 F13. Mission hit rate percentage per mission
🟡 F14. Most-failed missions ranked list
🟡 F15. Average time per mission (from run history)
🟡 F16. Travel efficiency score (actual path vs optimal straight-line)
🟡 F17. Points density map (points per cm² of field)
🟡 F18. Session summary report (auto-generated after each practice day)
🟢 F19. Comparison with FLL world record scores (public data)
🟢 F20. Score normalisation by season (compare to other FLL 2026 teams)
🟢 F21. Score breakdown by attachment (which attachment earns most points)
🟢 F22. Score breakdown by run (run 1 vs run 2 vs run 3)
🟢 F23. Score trajectory (are scores improving over time?)
🟢 F24. Regression-to-mean analysis (is improvement levelling off?)
🟢 F25. Competition day score predictor (based on practice trend)
🟢 F26. Margin of victory estimator (probability of beating typical opponent)
🟢 F27. Score ceiling analysis (max possible with current mission set)
🟢 F28. Score floor analysis (guaranteed minimum even if some missions fail)
🟢 F29. Risk-adjusted score (expected value accounting for failure probability)
🟢 F30. Practice session planner (which missions to focus on to gain most points)
🟢 F31. Diminishing returns analysis (where to stop practising)
🟢 F32. Score sensitivity heatmap (which missions matter most to total score)
🟢 F33. Points-vs-effort matrix (high value / low difficulty quadrant analysis)
🟢 F34. Referee scoring simulation (step through rubric manually)
🟢 F35. Score cross-check (auto-flag if calculated score ≠ referee score)
🟢 F36. Analytics export to CSV
🟢 F37. Analytics export to Excel
🟢 F38. Analytics export to PDF (formatted report)
🟢 F39. Coach dashboard view (high-level metrics, no technical details)
🟢 F40. Live score entry during competition (update actual scores)
🟢 F41. Actual vs planned score comparison
🟢 F42. Time pressure index (what % of time budget is used)
🟢 F43. Consistency metric (standard deviation of scores across runs)
🟢 F44. Breakeven analysis (minimum score needed to advance at competition)
🟢 F45. Historical trend line (linear regression over sessions)
🟢 F46. Outlier run detection (flag unusually high/low score runs)
🟢 F47. Best-day vs worst-day scenario planning
🟢 F48. Analytics reset function (clear history for new season)
🟢 F49. Multi-team analytics (import data from alliance partner)
🟢 F50. Anonymous data contribution to community benchmark database

---

### THEME G — MATCH TIMER & REAL-WORLD PACING (50 features)

🔴 G01. 150-second countdown timer
🔴 G02. Start / Pause / Reset controls
🔴 G03. Visual colour transition (green → yellow at 30s → red at 10s)
🔴 G04. Large font display (visible from 3 metres)
🔴 G05. Timer position marker on route scrubber (synced)
🟡 G06. Audio countdown beeps at 30s, 10s, 5s, 4s, 3s, 2s, 1s, 0s
🟡 G07. End-of-match gong sound
🟡 G08. Time split tracking (record time at each mission completion)
🟡 G09. Real-time pace indicator (ahead/behind planned schedule)
🟡 G10. Pace adjustment suggestions ("speed up — 15 s behind plan")
🟡 G11. Custom timer durations (practice rounds, qualifier rounds)
🟡 G12. Lap timer (stopwatch for individual attachment exchanges)
🟡 G13. Mission execution stopwatch (measure real mission time vs estimate)
🟡 G14. Timer history (record split times for each practice run)
🟡 G15. Timer sync to route animation (robot ghost follows real time)
🟢 G16. Multiple simultaneous timers (robot + exchange + review)
🟢 G17. Competition schedule integration (import event timetable)
🟢 G18. Round countdown (time until next competition round)
🟢 G19. Setup time countdown (time before round starts)
🟢 G20. Break reminder (alert when team has 5 minutes before next round)
🟢 G21. Match day mode (full-screen timer, minimal UI)
🟢 G22. Spectator mode timer display (large, clean, projection-friendly)
🟢 G23. Timer sound theme selection (default, dramatic, minimal, silent)
🟢 G24. Custom audio upload for timer sounds
🟢 G25. Timer vibration integration (if laptop has haptic feedback)
🟢 G26. Timer recording (log exact start/stop times for video sync)
🟢 G27. Timer export to video overlay (timecode for robot footage)
🟢 G28. Real-world obstacle timing (measure human execution, not simulated)
🟢 G29. Fatigue model (account for team slowing down in round 3)
🟢 G30. Warm-up round timer (shorter test run)
🟢 G31. Practice run statistics (mean, median, best, worst per session)
🟢 G32. Goal time setting (set target completion time, shows progress toward it)
🟢 G33. Timer notification to phone (webhook or local broadcast)
🟢 G34. Display timer on second monitor
🟢 G35. Timer overlay on field map (time label follows robot ghost)
🟢 G36. Time zone support (competition may be in different timezone)
🟢 G37. Automatic logging of all timer events
🟢 G38. Timer voice announcements ("30 seconds remaining")
🟢 G39. Sub-second precision display option
🟢 G40. Timer colour customisation
🟢 G41. Timer position on screen (user-draggable)
🟢 G42. Timer docking (snap to corner)
🟢 G43. Timer auto-start on Bluetooth hub connect
🟢 G44. Timer remote control via second device (phone/tablet as remote)
🟢 G45. "False start" detector (timer started before run begins)
🟢 G46. Post-match review mode (replay timer with actual split data)
🟢 G47. Time allocation visualiser (pie chart: travel + missions + exchanges)
🟢 G48. Practice session summary with average round time
🟢 G49. Best-ever time badge (celebrate personal bests)
🟢 G50. Timer integration with run history (each run automatically timed)

---

### THEME H — BLUETOOTH / HARDWARE INTEGRATION (50 features)

🔴 H01. BLE scan for SPIKE Prime hubs (bleak library, graceful fallback)
🔴 H02. Connection status display (connected/simulated/disconnected)
🔴 H03. Simulated telemetry with AMBER warning banner
🔴 H04. Yaw angle display from IMU
🔴 H05. Left/right encoder values display
🔴 H06. Battery voltage display
🟡 H07. Real bleak connection (replace simulation with actual BLE)
🟡 H08. Automatic reconnect on signal drop
🟡 H09. Hub name display (which hub is connected)
🟡 H10. Signal strength (RSSI) indicator
🟡 H11. Send commands to hub over BLE (start program, stop program)
🟡 H12. Live position telemetry (hub reports position, overlaid on field)
🟡 H13. Telemetry graph (scrolling line chart of IMU/encoder data)
🟡 H14. Telemetry export to CSV
🟡 H15. Telemetry recording mode (capture full run data)
🟢 H16. Multiple hub support (up to 3 hubs simultaneously)
🟢 H17. Hub firmware version display
🟢 H18. Hub memory usage display
🟢 H19. Hub program list (files on hub)
🟢 H20. Upload generated script to hub wirelessly
🟢 H21. Remote start run from laptop
🟢 H22. Remote stop / emergency halt
🟢 H23. Hub button mapping (assign UI actions to hub buttons)
🟢 H24. Motor diagnostics (stall detection, current draw)
🟢 H25. Sensor diagnostics (check all connected sensors)
🟢 H26. Calibration wizard via BLE (drive robot to known positions, measure error)
🟢 H27. Odometry calibration (measure actual vs expected distance)
🟢 H28. Turning calibration (measure actual vs expected angle)
🟢 H29. BLE ping test (measure round-trip latency)
🟢 H30. Offline mode detection (auto-switch to simulation when disconnected)
🟢 H31. Hub connection log (timestamps, event types)
🟢 H32. BLE device whitelist (only connect to team hub)
🟢 H33. Hub pairing QR code (encode hub address for quick reconnect)
🟢 H34. Multi-device sync (sync session state to coach's tablet over WiFi)
🟢 H35. USB fallback communication (serial port when BLE unavailable)
🟢 H36. Hub time sync (set hub clock to laptop time)
🟢 H37. Hub data download (retrieve run log from hub after completion)
🟢 H38. Overlay hub log on field map (trace actual path from hub data)
🟢 H39. Compare planned vs actual path (from hub position log)
🟢 H40. Deviation alert (hub reports position >3 cm from planned route)
🟢 H41. Auto-adjust route on deviation (dynamic replanning)
🟢 H42. Hub health check on connect (battery, motor, sensor status)
🟢 H43. Hub notification to UI (hub sends error codes, displayed in HUD)
🟢 H44. EV3 brick BLE support (backward compatibility)
🟢 H45. Raspberry Pi Pybricks support (headless hub mode)
🟢 H46. Hub battery alarm (alert when below 7.4V)
🟢 H47. Hub program slots display (which programs are in each slot)
🟢 H48. Hub reset function (remote factory reset)
🟢 H49. Hub log streaming (live Pybricks print() output in HUD)
🟢 H50. Hub execution profiler (time each movement command on hub)

---

### THEME I — CLOUD & DATA SYNC (50 features)

🔴 I01. Google Sheets background sync (5 s interval daemon)
🔴 I02. Manual sync button
🔴 I03. Offline fallback to Excel
🔴 I04. CSV fallback cache
🔴 I05. Sync status indicator (last sync timestamp)
🟡 I06. Sync conflict resolution (local vs cloud changes)
🟡 I07. Sync history log (what changed in each sync)
🟡 I08. Force overwrite cloud with local data
🟡 I09. Force overwrite local with cloud data
🟡 I10. Google Sheets write-back (push mission changes to sheet)
🟡 I11. Authentication error handling (clear, user-friendly message)
🟡 I12. Offline indicator in status bar
🟡 I13. Retry queue for failed syncs
🟡 I14. Data freshness badge (how old is the loaded data?)
🟢 I15. Google Drive attachment sync (attachment profiles stored in Drive)
🟢 I16. GitHub repository sync (push session data to team repo)
🟢 I17. Local network sync (sync between team laptops on same WiFi)
🟢 I18. Bluetooth sync to team tablet
🟢 I19. Session file export (.dashproj JSON — full state)
🟢 I20. Session file import (restore from .dashproj)
🟢 I21. Session auto-save every 5 minutes
🟢 I22. Session recovery on crash (restore last auto-save)
🟢 I23. Multiple session slots (save up to 10 named sessions)
🟢 I24. Session compare (diff two saved sessions)
🟢 I25. Cloud backup status (when was last cloud backup?)
🟢 I26. End-to-end encryption for cloud session data
🟢 I27. Data export anonymisation (remove team name for sharing)
🟢 I28. Public session sharing (generate shareable read-only link)
🟢 I29. Import session from shared link
🟢 I30. Webhook notifications (ping URL on sync complete)
🟢 I31. Custom sync interval (1s–60s)
🟢 I32. Sync pause mode (temporarily disable background sync)
🟢 I33. Differential sync (only send changed fields)
🟢 I34. Sync compression (gzip payload for slow connections)
🟢 I35. Sync log rotation (keep last 30 days)
🟢 I36. Cloud storage provider plugin system (Google/OneDrive/Dropbox)
🟢 I37. Offline-first architecture (all writes go local first)
🟢 I38. Sync queue (operations queued when offline, applied on reconnect)
🟢 I39. Version vector for conflict-free replication
🟢 I40. Data migration tool (upgrade schema between versions)
🟢 I41. Data integrity check (hash verification on load)
🟢 I42. Backup restore wizard
🟢 I43. Cloud quota display (storage used vs available)
🟢 I44. Rate limit handling (Google Sheets API quota awareness)
🟢 I45. Multi-account support (personal + team accounts)
🟢 I46. SSO support (school Microsoft/Google account login)
🟢 I47. Privacy mode (no cloud sync, local only)
🟢 I48. Data deletion tool (purge all cloud data for GDPR)
🟢 I49. Audit trail (every data change logged with user + timestamp)
🟢 I50. Change notification to coach (Slack/email on mission changes)

---

### THEME J — DIAGNOSTICS & PROFILING (50 features)

🔴 J01. RAM usage sparkline (live, 1 Hz)
🔴 J02. Active thread list with names
🔴 J03. Route node graph (topological display of mission sequence)
🔴 J04. Force garbage collection button
🔴 J05. Flush memento history button
🟡 J06. CPU usage sparkline (live)
🟡 J07. Queue depth monitor (how full is ui_queue?)
🟡 J08. Render latency display (ms per frame)
🟡 J09. Matplotlib DPI display
🟡 J10. App uptime display
🟡 J11. Log file viewer (tail -f style, last 100 lines)
🟡 J12. Log level filter (DEBUG / INFO / WARNING / ERROR)
🟡 J13. Log search (filter log by keyword)
🟡 J14. Log export to file
🟡 J15. Exception inspector (last 10 exceptions with stack trace)
🟢 J16. Performance timeline (Gantt-style chart of main thread activity)
🟢 J17. Function call profiler (cProfile integration, sorted by cumtime)
🟢 J18. Memory leak detector (track object counts over time)
🟢 J19. Tkinter widget inspector (tree view of all live widgets)
🟢 J20. Widget count display (number of live Tkinter objects)
🟢 J21. Matplotlib figure inspector (number of artists, axes)
🟢 J22. Canvas blit profiler (blit time per frame)
🟢 J23. Import time profiler (which modules are slow to import)
🟢 J24. Network request log (Google Sheets API calls with latency)
🟢 J25. Queue throughput meter (messages per second)
🟢 J26. Dead code detector (imported but unused modules)
🟢 J27. Memory snapshot diff (compare heap before/after operation)
🟢 J28. Garbage collection stats (GC counts, collected objects)
🟢 J29. Thread deadlock detector (timeout on join())
🟢 J30. Event loop lag meter (ms between scheduled and actual execution)
🟢 J31. Stack trace viewer for any live thread
🟢 J32. Module load times bar chart
🟢 J33. File I/O stats (reads, writes, bytes)
🟢 J34. JSON load/save latency display
🟢 J35. Tkinter event queue depth
🟢 J36. Font metrics inspector
🟢 J37. Screen DPI and resolution display
🟢 J38. Platform information panel (OS, Python version, dependencies)
🟢 J39. Dependency version table (all installed packages + versions)
🟢 J40. Crash report generator (structured JSON crash dump)
🟢 J41. Crash report uploader (send to team cloud storage)
🟢 J42. Auto-restart on crash (watchdog thread)
🟢 J43. Health check endpoint (local HTTP server reporting app status)
🟢 J44. Metrics export to Prometheus/Grafana (advanced monitoring)
🟢 J45. Historical performance database (runtime_stats.json analytics)
🟢 J46. Performance regression detector (alert if operations get slower)
🟢 J47. Resource quota alerts (e.g., RAM > 200 MB warning)
🟢 J48. Thermal throttling detection (CPU performance degradation)
🟢 J49. Battery/power status display (laptop battery, hub battery)
🟢 J50. Diagnostics PDF report (full health snapshot for coach)

---

### THEME K — UI ANIMATIONS & VISUAL POLISH (50 features)

🔴 K01. View switch: FadeTransition (200ms, ease-out)
🔴 K02. Window size lock (views use place() not pack_forget())
🔴 K03. Mission dot pulse animation (selected dots breathe alpha 0.6→1.0)
🔴 K04. Timer colour transition animation (green→yellow→red)
🔴 K05. Button hover animation (background colour ease-in 100ms)
🔴 K06. Tab active indicator slide (bottom border slides between tabs)
🔴 K07. Route draw animation (arrows draw sequentially 80ms each)
🟡 K08. Panel slide-in on first open (ease-spring 300ms)
🟡 K09. Accordion list expand/collapse with height animation
🟡 K10. Splash screen with progress bar and hex motif rotation
🟡 K11. Mission dot scale-up on hover (20% over 100ms)
🟡 K12. Status bar message slide-in (new messages slide from right)
🟡 K13. Error shake animation (3-cycle lateral oscillation on error widget)
🟡 K14. Undo flash (brief glow on changed elements)
🟡 K15. Route optimisation spinner (animated while computing)
🟡 K16. Loading skeleton screens (placeholder before data loads)
🟡 K17. Toast notifications (temporary message popups, HSR style)
🟡 K18. Node graph node pop-in animation (scale 0→1.1→1.0 on appear)
🟡 K19. Sparkline data-point pulse on update
🟡 K20. Match end confetti animation (points particles on timer=0)
🟢 K21. Drag handle visual feedback (cursor + grip indicator)
🟢 K22. Dropdown open animation (expand with ease-out-quad 150ms)
🟢 K23. Chart data update transition (bars grow from 0 on new data)
🟢 K24. Field map pan inertia (map coasts after drag release)
🟢 K25. Field zoom smooth interpolation (not snap)
🟢 K26. Attachment schedule step highlight animation
🟢 K27. Code generation reveal (code lines appear top-to-bottom 20ms each)
🟢 K28. Run completion celebration (score number counts up with bounce)
🟢 K29. Personal best record animation (gold flash + star burst)
🟢 K30. Tooltip slide-in (200ms from slightly below widget)
🟢 K31. Glow effect on active elements (HSR_CERULEAN outer glow ring)
🟢 K32. Circuit trace draw animation in header (traces "fill in" on boot)
🟢 K33. Hex corner bracket draw on panel focus
🟢 K34. Scanline overlay animation (very subtle, 0.5s phase drift)
🟢 K35. Mission dot trail animation (ghost dots fade in path behind robot)
🟢 K36. Score increment animation in Analytics (numbers roll up)
🟢 K37. Chart type transition morphing (bar→line smooth interpolation)
🟢 K38. Theme switch animation (colours crossfade over 400ms)
🟢 K39. Font size animation on window resize (smooth interpolation)
🟢 K40. Button press ripple effect (circular ripple from click point)
🟢 K41. Drag-and-drop ghost (semi-transparent copy follows cursor)
🟢 K42. Drop zone highlight animation (zone pulses when valid target)
🟢 K43. Invalid action wobble (brief rotation ±3° for rejected actions)
🟢 K44. App icon badge animation (taskbar badge updates with route score)
🟢 K45. Full-screen mode transition (smooth expand to fill screen)
🟢 K46. Panel collapse/expand keyboard shortcut with animation
🟢 K47. Idle screen saver (after 10 min inactivity — field map rotation)
🟢 K48. Wake-up animation (screen saver dismisses with reveal animation)
🟢 K49. Dark/light theme crossfade (all colours interpolate simultaneously)
🟢 K50. Coach presentation mode (extra-large text, no technical elements)

---

### THEME L — REAL-WORLD ROBOT PHYSICS (50 features)

🔴 L01. Straight-line travel time from kinematic constants (dist / speed)
🔴 L02. Turn time estimation (angle × sec_per_degree)
🔴 L03. Acceleration overhead per segment
🔴 L04. Total run time calculation (sum of travel + turn + mission times)
🔴 L05. Segment overhead (attachment activation, deceleration buffer)
🟡 L06. Battery depletion model (voltage drops as run progresses)
🟡 L07. Motor performance degradation over run (speed reduction at low voltage)
🟡 L08. Wheel slip estimation (smooth floor vs rough mat coefficient)
🟡 L09. Turning radius at speed (larger radius at higher speed)
🟡 L10. Heading drift model (gyro drift over time, magnitude adjustable)
🟡 L11. Odometry error model (accumulating position error per segment)
🟡 L12. Mission approach tolerance (how close robot must get to score)
🟡 L13. Robot footprint collision check (robot body vs obstacles)
🟡 L14. Robot turning clearance check (swing radius vs nearby objects)
🟡 L15. Surface friction coefficient input (calibrated per mat)
🟢 L16. Temperature model (colder = stiffer wheels = more motor power needed)
🟢 L17. Humidity model (mat surface grip change)
🟢 L18. Carpet vs smooth floor mode
🟢 L19. Motor warm-up time (first 2 minutes of use less accurate)
🟢 L20. Robot mass input (affects acceleration and turning)
🟢 L21. Battery level at start of run (affects all time estimates)
🟢 L22. Battery drop-off curve (real-time recalculation as run proceeds)
🟢 L23. Tire wear model (grip degrades over sessions)
🟢 L24. Encoder calibration factor (measured vs theoretical wheel diameter)
🟢 L25. Gyro drift rate calibration (measured from practice data)
🟢 L26. Stall recovery time penalty (if motor stalls, extra 2 s added)
🟢 L27. Attachment swap position error (exchange slightly shifts robot position)
🟢 L28. Table vibration model (nearby robots cause position noise)
🟢 L29. Human handler error model (placing robot ±3 mm off target)
🟢 L30. Competition floor vs practice floor comparison
🟢 L31. Wheel alignment calibration (toe-in/toe-out correction)
🟢 L32. Centre-of-gravity shift with attachments (turning behaviour changes)
🟢 L33. Backlash model (gear play introduces position error)
🟢 L34. Momentum overshoot model (robot slides past target at high speed)
🟢 L35. Deceleration ramp required distance (speed → 0 over N cm)
🟢 L36. Line-following sensor model (alternative navigation mode)
🟢 L37. Colour sensor approach timing (slow down when detecting colour)
🟢 L38. Ultrasonic wall-following model
🟢 L39. Infrared beacon homing model
🟢 L40. Multi-surface route (different physics on different mat zones)
🟢 L41. Robot tipping risk model (high centre of gravity on slopes)
🟢 L42. Attachment-to-mission contact force estimation
🟢 L43. Mission model physics (how does the mission object move when pushed?)
🟢 L44. Mission reset probability (does the mission model need re-seating?)
🟢 L45. Environmental noise model (other robots' BLE / magnetic interference)
🟢 L46. LED light interference model (game field lighting affects colour sensor)
🟢 L47. Mat expansion model (mat dimensions vary by temperature)
🟢 L48. Camera vision assist (integration with overhead camera for positioning)
🟢 L49. Particle filter localisation (probabilistic position estimate)
🟢 L50. Full dynamics simulation (Euler integration of robot equations of motion)

---

### THEME M — STRATEGY & COMPETITION PLANNING (50 features)

🔴 M01. Run plan editor (define Run 1, Run 2, Run 3 separately)
🔴 M02. Run switcher in HUD (toggle between runs)
🔴 M03. Total score across all runs (sum of best scores per mission)
🔴 M04. Competition score predictor (based on practice data)
🔴 M05. Backup strategy (if mission fails, which alternative to attempt)
🟡 M06. Strategy memo pad (freetext notes per strategy)
🟡 M07. Strategy comparison table (two strategies side by side)
🟡 M08. Mission dependency map (which missions can be done in any order)
🟡 M09. Competition bracket awareness (who are we likely to face?)
🟡 M10. Practice schedule planner (which missions to focus on each session)
🟡 M11. Competition day checklist (robot, hub, attachments, cables, etc.)
🟡 M12. Pre-match routine checklist (battery check, programme slot, etc.)
🟡 M13. Coach notes field (separate from student notes)
🟡 M14. Strategy version tags (v1 "conservative", v2 "aggressive")
🟡 M15. Strategy sharing (export PDF strategy card for team reference)
🟢 M16. Opponent scouting module (enter observed competitor scores)
🟢 M17. Head-to-head probability estimator
🟢 M18. Alliance selection advisor (which partner team maximises combined score)
🟢 M19. Mission risk matrix (probability × impact quadrant)
🟢 M20. Season calendar integration (upcoming competitions and deadlines)
🟢 M21. Challenge rubric reference (display official scoring rules inline)
🟢 M22. Judge's interview prep (Core Values, project, strategy questions)
🟢 M23. Team role assignment (who is responsible for each run)
🟢 M24. Contingency tree (if X fails, do Y; if Y fails, do Z)
🟢 M25. Time allocation strategy (first 60s vs last 90s priorities)
🟢 M26. Mission unlock tree (challenges with staged scoring)
🟢 M27. Points-to-rank estimator (what score is needed to rank top 3?)
🟢 M28. Qualification round vs final round strategy differentiation
🟢 M29. Equipment check list with photos
🟢 M30. Travel kit inventory (what to bring to competition)
🟢 M31. On-table equipment layout diagram
🟢 M32. Practice log (date, time, conditions, score for each practice)
🟢 M33. Improvement velocity (score gained per practice hour)
🟢 M34. Team confidence survey (subjective readiness per mission)
🟢 M35. Go/no-go decision tool (is team ready for competition?)
🟢 M36. Post-competition review template (what to improve before next event)
🟢 M37. Season retrospective report (full season stats and lessons)
🟢 M38. Next-season planning (carry forward lessons to FLL 2027)
🟢 M39. Alliance communication plan (signal system with partner team)
🟢 M40. Rule interpretation tracker (disputed rulings and official clarifications)
🟢 M41. Referee relationship log (notes from referee conversations)
🟢 M42. Field familiarity notes (notes about specific competition venue)
🟢 M43. Practice vs competition environment delta (differences to account for)
🟢 M44. Competition countdown calendar
🟢 M45. Practice session goals (set before, reflect after)
🟢 M46. Video recording integration (link practice footage to runs)
🟢 M47. Slow-motion review marker (flag video timestamp for review)
🟢 M48. Competition photo gallery
🟢 M49. Team certificate generator (participation, award, milestone)
🟢 M50. Season wrap-up slideshow (auto-generated from session data)

---

### THEME N — ACCESSIBILITY & LOCALISATION (50 features)

🔴 N01. Cross-platform fonts (Helvetica/Courier universal fallbacks)
🔴 N02. Minimum contrast ratio 4.5:1 (WCAG AA)
🔴 N03. Keyboard-only navigation (all features reachable without mouse)
🔴 N04. Screen reader compatibility (accessible widget names)
🟡 N05. Font size scaling (Small / Medium / Large / Extra Large)
🟡 N06. High-contrast mode (white-on-black, maximum contrast)
🟡 N07. Colourblind mode (Okabe-Ito palette for field map and charts)
🟡 N08. Dyslexia-friendly font option (OpenDyslexic)
🟡 N09. Reduced motion mode (disable all animations for vestibular sensitivity)
🟡 N10. Screen zoom support (100%, 125%, 150%, 200%)
🟢 N11. English (default) UI text
🟢 N12. Spanish translation
🟢 N13. Mandarin Chinese translation
🟢 N14. Japanese translation
🟢 N15. French translation
🟢 N16. German translation
🟢 N17. Portuguese translation
🟢 N18. Arabic translation (RTL layout support)
🟢 N19. Korean translation
🟢 N20. Dutch translation
🟢 N21. Language selector in settings
🟢 N22. All UI strings in a constants dictionary (no hardcoded English)
🟢 N23. Date/time format localisation
🟢 N24. Number format localisation (decimal separator)
🟢 N25. Currency format (not relevant but included for framework completeness)
🟢 N26. Field unit display toggle (cm / mm / inches)
🟢 N27. Time display toggle (seconds / MM:SS / fractional minutes)
🟢 N28. Coordinate display toggle (corner-origin / centre-origin / inches)
🟢 N29. Voice interface (voice commands for mission CRUD)
🟢 N30. Text-to-speech readout for field status
🟢 N31. Large button mode (targets ≥44px for touch screen use)
🟢 N32. Touch screen drag support (mission placement by finger drag)
🟢 N33. Stylus input support (annotate field map)
🟢 N34. Left-hand mode (flip control panel to left side)
🟢 N35. Single-hand mode (all critical controls reachable with one hand)
🟢 N36. Focus outline visibility (always visible, not just on :focus)
🟢 N37. Error message plain English (no stack traces shown to users)
🟢 N38. Help text on every form field
🟢 N39. Tutorial overlay on first run (highlight key features)
🟢 N40. Contextual help (F1 opens relevant docs section)
🟢 N41. Keyboard shortcut cheatsheet (Ctrl+/ overlay)
🟢 N42. Undo history tooltip (show what will be undone)
🟢 N43. Redo history tooltip (show what will be redone)
🟢 N44. Status bar text screen reader announcement
🟢 N45. Animation speed control (0.5× / 1× / 2× / off)
🟢 N46. Session restore on reopen (never lose work)
🟢 N47. Panic button (Ctrl+Escape: immediate safe close with auto-save)
🟢 N48. Offline docs bundle (full documentation available without internet)
🟢 N49. Community forum integration (link to FLL community discussions)
🟢 N50. Junior mode (simplified UI, fewer options, larger text)

---

### THEME O — SECURITY & DATA INTEGRITY (50 features)

🔴 O01. service_account.json never committed (in .gitignore)
🔴 O02. Log injection prevention (unicodedata control-character stripping)
🔴 O03. No eval/exec on user input
🔴 O04. Coordinate range validation (OutOfBoundsError for x>240 or y>120)
🔴 O05. Mission name sanitisation (no shell metacharacters)
🟡 O06. JSON schema validation on all config file loads
🟡 O07. Credential file permission check on startup (warn if world-readable)
🟡 O08. Input length limits (mission name ≤ 64 chars, notes ≤ 2000 chars)
🟡 O09. File path validation (no path traversal in user-supplied filenames)
🟡 O10. Atomic file writes (temp + rename, no partial writes)
🟢 O11. Encrypted session files (AES-256 for saved .dashproj files)
🟢 O12. Audit log (every write operation with user + timestamp)
🟢 O13. Data export redaction (remove credentials before sharing)
🟢 O14. Credential rotation reminder (warn if service_account.json > 90 days old)
🟢 O15. Dependency vulnerability scan (pip audit integration)
🟢 O16. Code signing for generated Pybricks scripts
🟢 O17. Hub program verification (compare deployed hash vs source hash)
🟢 O18. Rollback capability for all data changes
🟢 O19. Data backup before destructive operations
🟢 O20. GDPR data deletion tool
🟢 O21. Privacy notice on first run
🟢 O22. Telemetry opt-in/opt-out (no data sent without consent)
🟢 O23. Rate limiting on cloud API calls
🟢 O24. Timeout on all network requests (no indefinite hang)
🟢 O25. Certificate pinning for Google API calls
🟢 O26. Secrets detection in log files (redact accidental credential logging)
🟢 O27. Memory scrubbing after credential use
🟢 O28. Secure random for session IDs (secrets module)
🟢 O29. Integer overflow guards in kinematic calculations
🟢 O30. Float NaN/Inf guards in all physics calculations
🟢 O31. Graceful handling of corrupted calibration.json
🟢 O32. Graceful handling of corrupted runtime_stats.json
🟢 O33. Graceful handling of missing fll_map.png
🟢 O34. Graceful handling of missing service_account.json
🟢 O35. Graceful handling of corrupted Excel file
🟢 O36. Graceful handling of Google Sheets schema change
🟢 O37. Input fuzzing test suite (automated invalid input testing)
🟢 O38. Dependency licence checker (ensure all deps are GPL-compatible)
🟢 O39. Code review checklist (security items for each PR)
🟢 O40. Secure default configuration (all optional features off by default)
🟢 O41. Session expiry (auto-lock after 2 hours idle on shared computers)
🟢 O42. Multi-user session isolation (different students on same laptop)
🟢 O43. Admin mode for coaches (access to all students' sessions)
🟢 O44. Student mode restrictions (cannot delete missions from other students)
🟢 O45. Watermark on exported PDFs (team name + date)
🟢 O46. Export audit log (track every data export event)
🟢 O47. Network traffic logging (all outbound requests logged)
🟢 O48. Suspicious activity detection (abnormal sync frequency)
🟢 O49. Read-only spectator mode (competition officials can view but not edit)
🟢 O50. Emergency wipe (delete all local data in one action)

---

### THEME P — TESTING & QUALITY (50 features)

🔴 P01. Unit tests for all path_simulation model classes
🔴 P02. Unit tests for spike_code_merger compiler
🔴 P03. Unit tests for diagnostic_dashboard
🔴 P04. Unit tests for launcher architecture (theme, config, sanitizer)
🔴 P05. Manual test checklist (startup, sync, resize, calibration, Part 2)
🟡 P06. Automated integration test: mission CRUD cycle
🟡 P07. Automated integration test: route optimisation pipeline
🟡 P08. Automated integration test: code generation end-to-end
🟡 P09. Automated integration test: UI view switching
🟡 P10. Automated integration test: undo/redo stack
🟡 P11. GUI smoke test (launch app, take screenshot, close cleanly)
🟡 P12. Cross-platform CI matrix (Windows, macOS, Linux)
🟡 P13. Python version matrix (3.10, 3.11, 3.12, 3.13)
🟡 P14. Dependency version matrix (test with min and latest)
🟡 P15. Performance regression tests (ensure render < 50ms, startup < 3s)
🟢 P16. Property-based tests (hypothesis library for kinematic calculations)
🟢 P17. Fuzzing test for CSV parser
🟢 P18. Fuzzing test for JSON config parser
🟢 P19. Fuzzing test for coordinate input
🟢 P20. Load test: 1000 missions (performance ceiling)
🟢 P21. Load test: 10 000 run history records
🟢 P22. Network failure simulation (test offline mode)
🟢 P23. Corrupted file simulation tests
🟢 P24. Memory leak test (run for 30 minutes, monitor heap)
🟢 P25. Thread safety test (concurrent reads/writes to brain state)
🟢 P26. Coverage target: 80%+ on non-GUI code
🟢 P27. Coverage badge in README
🟢 P28. Mutation testing (mutmut) for critical functions
🟢 P29. Snapshot tests for UI layout
🟢 P30. Screenshot regression tests (compare renders across versions)
🟢 P31. Accessibility test (axe-core equivalent for Tkinter)
🟢 P32. Keyboard navigation test (tab order verification)
🟢 P33. Localisation test (all languages render without overflow)
🟢 P34. High DPI test (render at 200% scaling, check for blurriness)
🟢 P35. Minimum resolution test (render at 1024×600, nothing clipped)
🟢 P36. Part 2 isolation test (delete PathOptimizer, verify Part 1 works)
🟢 P37. Startup time benchmark (< 3s on reference hardware)
🟢 P38. Sync latency benchmark (< 1s Google Sheets round trip)
🟢 P39. Render latency benchmark (< 50ms per frame)
🟢 P40. Code generation correctness test (compare generated code to golden file)
🟢 P41. Pybricks script syntax test (parse generated script)
🟢 P42. Route optimisation correctness test (known-optimal small instances)
🟢 P43. Calibration round-trip test (save, load, verify unchanged)
🟢 P44. Session save/restore test (full state round-trip)
🟢 P45. Undo/redo exhaustive test (undo past beginning, redo past end)
🟢 P46. BLE simulation test (mock bleak, verify telemetry pipeline)
🟢 P47. Google Sheets mock test (mock gspread, verify sync logic)
🟢 P48. Error injection test (verify all error handlers fire correctly)
🟢 P49. Continuous integration pipeline (GitHub Actions)
🟢 P50. Test result publishing (HTML report + coverage to GitHub Pages)

---

### THEME Q — DOCUMENTATION (50 features)

🔴 Q01. This MASTER_DOCUMENT.md (single source of truth)
🔴 Q02. Inline code comments (explain WHY, not WHAT)
🔴 Q03. Google-style docstrings on every public method
🔴 Q04. Module-level docstrings on every file
🔴 Q05. SYSTEM_PROMPT.md (AI generation guidelines)
🟡 Q06. ARCHITECTURE.md (merged into this document — this replaces it)
🟡 Q07. FIELD_SPECS.md (merged into this document — this replaces it)
🟡 Q08. CHANGELOG.md (see Section 12 of this document)
🟡 Q09. REQUIREMENTS.txt (see Section 13 of this document)
🟡 Q10. API reference (auto-generated from docstrings with pdoc3)
🟡 Q11. Quickstart video (screen recording with voiceover)
🟡 Q12. Architecture diagram (draw.io / Mermaid source)
🟡 Q13. Data flow diagram (mission CRUD → optimisation → code generation)
🟡 Q14. Database schema doc (all JSON file formats documented)
🟡 Q15. Keyboard shortcut reference (printable A4 card)
🟢 Q16. Tutorial: first run (step-by-step for new students)
🟢 Q17. Tutorial: adding missions
🟢 Q18. Tutorial: optimising a route
🟢 Q19. Tutorial: generating Pybricks code
🟢 Q20. Tutorial: using Bluetooth telemetry
🟢 Q21. Tutorial: competition day workflow
🟢 Q22. Tutorial: cloud sync setup
🟢 Q23. Tutorial: attachment profiles
🟢 Q24. Tutorial: analytics and scoring
🟢 Q25. FAQ document
🟢 Q26. Troubleshooting guide
🟢 Q27. Contributing guide (for team members making code changes)
🟢 Q28. Code review checklist
🟢 Q29. Release notes template
🟢 Q30. Version history (see Section 12)
🟢 Q31. Glossary of FLL terms (TSP, odometry, PID, etc.)
🟢 Q32. Glossary of code terms (FLLBrain, ui_queue, CalibrationManager, etc.)
🟢 Q33. Dependency rationale (why each library was chosen)
🟢 Q34. Performance tuning guide
🟢 Q35. Security hardening guide
🟢 Q36. Deployment guide (school laptop setup)
🟢 Q37. Competition day deployment guide (quick reference)
🟢 Q38. Offline installation guide (no internet at school)
🟢 Q39. GitHub repository setup guide
🟢 Q40. Service account setup guide (Google Cloud)
🟢 Q41. Field map preparation guide (PDF → PNG calibration)
🟢 Q42. Pybricks deployment guide (upload script to hub)
🟢 Q43. EV3 deployment guide
🟢 Q44. Multi-device setup guide
🟢 Q45. Backup and restore guide
🟢 Q46. Season handover guide (passing knowledge to next year's team)
🟢 Q47. Parent/spectator guide (what the app does, in plain language)
🟢 Q48. Referee guide (read-only spectator mode instructions)
🟢 Q49. Judge's presentation guide (how to show strategy in judging room)
🟢 Q50. Community contribution guide (sharing improvements with other FLL teams)

---

### THEME R — DEVELOPER EXPERIENCE (50 features)

🔴 R01. Single-file entry point (python launcher.py — no complex setup)
🔴 R02. Offline-first (no internet required to run)
🔴 R03. Dependency check on startup (clear error if package missing)
🔴 R04. Python version check on startup (3.10+ required for match/case)
🔴 R05. Cross-platform (Windows 10+, macOS 12+, Ubuntu 20.04+)
🟡 R06. requirements.txt pinned to tested versions
🟡 R07. requirements-dev.txt (pytest, black, mypy for contributors)
🟡 R08. pyproject.toml (modern packaging config)
🟡 R09. .gitignore (excludes credentials, logs, __pycache__, .pyc)
🟡 R10. Makefile (make install, make test, make lint, make docs)
🟡 R11. Black formatting enforced (88-char lines)
🟡 R12. isort import ordering enforced
🟡 R13. mypy type checking (strict mode)
🟡 R14. flake8 linting
🟡 R15. pre-commit hooks (run black, isort, mypy before each commit)
🟢 R16. GitHub Actions CI pipeline
🟢 R17. Automatic dependency updates (Dependabot)
🟢 R18. Semantic versioning (semver) for all releases
🟢 R19. Changelog automation (conventional commits → CHANGELOG.md)
🟢 R20. Release tagging workflow (git tag v49.0.0)
🟢 R21. Docker container for isolated testing
🟢 R22. Dev container for VS Code (devcontainer.json)
🟢 R23. GitHub Codespaces support
🟢 R24. Hot reload for UI development (auto-reload on file save)
🟢 R25. Debug mode flag (--debug: verbose logging, extra diagnostics)
🟢 R26. Profiling mode flag (--profile: cProfile output on exit)
🟢 R27. Headless mode flag (--headless: run without UI, for testing)
🟢 R28. Demo mode flag (--demo: pre-loaded sample data, no credentials)
🟢 R29. Reset mode flag (--reset: clear all local data and start fresh)
🟢 R30. Environment variable config (override cloud_settings.json with env vars)
🟢 R31. Config file validation on startup (JSON schema check)
🟢 R32. Structured logging (JSON log format for machine parsing)
🟢 R33. Log sampling (DEBUG logs sampled at 10% in production)
🟢 R34. Tracing support (OpenTelemetry spans for distributed debugging)
🟢 R35. Error boundary pattern (isolate crashes to affected component only)
🟢 R36. Feature flags (enable/disable features without code change)
🟢 R37. A/B testing framework (compare two UI variants)
🟢 R38. Code coverage badge in README
🟢 R39. Type stub files for internal APIs
🟢 R40. API changelog (track breaking changes to public interfaces)
🟢 R41. Dependency graph visualisation
🟢 R42. Architecture decision records (ADRs) for major design choices
🟢 R43. Issue template for bug reports
🟢 R44. Issue template for feature requests
🟢 R45. Pull request template with checklist
🟢 R46. Code owner assignment (who reviews changes to each module)
🟢 R47. Automated release notes generation
🟢 R48. Performance benchmark comparisons between versions
🟢 R49. Dead code detection (vulture)
🟢 R50. Security scanning (bandit, safety)

---

### THEME S — FRAMEWORK INTEGRATION HOOKS (50 features)

> These features are stubs awaiting the framework you will send.
> All hooks follow the adapter pattern: a thin wrapper that the
> framework calls into, with no framework-specific code in the core engine.

🔴 S01. `FrameworkAdapter` base class (abstract interface for framework plugins)
🔴 S02. `FrameworkAdapter.on_mission_change(missions)` hook
🔴 S03. `FrameworkAdapter.on_route_optimised(route, stats)` hook
🔴 S04. `FrameworkAdapter.on_run_complete(result)` hook
🔴 S05. `FrameworkAdapter.on_timer_tick(elapsed_sec)` hook
🟡 S06. `FrameworkAdapter.on_attachment_scheduled(schedule)` hook
🟡 S07. `FrameworkAdapter.on_code_generated(script_path)` hook
🟡 S08. `FrameworkAdapter.on_telemetry_update(payload)` hook
🟡 S09. `FrameworkAdapter.on_session_save(filepath)` hook
🟡 S10. `FrameworkAdapter.on_session_restore(filepath)` hook
🟡 S11. Framework plugin discovery (scan plugins/ directory on startup)
🟡 S12. Framework plugin enable/disable at runtime
🟡 S13. Framework plugin configuration (per-plugin settings panel)
🟡 S14. Framework event bus (publish/subscribe for decoupled communication)
🟡 S15. Framework data model extension (add custom fields to Mission)
🟢 S16. Framework UI panel injection (plugin renders into dedicated dock)
🟢 S17. Framework menu item injection (plugin adds items to Tools menu)
🟢 S18. Framework keyboard shortcut registration
🟢 S19. Framework field overlay injection (draw custom items on field map)
🟢 S20. Framework analytics panel (custom charts in Analytics tab)
🟢 S21. Framework code generation hook (inject custom code into deploy script)
🟢 S22. Framework export format (plugin adds new export targets)
🟢 S23. Framework import format (plugin parses new file formats)
🟢 S24. Framework theme override (plugin can replace colour palette)
🟢 S25. Framework notification injection (toast messages from plugin)
🟢 S26. Framework REST API (local HTTP server exposing brain state)
🟢 S27. Framework WebSocket server (real-time state stream)
🟢 S28. Framework gRPC server (high-performance binary protocol)
🟢 S29. Framework MQTT client (IoT messaging for hub integration)
🟢 S30. Framework OPC-UA client (industrial automation protocol)
🟢 S31. Framework ROS 2 bridge (Robot Operating System integration)
🟢 S32. Framework Redux-style state store (predictable state management)
🟢 S33. Framework time-travel debugging (rewind state to any point)
🟢 S34. Framework hot module replacement (reload plugin without restart)
🟢 S35. Framework sandboxing (plugins run in restricted environment)
🟢 S36. Framework dependency injection container
🟢 S37. Framework i18n provider (supply translations to all plugins)
🟢 S38. Framework logging aggregation (all plugin logs routed to central log)
🟢 S39. Framework crash isolation (plugin crash does not crash main app)
🟢 S40. Framework version compatibility check (plugin declares required app version)
🟢 S41. Framework marketplace (discover and install community plugins)
🟢 S42. Framework plugin signing (verify plugin authenticity)
🟢 S43. Framework plugin sandbox escape prevention
🟢 S44. Framework inter-plugin communication bus
🟢 S45. Framework data contract validation (plugin data validated against schema)
🟢 S46. Framework UI test helpers (test framework UI components in isolation)
🟢 S47. Framework documentation injection (plugin docs shown in Help menu)
🟢 S48. Framework telemetry (plugin usage metrics, opt-in)
🟢 S49. Framework migration scripts (upgrade plugin data between versions)
🟢 S50. Framework uninstall cleanup (plugin removes all its data on uninstall)

---

### THEME T — COMPETITION DAY MODE (50 features)

🔴 T01. Full-screen mode toggle (F11)
🔴 T02. Match day layout (timer large, map large, controls minimal)
🔴 T03. Competition mode lock (prevent accidental route changes during match)
🔴 T04. Start button confirmation (require double-click to start timer)
🔴 T05. Emergency stop (Escape key immediately stops all background ops)
🟡 T06. Referee view (read-only, large text, no controls)
🟡 T07. Coach view (full stats, small text)
🟡 T08. Student view (task list only — which mission to do next)
🟡 T09. Audience display mode (for projector — field map + score only)
🟡 T10. Connection checklist (verify hub, battery, programme before match)
🟡 T11. Programme slot reminder (which slot has today's script)
🟡 T12. Quick-launch shortcut (one click to open today's strategy)
🟡 T13. Battery pre-check alarm (warn if hub battery < 80% before match)
🟡 T14. Backup strategy quick-switch (one click to fallback plan)
🟡 T15. Score entry interface (enter actual referee score after match)
🟢 T16. Round number tracker (Round 1 of 3, etc.)
🟢 T17. Competition schedule display (all rounds and times)
🟢 T18. Judge presentation timer (3-minute countdown for judging room)
🟢 T19. Noise level indicator (countdown to quieter environment)
🟢 T20. Pit area checklist (between rounds)
🟢 T21. Robot transportation checklist (from pit to table)
🟢 T22. Table setup checklist (mission models, attachments ready)
🟢 T23. Final inspection checklist (size, weight, parts rules)
🟢 T24. Match result recorder (referee score vs simulated score comparison)
🟢 T25. Instant post-match debrief form
🟢 T26. Between-round improvement prioritiser (what to fix in 30 minutes)
🟢 T27. Quick battery swap guide (step-by-step with timer)
🟢 T28. Programme re-upload workflow (if script needs updating)
🟢 T29. Alliance partner coordination display
🟢 T30. Venue map (layout of tables, pit, judging rooms)
🟢 T31. Wi-Fi dead zone indicator (note areas where sync is unreliable)
🟢 T32. Backup data on USB (one-click export to USB drive)
🟢 T33. Print strategy card (A4 reference for team at table)
🟢 T34. QR code strategy share (share route with coach's phone instantly)
🟢 T35. Livestream overlay export (route graphic for video stream)
🟢 T36. Social media graphic generator (shareable results image)
🟢 T37. Award tracker (record awards received during event)
🟢 T38. Photo capture integration (tag photos to specific missions/rounds)
🟢 T39. Mentor debrief recording (record coach notes after each round)
🟢 T40. Event journal (time-stamped notes throughout competition day)
🟢 T41. Post-event report generator (auto-summary of all rounds)
🟢 T42. Next-event planning trigger (immediately after event ends)
🟢 T43. Transportation debrief (anything broken or lost during travel)
🟢 T44. Equipment damage log
🟢 T45. Team mood tracker (how is the team feeling at each point?)
🟢 T46. Celebration capture (record team reaction to scores)
🟢 T47. Competitor analysis (what did the winning team do differently?)
🟢 T48. Rule clarification request log (track questions asked of referees)
🟢 T49. Battery lifecycle tracker (count charge cycles per battery)
🟢 T50. Season close-out checklist (store equipment, document lessons)

---

## 11. BUG TRACKER

| ID | File | Status | Description |
|----|------|--------|-------------|
| CRASH-001 | path_simulation.py | ✅ FIXED v49 | `RuntimeStatisticsCollector.timed()` missing — crash on import |
| CRASH-002 | spike_code_merger.py | ✅ FIXED v48 | File replaced with tactical_hud.py copy — compiler lost |
| CRASH-003 | tactical_hud.py | ⚠ OPEN | `ToolTip.show()` calls `widget.bbox("insert")` → TclError on buttons |
| CRASH-004 | mission_editor.py | ✅ FIXED v47.2 | CalibrationTab referenced but not defined |
| BUG-001 | path_simulation.py | ✅ FIXED v49 | `format_duration` not exported (only `format_time_dynamic` defined) |
| BUG-002 | diagnostic_dashboard.py | ✅ FIXED v47.1 | `dx`/`dy` stale variables on final return edge of node graph |
| BUG-003 | mission_editor.py | ⚠ OPEN | `pack()` / `grid()` mixed in `_build_accordion_list` |
| BUG-004 | mission_editor.py | ✅ FIXED v47.2 | Name Entry widget missing `validate=` |
| BUG-005 | All views | ⚠ OPEN | View switching resizes root window |
| BUG-006 | tactical_hud.py | ✅ FIXED v48 | `_build_menu_bar()` defined but never called |
| BUG-007 | diagnostic_dashboard.py | ✅ FIXED v47.1 | `_compute_state_hash` omitted `m.name` and `m.time_sec` |
| ARCH-001 | spike_code_merger.py | ✅ FIXED v48 | 13 duplicate class definitions across project |
| ARCH-002 | tactical_hud.py | ✅ FIXED v48 | 530-line string-literal changelog overhead |
| ARCH-003 | config.py | ✅ FIXED v1.1 | Orphan module imported by no files |
| ARCH-004 | All files | ⚠ PARTIAL | Changelog as `"""string literals"""` — fixed in launcher, diag, merger |
| STYLE-001 | tactical_hud.py | ⚠ OPEN | ToolTip `<Destroy>` binding missing — orphaned tooltip windows |
| PERF-001 | launcher.py | ✅ FIXED v47 | `time.sleep(0.2)` on main thread during boot |
| PERF-002 | launcher.py | ✅ FIXED v47 | Flat 16ms polling even when queue idle |
| COMPAT-001 | path_simulation.py | ✅ FIXED v49 | `format_duration` alias missing |
| OLD-001 | path_simulation.py | ✅ FIXED v35 | `fig.text()` recreated in `_setup_axes()` → dpi crash on resize |
| OLD-002 | path_simulation.py | ✅ FIXED v36 | Screen blinking: sync thread calling `_render_missions()` directly |

---

## 12. CHANGELOG

### v49.0.0 (Current — March 2026)
- path_simulation.py: Added `RuntimeStatisticsCollector.timed()` (no-op decorator) — fixes CRASH-001
- path_simulation.py: Added `format_duration = format_time_dynamic` alias — fixes BUG-001
- path_simulation.py: Stripped 530 lines of string-literal changelog overhead
- path_simulation.py: APP_VERSION updated to v49.0.0
- mission_editor.py: Removed stale `CalibrationTab` reference — fixes CRASH-004
- mission_editor.py: `ToolTip.show()` TclError guard added — partial fix CRASH-003
- mission_editor.py: Name Entry `validate=` added — fixes BUG-004
- mission_editor.py: Stripped 273 lines of string-literal changelog overhead
- config.py: Fully integrated — theme dicts, platform_font(), FONT_* tuples, polling constants
- MASTER_DOCUMENT.md: Created (this file) — replaces all individual docs

### v48.0.0
- tactical_hud.py: Radar system, tooltip system, menu bar implemented
- tactical_hud.py: `_build_menu_bar()` now called from `_build_ui()` — fixes BUG-006
- spike_code_merger.py: Rebuilt from scratch (was replaced with tactical_hud copy) — fixes CRASH-002 + ARCH-001
- spike_code_merger.py: argparse CLI, utf-8-sig CSV, atomic write, odometry resets, motor stall wrappers

### v47.2.0
- mission_editor.py: ToolTip bbox TclError guard
- mission_editor.py: Name Entry validation added
- mission_editor.py: <Destroy> binding on ToolTip

### v47.1.0
- diagnostic_dashboard.py: Full rebuild — clean architecture, merged changelog
- diagnostic_dashboard.py: BUG-002 dx/dy final edge fix
- diagnostic_dashboard.py: BUG-007 state hash includes m.name and m.time_sec

### v47.0.0
- launcher.py: Full clean rewrite — all forensic audit bugs fixed
- launcher.py: PERF-001 main-thread sleep removed
- launcher.py: PERF-002 adaptive polling (16ms active / 250ms idle)
- launcher.py: BLE handler fixed to use tab_bt.set_status() API directly
- launcher.py: unicodedata sanitizer (replaces ASCII allowlist)
- launcher.py: Dynamic window geometry (85% of screen)

### v46.0.0 — v35.0.0
See previous session notes. Key milestones:
- v45.1: path_simulation TSP + A* + code generation
- v44.0: BluetoothTelemetryManager, DiagnosticsDashboard
- v42.0: MissionEditor DEPLOY tab, BlockVisualizer
- v39.1: 16ms queue polling, full callback verification
- v38.0: DiagnosticsDashboard decoupled to Toplevel
- v37.0: Held-Karp TSP, KinematicCostCalculator
- v36.0: FieldCalibrationProfile, RotatingFileHandler logging
- v35.0: Initial scaffold. Mission dataclass, nearest-neighbour TSP, Google Sheets sync.

---

## 13. DEPENDENCIES

### Runtime (required)

```
# Visualisation
matplotlib>=3.9.0
numpy>=2.1.0
Pillow>=11.0.0

# Tkinter is stdlib — no install needed

# Cloud sync (optional — app works without these)
gspread>=6.1.0
google-auth>=2.37.0
google-auth-oauthlib>=1.2.0
google-auth-httplib2>=0.2.0

# Data
pandas>=2.2.0
openpyxl>=3.1.0

# PDF processing (for fll_map PDF → PNG conversion)
PyMuPDF>=1.25.0

# Bluetooth (optional — falls back to simulation without)
bleak>=0.22.0
```

### Path Optimisation (optional — Part 2)
```
scipy>=1.14.0
networkx>=3.4.0
```

### Development only
```
pytest>=8.0.0
black>=24.0.0
isort>=5.13.0
mypy>=1.11.0
flake8>=7.0.0
hypothesis>=6.0.0
```

---

## 14. FRAMEWORK INTEGRATION HOOKS

> **Awaiting framework specification from user.**

When the framework is received, implement the `FrameworkAdapter` protocol
in a new file `framework_adapter.py`. The core engine already emits all
necessary events through `brain.ui_queue` — the adapter simply subscribes
to those events and translates them into framework calls.

```python
# framework_adapter.py — to be filled when framework spec arrives
from typing import Protocol

class FrameworkAdapter(Protocol):
    def on_mission_change(self, missions: list) -> None: ...
    def on_route_optimised(self, route: list, stats: object) -> None: ...
    def on_run_complete(self, result: dict) -> None: ...
    def on_timer_tick(self, elapsed_sec: float) -> None: ...
    def on_attachment_scheduled(self, schedule: list) -> None: ...
    def on_code_generated(self, script_path: str) -> None: ...
    def on_telemetry_update(self, payload: dict) -> None: ...
    def on_session_save(self, filepath: str) -> None: ...
    def on_session_restore(self, filepath: str) -> None: ...
```

Register an adapter with `brain.register_framework_adapter(adapter)`.
The brain will call each hook at the appropriate lifecycle event.

---

## 15. DEVELOPMENT GUIDELINES

### Code Style
- PEP 8, 88-char lines (Black compatible)
- PEP 257 Google-style docstrings on every public method
- Type hints on every function signature and return type
- `pathlib.Path` for all file I/O — never `os.path`
- `logging.getLogger(__name__)` per module — zero `print()` in production
- No bare `except:` or `except Exception: pass`
- Named constants in `UPPER_SNAKE_CASE` — no magic numbers
- `if not hasattr(...): raise RuntimeError(...)` — never `assert hasattr()`

### Changelog Convention
Every file must have ONE `#` comment changelog block at the top.
Never `"""string literals"""` — these corrupt `__doc__`.

### Cross-Platform Fonts
Use `platform_font()` from `config.py`. Never hardcode `"Segoe UI"` alone.

### No Globals
No module-level mutable state. All state lives in `FLLBrain` instance.

### Thread Safety
Background threads only push to `brain.ui_queue`. They never touch widgets.

---

## 16. TESTING STRATEGY

### Manual Checklist (run before every commit)
- [ ] Startup with Google Sheets available
- [ ] Startup with Google Sheets unavailable (offline)
- [ ] Mission selection toggle (click to toggle)
- [ ] Sync button (manual refresh)
- [ ] Timer start/pause/reset
- [ ] Window resize (no dpi crash)
- [ ] Calibration save/load
- [ ] Part 2 deletion (verify Part 1 still works)
- [ ] View switch HUD ↔ Editor (window stays same size)
- [ ] Undo/redo (multiple levels)
- [ ] Route optimisation
- [ ] Code generation (dry-run)
- [ ] Diagnostics window open/close

### Error Scenario Tests
- [ ] No internet connection
- [ ] Invalid service_account.json
- [ ] Missing Excel fallback file
- [ ] Corrupted calibration.json
- [ ] Missing field map image
- [ ] Python with `-O` flag (assert optimisation)

---

## 17. DEPLOYMENT

### Requirements
1. Python 3.10+ (3.14+ preferred)
2. All dependencies from Section 13
3. Google Cloud service account JSON (optional, for cloud sync)
4. Field map PNG or PDF (auto-converts on first run)
5. calibration.json (auto-created with defaults if missing)

### First Run
1. `pip install -r REQUIREMENTS.txt`
2. `python launcher.py`
3. App converts PDF → PNG (one-time, ~5s)
4. Creates `calibration.json` with defaults
5. Attempts Google Sheets connection, falls back to Excel if offline
6. Opens UI window

### File Dependencies
**Required:**
- `path_simulation.py`, `launcher.py`, `tactical_hud.py`,
  `mission_editor.py`, `diagnostic_dashboard.py`, `spike_code_merger.py`,
  `config.py`, `cloud_settings.json`

**Auto-created if missing:**
- `calibration.json`, `logs/launcher.log`, `runtime_stats.json`

**Optional (cloud features):**
- `service_account.json`, `FLL_Mission_Data.xlsx`

### Performance Targets
| Metric | Target |
|--------|--------|
| Startup time | < 3 seconds |
| Sync latency | < 1 second |
| Render time per frame | < 50 ms |
| Memory usage | < 150 MB |
| Code generation | < 500 ms |

---

## 18. HANDOFF BRIEF

**For starting a new AI conversation, paste this section:**

---

Hi! I'm continuing work on the **FLL 2026 UNEARTHED Strategy Engine**.

**Location:** `C:\Users\jaron\OneDrive - Ministry of Education (M365 T&L)\Documents\First LEGO League 2026 [FLL]\Simulation Testing\`

**Python:** `C:\Users\jaron\AppData\Local\Programs\Python\Python314\python.exe`

**6 core files** (all at v47–v49):
- `launcher.py` (MVC Controller)
- `tactical_hud.py` (field map view)
- `mission_editor.py` (mission CRUD view)
- `path_simulation.py` (domain model, TSP, FLLBrain)
- `diagnostic_dashboard.py` (profiler, node graph)
- `spike_code_merger.py` (CSV → Pybricks compiler)
- `config.py` (shared constants, HSR theme, fonts)

**Single source of truth:** `MASTER_DOCUMENT.md`

**What works:** Mission CRUD, route optimisation (Held-Karp + 2-opt),
Pybricks code generation, BLE telemetry (simulated), Google Sheets sync,
match timer, undo/redo, diagnostic dashboard, node graph.

**Currently open bugs:**
- CRASH-003: ToolTip TclError on non-text widgets (tactical_hud.py)
- BUG-003: pack/grid mixed in mission_editor._build_accordion_list
- BUG-005: View switching resizes root window

**Next priorities:**
1. Fix BUG-005 (window size lock via place() stacking)
2. Apply Honkai Star Rail colour palette (HSR_* from MASTER_DOCUMENT.md Section 6)
3. Add animation framework (Section 7)
4. Implement attachment system (Section 8)
5. Integrate framework spec (Section 14) when provided

**Architecture rules:**
- No Tkinter imports in path_simulation.py
- Background threads only push to brain.ui_queue
- All views use public API methods (never widget-tree walking)
- Changelog as # comments, never """string literals"""
- See MASTER_DOCUMENT.md for full rules.

---

*End of MASTER_DOCUMENT.md*
