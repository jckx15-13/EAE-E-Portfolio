# FLL 2026 UNEARTHED Strategy Engine

**Competition-grade strategy planning tool for FIRST LEGO League 2026 UNEARTHED**

A Python/matplotlib application that visualizes the competition field, allows mission selection via UI clicks, syncs with Google Sheets, and includes path optimization.

---

## 📁 Project Location

**Working Directory:**  
`C:\Users\jaron\OneDrive - Ministry of Education (M365 T&L)\Documents\First LEGO League 2026 [FLL]\Simulation Testing\`

**Python Environment:**  
`C:\Users\jaron\AppData\Local\Programs\Python\Python314\python.exe`

---

## 🗂️ File Structure

```
Simulation Testing/
├── path_simulation.py          ← Core engine (all modules 0-5)
├── launcher.py                 ← Entry point (module 6)
├── cloud_settings.json         ← Google Cloud config
├── .git/                       ← Local repo, branch "seed"
│
../[FLL]/                        ← Parent folder
├── calibration.json            ← Viewport calibration
├── service_account.json        ← Google OAuth credentials  
├── fll_map.png                 ← Field background image
├── fll-challenge-unearthed-wireframe.pdf  ← Original wireframe
└── FLL_Mission_Data.xlsx       ← Local fallback data
```

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r REQUIREMENTS.txt
   ```

2. **Run the engine:**
   ```bash
   python launcher.py
   ```

3. **Controls:**
   - Click mission dots to toggle them in/out of route
   - Press **SYNC NOW** to pull latest data from Google Sheets
   - Press **[T] START** to begin 2:30 match countdown
   - Press **SAVE ✓** to save viewport calibration

---

## 📋 Key Features

**Working:**
- ✅ Matplotlib UI with mission dots, button panel, timer
- ✅ Google Sheets sync (reads `FLL Mission Data` spreadsheet)
- ✅ Manual mission selection (click to toggle)
- ✅ Match timer (150 seconds)
- ✅ Calibration system for image alignment
- ✅ Offline fallback to local Excel file

**In Progress:**
- 🔧 Async queue pattern for thread-safe rendering
- 🔧 UI polish (alignment, professional styling)
- 🔧 Mat dimensions box (2019mm × 1137mm)
- 🔧 Start zone visualization (red/blue)
- 🔧 Brightened field map
- 🔧 Robot start position indicator

---

## 📚 Documentation

- **PROJECT_STATUS.md** - Current state and git info
- **ARCHITECTURE.md** - Technical design and rules
- **TODO.md** - Known issues and next steps
- **FIELD_SPECS.md** - Field dimensions and coordinates
- **REQUIREMENTS.txt** - Python dependencies

---

## 🏗️ Architecture Overview

**Part 1: Display Engine** (standalone)
- Mission visualization
- Google Sheets sync
- UI controls
- Timer system

**Part 2: PathOptimizer** (isolated, optional)
- Can be deleted without breaking Part 1
- Declares own imports
- Guarded by `_PART2_AVAILABLE` flag

---

## 🔑 Google Cloud Setup

Edit `cloud_settings.json`:
```json
{
  "project_id": "fll-challenge-competition-2026",
  "bot_id": "fll-strategy-program",
  "sheet_name": "FLL Mission Data",
  "key_file": "service_account.json"
}
```

---

## 🐛 Support

See **TODO.md** for known issues and fixes in progress.

---

## 📄 License

Educational project for FLL 2026 competition preparation.
