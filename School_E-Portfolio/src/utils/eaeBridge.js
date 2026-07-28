// Bridge between the vanilla EAE portfolio and this React school portfolio.
// The main portfolio writes `eaePortfolioReturn` when its School E-Portfolio
// button is clicked; this module reads it so the transition keeps the same
// theme and the back button returns to the exact section the visitor left.

const RETURN_KEY = 'eaePortfolioReturn'
const THEME_KEY = 'eaePortfolioTheme'

export function readHandoff() {
  try {
    const raw = localStorage.getItem(RETURN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

export function initialTheme() {
  const handoff = readHandoff()
  if (handoff?.theme === 'light' || handoff?.theme === 'dark') return handoff.theme
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch (error) { /* private mode */ }
  return 'dark'
}

// The app runs either standalone (vite dev / vite preview, basename '/') or
// from a subfolder of the main portfolio server. Everything up to and
// including 'dist' in the path is the router basename in that case.
export function routerBasename() {
  const match = window.location.pathname.match(/^(.*\/dist)(\/|$)/)
  return match ? match[1] : '/'
}

// Back to the vanilla portfolio, landing on the section the visitor left from.
export function mainPortfolioHref() {
  const handoff = readHandoff()
  const hash = typeof handoff?.hash === 'string' && handoff.hash.startsWith('#') ? handoff.hash : ''
  const base = routerBasename()
  if (base !== '/') {
    return base.replace(/School_E-Portfolio\/dist$/, '') + 'index.html' + hash
  }
  return '/index.html' + hash
}
