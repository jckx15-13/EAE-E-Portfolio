# Project Status

**Last Updated:** March 12, 2026  
**Status:** In Active Development - Major Refactor In Progress

---

## 🔄 Git Repository

**Location:** `Simulation Testing/.git/`  
**Branch:** `seed`  
**Last Commit:** `"FLL 2026 UNEARTHED strategy engine v5:baseline"`  
**Remote:** None (local only)

---

## ✅ What's Working

### Core Functionality
- [x] Matplotlib UI window with field visualization
- [x] Mission dots rendered on field map
- [x] Click-to-toggle mission selection
- [x] Button panel with controls
- [x] Match timer (150 seconds countdown)
- [x] Google Sheets integration
- [x] Background sync thread (daemon)
- [x] Offline fallback to `FLL_Mission_Data.xlsx`
- [x] Viewport calibration save/load
- [x] PDF to PNG conversion for field map

### UI Controls
- [x] **SYNC NOW** - Manual Google Sheets refresh
- [x] **[T] START** - Begin match timer
- [x] **SAVE ✓** - Save viewport calibration
- [x] **RESET** - Clear mission selections
- [x] Status bar with real-time updates

### Data Pipeline
- [x] Google OAuth2 authentication
- [x] gspread client connection
- [x] Sheet → DataFrame conversion
- [x] Coordinate system conversion (center → corner origin)
- [x] Auto-retry on network failures
- [x] CSV fallback cache

---

## 🔧 Issues Being Fixed

### Critical (In Progress)
1. **`dpi` crash on window resize**
   - Cause: `fig.text()` recreated in `_setup_axes()` every redraw
   - Fix: Create text artists once in `__init__`, update with `.set_text()`
   - Status: **Rewrite in progress**

2. **Screen blinking during sync**
   - Cause: Sync thread calling `_render_missions()` directly
   - Fix: Queue pattern - thread → queue → main thread timer → render
   - Status: **Rewrite in progress**

3. **Code readability**
   - Current: Technical comments for developers
   - Target: Toddler-level explanations for every section
   - Status: **Rewrite in progress**

### Enhancements (In Progress)
4. **Mat dimensions visualization**
   - Add contrasting box showing real mat: 2019mm × 1137mm
   - Status: **Not yet implemented**

5. **Start zone markers**
   - Add red box (left) and blue box (right) at y=0
   - Show robot start position (back-against-wall)
   - Status: **Not yet implemented**

6. **Map brightness**
   - Current map is too dark
   - Need brightness/contrast boost
   - Status: **Not yet implemented**

7. **UI alignment**
   - Button panel needs perfect alignment
   - Status bar positioning
   - Text label spacing
   - Status: **Partially complete**

---

## 🎯 Performance Metrics

**Startup Time:** ~2-3 seconds  
**Sync Interval:** 5 seconds (background daemon)  
**UI Responsiveness:** Good (main thread never blocks)  
**Memory Usage:** ~50-80 MB  

**Known Bottlenecks:**
- PDF → PNG conversion (first run only)
- Google Sheets API calls (~500ms per sync)
- Mission redraw on every sync (fixed by queue pattern)

---

## 📦 Dependencies Status

### Core (Required)
- [x] matplotlib 3.9+
- [x] pandas 2.2+
- [x] numpy 2.1+

### Cloud Sync (Required)
- [x] gspread 6.1+
- [x] google-auth 2.37+
- [x] openpyxl 3.1+

### PDF Processing (Required)
- [x] PyMuPDF (fitz) 1.25+

### Path Optimization (Optional - Part 2)
- [x] scipy 1.14+
- [x] networkx 3.4+

---

## 🏗️ Module Status

### Module 0: Core Types & Config
- [x] Terminal colors
- [x] Mission dataclass
- [x] Constants (field size, match time, robot speed)
- [x] Cloud settings loader

### Module 1: Diagnostics
- [x] Error logging
- [x] Timestamp tracking
- [x] Critical error handler

### Module 2: Image Processing
- [x] PDF → PNG conversion
- [x] Image loading
- [x] Brightness adjustment (needs implementation)

### Module 3: Data Sync
- [x] Google Sheets connection
- [x] DataFrame conversion
- [x] Background sync loop
- [x] Excel fallback
- [ ] Async queue pattern (in progress)

### Module 4: Path Optimization (Part 2)
- [x] TSP solver
- [x] Path visualization
- [x] Time estimation
- [x] Isolated with flag guard

### Module 5: Strategy Engine (UI)
- [x] Figure initialization
- [x] Axes setup
- [x] Mission rendering
- [x] Button panel
- [x] Click handlers
- [ ] Async rendering (in progress)
- [ ] Mat box overlay (pending)
- [ ] Start zones (pending)

### Module 6: System Launcher
- [x] Boot sequence
- [x] Pre-flight checks
- [x] Engine initialization
- [x] Sync manager wiring
- [x] Thread startup
- [x] UI launch

---

## 📊 Test Coverage

**Manual Testing:**
- [x] Mission selection (click to toggle)
- [x] Google Sheets sync
- [x] Offline mode (Excel fallback)
- [x] Match timer
- [x] Viewport calibration
- [x] Window resize (crashes with dpi error - fix pending)

**Automated Testing:**
- [ ] Not yet implemented

---

## 🚧 Current Work Session

**Task:** Complete architectural rewrite of `path_simulation.py`

**Goals:**
1. Implement async queue pattern
2. Fix `dpi` crash
3. Add mat dimensions box
4. Add start zone markers
5. Brighten field map
6. Add toddler-level comments
7. Polish UI alignment

**Status:** Rewrite was in progress when conversation was interrupted. New `path_simulation.py` not yet delivered.

**Deliverable:** Complete new `path_simulation.py` with all fixes above.

---

## 📝 Next Session Priorities

1. Complete and deliver rewritten `path_simulation.py`
2. Test async queue pattern
3. Verify Part 2 isolation (delete test)
4. Run full manual test suite
5. Commit to git: `"v6: async rendering + UI polish + mat visualization"`
6. Document new architecture changes
