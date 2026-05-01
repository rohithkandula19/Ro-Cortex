import { useState } from 'react'
import axios from 'axios'
import TrialCard from '../components/TrialCard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SAMPLE_PATIENTS = [
  {
    label: 'Diabetic male, 67',
    data: { age: 67, gender: 'male', diagnoses: ['T2DM', 'CKD stage 3', 'Hypertension'], medications: ['Metformin', 'Glipizide'], symptoms: ['increased thirst', 'frequent urination'] }
  },
  {
    label: 'Breast cancer female, 54',
    data: { age: 54, gender: 'female', diagnoses: ['breast cancer', 'stage II'], medications: ['Tamoxifen'], symptoms: ['joint pain', 'hot flashes'] }
  },
  {
    label: 'Heart failure male, 72',
    data: { age: 72, gender: 'male', diagnoses: ['heart failure', 'CHF'], medications: ['Carvedilol', 'Lisinopril', 'Furosemide'], symptoms: ['weight gain', 'shortness of breath'] }
  },
]

export default function Trials() {
  const [patient, setPatient] = useState(JSON.stringify(SAMPLE_PATIENTS[0].data, null, 2))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const match = async (data) => {
    let patientData
    try {
      patientData = data || JSON.parse(patient)
    } catch (e) {
      setError('Patient JSON is invalid.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await axios.post(`${API}/match-trials`, { patient_data: patientData, use_demo_trials: true })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not reach the backend.')
    }
    setLoading(false)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: '#1B1A1F' }}>Patient profile</p>
        <textarea
          value={patient}
          onChange={e => setPatient(e.target.value)}
          rows={12}
          className="w-full p-4 rounded-2xl text-sm resize-none outline-none mono"
          style={{ background: '#FFFDF8', border: '1px solid #E4D9C5', color: '#1B1A1F', marginBottom: 12 }}
        />
        <button onClick={() => match()} disabled={loading} className="btn-primary w-full justify-center mb-5">
          {loading ? 'Searching trials...' : 'Find matching trials'}
          {!loading && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          )}
        </button>

        <p className="text-xs mono mb-2" style={{ color: '#6F6A66' }}>Try a sample patient:</p>
        <div className="flex flex-col gap-2">
          {SAMPLE_PATIENTS.map((p, i) => (
            <button key={i}
              onClick={() => { setPatient(JSON.stringify(p.data, null, 2)); match(p.data) }}
              disabled={loading}
              className="py-3 px-4 rounded-xl text-sm text-left"
              style={{ background: '#FFFDF8', border: '1px solid #E4D9C5', color: '#1B1A1F' }}>
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#FCEBED', border: '1px solid #F1B5BC' }}>
            <p className="text-xs mono" style={{ color: '#B23A48' }}>{error}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-3" style={{ color: '#1B1A1F' }}>Eligible trials</p>
        {!result && !loading && (
          <div className="card p-8 text-center" style={{ minHeight: 360 }}>
            <div className="flex items-center justify-center mb-5" style={{ height: 80 }}>
              <svg width="160" height="60" viewBox="0 0 160 60">
                <circle cx="20" cy="30" r="6" fill="none" stroke="#0F4F4A" strokeWidth="1.5" />
                <circle cx="80" cy="30" r="10" fill="none" stroke="#C25E3B" strokeWidth="1.5" />
                <circle cx="140" cy="30" r="6" fill="none" stroke="#0F4F4A" strokeWidth="1.5" />
                <line x1="26" y1="30" x2="70" y2="30" stroke="#C9A961" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="90" y1="30" x2="134" y2="30" stroke="#C9A961" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>
            <p className="display text-2xl mb-2" style={{ color: '#1B1A1F' }}>No patient selected</p>
            <p className="text-sm" style={{ color: '#6F6A66' }}>
              Pick a sample on the left or paste a patient profile to find matching trials.
            </p>
          </div>
        )}
        {loading && (
          <div className="flex flex-col gap-3">
            <div className="card p-3 grid grid-cols-2 gap-2">
              <div className="text-center px-2 py-3 rounded" style={{ background: '#FAF6EE' }}>
                <div className="shimmer h-7 w-12 mx-auto mb-1" /><div className="shimmer h-2 w-16 mx-auto" />
              </div>
              <div className="text-center px-2 py-3 rounded" style={{ background: '#FAF6EE' }}>
                <div className="shimmer h-7 w-12 mx-auto mb-1" /><div className="shimmer h-2 w-16 mx-auto" />
              </div>
            </div>
            {[0, 1, 2].map(i => (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="shimmer h-3 w-20 mb-2" />
                    <div className="shimmer h-4 w-3/4 mb-2" />
                    <div className="shimmer h-2.5 w-full mb-1" />
                    <div className="shimmer h-2.5 w-4/5" />
                  </div>
                  <div className="shimmer h-9 w-12" />
                </div>
                <div className="shimmer h-1.5 w-full" />
              </div>
            ))}
            <p className="text-xs text-center mono" style={{ color: '#0F4F4A' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full pulse-dot mr-2 align-middle" style={{ background: '#0F4F4A' }} />
              Embedding patient and ranking trials with FAISS...
            </p>
          </div>
        )}
        {result && (
          <div className="slide-in">
            <div className="card p-3 mb-3 grid grid-cols-2 gap-2">
              <div className="text-center px-2 py-2 rounded" style={{ background: '#FAF6EE' }}>
                <p className="display text-2xl font-semibold" style={{ color: '#1B1A1F' }}>{result.total_trials_evaluated}</p>
                <p className="text-[10px] mono uppercase tracking-wider" style={{ color: '#6F6A66' }}>trials reviewed</p>
              </div>
              <div className="text-center px-2 py-2 rounded" style={{ background: '#E8F2EE' }}>
                <p className="display text-2xl font-semibold" style={{ color: '#1F7A57' }}>{result.eligible_count}</p>
                <p className="text-[10px] mono uppercase tracking-wider" style={{ color: '#6F6A66' }}>eligible</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {result.matches.map((m, i) => <TrialCard key={i} match={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
