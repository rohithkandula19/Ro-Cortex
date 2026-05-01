export default function ExtractedCard({ data, icdCodes }) {
  if (!data) return null
  const patient = data.patient || {}
  const diagnoses = data.diagnoses || []
  const medications = data.medications || []
  const vitals = Object.fromEntries(
    Object.entries(data.vitals || {}).filter(([, v]) => v !== null && v !== undefined && v !== '')
  )
  const labResults = (data.lab_results || []).filter(l =>
    typeof l === 'string' ? l.trim() : (l.test || l.value)
  )
  const symptoms = data.diagnoses ? (data.symptoms || []) : []
  const procedures = data.procedures || []
  const referrals = data.referrals || []
  const allergies = data.allergies || []

  const VITAL_LABELS = {
    blood_pressure: 'Blood pressure',
    heart_rate: 'Heart rate',
    temperature: 'Temperature',
    weight: 'Weight',
    height: 'Height',
    bmi: 'BMI',
    o2_saturation: 'O2 saturation',
    respiratory_rate: 'Respiratory rate',
  }

  const SectionHeader = ({ label, count }) => (
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs mono font-semibold tracking-wider" style={{ color: '#6B6B7C' }}>{label}</p>
      {count !== undefined && (
        <span className="text-xs mono px-2 py-0.5 rounded-full"
          style={{ background: '#FFE9DC', color: '#C0421E' }}>{count}</span>
      )}
    </div>
  )

  const Tag = ({ text, tone = 'coral' }) => {
    const tones = {
      coral: { bg: '#FFE9DC', fg: '#C0421E' },
      gold: { bg: '#FEF3C7', fg: '#9A6700' },
      purple: { bg: '#EDE9FE', fg: '#6D28D9' },
      teal: { bg: '#CFFAFE', fg: '#0E7490' },
      green: { bg: '#DCFCE7', fg: '#15803D' },
      red: { bg: '#FEE2E2', fg: '#B91C1C' },
    }
    const t = tones[tone] || tones.coral
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs"
        style={{ background: t.bg, color: t.fg }}>{text}</span>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Patient header */}
      <div className="card p-5">
        <SectionHeader label="PATIENT" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs" style={{ color: '#6B6B7C' }}>Age</p>
            <p className="display text-2xl" style={{ color: '#161624' }}>{patient.age || '-'}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#6B6B7C' }}>Gender</p>
            <p className="display text-2xl capitalize" style={{ color: '#161624' }}>{patient.gender || '-'}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#6B6B7C' }}>Confidence</p>
            <p className="display text-2xl" style={{ color: data.confidence_score >= 70 ? '#22A06B' : '#F59E0B' }}>
              {data.confidence_score || 0}%
            </p>
          </div>
        </div>
        {data.clinical_summary && (
          <div className="pt-4" style={{ borderTop: '1px solid #F5E6D7' }}>
            <p className="text-xs mono mb-2" style={{ color: '#6B6B7C' }}>SUMMARY</p>
            <p className="text-sm leading-relaxed" style={{ color: '#3C3C4C' }}>
              {data.clinical_summary}
            </p>
          </div>
        )}
      </div>

      {/* Diagnoses with ICD codes */}
      {diagnoses.length > 0 && (
        <div className="card p-5">
          <SectionHeader label="DIAGNOSES & ICD-10" count={diagnoses.length} />
          <div className="flex flex-col gap-2">
            {(icdCodes && icdCodes.length > 0 ? icdCodes : diagnoses.map(d => ({ diagnosis: d }))).map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] gap-3 items-center p-3 rounded-xl"
                style={{ background: '#FFFAF6', border: '1px solid #F5E6D7' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#161624' }}>{item.diagnosis}</p>
                  {item.description && (
                    <p className="text-xs truncate" style={{ color: '#6B6B7C' }}>{item.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {item.icd_code && (
                    <p className="text-sm font-semibold mono" style={{ color: '#FF6B47' }}>{item.icd_code}</p>
                  )}
                  {item.confidence !== undefined && (
                    <p className="text-xs mono" style={{ color: '#6B6B7C' }}>
                      {Math.round(item.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {medications.length > 0 && (
        <div className="card p-5">
          <SectionHeader label="MEDICATIONS" count={medications.length} />
          <div className="flex flex-col gap-2">
            {medications.map((med, i) => {
              const m = typeof med === 'string' ? { name: med } : med
              const subline = [m.dose, m.frequency, m.route].filter(Boolean).join(' · ')
              return (
                <div key={i} className="grid grid-cols-[10px_1fr_auto] gap-3 items-center p-3 rounded-xl"
                  style={{ background: '#FFFAF6', border: '1px solid #F5E6D7' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: '#22A06B' }} />
                  <p className="text-sm font-medium" style={{ color: '#161624' }}>{m.name}</p>
                  <p className="text-xs mono text-right" style={{ color: '#6B6B7C' }}>{subline || '-'}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vitals */}
      {Object.keys(vitals).length > 0 && (
        <div className="card p-5">
          <SectionHeader label="VITALS" count={Object.keys(vitals).length} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(vitals).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl"
                style={{ background: '#FFFAF6', border: '1px solid #F5E6D7' }}>
                <p className="text-xs mb-1" style={{ color: '#6B6B7C' }}>{VITAL_LABELS[k] || k.replace(/_/g, ' ')}</p>
                <p className="text-base font-semibold mono" style={{ color: '#161624' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab results */}
      {labResults.length > 0 && (
        <div className="card p-5">
          <SectionHeader label="LAB RESULTS" count={labResults.length} />
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #F5E6D7' }}>
            <div className="grid grid-cols-[1.4fr_1fr_0.6fr_0.6fr] px-3 py-2 text-xs mono"
              style={{ background: '#FFFAF6', color: '#6B6B7C' }}>
              <span>Test</span><span>Value</span><span>Unit</span><span className="text-right">Flag</span>
            </div>
            {labResults.map((l, i) => {
              const item = typeof l === 'string' ? { test: l } : l
              const flagColor = item.flag === 'H' || item.flag === 'high' ? '#B91C1C'
                              : item.flag === 'L' || item.flag === 'low' ? '#1D4ED8'
                              : '#6B6B7C'
              return (
                <div key={i} className="grid grid-cols-[1.4fr_1fr_0.6fr_0.6fr] px-3 py-2.5 text-sm"
                  style={{ borderTop: '1px solid #F5E6D7', color: '#161624' }}>
                  <span>{item.test || '-'}</span>
                  <span className="font-medium mono">{item.value || '-'}</span>
                  <span className="mono" style={{ color: '#6B6B7C' }}>{item.unit || '-'}</span>
                  <span className="text-right mono font-semibold" style={{ color: flagColor }}>{item.flag || '-'}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Symptoms */}
      {symptoms.length > 0 && (
        <div className="card p-5">
          <SectionHeader label="SYMPTOMS" count={symptoms.length} />
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s, i) => <Tag key={i} text={s} tone="gold" />)}
          </div>
        </div>
      )}

      {/* Procedures */}
      {procedures.length > 0 && (
        <div className="card p-5">
          <SectionHeader label="PROCEDURES" count={procedures.length} />
          <div className="flex flex-wrap gap-1.5">
            {procedures.map((p, i) => <Tag key={i} text={p} tone="purple" />)}
          </div>
        </div>
      )}

      {/* Referrals */}
      {referrals.length > 0 && (
        <div className="card p-5">
          <SectionHeader label="REFERRALS" count={referrals.length} />
          <div className="flex flex-wrap gap-1.5">
            {referrals.map((r, i) => <Tag key={i} text={r} tone="coral" />)}
          </div>
        </div>
      )}

      {/* Allergies */}
      {allergies.length > 0 && (
        <div className="card p-5">
          <SectionHeader label="ALLERGIES" count={allergies.length} />
          <div className="flex flex-wrap gap-1.5">
            {allergies.map((a, i) => <Tag key={i} text={a} tone="red" />)}
          </div>
        </div>
      )}
    </div>
  )
}
