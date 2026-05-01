import { useState } from 'react'
import axios from 'axios'
import TrialCard from '../components/TrialCard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SAMPLE_PATIENTS = [
  {
    label: '👴 Diabetic Male 67',
    data: { age: 67, gender: 'male', diagnoses: ['T2DM', 'CKD stage 3', 'Hypertension'], medications: ['Metformin', 'Glipizide'], symptoms: ['increased thirst', 'frequent urination'] }
  },
  {
    label: '👩 Breast Cancer Female 54',
    data: { age: 54, gender: 'female', diagnoses: ['breast cancer', 'stage II'], medications: ['Tamoxifen'], symptoms: ['joint pain', 'hot flashes'] }
  },
  {
    label: '👴 Heart Failure Male 72',
    data: { age: 72, gender: 'male', diagnoses: ['heart failure', 'CHF'], medications: ['Carvedilol', 'Lisinopril', 'Furosemide'], symptoms: ['weight gain', 'shortness of breath'] }
  },
]

export default function Trials() {
  const [patient, setPatient] = useState(JSON.stringify(SAMPLE_PATIENTS[0].data, null, 2))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const match = async (data) => {
    const patientData = data || JSON.parse(patient)
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await axios.post(`${API}/match-trials`, { patient_data: patientData, use_demo_trials: true })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Error running trial matching')
    }
    setLoading(false)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left */}
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Patient Profile</p>
        <textarea
          value={patient}
          onChange={e => setPatient(e.target.value)}
          rows={12}
          className="w-full p-4 rounded-xl text-sm resize-none outline-none mono"
          style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', color: '#E0E0F0', marginBottom: 12 }}
        />
        <button onClick={() => match()}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-4"
          style={{ background: loading ? '#1A1A2E' : '#7B2FBE', color: loading ? '#555566' : '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Searching trials...' : 'Find matching trials'}
        </button>

        <p className="text-xs mono mb-2" style={{ color: '#555566' }}>Try a sample patient:</p>
        <div className="flex flex-col gap-2">
          {SAMPLE_PATIENTS.map((p, i) => (
            <button key={i}
              onClick={() => { setPatient(JSON.stringify(p.data, null, 2)); match(p.data) }}
              disabled={loading}
              className="py-2.5 px-4 rounded-lg text-sm text-left"
              style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', color: '#A0A0B0' }}>
              {p.label}
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
        <p className="text-sm font-medium mb-3" style={{ color: '#A0A0B0' }}>Eligible trials</p>
        {!result && !loading && (
          <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
            className="p-8 text-center h-64 flex items-center justify-center">
            <p className="mono text-sm" style={{ color: '#333355' }}>
              Pick a patient on the left to see matching trials.
            </p>
          </div>
        )}
        {loading && (
          <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }}
            className="p-8 text-center flex flex-col items-center justify-center gap-3" style={{ minHeight: 200 }}>
            <div className="w-6 h-6 rounded-full border-2 spin"
              style={{ borderColor: '#7B2FBE', borderTopColor: 'transparent' }} />
            <p className="mono text-sm" style={{ color: '#7B2FBE' }}>Embedding the patient and ranking trials...</p>
          </div>
        )}
        {result && (
          <div className="slide-in">
            <div className="flex gap-3 mb-4">
              <div className="p-3 rounded-lg flex-1 text-center"
                style={{ background: '#0F0F1C', border: '1px solid #1A1A2E' }}>
                <p className="text-2xl font-bold mono" style={{ color: '#00D4FF' }}>
                  {result.total_trials_evaluated}
                </p>
                <p className="text-xs" style={{ color: '#555566' }}>trials reviewed</p>
              </div>
              <div className="p-3 rounded-lg flex-1 text-center"
                style={{ background: '#0F0F1C', border: '1px solid #00FF8844' }}>
                <p className="text-2xl font-bold mono" style={{ color: '#00FF88' }}>
                  {result.eligible_count}
                </p>
                <p className="text-xs" style={{ color: '#555566' }}>eligible</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {result.matches.map((m, i) => (
                <TrialCard key={i} match={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
