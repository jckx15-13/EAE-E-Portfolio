# School E-Portfolio (React)

A React-based school portfolio migrated from 30 Google Sites exports.

## Structure

- `/src/pages/` - Page components (Secondary 1-4, terms, programs)
- `/src/components/` - Shared components (SchoolNav)
- `/src/styles/` - Consolidated CSS
- `/src/utils/` - Navigation data and helpers
- `/archived_exports/` - Original Google Sites HTML exports (preserved)

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3001`

## Build

```bash
npm run build
```

## Design Principles

- Keep design consistent with original exports
- WCAG 2.1 AA accessibility
- Multi-page/SPA hybrid navigation
- Dark/light theme support
