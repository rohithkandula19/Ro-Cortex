import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Extract from './pages/Extract'
import Trials from './pages/Trials'
import Pipeline from './pages/Pipeline'
import History from './pages/History'

const TITLES = {
  '/': 'Dashboard',
  '/extract': 'Note Extraction',
  '/trials': 'Trial Matcher',
  '/pipeline': 'End to end pipeline',
  '/history': 'Analysis history',
}

const SUBS = {
  '/': 'Live view of extractions, codes, and trial matches across your team.',
  '/extract': 'Paste a clinical note and get back structured entities, ICD-10 codes, and a confidence score.',
  '/trials': 'Match a patient profile to active clinical trials using semantic search and rule based eligibility.',
  '/pipeline': 'Run extraction, coding, and trial matching together in a single call.',
  '/history': 'Every analysis your team has run, all in one place.',
}

export default function App() {
  const loc = useLocation()
  const isHome = loc.pathname === '/'

  return (
    <div style={{ minHeight: '100vh', background: '#FFF7F1' }}>
      <Navbar />
      {isHome ? (
        <Dashboard />
      ) : (
        <main key={loc.pathname} className="pt-24 px-6 md:px-8 pb-16 max-w-6xl mx-auto fade-up">
          <div className="py-4 mb-6">
            <h1 className="display text-4xl md:text-5xl mb-2" style={{ color: '#161624' }}>
              {TITLES[loc.pathname] || 'RO Cortex'}
            </h1>
            <p className="text-sm" style={{ color: '#6B6B7C', maxWidth: 640 }}>
              {SUBS[loc.pathname] || ''}
            </p>
          </div>
          <Routes>
            <Route path="/extract" element={<Extract />} />
            <Route path="/trials" element={<Trials />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      )}
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="px-6 md:px-8 py-10 mt-10" style={{ borderTop: '1px solid #F1E2D4' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#FF6B47' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 9c0-2 1.8-4 5-4s5 2 5 4c0 2.5-2 3-3 3v1.5c1.5.3 3 1.5 3 3.5 0 2-1.8 3.5-5 3.5s-5-1.5-5-3.5" />
            </svg>
          </div>
          <span className="text-sm" style={{ color: '#6B6B7C' }}>
            © 2026 RO Cortex. Built for clinical teams.
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs" style={{ color: '#6B6B7C' }}>
          <span className="mono">v1.0.0</span>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:underline">API docs</a>
          <a href="https://github.com/rohithkandula19/Ro-Cortex" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
