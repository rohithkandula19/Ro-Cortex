import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function History() {
  const [notes, setNotes] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/notes?limit=50`)
      .then(r => setNotes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <p className="text-sm font-medium mb-4" style={{ color: '#A0A0B0' }}>
        Analysis History — {notes.length} records
      </p>

      {loading ? (
        <div className="text-center py-12">
          <p className="mono text-sm" style={{ color: '#333355' }}>Loading...</p>
        </div>
      ) : notes.length === 0 ? (
        <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
          className="p-12 text-center">
          <p className="mono text-sm" style={{ color: '#333355' }}>
            No analyses yet — go to NER Extract or Full Pipeline to get started
          </p>
        </div>
      ) : (
        <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header */}
          <div className="grid px-4 py-3 text-xs mono"
            style={{ color: '#555566', borderBottom: '1px solid #1A1A2E', gridTemplateColumns: '130px 1fr 120px 80px 70px' }}>
            <span>TIME</span><span>NOTE PREVIEW</span><span>DIAGNOSES</span><span>ICD CODES</span><span>CONF.</span>
          </div>

          {notes.map((note, i) => (
            <div key={note.id}>
              <div className="grid px-4 py-3 cursor-pointer transition-all text-sm"
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  gridTemplateColumns: '130px 1fr 120px 80px 70px',
                  borderBottom: '1px solid #1A1A2E',
                  background: expanded === i ? '#12122A' : 'transparent'
                }}>
                <span className="mono text-xs" style={{ color: '#555566' }}>
                  {note.created_at ? new Date(note.created_at).toLocaleTimeString() : '—'}
                </span>
                <span className="truncate pr-4 text-xs" style={{ color: '#C0C0D0' }}>
                  {note.raw_text}
                </span>
                <span className="text-xs" style={{ color: '#FF6B35' }}>
                  {(note.diagnoses || []).slice(0, 2).join(', ') || '—'}
                </span>
                <span className="mono text-xs" style={{ color: '#FFD700' }}>
                  {(note.icd_codes || []).length} codes
                </span>
                <span className="mono font-bold text-xs" style={{ color: '#00FF88' }}>
                  {Math.round(note.confidence_score || 0)}%
                </span>
              </div>

              {expanded === i && (
                <div className="px-4 py-4 slide-in" style={{ borderBottom: '1px solid #1A1A2E', background: '#0A0A18' }}>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs mono mb-2" style={{ color: '#555566' }}>DIAGNOSES</p>
                      {(note.diagnoses || []).map((d, j) => (
                        <p key={j} className="text-xs mb-1" style={{ color: '#FF6B35' }}>• {d}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs mono mb-2" style={{ color: '#555566' }}>ICD-10 CODES</p>
                      {(note.icd_codes || []).map((c, j) => (
                        <p key={j} className="text-xs mb-1 mono" style={{ color: '#FFD700' }}>
                          {c.icd_code} — {c.diagnosis}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs mono mb-2" style={{ color: '#555566' }}>RAW NOTE</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#A0A0B0' }}>{note.raw_text}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
