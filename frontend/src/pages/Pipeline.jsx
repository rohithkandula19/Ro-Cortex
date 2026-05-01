import { useState } from 'react'
import axios from 'axios'
import ExtractedCard from '../components/ExtractedCard'
import TrialCard from '../components/TrialCard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STEPS = [
  { id: 1, label: 'Read the note', desc: 'Pull entities out of the prose' },
  { id: 2, label: 'Assign ICD-10', desc: 'Map diagnoses to billing codes' },
  { id: 3, label: 'Match trials', desc: 'Rank eligible studies for this patient' },
  { id: 4, label: 'Hand off', desc: 'Return clean JSON to your stack' },
]

const DEMO = "72 year old male admitted for acute exacerbation of CHF. EF 30% on last echo. On Carvedilol 25mg BID, Lisinopril 10mg daily, Furosemide 40mg daily. BP 110/70, HR 88, O2 sat 94% on room air. Weight gain of 4kg in past week. BNP elevated at 1200. Chest X-ray shows pulmonary edema. History of HTN and T2DM. Referred to cardiology for urgent evaluation."

export default function Pipeline() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')

  const run = async (t) => {
    const noteText = t || text
    if (!noteText.trim()) return
    setLoading(true); setError(''); setResult(null); setCurrentStep(1)
    const stepTimer = setInterval(() => setCurrentStep(p => p < 4 ? p + 1 : p), 1500)
    try {
      const res = await axios.post(`${API}/analyze-full`, { text: noteText })
      clearInterval(stepTimer); setCurrentStep(4); setResult(res.data)
    } catch (e) {
      clearInterval(stepTimer)
      setError(e?.response?.data?.detail || 'Pipeline error.')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#1B1A1F' }}>Clinical note</p>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste a note. Cortex will read it, code it, and match the patient to trials in one shot..."
            rows={8} className="w-full p-4 rounded-2xl text-sm resize-none outline-none mono"
            style={{ background: '#FFFDF8', border: '1px solid #E4D9C5', color: '#1B1A1F', marginBottom: 12 }} />
          <div className="flex gap-3">
            <button onClick={() => run()} disabled={loading || !text.trim()} className="btn-primary flex-1 justify-center">
              {loading ? 'Running pipeline...' : 'Run end to end'}
              {!loading && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              )}
            </button>
            <button onClick={() => { setText(DEMO); run(DEMO) }} disabled={loading} className="btn-secondary">
              Try sample
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: '#FCEBED', border: '1px solid #F1B5BC' }}>
              <p className="text-xs mono" style={{ color: '#B23A48' }}>{error}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#1B1A1F' }}>Live progress</p>
          <div className="flex flex-col gap-2">
            {STEPS.map(s => {
              const active = currentStep === s.id
              const done = currentStep > s.id
              return (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{
                    background: done ? '#E8F2EE' : active ? '#FAF6EE' : '#FFFDF8',
                    border: `1px solid ${done ? '#BBE0D0' : active ? '#C9A961' : '#E4D9C5'}`,
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? '#1F7A57' : active ? '#0F4F4A' : '#F4EEE3', border: done || active ? 'none' : '1px solid #E4D9C5' }}>
                    {done ? (
                      <span className="text-xs font-bold" style={{ color: '#FAF6EE' }}>✓</span>
                    ) : active ? (
                      <div className="w-3 h-3 rounded-full border-2 spin"
                        style={{ borderColor: '#C9A961', borderTopColor: 'transparent' }} />
                    ) : (
                      <span className="text-xs mono font-semibold" style={{ color: '#6F6A66' }}>{s.id}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1B1A1F' }}>{s.label}</p>
                    <p className="text-xs" style={{ color: '#6F6A66' }}>{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {result && (
        <div className="slide-in">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px mb-6" style={{ background: '#E4D9C5', border: '1px solid #E4D9C5', borderRadius: 14, overflow: 'hidden' }}>
            {[
              ['Confidence', `${result.confidence_score}%`, result.confidence_score >= 70 ? '#1F7A57' : '#B8862C'],
              ['Diagnoses', result.extracted?.diagnoses?.length || 0, '#1B1A1F'],
              ['Medications', result.extracted?.medications?.length || 0, '#1B1A1F'],
              ['ICD codes', result.icd_codes?.length || 0, '#C25E3B'],
              ['Eligible trials', result.eligible_trials?.length || 0, '#0F4F4A'],
            ].map(([l, v, c]) => (
              <div key={l} className="px-4 py-5 text-center" style={{ background: '#FFFDF8' }}>
                <p className="display text-3xl font-semibold mb-1" style={{ color: c }}>{v}</p>
                <p className="text-xs font-medium" style={{ color: '#6F6A66' }}>{l}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#1B1A1F' }}>Extracted data</p>
              <ExtractedCard data={result.extracted} icdCodes={result.icd_codes} />
            </div>
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#1B1A1F' }}>Trial matches</p>
              {result.trial_matches?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {result.trial_matches.map((m, i) => <TrialCard key={i} match={m} />)}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-sm" style={{ color: '#6F6A66' }}>No matching trials found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
