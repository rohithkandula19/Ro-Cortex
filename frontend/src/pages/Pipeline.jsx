import { useState } from 'react'
import axios from 'axios'
import ExtractedCard from '../components/ExtractedCard'
import TrialCard from '../components/TrialCard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STEPS = [
  { id: 1, label: 'NER Extraction', desc: 'ClinicalBERT extracts entities', color: '#00D4FF' },
  { id: 2, label: 'ICD-10 Classification', desc: 'Deep learning assigns codes', color: '#FFD700' },
  { id: 3, label: 'Trial Matching', desc: 'BioBERT + FAISS matching', color: '#7B2FBE' },
  { id: 4, label: 'Structured Output', desc: 'Clean JSON ready for use', color: '#00FF88' },
]

export default function Pipeline() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')

  const run = async (t) => {
    const noteText = t || text
    if (!noteText.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setCurrentStep(1)

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => prev < 4 ? prev + 1 : prev)
    }, 1500)

    try {
      const res = await axios.post(`${API}/analyze-full`, { text: noteText })
      clearInterval(stepTimer)
      setCurrentStep(4)
      setResult(res.data)
    } catch (e) {
      clearInterval(stepTimer)
      setError(e?.response?.data?.detail || 'Pipeline error')
    }
    setLoading(false)
  }

  const DEMO = "72 year old male admitted for acute exacerbation of CHF. EF 30% on last echo. On Carvedilol 25mg BID, Lisinopril 10mg daily, Furosemide 40mg daily. BP 110/70, HR 88, O2 sat 94% on room air. Weight gain of 4kg in past week. BNP elevated at 1200. Chest X-ray shows pulmonary edema. History of HTN and T2DM. Referred to cardiology for urgent evaluation."

  return (
    <div>
      {/* Input */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Clinical Note</p>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste clinical note here for full pipeline analysis..."
            rows={8} className="w-full p-4 rounded-xl text-sm resize-none outline-none mono"
            style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', color: '#E0E0F0', marginBottom: 12 }} />
          <div className="flex gap-3">
            <button onClick={() => run()}
              disabled={loading || !text.trim()}
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ background: loading ? '#1A1A2E' : '#00FF88', color: '#080810', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Running Pipeline...' : 'Run Full Pipeline →'}
            </button>
            <button onClick={() => { setText(DEMO); run(DEMO) }}
              disabled={loading}
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', color: '#A0A0B0' }}>
              Demo
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: '#FF333311', border: '1px solid #FF333344' }}>
              <p className="text-xs mono" style={{ color: '#FF3333' }}>{error}</p>
            </div>
          )}
        </div>

        {/* Pipeline steps */}
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Pipeline Status</p>
          <div className="flex flex-col gap-2">
            {STEPS.map(s => {
              const active = currentStep === s.id
              const done = currentStep > s.id
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl transition-all"
                  style={{
                    background: done ? `${s.color}11` : active ? `${s.color}08` : '#0F0F1C',
                    border: `1px solid ${done || active ? s.color + '44' : '#1A1A2E'}`,
                  }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? s.color : active ? `${s.color}33` : '#1A1A2E' }}>
                    {done ? (
                      <span className="text-xs font-bold" style={{ color: '#080810' }}>✓</span>
                    ) : active ? (
                      <div className="w-3 h-3 rounded-full border spin"
                        style={{ borderColor: s.color, borderTopColor: 'transparent' }} />
                    ) : (
                      <span className="text-xs mono" style={{ color: '#555566' }}>{s.id}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: done || active ? '#E0E0F0' : '#555566' }}>
                      {s.label}
                    </p>
                    <p className="text-xs" style={{ color: '#555566' }}>{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="slide-in">
          <div className="flex gap-3 mb-6 flex-wrap">
            {[
              ['Confidence', `${result.confidence_score}%`, '#00FF88'],
              ['Diagnoses', result.extracted?.diagnoses?.length || 0, '#FF6B35'],
              ['Medications', result.extracted?.medications?.length || 0, '#00D4FF'],
              ['ICD Codes', result.icd_codes?.length || 0, '#FFD700'],
              ['Eligible Trials', result.eligible_trials?.length || 0, '#7B2FBE'],
            ].map(([l, v, c]) => (
              <div key={l} className="p-3 rounded-xl text-center flex-1 min-w-24"
                style={{ background: '#0F0F1C', border: '1px solid #1A1A2E' }}>
                <p className="text-xl font-bold mono" style={{ color: c }}>{v}</p>
                <p className="text-xs" style={{ color: '#555566' }}>{l}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Extracted Data</p>
              <ExtractedCard data={result.extracted} icdCodes={result.icd_codes} />
            </div>
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Trial Matches</p>
              {result.trial_matches?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {result.trial_matches.map((m, i) => <TrialCard key={i} match={m} />)}
                </div>
              ) : (
                <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
                  className="p-8 text-center">
                  <p className="text-sm mono" style={{ color: '#333355' }}>No matching trials found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
