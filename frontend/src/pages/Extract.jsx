import { useState, useEffect } from 'react'
import axios from 'axios'
import ExtractedCard from '../components/ExtractedCard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await axios.post(`${API}/extract`, { text: noteText })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Error connecting to backend')
    }
    setLoading(false)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left */}
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Paste a clinical note</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Drop in a discharge summary, progress note, or anything a clinician might write..."
          rows={10}
          className="w-full p-4 rounded-xl text-sm resize-none outline-none mono"
          style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', color: '#E0E0F0', marginBottom: 12 }}
        />
        <button onClick={() => extract()}
          disabled={loading || !text.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-4"
          style={{
            background: loading ? '#1A1A2E' : '#00D4FF',
            color: loading ? '#555566' : '#080810',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'Reading the note...' : 'Extract entities'}
        </button>

        <p className="text-xs mono mb-2" style={{ color: '#555566' }}>Try a sample:</p>
        <div className="flex flex-col gap-2">
          {demoNotes.map((n, i) => (
            <button key={i}
              onClick={() => { setText(n.text); extract(n.text) }}
              disabled={loading}
              className="py-2.5 px-4 rounded-lg text-sm text-left"
              style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', color: '#A0A0B0' }}>
              {n.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg" style={{ background: '#FF333311', border: '1px solid #FF333344' }}>
            <p className="text-xs mono" style={{ color: '#FF3333' }}>{error}</p>
          </div>
        )}
      </div>

      {/* Right */}
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Structured output</p>
        {!result && !loading && (
          <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
            className="p-8 text-center h-64 flex items-center justify-center">
            <p className="mono text-sm" style={{ color: '#333355' }}>
              Your extracted entities will show up here.
            </p>
          </div>
        )}
        {loading && (
          <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
            className="p-8 text-center h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 spin"
              style={{ borderColor: '#00D4FF', borderTopColor: 'transparent' }} />
            <p className="mono text-sm" style={{ color: '#00D4FF' }}>Reading the note and pulling entities...</p>
          </div>
        )}
        {result && (
          <div className="slide-in">
            <ExtractedCard data={result.extracted} icdCodes={result.icd_codes} />
          </div>
        )}
      </div>
    </div>
  )
}
