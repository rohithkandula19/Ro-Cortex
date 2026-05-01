export default function ExtractedCard({ data, icdCodes }) {
  if (!data) return null
  const patient = data.patient || {}
  const diagnoses = data.diagnoses || []
  const medications = data.medications || []
  const vitals = data.vitals || {}
  const symptoms = data.symptoms || []
  const procedures = data.procedures || []
  const referrals = data.referrals || []
  const labResults = data.lab_results || []

  const Tag = ({ text, color = '#00D4FF' }) => (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs mono mr-1 mb-1"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {text}
    </span>
  )

  const Section = ({ title, children, color = '#A0A0B0' }) => (
    <div className="mb-4">
      <p className="text-xs mono mb-2" style={{ color: '#555566' }}>{title}</p>
      {children}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Patient Info */}
      <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }} className="p-4">
        <p className="text-xs mono mb-3" style={{ color: '#555566' }}>PATIENT PROFILE</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Age', patient.age || '—'],
            ['Gender', patient.gender || '—'],
            ['Confidence', `${data.confidence_score || 0}%`],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs" style={{ color: '#555566' }}>{l}</p>
              <p className="text-lg font-bold mono" style={{ color: '#00D4FF' }}>{v}</p>
            </div>
          ))}
        </div>
        {data.clinical_summary && (
          <p className="text-xs mt-3 leading-relaxed" style={{ color: '#A0A0B0' }}>
            {data.clinical_summary}
          </p>
        )}
      </div>

      {/* Diagnoses + ICD */}
      {diagnoses.length > 0 && (
        <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }} className="p-4">
          <p className="text-xs mono mb-3" style={{ color: '#555566' }}>DIAGNOSES + ICD-10 CODES</p>
          <div className="flex flex-col gap-2">
            {(icdCodes || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: '#12122A' }}>
                <div>
                  <p className="text-sm" style={{ color: '#E0E0F0' }}>{item.diagnosis}</p>
                  <p className="text-xs mono" style={{ color: '#555566' }}>{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold mono" style={{ color: '#FFD700' }}>{item.icd_code}</p>
                  {item.confidence && (
                    <p className="text-xs mono" style={{ color: '#555566' }}>
                      {Math.round(item.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(!icdCodes || icdCodes.length === 0) && diagnoses.map((d, i) => (
              <div key={i}>
                <Tag text={d} color="#FF6B35" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {medications.length > 0 && (
        <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }} className="p-4">
          <p className="text-xs mono mb-3" style={{ color: '#555566' }}>MEDICATIONS</p>
          <div className="flex flex-col gap-2">
            {medications.map((med, i) => {
              const m = typeof med === 'string' ? { name: med } : med
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg"
                  style={{ background: '#12122A' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00FF88' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#E0E0F0' }}>{m.name}</p>
                    <p className="text-xs mono" style={{ color: '#555566' }}>
                      {[m.dose, m.frequency, m.route].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vitals */}
      {Object.values(vitals).some(Boolean) && (
        <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }} className="p-4">
          <p className="text-xs mono mb-3" style={{ color: '#555566' }}>VITALS</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(vitals).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="p-2 rounded-lg" style={{ background: '#12122A' }}>
                <p className="text-xs" style={{ color: '#555566' }}>{k.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="text-sm font-bold mono" style={{ color: '#00D4FF' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other entities */}
      <div style={{ background: '#0F0F1C', border: '1px solid #1A1A2E', borderRadius: 12 }} className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {symptoms.length > 0 && (
            <Section title="SYMPTOMS">
              {symptoms.map((s, i) => <Tag key={i} text={s} color="#FFD700" />)}
            </Section>
          )}
          {procedures.length > 0 && (
            <Section title="PROCEDURES">
              {procedures.map((p, i) => <Tag key={i} text={p} color="#7B2FBE" />)}
            </Section>
          )}
          {referrals.length > 0 && (
            <Section title="REFERRALS">
              {referrals.map((r, i) => <Tag key={i} text={r} color="#FF6B35" />)}
            </Section>
          )}
          {labResults.length > 0 && (
            <Section title="LAB RESULTS">
              {labResults.map((l, i) => {
                const item = typeof l === 'string' ? { test: l } : l
                return (
                  <Tag key={i} text={`${item.test}${item.value ? ': ' + item.value : ''}`} color="#00CED1" />
                )
              })}
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
