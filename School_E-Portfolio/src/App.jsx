import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SchoolNav from './components/SchoolNav'

// Lazy load page components
import Home from './pages/Home'
import Secondary1 from './pages/Secondary1'
import Secondary2 from './pages/Secondary2'
import Secondary3 from './pages/Secondary3'
import Secondary4 from './pages/Secondary4'
import S1Term1 from './pages/terms/S1Term1'
import S1Term2 from './pages/terms/S1Term2'
import S1Term3 from './pages/terms/S1Term3'
import S1Term4 from './pages/terms/S1Term4'
import S2Term1 from './pages/terms/S2Term1'
import S2Term2 from './pages/terms/S2Term2'
import S3Term1 from './pages/terms/S3Term1'
import S3Term2 from './pages/terms/S3Term2'
import S3Term3 from './pages/terms/S3Term3'
import S3Term4 from './pages/terms/S3Term4'
import S4Term1 from './pages/terms/S4Term1'
import S4Term2 from './pages/terms/S4Term2'
import Achievers from './pages/programs/Achievers'
import CCA from './pages/programs/CCA'
import EAE from './pages/programs/EAE'
import Orientation from './pages/programs/Orientation'
import Personal from './pages/programs/Personal'
import Endorsements from './pages/recognition/Endorsements'
import ApLM from './pages/terms/ApLM'

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('eaePortfolioTheme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-school-theme', theme)
    localStorage.setItem('eaePortfolioTheme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Router>
      <div className="school-portfolio-app">
        <SchoolNav onThemeToggle={toggleTheme} currentTheme={theme} />
        <main className="school-portfolio-main">
          <Routes>
            {/* Overview */}
            <Route path="/" element={<Home />} />

            {/* Secondary 1 */}
            <Route path="/secondary-1" element={<Secondary1 />} />
            <Route path="/s1-term-1" element={<S1Term1 />} />
            <Route path="/s1-term-2" element={<S1Term2 />} />
            <Route path="/s1-term-3" element={<S1Term3 />} />
            <Route path="/s1-term-4" element={<S1Term4 />} />

            {/* Secondary 2 */}
            <Route path="/secondary-2" element={<Secondary2 />} />
            <Route path="/s2-term-1" element={<S2Term1 />} />
            <Route path="/s2-term-2" element={<S2Term2 />} />

            {/* Secondary 3 */}
            <Route path="/secondary-3" element={<Secondary3 />} />
            <Route path="/s3-term-1" element={<S3Term1 />} />
            <Route path="/s3-term-2" element={<S3Term2 />} />
            <Route path="/s3-term-3" element={<S3Term3 />} />
            <Route path="/s3-term-4" element={<S3Term4 />} />
            <Route path="/s3-aplm" element={<ApLM />} />

            {/* Secondary 4 */}
            <Route path="/secondary-4" element={<Secondary4 />} />
            <Route path="/s4-term-1" element={<S4Term1 />} />
            <Route path="/s4-term-2" element={<S4Term2 />} />

            {/* Programmes */}
            <Route path="/achievers" element={<Achievers />} />
            <Route path="/cca" element={<CCA />} />
            <Route path="/eae" element={<EAE />} />
            <Route path="/orientation" element={<Orientation />} />
            <Route path="/personal" element={<Personal />} />

            {/* Recognition */}
            <Route path="/endorsements" element={<Endorsements />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
