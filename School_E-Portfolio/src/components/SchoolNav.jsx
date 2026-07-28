import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PAGES, GROUP_ORDER, getBreadcrumb } from '../utils/navigationData'
import '../styles/SchoolNav.css'

export default function SchoolNav({ onThemeToggle, currentTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  
  const breadcrumb = getBreadcrumb(location.pathname)
  const pagesByGroup = {}
  GROUP_ORDER.forEach(group => {
    pagesByGroup[group] = PAGES.filter(p => p.group === group)
  })

  return (
    <nav className="school-nav-bar" aria-label="School e-portfolio">
      <Link to="/" className="school-nav-back-btn" aria-label="Back to main EAE portfolio">
        <span className="school-nav-back-glyph">←</span>
        <span className="school-nav-back-label">Main portfolio</span>
      </Link>

      <span className="school-nav-title">School E-Portfolio</span>

      <ol className="school-nav-crumbs">
        {breadcrumb.map((item, idx) => (
          <li key={idx} className="school-nav-crumb">
            {idx === breadcrumb.length - 1 ? (
              <span className="school-nav-crumb-label school-nav-page" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="school-nav-crumb-label school-nav-crumb-link">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>

      <div className="school-nav-actions">
        <button
          className="school-nav-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="school-nav-menu"
          aria-haspopup="true"
        >
          <span className="school-nav-menu-glyph">☰</span>
          <span className="school-nav-menu-label">Pages</span>
        </button>
        
        <button
          className="school-nav-theme-btn"
          onClick={onThemeToggle}
          title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {currentTheme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {menuOpen && (
        <div className="school-nav-menu" id="school-nav-menu">
          {GROUP_ORDER.map(group => (
            pagesByGroup[group]?.length > 0 && (
              <div key={group} className="school-nav-menu-group">
                <p className="school-nav-menu-heading">{group}</p>
                <ul className="school-nav-menu-list">
                  {pagesByGroup[group].map(page => (
                    <li key={page.path}>
                      <Link
                        to={page.path}
                        className={`school-nav-menu-link ${location.pathname === page.path ? 'is-current' : ''}`}
                        onClick={() => setMenuOpen(false)}
                        {...(location.pathname === page.path && { 'aria-current': 'page' })}
                      >
                        {page.short || page.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>
      )}
    </nav>
  )
}
