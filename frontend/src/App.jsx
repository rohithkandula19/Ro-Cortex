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
  '/pipeline': 'End to End Pipeline',
  '/history': 'Analysis History',
}

const SUBS = {
  '/': 'Live view of extractions, codes, and trial matches across your team.',
  '/extract': 'Paste a clinical note and get structured entities, ICD-10 codes, and a confidence score.',
  '/trials': 'Match a patient profile to active clinical trials using semantic search and rule based eligibility.',
  '/pipeline': 'Run extraction, coding, and trial matching together in a single call.',
  '/history': 'Every analysis your team has run, searchable and exportable.',
}

export default function App() {
  const loc = useLocation()
  return (
    <div style={{ minHeight: '100vh', background: '#080810' }}>
      <Navbar />
      <main className="pt-16 px-4 md:px-8 pb-8 max-w-6xl mx-auto">
        <div className="py-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
            {TITLES[loc.pathname] || 'RO Cortex'}
          </h1>
          <p className="text-xs" style={{ color: '#A0A0B0' }}>
            {SUBS[loc.pathname] || ''}
          </p>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/extract" element={<Extract />} />
          <Route path="/trials" element={<Trials />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/history" element={<History />} />
        </Routes>
        <footer className="mt-16 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          style={{ borderTop: '1px solid #1A1A2E' }}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #7B2FBE 100%)' }}>
              <span className="text-[8px] font-bold mono" style={{ color: '#080810' }}>RO</span>
            </div>
            <span className="text-xs" style={{ color: '#555566' }}>
              © 2026 RO Cortex. Built for clinical teams.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs mono" style={{ color: '#555566' }}>
            <span>v1.0.0</span>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: '#A0A0B0' }}>API docs</a>
            <a href="https://github.com/rohithkandula19/Ro-Cortex" target="_blank" rel="noreferrer" style={{ color: '#A0A0B0' }}>GitHub</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
