# Project: EAE Portfolio Core Frontend Documentation & Sectioning

## Architecture
- Codebase location: `/home/admin/Documents/EAE Materials`
- Core frontend files: `script.js`, `style.css`, `data.js`, `index.html`
- Server & Testing: `server.js`, `npm run test:data`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Baseline & Exploration | Inspect codebase, run baseline tests | none | DONE |
| 2 | data.js & index.html Documentation | Add TOC, ASCII banners, schema & region annotations | M1 | DONE |
| 3 | style.css Documentation | Add TOC, ASCII banners, CSS selector layout & responsive notes | M1, M2 | IN_PROGRESS |
| 4 | script.js Documentation | Add TOC, ASCII banners, JSDoc annotations (@param, @returns, etc.) | M1, M2, M3 | PLANNED |
| 5 | E2E Testing & Audit Verification | Run verification suite, forensic audit, Sentinel claim | M1-M4 | PLANNED |

## Code Layout
- `index.html`: Entry point HTML layout and template structures
- `style.css`: Visual styling, design tokens, layout, responsive queries
- `data.js`: Data models, portfolio items, schema definitions
- `script.js`: State management, event listeners, view modes, dynamic rendering, editor suite
- `server.js`: Node.js server setup
- `test/` or data test scripts (`npm run test:data`): Data integrity verification suite

## Interface Contracts
- All existing function signatures, data structures, DOM IDs, class names, event listener targets, and API endpoints must remain unchanged.
