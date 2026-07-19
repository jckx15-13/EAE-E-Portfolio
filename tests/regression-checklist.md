# Portfolio Regression Checklist

**Purpose**: Ensure all existing features still work after recent changes (timeline sorting, floating controls, placeholder cleanup, progress bar enhancements).

**Format**: Each test has a description, pass criteria, and verification method.

---

## Phase 1: Core Rendering (Must pass)

### Test 1.1: Homepage loads without errors
- **Description**: Page loads at localhost:3000 with no console errors.
- **Pass criteria**: 
  - Page title is "Jaron Chew | EAE Portfolio"
  - `window.PORTFOLIO_DATA` exists and is an object
  - No JavaScript exceptions in console
  - Hero section visible
- **Method**: Browser dev tools console, page source inspection

### Test 1.2: Projects render into grid
- **Description**: Featured projects section displays all project cards.
- **Pass criteria**:
  - `#projectsGrid` container exists
  - At least 3 project cards render
  - Each card has title, date, summary, and image placeholder or actual image
  - No card is stretched to full viewport width
- **Method**: Open DevTools, inspect `#projectsGrid`, count `.project-card` elements

### Test 1.3: Achievements render into grid
- **Description**: Achievement cards display in Cards view.
- **Pass criteria**:
  - `#achievementCards` container exists
  - At least 5 achievement cards render
  - Each card has category kicker, title, date, summary, evidence status chips
  - No alignment issues (cards not stretched)
- **Method**: Open DevTools, inspect `#achievementCards`, verify card count

### Test 1.4: Personal map cards render
- **Description**: Personal map section shows identity/qualities snapshot.
- **Pass criteria**:
  - `#personalMapCards` container exists
  - Contains at least 6 cards
  - Cards show labels and descriptions
  - Grid is responsive (does not use `align-items: stretch`)
- **Method**: Scroll to Evidence Overview tab "Personal Map", verify layout

### Test 1.5: Evidence deck cards render
- **Description**: Evidence deck section shows key proof-point cards.
- **Pass criteria**:
  - `#evidenceDeckCards` container exists
  - Contains at least 3 cards
  - Cards display without overlap or misalignment
- **Method**: In Evidence Overview, click "Evidence Cards" tab, verify cards appear

---

## Phase 2: View Modes (Must pass)

### Test 2.1: Cards view loads and is default
- **Description**: Page opens in Cards view by default.
- **Pass criteria**:
  - `#view-cards` button has `is-active` class
  - `body.cards-mode` class is present
  - `#achievementCards` is visible
  - Other view containers are hidden or invisible
- **Method**: Inspect page on load, check button state and body classes

### Test 2.2: Timeline view loads and renders
- **Description**: Clicking Timeline mode shows timeline layout with alternating cards.
- **Pass criteria**:
  - `#view-timeline` button becomes active
  - `body.timeline-mode` class is present
  - `#achievementTimeline` becomes visible
  - Timeline items render with dates, titles, summaries
  - At least 5 timeline items visible
- **Method**: Click `#view-timeline`, inspect DOM and visual layout

### Test 2.3: Story view loads
- **Description**: Clicking Story mode shows narrative card layout.
- **Pass criteria**:
  - `#view-story` button becomes active
  - `body.story-mode` class is present
  - Story view container is visible
  - No console errors
- **Method**: Click `#view-story`, verify layout renders

### Test 2.4: View mode persists after refresh
- **Description**: Selected view mode is saved in localStorage and restored.
- **Pass criteria**:
  - Switch to Timeline view
  - Refresh page (F5)
  - Timeline view is still active
  - localStorage contains `eaePortfolioViewModeV2` with value `"timeline"`
- **Method**: Open DevTools Storage tab, check localStorage key after refresh

### Test 2.5: Switching views does not duplicate cards
- **Description**: No duplicate cards appear when toggling between modes.
- **Pass criteria**:
  - Count visible cards in Cards view (e.g., 5 cards)
  - Switch to Timeline view
  - Count timeline items (should match or be chronologically arranged)
  - Switch back to Cards view
  - Card count remains the same, no duplicates added
- **Method**: Manually count cards in DevTools or run a query

---

## Phase 3: Search & Filter (Must pass)

### Test 3.1: Achievement search by title
- **Description**: Search input filters achievements by matching title or summary.
- **Pass criteria**:
  - Type a known achievement title into `#achievementSearch`
  - Only matching cards display
  - Result count updates (e.g., "1 of 12 cards shown")
  - Matching card is visible and not hidden
- **Method**: Use search box, verify result visibility and count

### Test 3.2: Search with no match
- **Description**: Search with non-matching text shows appropriate empty state.
- **Pass criteria**:
  - Search for "xyz999notreal"
  - Result count shows "0 of 12 cards shown" or similar
  - Empty state message appears (if implemented) or no cards render
  - No console errors
- **Method**: Search for gibberish, verify graceful handling

### Test 3.3: Clear search restores all cards
- **Description**: Clearing search box restores full achievement list.
- **Pass criteria**:
  - Type search term, cards filter
  - Clear search input
  - All cards reappear
  - Result count shows full list again
- **Method**: Search, clear, verify count updates

---

## Phase 4: Modals & Interactions (Must pass)

### Test 4.1: Achievement modal opens on card click
- **Description**: Clicking an achievement card opens the modal with full details.
- **Pass criteria**:
  - Modal `#achievementModal` becomes visible
  - Modal displays correct achievement title, date, category
  - Modal shows full description, reflection, images, and certificates
  - Modal overlays the page correctly
  - No horizontal overflow in modal
- **Method**: Click any achievement card, verify modal content

### Test 4.2: Modal close button works
- **Description**: Close button (×) closes the modal.
- **Pass criteria**:
  - Modal is open
  - Click close button
  - Modal is hidden
  - Page scroll is restored (if scroll was disabled)
- **Method**: Open modal, click × button, verify hidden

### Test 4.3: Escape key closes modal
- **Description**: Pressing Escape closes the modal.
- **Pass criteria**:
  - Modal is open
  - Press Escape key
  - Modal closes
  - Focus returns to the card that opened it (if accessible)
- **Method**: Open modal, press Escape, verify closed

### Test 4.4: Modal does not overflow viewport on mobile
- **Description**: Modal fits within viewport on 375px width.
- **Pass criteria**:
  - Set viewport to 375px
  - Open modal
  - No horizontal scrolling
  - Close button remains visible
  - Modal can be closed
- **Method**: DevTools mobile view, open modal, check for overflow

---

## Phase 5: New Features (Must pass)

### Test 5.1: Timeline is sorted chronologically
- **Description**: Achievements are ordered from earliest to latest date in Timeline view.
- **Pass criteria**:
  - Open Timeline view
  - Extract dates from all visible timeline items
  - Dates are in ascending order (oldest first)
  - No console errors during sort
- **Method**: Inspect `.timeline-item .date-line` text, verify sort order

### Test 5.2: Timeline alternates left/right around spine
- **Description**: Timeline cards are balanced on both sides of the center line.
- **Pass criteria**:
  - Timeline has visible centered spine/line
  - First card is on left
  - Second card is on right
  - Pattern continues alternating
  - No cards overlap the spine
- **Method**: Visual inspection, check `.left` and `.right` classes on items

### Test 5.3: Floating timeline controls appear/disappear
- **Description**: Floating controls become visible when scrolling to achievements section.
- **Pass criteria**:
  - Scroll to top: floating controls are hidden or very transparent
  - Scroll to Achievements section: controls appear and are opaque
  - Scroll past Achievements: controls fade or hide again
- **Method**: Scroll page, watch floating element opacity

### Test 5.4: Year filter works
- **Description**: Timeline year filter pills show/hide achievements by year.
- **Pass criteria**:
  - Year filter bar exists below "Timeline" heading
  - "All" pill is active by default, all items visible
  - Click a year pill (e.g., "2024")
  - Only items from that year show
  - Click "All" again, all items reappear
- **Method**: Click year filters, verify item visibility

### Test 5.5: Scroll progress bar updates
- **Description**: Progress bar at top of header fills as user scrolls.
- **Pass criteria**:
  - Progress bar exists in header
  - On page load, bar width is 0% or minimal
  - Scroll halfway down page, bar fills to ~50%
  - Scroll to bottom, bar is nearly full
  - No jitter or jumpy behaviour
- **Method**: Scroll page, watch progress bar fill

### Test 5.6: Placeholder text is removed
- **Description**: Placeholder phrases like "TBD", "Coming soon", "Pending" are not visible.
- **Pass criteria**:
  - Search page text for "tbd", "to be updated", "coming soon", "unconfirmed", "pending"
  - None of these phrases appear in rendered content
  - If they exist in data, they are hidden via CSS or filtered
- **Method**: Ctrl+F search, inspect page source, verify cleanup

---

## Phase 6: Live Editor (Must pass)

### Test 6.1: Live editor FAB appears
- **Description**: Floating action button for Live Editor is visible at bottom-right.
- **Pass criteria**:
  - `.live-editor-fab` element exists
  - Button is positioned at bottom-right of screen
  - Button text or icon indicates "Edit" or similar
  - Button does not overlap critical page content on mobile
- **Method**: Inspect bottom-right corner, look for edit icon/button

### Test 6.2: Live editor sidebar opens and closes
- **Description**: Clicking FAB opens editor sidebar; clicking again or close button closes it.
- **Pass criteria**:
  - Click FAB, `.live-editor-sidebar` slides in or appears
  - Close button inside sidebar works
  - Sidebar closes cleanly without breaking layout
  - Page content shifts or sidebar is overlaid appropriately
- **Method**: Click FAB, verify sidebar appears; click close, verify it hides

### Test 6.3: Save API route exists
- **Description**: POST `/api/save` endpoint is available for saving changes.
- **Pass criteria**:
  - Endpoint exists (check `server.js`)
  - No 404 errors when attempting save
  - Path traversal protection is in place (server validates paths)
- **Method**: Inspect `server.js` for route definition and validation

---

## Phase 7: Data Integrity (Must pass)

### Test 7.1: PORTFOLIO_DATA structure is intact
- **Description**: `window.PORTFOLIO_DATA` has all expected top-level keys.
- **Pass criteria**:
  - `PORTFOLIO_DATA.profile` exists (name, title, intro, etc.)
  - `PORTFOLIO_DATA.projects` is an array with at least 3 items
  - `PORTFOLIO_DATA.achievements` is an array with at least 5 items
  - `PORTFOLIO_DATA.goals` exists
  - `PORTFOLIO_DATA.customSections` is an array (may be empty)
- **Method**: Open DevTools console, type `window.PORTFOLIO_DATA`, inspect structure

### Test 7.2: No missing images or broken links
- **Description**: Project and achievement images exist or have fallback placeholders.
- **Pass criteria**:
  - All project cards show images (not broken)
  - Achievement cards with `.image` property show thumbnails
  - No 404 errors in Network tab for images used
  - Broken image paths fall back gracefully
- **Method**: Open Network tab, load page, filter by images, verify no 404s

---

## Phase 8: No Console Errors (Must pass)

### Test 8.1: Page logs no errors or warnings
- **Description**: Console is clean on page load and during interaction.
- **Pass criteria**:
  - No red error messages in DevTools Console
  - No undefined variable warnings
  - No failed fetch/network requests
  - Warnings are acceptable if they are from third-party libraries or minor
- **Method**: Open DevTools Console, reload page, verify clean state

---

## Regression Test Results Template

Copy and fill this in after running all tests:

```
Date: YYYY-MM-DD
Environment: Node v__, Chrome v__
Viewport: 1366x900 (desktop)

PHASE 1: CORE RENDERING
[ ] 1.1 Homepage loads
[ ] 1.2 Projects render
[ ] 1.3 Achievements render
[ ] 1.4 Personal map renders
[ ] 1.5 Evidence deck renders

PHASE 2: VIEW MODES
[ ] 2.1 Cards view default
[ ] 2.2 Timeline view loads
[ ] 2.3 Story view loads
[ ] 2.4 View mode persists
[ ] 2.5 No duplicate cards

PHASE 3: SEARCH & FILTER
[ ] 3.1 Search by title
[ ] 3.2 No match handling
[ ] 3.3 Clear search

PHASE 4: MODALS
[ ] 4.1 Modal opens
[ ] 4.2 Close button works
[ ] 4.3 Escape closes
[ ] 4.4 Mobile modal fit

PHASE 5: NEW FEATURES
[ ] 5.1 Timeline sorted
[ ] 5.2 Alternating spine
[ ] 5.3 Floating controls
[ ] 5.4 Year filter
[ ] 5.5 Progress bar
[ ] 5.6 Placeholders removed

PHASE 6: LIVE EDITOR
[ ] 6.1 FAB visible
[ ] 6.2 Sidebar opens/closes
[ ] 6.3 Save API exists

PHASE 7: DATA INTEGRITY
[ ] 7.1 PORTFOLIO_DATA intact
[ ] 7.2 No broken images

PHASE 8: CONSOLE
[ ] 8.1 No console errors

Total: __/39 tests passed
```

---

## How to Run

1. Start server: `node server.js`
2. Open `http://localhost:3000` in browser
3. Open DevTools (F12)
4. Go through each phase, checking off as you pass
5. Record any failures with screenshot and console error
6. Document findings in improvement report
