// Cohort search — the page that turns a pile of extractions into a real query.
// Most NLP demos stop after one note. This is what you'd actually do with the
// structured output: ask population questions across everyone you've processed.

import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PRESET_QUERIES = [
  { label: 'Diabetics on Metformin', q: { diagnosis: 'diabetes', medication: 'metformin' } },
  { label: 'CKD stage 3+', q: { diagnosis: 'ckd' } },
  { label: 'Heart failure patients', q: { diagnosis: 'heart failure' } },
  { label: 'Female patients over 50', q: { gender: 'female', min_age: 50 } },
  { label: 'High confidence only', q: { min_confidence: 80 } },
]

export default function Cohort() {
  const [filters, setFilters] = useState({
    diagnosis: '', medication: '', icd_code: '',
    min_age: '', max_age: '', gender: '', min_confidence: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  const search = async (override) => {
    const f = override || filters
    // strip empty strings — the backend treats null and empty differently
    const payload = Object.fromEntries(
      Object.entries(f)
        .filter(([, v]) => v !== '' && v !== null && v !== undefined)
        .map(([k, v]) => [k, ['min_age','max_age','min_confidence'].includes(k) ? Number(v) : v])
    )

    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post(`${API}/cohort`, payload)
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Search failed')
    }
    setLoading(false)
  }

  const runPreset = (preset) => {
    const next = { diagnosis: '', medication: '', icd_code: '', min_age: '', max_age: '', gender: '', min_confidence: '', ...preset.q }
    setFilters(next)
    search(next)
  }

  const reset = () => setFilters({ diagnosis: '', medication: '', icd_code: '', min_age: '', max_age: '', gender: '', min_confidence: '' })

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-6">
      {/* Filters */}
      <aside>
        <div className="card p-5 mb-4">
          <p className="text-xs mono mb-4" style={{ color: '#6F6A66', letterSpacing: '0.1em' }}>FILTERS</p>

          <div className="flex flex-col gap-3">
            <Field label="Diagnosis contains" placeholder="e.g. diabetes"
              value={filters.diagnosis} onChange={v => set('diagnosis', v)} />
            <Field label="Medication contains" placeholder="e.g. metformin"
              value={filters.medication} onChange={v => set('medication', v)} />
            <Field label="ICD-10 prefix" placeholder="e.g. E11"
              value={filters.icd_code} onChange={v => set('icd_code', v)} mono />

            <div className="grid grid-cols-2 gap-2">
              <Field label="Min age" type="number" placeholder="0"
                value={filters.min_age} onChange={v => set('min_age', v)} />
              <Field label="Max age" type="number" placeholder="120"
                value={filters.max_age} onChange={v => set('max_age', v)} />
            </div>

            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#6F6A66' }}>Gender</label>
              <div className="flex gap-1">
                {['', 'male', 'female'].map(g => (
                  <button key={g || 'any'}
                    onClick={() => set('gender', g)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                    style={{
                      background: filters.gender === g ? '#0F4F4A' : '#FAF6EE',
                      color: filters.gender === g ? '#FAF6EE' : '#39363F',
                      border: '1px solid #E4D9C5',
                    }}>{g || 'any'}</button>
                ))}
              </div>
            </div>

            <Field label="Min confidence (%)" type="number" placeholder="0"
              value={filters.min_confidence} onChange={v => set('min_confidence', v)} />
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={() => search()} disabled={loading} className="btn-primary flex-1 justify-center text-sm">
              {loading ? 'Searching...' : 'Run search'}
            </button>
            <button onClick={reset} disabled={loading} className="btn-secondary text-sm">Clear</button>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs mono mb-3" style={{ color: '#6F6A66', letterSpacing: '0.1em' }}>SAVED QUERIES</p>
          <div className="flex flex-col gap-1.5">
            {PRESET_QUERIES.map((p, i) => (
              <button key={i}
                onClick={() => runPreset(p)}
                disabled={loading}
                className="text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: '#FAF6EE', border: '1px solid #E4D9C5', color: '#1B1A1F' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Results */}
      <section>
        {error && (
          <div className="card p-4 mb-4" style={{ background: '#FCEBED', borderColor: '#F1B5BC' }}>
            <p className="text-sm mono" style={{ color: '#B23A48' }}>{error}</p>
          </div>
        )}

        {!result && !loading && (
          <div className="card p-10 text-center" style={{ minHeight: 360 }}>
            <div className="flex justify-center mb-5">
              <svg width="200" height="80" viewBox="0 0 200 80">
                <circle cx="40" cy="40" r="14" fill="none" stroke="#0F4F4A" strokeWidth="1.5" />
                <circle cx="100" cy="25" r="10" fill="none" stroke="#C9A961" strokeWidth="1.5" />
                <circle cx="100" cy="55" r="10" fill="none" stroke="#C9A961" strokeWidth="1.5" />
                <circle cx="160" cy="40" r="14" fill="none" stroke="#C25E3B" strokeWidth="1.5" />
                <line x1="54" y1="35" x2="90" y2="28" stroke="#C9A961" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="54" y1="45" x2="90" y2="52" stroke="#C9A961" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="110" y1="25" x2="146" y2="35" stroke="#C9A961" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="110" y1="55" x2="146" y2="45" stroke="#C9A961" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>
            <p className="display text-2xl mb-2" style={{ color: '#1B1A1F' }}>Query the population</p>
            <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: '#6F6A66' }}>
              Filter every extracted note by diagnosis, medication, ICD code, age, or confidence.
              Try a saved query or build your own.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="card p-4">
                <div className="shimmer h-3 w-1/3 mb-3" />
                <div className="shimmer h-2.5 w-full mb-2" />
                <div className="shimmer h-2.5 w-4/5" />
              </div>
            ))}
            <p className="text-xs text-center mono" style={{ color: '#0F4F4A' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full pulse-dot mr-2 align-middle" style={{ background: '#0F4F4A' }} />
              Filtering across the cohort...
            </p>
          </div>
        )}

        {result && (
          <div className="slide-in">
            <div className="card p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="display text-3xl font-semibold" style={{ color: '#1B1A1F' }}>
                  {result.matched}<span className="text-base font-normal mono" style={{ color: '#6F6A66' }}> / {result.total_searched}</span>
                </p>
                <p className="text-xs" style={{ color: '#6F6A66' }}>matching notes in cohort</p>
              </div>
              <span className="text-xs mono px-3 py-1.5 rounded" style={{ background: '#E8F2EE', color: '#1F7A57' }}>
                {result.total_searched > 0 ? Math.round((result.matched / result.total_searched) * 100) : 0}% of population
              </span>
            </div>

            {result.results.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="display text-xl mb-2" style={{ color: '#1B1A1F' }}>No matches</p>
                <p className="text-sm" style={{ color: '#6F6A66' }}>Loosen your filters or try a different combination.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {result.results.map((r, i) => <ResultRow key={i} row={r} />)}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', mono = false }) {
  return (
    <div>
      <label className="text-xs mb-1.5 block" style={{ color: '#6F6A66' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${mono ? 'mono' : ''}`}
        style={{ background: '#FAF6EE', border: '1px solid #E4D9C5', color: '#1B1A1F' }}
      />
    </div>
  )
}

function ResultRow({ row }) {
  const [open, setOpen] = useState(false)
  const initials = row.gender === 'female' ? 'PF' : row.gender === 'male' ? 'PM' : 'PT'
  return (
    <div className="card transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 flex items-center gap-4">
        <div className="avatar flex-shrink-0" style={{ background: '#0F4F4A15', color: '#0F4F4A' }}>{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold" style={{ color: '#1B1A1F' }}>
              Note #{row.id}
            </span>
            {row.age && <span className="text-xs mono" style={{ color: '#6F6A66' }}>· {row.age}{row.gender ? row.gender[0].toUpperCase() : ''}</span>}
            {row.patient_id && <span className="text-xs mono px-1.5 py-0.5 rounded" style={{ background: '#F4EEE3', color: '#39363F' }}>{row.patient_id}</span>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(row.diagnoses || []).slice(0, 4).map((d, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: '#F4EEE3', color: '#0F4F4A', border: '1px solid #E4D9C5' }}>{d}</span>
            ))}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="display text-xl font-semibold" style={{ color: row.confidence_score >= 70 ? '#1F7A57' : '#B8862C' }}>
            {Math.round(row.confidence_score || 0)}%
          </p>
          <p className="text-xs mono" style={{ color: '#6F6A66' }}>{row.icd_codes?.length || 0} codes</p>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 slide-in">
          <div className="rounded-lg p-3 text-xs mb-2" style={{ background: '#FAF6EE', color: '#39363F' }}>
            {row.raw_text}{(row.raw_text || '').length >= 200 ? '...' : ''}
          </div>
          {row.medications?.length > 0 && (
            <div>
              <p className="text-xs mono mb-1" style={{ color: '#6F6A66' }}>MEDICATIONS</p>
              <div className="flex flex-wrap gap-1">
                {row.medications.map((m, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: '#F4EEE3', color: '#39363F' }}>{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
