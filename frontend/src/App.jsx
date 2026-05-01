import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Extract from './pages/Extract'
import Trials from './pages/Trials'
import Pipeline from './pages/Pipeline'
import History from './pages/History'

const TITLES = {
  '/': 'Dashboard',
  '/extract': 'Clinical NER Extraction',
  '/trials': 'Patient-Trial Matcher',
  '/pipeline': 'Full Pipeline',
  '/history': 'Analysis History',
}

const SUBS = {
  '/': 'ClinicalBERT · BioBERT · ICD-10 · FAISS · Claude Sonnet',
  '/extract': 'Named Entity Recognition from unstructured clinical notes',
  '/trials': 'BioBERT embeddings + FAISS vector search for patient-trial matching',
  '/pipeline': 'End-to-end: NER → ICD Classification → Trial Matching',
  '/history': 'Past clinical note analyses',
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
          <p className="text-xs mono" style={{ color: '#555566' }}>
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
      </main>
    </div>
  )
}
