# System Architecture

**FLL 2026 UNEARTHED Strategy Engine - Technical Design Document**

---

## 🏗️ Core Architecture

### Two-Part Design

The system is architected as **two independent parts** that can operate separately:

```
┌─────────────────────────────────────────────────────────┐
│ PART 1: Display Engine (Standalone)                    │
│  ├─ Mission visualization                              │
│  ├─ Google Sheets sync                                 │
│  ├─ UI controls                                        │
│  └─ Timer system                                       │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ PART 2: PathOptimizer (Isolated, Optional)             │
│  ├─ TSP solver                                         │
│  ├─ Route calculation                                  │
│  ├─ Time estimation                                    │
│  └─ Path visualization                                 │
│                                                         │
│  Guarded by: _PART2_AVAILABLE flag                     │
│  Try/except: scipy, networkx imports                   │
│  Deletion: Part 1 continues working                    │
└─────────────────────────────────────────────────────────┘
```

**Critical Rule:**  
If Part 2 is deleted, Part 1 must continue to function without errors.

---

## 🧵 Threading Model

### Architecture Pattern

```
┌──────────────────────────────────────────────────────────┐
│ BACKGROUND THREAD (Daemon)                              │
│  └─ MissionSyncManager.run_sync_loop()                  │
│      ↓ every 5 seconds                                  │
│      ├─ Fetch from Google Sheets                        │
│      ├─ Convert DataFrame                               │
│      └─ Push to queue (thread-safe)                     │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│ QUEUE (_update_queue)                                   │
│  └─ queue.Queue() - thread-safe FIFO                    │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│ MATPLOTLIB TIMER (Main Thread)                          │
│  └─ _poll_queue() - called every 100ms                  │
│      ├─ Check queue.get_nowait()                        │
│      ├─ Extract mission DataFrame                       │
│      └─ Call _render_missions()                         │
└──────────────────────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│ RENDER PIPELINE (Main Thread Only)                      │
│  └─ _render_missions()                                  │
│      ├─ ax.cla()                                        │
│      ├─ _setup_axes()                                   │
│      └─ Draw mission dots                               │
└──────────────────────────────────────────────────────────┘
```

### Critical Rules

1. **NEVER call render methods from background threads**
   - ❌ Wrong: `sync_thread → _render_missions()`
   - ✅ Right: `sync_thread → queue → timer → _render_missions()`

2. **Main thread owns all matplotlib operations**
   - All `ax.*`, `fig.*`, `plt.*` calls on main thread only
   - Background threads only push data to queue

3. **Queue as the only cross-thread communication**
   - Thread-safe `queue.Queue()`
   - Non-blocking `get_nowait()` in timer
   - No shared variables between threads

---

## 🎨 Rendering Rules

### The `cla()` Pattern

**Rule:** Always use `ax.cla()` + rebuild, never `art.remove()`

```python
def _render_missions(self):
    """Redraw all mission dots from scratch."""
    
    # 1. Clear everything
    self.ax.cla()
    
    # 2. Rebuild from ground up
    self._setup_axes()  # Grid, limits, labels
    
    # 3. Draw new content
    for mission in self.missions:
        self.ax.plot(mission.x, mission.y, 'o')
    
    # 4. Refresh display
    self.fig.canvas.draw_idle()
```

**Why:**
- Matplotlib artist removal is fragile
- `cla()` is atomic and reliable
- Rebuilding is fast enough (<50ms)
- Avoids orphaned artist references

### Text Label Management

**Rule:** Create `fig.text()` artists ONCE in `__init__`, update with `.set_text()` only

```python
# ✅ CORRECT PATTERN
def __init__(self):
    # Create text artist once
    self.status_label = self.fig.text(
        0.5, 0.02, "", ha='center', transform=self.fig.transFigure
    )

def set_status(self, msg):
    # Update existing artist
    self.status_label.set_text(msg)
    self.fig.canvas.draw_idle()
```

```python
# ❌ WRONG PATTERN (causes dpi crash)
def _setup_axes(self):
    # This recreates the artist every redraw → dpi error
    self.fig.text(0.5, 0.02, self.status_msg, ...)
```

**Why:**
- `fig.text()` creates artist with `transData` transform
- Recreating on every redraw breaks `dpi` calculation on resize
- Old artists become orphaned but remain in figure
- Updating `.set_text()` is safe and fast

### Axes Limits

**Rule:** `set_xlim/ylim` called ONLY in `_setup_axes()`

```python
def _setup_axes(self):
    """Set up coordinate system and visual elements."""
    
    # These should ONLY be called here
    self.ax.set_xlim(0, 240)
    self.ax.set_ylim(0, 120)
    self.ax.set_aspect('equal')
    
    # Grid, ticks, labels, etc.
    # ...
```

**Why:**
- Prevents limits from being reset multiple times
- Keeps coordinate system stable
- Avoids jitter during redraws

---

## 📐 Coordinate System

### Field Geometry

```
     y
     ↑
120  ┌─────────────────────────────────────┐
     │                                     │
 60  │            (120, 60)                │  Center of field
     │                ●                    │
  0  └─────────────────────────────────────┘ → x
     0                                   240

Origin: Bottom-left corner (0, 0)
Units: 1 unit = 1 cm
Field: 240 cm wide × 120 cm tall
```

### Coordinate Conversion

**Google Sheets uses center-origin:**
- (0, 0) = center of field
- Positive x = right, Negative x = left
- Positive y = top, Negative y = bottom

**Code uses corner-origin:**
- (0, 0) = bottom-left corner
- All coordinates positive

**Conversion Formula:**
```python
field_x = sheet_x + 120  # Shift right by half width
field_y = sheet_y + 60   # Shift up by half height
```

### Real Mat Dimensions

**FLL Competition Mat:**
- Total size: 2019mm × 1137mm
- Playing field: 2400mm × 1200mm (offset by border)
- Border width: varies by mat design

**Visualization Requirement:**
- Draw contrasting box at exact mat dimensions
- Position relative to field coordinates
- Conversion: 1 unit = 10mm → 201.9 × 113.7 units

---

## 🎮 UI Layout

### Window Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Figure Title: FLL 2026 UNEARTHED Strategy Engine]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │ Main Axes (Field Visualization)        │           │
│  │  - Background: fll_map.png             │  Button   │
│  │  - Mat box: 2019×1137mm                │  Panel    │
│  │  - Start zones: Red/Blue               │  (right)  │
│  │  - Mission dots                        │           │
│  │  - Path lines (if Part 2 enabled)      │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Status Bar]                                            │
├─────────────────────────────────────────────────────────┤
│ [Timer Display: MM:SS]                                  │
└─────────────────────────────────────────────────────────┘
```

### Button Panel (Right Side)

```
┌─────────────┐
│ SYNC NOW    │  ← Manual Google Sheets refresh
├─────────────┤
│ [T] START   │  ← Begin match timer
├─────────────┤
│ SAVE ✓      │  ← Save viewport calibration
├─────────────┤
│ RESET       │  ← Clear mission selections
├─────────────┤
│ OPTIMIZE    │  ← Run PathOptimizer (Part 2)
└─────────────┘
```

### Start Zones

```
     ┌─────────────────────────────────────┐
     │                                     │
     │          Field (240×120)            │
     │                                     │
  0  ┢━━━━━━━━━━━━━┫   ┣━━━━━━━━━━━━━┪     ← y=0
     │  RED ZONE   │   │  BLUE ZONE  │
     └─────────────┘   └─────────────┘

Legend:
  RED ZONE  = x: 0-80, y: 0-20 (left)
  BLUE ZONE = x: 160-240, y: 0-20 (right)
  Robot starts in either zone, back against y=0
```

---

## 📦 Module Hierarchy

```
path_simulation.py (Modules 0-5)
├─ Module 0: Core Types & Config
│   ├─ TerminalColors
│   ├─ Mission dataclass
│   └─ Constants (FIELD_X_MAX, MATCH_SECONDS, etc.)
│
├─ Module 1: Diagnostics
│   └─ FLLDiagnostics.report()
│
├─ Module 2: Image Processing
│   ├─ convert_pdf_to_png()
│   └─ load_and_prepare_image()
│
├─ Module 3: Data Sync
│   └─ MissionSyncManager
│       ├─ load_from_sheet()
│       ├─ load_from_excel()
│       └─ run_sync_loop()
│
├─ Module 4: Path Optimization (PART 2 - ISOLATED)
│   └─ PathOptimizer
│       ├─ solve_tsp()
│       ├─ calculate_time()
│       └─ draw_path()
│
└─ Module 5: Strategy Engine (Main UI)
    └─ FLLStrategyEngine
        ├─ __init__()              # Create figure, load data
        ├─ _setup_axes()           # Build coordinate system
        ├─ _render_missions()      # Draw mission dots
        ├─ _poll_queue()           # Check for updates
        ├─ _build_button_panel()   # Create UI controls
        └─ _on_click()             # Handle mission selection

launcher.py (Module 6)
└─ Module 6: System Launcher
    ├─ boot_sequence()         # Pre-flight checks
    ├─ run()                   # Main orchestrator
    └─ if __name__ == "__main__"
```

---

## 🔒 Security Considerations

### Credential Management

**service_account.json** contains:
- Google Cloud private key
- OAuth2 credentials
- Project IDs

**Rules:**
1. Never commit to git (in `.gitignore`)
2. Store in parent `[FLL]` folder (outside repo)
3. Permissions: Read-only for user account only
4. Never log or print key contents

### Data Validation

**Google Sheets input:**
- Validate column names match expected schema
- Check coordinate ranges (0-240, 0-120)
- Handle missing/malformed data gracefully
- Sanitize mission names (no code injection)

---

## 🧪 Testing Strategy

### Manual Test Checklist

- [ ] Startup with Google Sheets available
- [ ] Startup with Google Sheets unavailable (offline)
- [ ] Mission selection (click to toggle)
- [ ] Sync button (manual refresh)
- [ ] Timer start/stop
- [ ] Window resize (check for dpi crash)
- [ ] Calibration save/load
- [ ] Part 2 deletion (verify Part 1 still works)

### Error Scenarios

- [ ] No internet connection
- [ ] Invalid service_account.json
- [ ] Missing Excel fallback file
- [ ] Corrupted calibration.json
- [ ] Missing field map image

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Startup time | < 3 seconds | ~2-3 sec |
| Sync latency | < 1 second | ~500ms |
| Render time | < 50ms | ~30ms |
| UI responsiveness | Always smooth | Good |
| Memory usage | < 100 MB | ~50-80 MB |

---

## 🔧 Development Guidelines

### Code Style

1. **Toddler-level comments:**
   - Explain WHY, not just WHAT
   - Use analogies and simple language
   - Assume reader has basic Python knowledge only

2. **Function structure:**
   - Single responsibility
   - Clear input/output types
   - Docstrings with examples

3. **Error handling:**
   - Try/except with specific exceptions
   - Log errors with timestamps
   - Graceful degradation (fallbacks)

### Git Workflow

1. **Branch:** Always work on `seed` branch
2. **Commits:** Descriptive messages with version
3. **Testing:** Manual test before commit
4. **Baseline:** Keep stable versions tagged

---

## 🚀 Deployment

### Requirements

1. Python 3.14+
2. All dependencies from `REQUIREMENTS.txt`
3. Google Cloud service account (optional for offline)
4. Field map PDF or PNG
5. Calibration file (auto-created on first save)

### First Run

1. Converts PDF → PNG (one-time)
2. Creates calibration.json with defaults
3. Attempts Google Sheets connection
4. Falls back to Excel if offline
5. Opens UI window

### File Dependencies

**Required:**
- `path_simulation.py`
- `launcher.py`
- `cloud_settings.json`

**Optional (auto-created):**
- `calibration.json` (defaults if missing)
- `fll_map.png` (converted from PDF)

**Optional (cloud features):**
- `service_account.json`
- `FLL_Mission_Data.xlsx`
