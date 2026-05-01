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
      <p className="text-sm mb-4" style={{ color: '#6B6B7C' }}>
        {notes.length} {notes.length === 1 ? 'record' : 'records'}
      </p>

      {loading ? (
        <div className="card p-12 text-center">
          <p className="text-sm" style={{ color: '#6B6B7C' }}>Loading...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm" style={{ color: '#6B6B7C' }}>
            No analyses yet. Head over to Extract or Pipeline to get started.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <div className="grid px-5 py-3 text-xs mono min-w-[680px]"
            style={{ color: '#6F6A66', borderBottom: '1px solid #EFE4CF', gridTemplateColumns: '130px 1fr 160px 90px 70px' }}>
            <span>TIME</span><span>NOTE PREVIEW</span><span>DIAGNOSES</span><span>ICD</span><span>CONF.</span>
          </div>

          {notes.map((note, i) => (
            <div key={note.id}>
              <div className="grid px-5 py-3 cursor-pointer transition-all text-sm min-w-[680px]"
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  gridTemplateColumns: '130px 1fr 160px 90px 70px',
                  borderTop: '1px solid #EFE4CF',
                  background: expanded === i ? '#FAF6EE' : 'transparent'
                }}>
                <span className="mono text-xs" style={{ color: '#6F6A66' }}>
                  {note.created_at ? new Date(note.created_at).toLocaleTimeString() : '-'}
                </span>
                <span className="truncate pr-4 text-xs" style={{ color: '#1B1A1F' }}>
                  {note.raw_text}
                </span>
                <span className="text-xs truncate pr-2 font-medium" style={{ color: '#0F4F4A' }}>
                  {(note.diagnoses || []).slice(0, 2).join(', ') || '-'}
                </span>
                <span className="mono text-xs" style={{ color: '#C25E3B' }}>
                  {(note.icd_codes || []).length} codes
                </span>
                <span className="mono font-semibold text-xs" style={{ color: Math.round(note.confidence_score) >= 70 ? '#1F7A57' : '#B8862C' }}>
                  {Math.round(note.confidence_score || 0)}%
                </span>
              </div>

              {expanded === i && (
                <div className="px-5 py-5 slide-in min-w-[680px]" style={{ borderTop: '1px solid #EFE4CF', background: '#FAF6EE' }}>
                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <p className="text-xs mono mb-2" style={{ color: '#6F6A66' }}>DIAGNOSES</p>
                      {(note.diagnoses || []).map((d, j) => (
                        <p key={j} className="text-xs mb-1 font-medium" style={{ color: '#0F4F4A' }}>· {d}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs mono mb-2" style={{ color: '#6F6A66' }}>ICD-10 CODES</p>
                      {(note.icd_codes || []).map((c, j) => (
                        <p key={j} className="text-xs mb-1 mono font-semibold" style={{ color: '#C25E3B' }}>
                          {c.icd_code} · <span className="font-normal" style={{ color: '#39363F' }}>{c.diagnosis}</span>
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs mono mb-2" style={{ color: '#6F6A66' }}>RAW NOTE</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#39363F' }}>{note.raw_text}</p>
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
