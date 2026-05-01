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
    { label: 'Notes Analyzed', value: stats?.total_notes_analyzed ?? '—', color: '#00D4FF' },
    { label: 'Diagnoses Extracted', value: stats?.total_diagnoses_extracted ?? '—', color: '#00FF88' },
    { label: 'Medications Found', value: stats?.total_medications_extracted ?? '—', color: '#FFD700' },
    { label: 'Trial Matches', value: stats?.total_trial_matches ?? '—', color: '#7B2FBE' },
    { label: 'Eligible Matches', value: stats?.eligible_matches ?? '—', color: '#00FF88' },
    { label: 'Avg Confidence', value: stats?.avg_confidence ? `${stats.avg_confidence}%` : '—', color: '#FF6B35' },
  ]

  const pipeline = [
    { step: '01', label: 'Clinical Note Input', desc: 'Unstructured doctor notes, discharge summaries, clinical text', color: '#00D4FF' },
    { step: '02', label: 'NER Extraction', desc: 'ClinicalBERT-powered named entity recognition — diagnoses, medications, vitals, labs', color: '#7B2FBE' },
    { step: '03', label: 'ICD-10 Classification', desc: 'Deep learning multi-label classifier assigns standardized medical codes', color: '#FFD700' },
    { step: '04', label: 'Trial Matching', desc: 'BioBERT embeddings + FAISS vector search matches patients to clinical trials', color: '#00FF88' },
    { step: '05', label: 'Structured Output', desc: 'Clean JSON with entities, codes, trial matches — ready for downstream systems', color: '#FF6B35' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 p-6 rounded-xl" style={{ background: '#0A0A1E', border: '1px solid #1A1A2E' }}>
        <p className="text-xs mono mb-2" style={{ color: '#555566' }}>CLINICAL NLP INTELLIGENCE PLATFORM</p>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
          Extract. Classify. Match.
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0B0', maxWidth: 600 }}>
          RO Cortex transforms unstructured clinical notes into structured intelligence — 
          powered by ClinicalBERT NER, ICD-10 deep learning classification, and BioBERT-based 
          patient-trial matching at scale.
        </p>
        <div className="flex gap-3 mt-4">
          {['ClinicalBERT', 'BioBERT', 'FAISS', 'ICD-10', 'spaCy', 'Claude Sonnet'].map(t => (
            <span key={t} className="text-xs mono px-2 py-1 rounded-full"
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
        <p className="text-sm font-medium mb-4" style={{ color: '#A0A0B0' }}>Deep Learning Pipeline</p>
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
          <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Recent Analyses</p>
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
