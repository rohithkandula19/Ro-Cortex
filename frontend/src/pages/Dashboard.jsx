import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [notes, setNotes] = useState([])

  useEffect(() => {
    axios.get(`${API}/stats`).then(r => setStats(r.data)).catch(() => {})
    axios.get(`${API}/notes?limit=5`).then(r => setNotes(r.data)).catch(() => {})
  }, [])

  const statCards = [
    { label: 'Notes Analyzed', value: stats?.total_notes_analyzed ?? '-', color: '#00D4FF' },
    { label: 'Diagnoses Extracted', value: stats?.total_diagnoses_extracted ?? '-', color: '#00FF88' },
    { label: 'Medications Found', value: stats?.total_medications_extracted ?? '-', color: '#FFD700' },
    { label: 'Trial Matches', value: stats?.total_trial_matches ?? '-', color: '#7B2FBE' },
    { label: 'Eligible Matches', value: stats?.eligible_matches ?? '-', color: '#00FF88' },
    { label: 'Avg Confidence', value: stats?.avg_confidence ? `${stats.avg_confidence}%` : '-', color: '#FF6B35' },
  ]

  const pipeline = [
    { step: '01', label: 'Note in', desc: 'Free text from EHR, dictation, discharge summaries, or pasted notes.', color: '#00D4FF' },
    { step: '02', label: 'Entity extraction', desc: 'Pulls diagnoses, medications, dosages, vitals, labs, and referrals out of the prose.', color: '#7B2FBE' },
    { step: '03', label: 'ICD-10 coding', desc: 'Multi label classifier assigns standardized billing codes with a confidence score.', color: '#FFD700' },
    { step: '04', label: 'Trial matching', desc: 'BioBERT embeddings and FAISS rank active trials, then rules check eligibility.', color: '#00FF88' },
    { step: '05', label: 'Structured out', desc: 'Clean JSON ready for your data warehouse, EHR write back, or downstream apps.', color: '#FF6B35' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 p-6 rounded-xl relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at top right, rgba(123,47,190,0.15), transparent 60%), #0A0A1E', border: '1px solid #1A1A2E' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full mono"
            style={{ background: '#00FF8822', color: '#00FF88', border: '1px solid #00FF8844' }}>
            v1.0
          </span>
          <span className="text-xs mono" style={{ color: '#555566' }}>HIPAA aware · SOC 2 ready</span>
        </div>
        <h2 className="text-3xl font-bold mb-3" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Clinical intelligence for messy notes.
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#A0A0B0', maxWidth: 580 }}>
          Doctors write notes the way they think. Cortex reads them the way a coder, a researcher,
          and a trial coordinator would, then hands you back clean, structured patient data in seconds.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Clinical NER', 'ICD-10 coding', 'Trial matching', 'BioBERT embeddings', 'FAISS search'].map(t => (
            <span key={t} className="text-xs mono px-2.5 py-1 rounded-full"
              style={{ background: '#00D4FF11', color: '#00D4FF', border: '1px solid #00D4FF33' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {statCards.map(s => (
          <div key={s.label} style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
            className="p-3 text-center">
            <p className="text-2xl font-bold mono mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#555566' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="mb-8">
        <p className="text-sm font-medium mb-4" style={{ color: '#A0A0B0' }}>How a note flows through Cortex</p>
        <div className="flex flex-col gap-2">
          {pipeline.map((p, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: '#0F0F1C', border: '1px solid #1A1A2E' }}>
              <span className="text-xl font-bold mono flex-shrink-0" style={{ color: p.color }}>{p.step}</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#E0E0F0' }}>{p.label}</p>
                <p className="text-xs" style={{ color: '#555566' }}>{p.desc}</p>
              </div>
              {i < pipeline.length - 1 && (
                <span className="text-xs mono" style={{ color: '#1A1A2E' }}>↓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notes */}
      {notes.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Recent activity</p>
          <div className="flex flex-col gap-2">
            {notes.map(n => (
              <div key={n.id} style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
                className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-1 truncate" style={{ color: '#A0A0B0' }}>{n.raw_text}</p>
                  <div className="flex gap-2 flex-wrap">
                    {(n.diagnoses || []).slice(0, 3).map((d, i) => (
                      <span key={i} className="text-xs mono px-2 py-0.5 rounded-full"
                        style={{ background: '#FF6B3522', color: '#FF6B35' }}>{d}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold mono" style={{ color: '#00FF88' }}>
                    {Math.round(n.confidence_score || 0)}%
                  </p>
                  <p className="text-xs mono" style={{ color: '#555566' }}>confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
