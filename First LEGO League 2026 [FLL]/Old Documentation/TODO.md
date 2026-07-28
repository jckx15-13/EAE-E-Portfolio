# TODO & Known Issues

**Last Updated:** March 12, 2026

---

## 🔴 Critical Issues (Blocking)

### 1. `dpi` Crash on Window Resize

**Symptom:**
```
AttributeError: 'FigureCanvasQTAgg' object has no attribute 'dpi'
or
RuntimeError: transData transform invalid
```

**Root Cause:**
- `fig.text()` being called inside `_setup_axes()`
- `_setup_axes()` is called on every redraw (via `ax.cla()`)
- Each call creates a new text artist with `transData` transform
- Old artists remain in figure but become orphaned
- Window resize triggers `dpi` recalculation on all artists
- Orphaned artists have invalid transform → crash

**Fix:**
1. Create ALL `fig.text()` artists ONCE in `__init__()`
2. Store references to text artists as instance variables
3. Update text content with `.set_text()` instead of recreating
4. Never call `fig.text()` in `_setup_axes()`

**Status:** ⏳ Rewrite in progress

**Code Pattern:**
```python
# ✅ CORRECT
class FLLStrategyEngine:
    def __init__(self):
        self.status_label = self.fig.text(
            0.5, 0.02, "", ha='center', 
            transform=self.fig.transFigure
        )
    
    def set_status(self, msg):
        self.status_label.set_text(msg)
        self.fig.canvas.draw_idle()
```

---

### 2. Screen Blinking During Sync

**Symptom:**
- Field flickers/blinks every 5 seconds during sync
- UI feels janky and unprofessional

**Root Cause:**
- Background sync thread calls `_render_missions()` directly
- Matplotlib is not thread-safe
- Main thread and sync thread fight over canvas
- Double-redraw on every sync cycle

**Fix:**
Implement async queue pattern:

```python
# Background thread (sync)
def run_sync_loop(self, engine, interval):
    while True:
        df = self.load_from_sheet()
        engine._update_queue.put(df)  # ← Push to queue
        time.sleep(interval)

# Main thread (timer)
def _poll_queue(self):
    try:
        df = self._update_queue.get_nowait()
        self._process_update(df)  # ← Pull from queue
        self._render_missions()
    except queue.Empty:
        pass
```

**Status:** ⏳ Rewrite in progress

**Benefits:**
- No cross-thread matplotlib calls
- Smooth rendering
- Main thread controls all drawing
- Queue is thread-safe by design

---

## 🟡 High Priority Enhancements

### 3. Mat Dimensions Visualization

**Requirement:**
- Draw contrasting box showing real FLL mat: **2019mm × 1137mm**
- Should be visible but not obtrusive
- Different color from field boundary

**Implementation:**
```python
def _setup_axes(self):
    # ... existing code ...
    
    # Real mat dimensions (2019mm × 1137mm)
    # Convert mm to cm: 201.9 × 113.7
    mat_width = 201.9
    mat_height = 113.7
    
    # Center on field
    mat_x = (240 - mat_width) / 2
    mat_y = (120 - mat_height) / 2
    
    # Draw mat outline
    mat_rect = patches.Rectangle(
        (mat_x, mat_y), mat_width, mat_height,
        linewidth=2, edgecolor='orange', 
        facecolor='none', linestyle='--',
        label='FLL Mat (2019×1137mm)'
    )
    self.ax.add_patch(mat_rect)
```

**Status:** ❌ Not yet implemented

---

### 4. Start Zone Markers

**Requirement:**
- **Red zone:** Left side, x: 0-80, y: 0-20
- **Blue zone:** Right side, x: 160-240, y: 0-20
- Robot starts in either zone, back against y=0

**Implementation:**
```python
def _setup_axes(self):
    # ... existing code ...
    
    # Red start zone (left)
    red_zone = patches.Rectangle(
        (0, 0), 80, 20,
        facecolor='red', alpha=0.2,
        edgecolor='darkred', linewidth=2,
        label='Red Start Zone'
    )
    self.ax.add_patch(red_zone)
    
    # Blue start zone (right)
    blue_zone = patches.Rectangle(
        (160, 0), 80, 20,
        facecolor='blue', alpha=0.2,
        edgecolor='darkblue', linewidth=2,
        label='Blue Start Zone'
    )
    self.ax.add_patch(blue_zone)
    
    # Robot start position indicator (center bottom)
    self.ax.plot(
        120, 0, 'k^', markersize=15,
        label='Robot Start (back against wall)'
    )
```

**Status:** ❌ Not yet implemented

---

### 5. Brighten Field Map

**Requirement:**
- Current `fll_map.png` is too dark
- Hard to see mission dots on dark background
- Needs brightness/contrast boost

**Implementation:**
```python
def load_and_prepare_image(image_path):
    from PIL import Image, ImageEnhance
    
    img = Image.open(image_path)
    
    # Increase brightness by 30%
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.3)
    
    # Increase contrast by 20%
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.2)
    
    return np.array(img)
```

**Status:** ❌ Not yet implemented

**Note:** May need to adjust mission dot colors to maintain contrast

---

### 6. UI Alignment & Polish

**Current Issues:**
- Button panel spacing inconsistent
- Status bar text alignment off-center
- Timer position overlaps with other elements
- No visual hierarchy (all elements same weight)

**Fixes Needed:**
1. **Button panel:**
   - Equal spacing between buttons
   - Consistent button sizes
   - Aligned left edges
   - Professional colors

2. **Status bar:**
   - Centered horizontally
   - Fixed vertical position
   - Background color for visibility
   - Border/box around text

3. **Timer display:**
   - Large, bold font
   - Top-right corner
   - Color changes: green → yellow → red
   - Countdown sound effects (optional)

**Status:** 🟡 Partially complete

---

## 🟢 Low Priority / Future Enhancements

### 7. Toddler-Level Comments

**Current State:**
- Comments written for developers
- Technical terminology
- Assumes knowledge of threading, matplotlib, etc.

**Target State:**
- Explain EVERY section in simple language
- Use analogies ("like a to-do list for the robot")
- No jargon without explanation
- ASCII art diagrams where helpful

**Example:**
```python
# BEFORE:
# Sync thread pushes DataFrame to queue

# AFTER:
# The background worker thread is like a librarian.
# When it finds new book data (mission info), it doesn't
# shout it out loud (that would interrupt everyone).
# Instead, it quietly puts a note in the mailbox (the queue).
# Later, the main worker checks the mailbox and updates
# the display when it's convenient.
```

**Status:** 🟡 In progress during rewrite

---

### 8. Part 2 Isolation Verification

**Requirement:**
- Deleting `PathOptimizer` class and imports should NOT break Part 1
- All Part 2 dependencies in isolated try/except block
- `_PART2_AVAILABLE` flag guards all Part 2 usage

**Test:**
1. Comment out entire Module 4 (PathOptimizer)
2. Run `launcher.py`
3. Verify UI opens without errors
4. Verify sync, timer, mission selection still work
5. Verify "OPTIMIZE" button shows "Part 2 not available"

**Status:** ❌ Not yet tested

---

## 🔧 Refactoring Tasks

### 9. Complete Rewrite of `path_simulation.py`

**Scope:**
- Fix issues #1 and #2 (dpi crash, blinking)
- Add enhancements #3, #4, #5 (mat box, start zones, brightness)
- Improve #6 (UI alignment)
- Add #7 (toddler comments)

**Deliverable:**
- New `path_simulation.py` with all fixes
- Backward compatible with existing `launcher.py`
- Same API, better implementation

**Status:** ⏳ In progress (interrupted mid-delivery)

---

### 10. Submodule Naming

**Current:**
- Modules numbered 0-6
- Generic names like "Module 3: Data Sync"

**Proposed:**
```
Submodule 0: Core Types & Config
Submodule 1: Diagnostics
Submodule 2: Image Processing
Submodule 3: Data Sync Manager
Submodule 4: Path Optimizer (Part 2 - Isolated)
Submodule 5: Strategy Engine (Main UI)
Submodule 6: System Launcher
```

**Status:** ❌ Not yet implemented

---

## 📋 Checklist for Next Session

- [ ] Complete rewrite of `path_simulation.py`
- [ ] Fix #1: dpi crash (fig.text in __init__)
- [ ] Fix #2: blinking (async queue pattern)
- [ ] Add #3: Mat dimensions box (2019×1137mm)
- [ ] Add #4: Start zone markers (red/blue)
- [ ] Add #5: Brighten field map
- [ ] Polish #6: UI alignment
- [ ] Add #7: Toddler-level comments
- [ ] Test #8: Part 2 isolation
- [ ] Rename to "Submodule" convention
- [ ] Manual testing (full test checklist)
- [ ] Git commit: `"v6: async rendering + UI polish + mat visualization"`
- [ ] Update documentation to reflect changes

---

## 🐛 Bug Triage

| Priority | Issue | Impact | Effort | Status |
|----------|-------|--------|--------|--------|
| P0 | dpi crash (#1) | Blocks resize | Medium | In progress |
| P0 | Blinking (#2) | UX quality | Medium | In progress |
| P1 | Mat box (#3) | Competition accuracy | Low | Not started |
| P1 | Start zones (#4) | Competition accuracy | Low | Not started |
| P1 | Map brightness (#5) | Visibility | Low | Not started |
| P2 | UI alignment (#6) | Polish | Medium | Partial |
| P2 | Comments (#7) | Documentation | High | In progress |
| P3 | Part 2 test (#8) | Architecture | Low | Not started |

---

## 💡 Future Ideas (Backlog)

- [ ] Export route to CSV for robot code
- [ ] Import actual robot programs (integrate with EV3/Spike)
- [ ] Multi-robot simulation (2+ robots on field)
- [ ] Replay previous runs from log
- [ ] Performance analytics (score prediction)
- [ ] Voice commands ("Add mission 3")
- [ ] Mobile app version (tablet on field)
- [ ] 3D visualization (height-based missions)
- [ ] Automated testing suite
- [ ] CI/CD pipeline with GitHub Actions

---

## 🎯 Success Criteria for v6 Release

1. ✅ No dpi crash on window resize
2. ✅ Smooth rendering (no blink)
3. ✅ Mat dimensions visible (2019×1137mm)
4. ✅ Start zones marked (red/blue)
5. ✅ Field map brightened
6. ✅ UI professionally aligned
7. ✅ Code fully commented (toddler-level)
8. ✅ Part 2 proven deletable
9. ✅ All manual tests pass
10. ✅ Git committed with version tag

**Target Date:** End of current work session

---

## 📞 Support / Questions

**Common Questions:**

Q: Why async queue instead of locks?  
A: Locks block threads. Queue is non-blocking and thread-safe by design.

Q: Why rebuild with `cla()` instead of `art.remove()`?  
A: Artist removal is fragile. Rebuilding is fast and reliable.

Q: Why create text in `__init__` instead of `_setup_axes()`?  
A: Text artists with transforms break on resize if recreated.

Q: Can I skip Part 2 entirely?  
A: Yes! Part 1 is fully functional without PathOptimizer.

---

**For issues not listed here, check:**
- `PROJECT_STATUS.md` - Current state
- `ARCHITECTURE.md` - Design rules
- `FIELD_SPECS.md` - Coordinates and dimensions
