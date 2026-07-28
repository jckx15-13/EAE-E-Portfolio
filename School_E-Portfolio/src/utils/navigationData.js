// Consolidated page navigation map - mirrors the school portfolio structure
export const PAGES = [
  { file: 'Home.html', label: 'Home', path: '/', group: 'Overview' },

  { file: 'Secondary 1.html', label: 'Secondary 1', path: '/secondary-1', group: 'Secondary 1', parent: '/' },
  { file: 'S1-Term 1.html', label: 'S1-Term 1', path: '/s1-term-1', group: 'Secondary 1', parent: '/secondary-1' },
  { file: 'S1-Term 2.html', label: 'S1-Term 2', path: '/s1-term-2', group: 'Secondary 1', parent: '/secondary-1' },
  { file: 'S1-Term 3.html', label: 'S1-Term 3', path: '/s1-term-3', group: 'Secondary 1', parent: '/secondary-1' },
  { file: 'S1-Term 4.html', label: 'S1-Term 4', path: '/s1-term-4', group: 'Secondary 1', parent: '/secondary-1' },

  { file: 'Secondary 2.html', label: 'Secondary 2', path: '/secondary-2', group: 'Secondary 2', parent: '/' },
  { file: 'S2 -Term 1.html', label: 'S2 -Term 1', path: '/s2-term-1', group: 'Secondary 2', parent: '/secondary-2' },
  { file: 'S2 - Term 2.html', label: 'S2 - Term 2', path: '/s2-term-2', group: 'Secondary 2', parent: '/secondary-2' },

  { file: 'Secondary 3.html', label: 'Secondary 3', path: '/secondary-3', group: 'Secondary 3', parent: '/' },
  { file: 'S3 - Term 1.html', label: 'S3 - Term 1', path: '/s3-term-1', group: 'Secondary 3', parent: '/secondary-3' },
  { file: 'S3 - Term 2.html', label: 'S3 - Term 2', path: '/s3-term-2', group: 'Secondary 3', parent: '/secondary-3' },
  { file: 'S3 - Term 3.html', label: 'S3 - Term 3', path: '/s3-term-3', group: 'Secondary 3', parent: '/secondary-3' },
  { file: 'S3 - Term 4.html', label: 'S3 - Term 4', path: '/s3-term-4', group: 'Secondary 3', parent: '/secondary-3' },
  { file: ' Secondary 3 2025 June Holiday ApLM Course.html', label: 'June Holiday ApLM Course', path: '/s3-aplm', short: 'June Holiday ApLM', group: 'Secondary 3', parent: '/secondary-3' },

  { file: 'Orientation Camp Leader.html', label: 'Orientation Camp Leader', path: '/orientation', group: 'Programmes', parent: '/' },

  { file: 'Secondary 4.html', label: 'Secondary 4', path: '/secondary-4', group: 'Secondary 4', parent: '/' },
  { file: 'S4 - Term 1.html', label: 'S4 - Term 1', path: '/s4-term-1', group: 'Secondary 4', parent: '/secondary-4' },
  { file: 'S4 - Term 2.html', label: 'S4 - Term 2', path: '/s4-term-2', group: 'Secondary 4', parent: '/secondary-4' },

  { file: 'Overall Endorsements And Achivements.html', label: 'Endorsements & Achivements', path: '/endorsements', short: 'Endorsements & Achivements', group: 'Recognition', parent: '/' },

  { file: 'Achievers Program.html', label: 'Achievers Program', path: '/achievers', group: 'Programmes', parent: '/' },
  { file: 'E-A-E.html', label: 'E-A-E', path: '/eae', group: 'Programmes', parent: '/' },
  { file: 'CCA.html', label: 'CCA', path: '/cca', group: 'Programmes', parent: '/' },
  { file: 'Personal Projects.html', label: 'Personal Projects', path: '/personal', group: 'Programmes', parent: '/' }
]

export const PAGE_MAP = new Map(PAGES.map(p => [p.path, p]))

export const GROUP_ORDER = ['Overview', 'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Programmes', 'Recognition']

export const getPageByPath = (path) => PAGE_MAP.get(path)

export const getPagesByGroup = (group) => PAGES.filter(p => p.group === group)

export const getPrevPage = (currentPath) => {
  const idx = PAGES.findIndex(p => p.path === currentPath)
  return idx > 0 ? PAGES[idx - 1] : null
}

export const getNextPage = (currentPath) => {
  const idx = PAGES.findIndex(p => p.path === currentPath)
  return idx < PAGES.length - 1 ? PAGES[idx + 1] : null
}

export const getBreadcrumb = (currentPath) => {
  const page = getPageByPath(currentPath)
  if (!page) return [{ label: 'Home', path: '/' }]

  const trail = []
  let current = page

  while (current.parent) {
    const parent = getPageByPath(current.parent)
    if (!parent) break
    trail.unshift({ label: parent.label, path: parent.path })
    current = parent
  }

  // Root crumb, unless the ancestor walk already ended at the root page.
  if (!trail.length || trail[0].path !== '/') {
    trail.unshift({ label: 'Home', path: '/' })
  }

  if (page.path !== '/') {
    trail.push({ label: page.short || page.label, path: page.path })
  }

  return trail
}
