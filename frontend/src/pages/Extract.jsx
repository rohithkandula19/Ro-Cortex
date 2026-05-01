import { useState, useEffect } from 'react'
import axios from 'axios'
import ExtractedCard from '../components/ExtractedCard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SAMPLE_META = {
  'Diabetic patient': { initials: 'DM', tone: '#0F4F4A', age: '67M', tags: ['T2DM', 'CKD', 'HTN'] },
  'Oncology patient': { initials: 'BC', tone: '#8E2C5A', age: '54F', tags: ['Breast Ca', 'Stage II'] },
  'Cardiac patient': { initials: 'CH', tone: '#B23A48', age: '72M', tags: ['CHF', 'EF 30%'] },
  'COPD exacerbation': { initials: 'CO', tone: '#6D28D9', age: '63F', tags: ['COPD', 'Severe'] },
  'Stroke workup': { initials: 'CV', tone: '#1D4ED8', age: '78M', tags: ['Stroke', 'AFib'] },
  'Pediatric asthma': { initials: 'PA', tone: '#0E7490', age: '9F', tags: ['Asthma', 'Acute'] },
  'Postpartum check': { initials: 'PP', tone: '#15803D', age: '32F', tags: ['Postpartum', 'G2P2'] },
  'Geriatric falls': { initials: 'GF', tone: '#9A6700', age: '84F', tags: ['Falls', 'Osteoporosis'] },
  'Mental health visit': { initials: 'MH', tone: '#6D28D9', age: '28M', tags: ['MDD', 'GAD'] },
  'Sepsis workup': { initials: 'SP', tone: '#B91C1C', age: '71M', tags: ['Sepsis', 'UTI'] },
}

export default function Extract() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoNotes, setDemoNotes] = useState([])

  useEffect(() => {
    axios.get(`${API}/demo-notes`).then(r => setDemoNotes(r.data)).catch(() => {})
  }, [])

  const extract = async (t) => {
    const noteText = t || text
    if (!noteText.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post(`${API}/extract`, { text: noteText })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not reach the backend.')
    }
    setLoading(false)
  }

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        extract()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [text])

  const copyJson = () => {
    if (!result) return
    navigator.clipboard.writeText(JSON.stringify(result.extracted, null, 2))
  }

  return (
    <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
      {/* Left: input + patient picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: '#1B1A1F' }}>Clinical note</p>
          <span className="text-xs mono" style={{ color: '#6F6A66' }}>{text.trim() ? `${text.trim().length} chars` : 'empty'}</span>
        </div>
        <div className="card p-0 overflow-hidden mb-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Drop in a discharge summary, progress note, or anything a clinician might write..."
            rows={9}
            className="w-full p-4 text-sm resize-none outline-none mono bg-transparent"
            style={{ color: '#1B1A1F' }}
          />
        </div>
        <button onClick={() => extract()} disabled={loading || !text.trim()} className="btn-primary w-full justify-center mb-3">
          {loading ? 'Reading the note...' : 'Run extraction'}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          )}
        </button>
        <p className="text-xs mono text-center mb-6" style={{ color: '#6F6A66' }}>
          press <kbd className="px-1.5 py-0.5 rounded mono" style={{ background: '#F4EEE3', border: '1px solid #E4D9C5', color: '#1B1A1F' }}>⌘</kbd>
          {' '}<kbd className="px-1.5 py-0.5 rounded mono" style={{ background: '#F4EEE3', border: '1px solid #E4D9C5', color: '#1B1A1F' }}>⏎</kbd> to extract
        </p>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs mono uppercase tracking-wider" style={{ color: '#6F6A66' }}>Sample patients</p>
          <span className="text-xs mono" style={{ color: '#6F6A66' }}>{demoNotes.length} cases</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {demoNotes.map((n, i) => {
            const meta = SAMPLE_META[n.label] || { initials: 'PT', tone: '#0F4F4A', age: '', tags: [] }
            return (
              <button key={i}
                onClick={() => { setText(n.text); extract(n.text) }}
                disabled={loading}
                className="card card-hover text-left p-3 flex items-center gap-3 transition-all">
                <div className="avatar flex-shrink-0" style={{ background: `${meta.tone}15`, color: meta.tone }}>
                  {meta.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1B1A1F' }}>{n.label}</p>
                    {meta.age && <span className="text-xs mono" style={{ color: '#6F6A66' }}>· {meta.age}</span>}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {meta.tags.map((t, j) => (
                      <span key={j} className="text-[10px] mono px-1.5 py-0.5 rounded"
                        style={{ background: '#F4EEE3', color: '#39363F', border: '1px solid #E4D9C5' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6F6A66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#FCEBED', border: '1px solid #F1B5BC' }}>
            <p className="text-xs mono" style={{ color: '#B23A48' }}>{error}</p>
          </div>
        )}
      </div>

      {/* Right: structured output */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: '#1B1A1F' }}>Structured output</p>
          {result && (
            <div className="flex items-center gap-2">
              <span className="text-xs mono px-2 py-0.5 rounded" style={{ background: '#E8F2EE', color: '#1F7A57' }}>parsed</span>
              <button onClick={copyJson} className="text-xs mono px-2 py-0.5 rounded transition-colors"
                style={{ background: '#F4EEE3', color: '#1B1A1F', border: '1px solid #E4D9C5' }}>
                copy json
              </button>
            </div>
          )}
        </div>

        {result && (
          <div className="card p-3 mb-3 grid grid-cols-4 gap-2 slide-in">
            {[
              ['Diagnoses', result.extracted?.diagnoses?.length || 0],
              ['Meds', result.extracted?.medications?.length || 0],
              ['Vitals', Object.values(result.extracted?.vitals || {}).filter(Boolean).length],
              ['Labs', (result.extracted?.lab_results || []).length],
            ].map(([l, v]) => (
              <div key={l} className="text-center px-2 py-1.5 rounded" style={{ background: '#FAF6EE' }}>
                <p className="display text-xl font-semibold" style={{ color: '#0F4F4A' }}>{v}</p>
                <p className="text-[10px] mono uppercase tracking-wider" style={{ color: '#6F6A66' }}>{l}</p>
              </div>
            ))}
          </div>
        )}

        {!result && !loading && <EmptyState />}

        {loading && <LoadingSkeleton />}

        {result && (
          <div className="slide-in">
            <ExtractedCard data={result.extracted} icdCodes={result.icd_codes} />
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card p-8 text-center" style={{ minHeight: 360 }}>
      <div className="flex items-center justify-center mb-5" style={{ height: 80 }}>
        <svg width="160" height="60" viewBox="0 0 160 60">
          <path
            d="M 0 30 L 30 30 L 38 30 L 42 22 L 46 38 L 50 10 L 54 50 L 58 30 L 90 30 L 98 30 L 102 22 L 106 38 L 110 10 L 114 50 L 118 30 L 160 30"
            fill="none" stroke="#0F4F4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="ecg-line"
          />
        </svg>
      </div>
      <p className="display text-2xl mb-2" style={{ color: '#1B1A1F' }}>Awaiting input</p>
      <p className="text-sm mb-6" style={{ color: '#6F6A66' }}>
        Paste a note or pick a sample patient to see the structured extraction.
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {['diagnoses', 'medications', 'vitals', 'lab_results', 'icd_codes', 'symptoms', 'referrals'].map(k => (
          <span key={k} className="text-xs mono px-2 py-1 rounded"
            style={{ background: '#F4EEE3', color: '#0F4F4A', border: '1px solid #E4D9C5' }}>{k}</span>
        ))}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-5">
        <div className="shimmer h-3 w-1/4 mb-4" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[0, 1, 2].map(i => (
            <div key={i}>
              <div className="shimmer h-2.5 w-1/2 mb-2" />
              <div className="shimmer h-7 w-2/3" />
            </div>
          ))}
        </div>
        <div className="shimmer h-3 w-full mb-2" />
        <div className="shimmer h-3 w-4/5" />
      </div>
      <div className="card p-5">
        <div className="shimmer h-3 w-1/4 mb-4" />
        {[0, 1, 2].map(i => (
          <div key={i} className="shimmer h-12 w-full mb-2" />
        ))}
      </div>
      <p className="text-xs text-center mono" style={{ color: '#0F4F4A' }}>
        <span className="inline-block w-1.5 h-1.5 rounded-full pulse-dot mr-2 align-middle" style={{ background: '#0F4F4A' }} />
        Reading the note and structuring fields...
      </p>
    </div>
  )
}
