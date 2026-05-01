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
        <p className="text-sm font-medium mb-3" style={{ color: '#161624' }}>Patient profile</p>
        <textarea
          value={patient}
          onChange={e => setPatient(e.target.value)}
          rows={12}
          className="w-full p-4 rounded-2xl text-sm resize-none outline-none mono"
          style={{ background: '#FFFFFF', border: '1px solid #F1E2D4', color: '#161624', marginBottom: 12 }}
        />
        <button onClick={() => match()} disabled={loading} className="btn-primary w-full mb-5">
          {loading ? 'Searching trials...' : 'Find matching trials'}
        </button>

        <p className="text-xs mono mb-2" style={{ color: '#6B6B7C' }}>Try a sample patient:</p>
        <div className="flex flex-col gap-2">
          {SAMPLE_PATIENTS.map((p, i) => (
            <button key={i}
              onClick={() => { setPatient(JSON.stringify(p.data, null, 2)); match(p.data) }}
              disabled={loading}
              className="py-3 px-4 rounded-xl text-sm text-left"
              style={{ background: '#FFFFFF', border: '1px solid #F1E2D4', color: '#161624' }}>
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#FFF1F1', border: '1px solid #F5C6CB' }}>
            <p className="text-xs mono" style={{ color: '#E5484D' }}>{error}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-3" style={{ color: '#161624' }}>Eligible trials</p>
        {!result && !loading && (
          <div className="card p-10 text-center h-72 flex items-center justify-center">
            <p className="text-sm" style={{ color: '#6B6B7C' }}>
              Pick a patient on the left to see matching trials.
            </p>
          </div>
        )}
        {loading && (
          <div className="card p-10 text-center flex flex-col items-center justify-center gap-3" style={{ minHeight: 220 }}>
            <div className="w-7 h-7 rounded-full border-2 spin"
              style={{ borderColor: '#FF6B47', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#FF6B47' }}>Embedding the patient and ranking trials...</p>
          </div>
        )}
        {result && (
          <div className="slide-in">
            <div className="flex gap-3 mb-4">
              <div className="card p-4 flex-1 text-center">
                <p className="display text-3xl" style={{ color: '#161624' }}>{result.total_trials_evaluated}</p>
                <p className="text-xs" style={{ color: '#6B6B7C' }}>trials reviewed</p>
              </div>
              <div className="card p-4 flex-1 text-center" style={{ borderColor: '#BBE5CD', background: '#F4FBF7' }}>
                <p className="display text-3xl" style={{ color: '#15803D' }}>{result.eligible_count}</p>
                <p className="text-xs" style={{ color: '#6B6B7C' }}>eligible</p>
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
