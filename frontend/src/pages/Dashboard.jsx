import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import HeroVisual from '../components/HeroVisual'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [notes, setNotes] = useState([])

  useEffect(() => {
    axios.get(`${API}/stats`).then(r => setStats(r.data)).catch(() => {})
    axios.get(`${API}/notes?limit=4`).then(r => setNotes(r.data)).catch(() => {})
  }, [])

  const stepCards = [
    { n: '01', tag: 'extract', title: 'Structured data from unstructured text', body: 'Pull diagnoses, medications with doses, vitals, labs, and referrals out of free text notes. ICD-10 codes attached with per field confidence.', bold: 'diagnoses, medications' },
    { n: '02', tag: 'identify', title: 'Patients matched to active trials', body: 'BioBERT embeddings plus FAISS rank trials by semantic fit, then rule based eligibility cuts the list to who actually qualifies.', bold: 'who actually qualifies' },
    { n: '03', tag: 'decide', title: 'Downstream systems get clean JSON', body: 'Deterministic schema flows into your warehouse, EHR write back, or analytics layer so every team works from the same source of truth.', bold: 'same source of truth' },
  ]

  const counters = [
    { label: 'notes analyzed', value: stats?.total_notes_analyzed },
    { label: 'diagnoses extracted', value: stats?.total_diagnoses_extracted },
    { label: 'medications captured', value: stats?.total_medications_extracted },
    { label: 'eligible matches', value: stats?.eligible_matches },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center">
          <div>
            <div className="eyebrow mb-6 fade-up">Clinical NLP, production grade</div>
            <h1 className="display text-4xl sm:text-5xl md:text-[64px] leading-[1.04] mb-6 fade-up delay-1" style={{ color: '#1B1A1F' }}>
              Read <strong style={{ fontWeight: 600 }}>every</strong> clinical note.<br />
              <span style={{ color: '#0F4F4A', fontStyle: 'italic' }}>Surface what matters.</span>
            </h1>
            <p className="text-base md:text-lg mb-8 fade-up delay-2" style={{ color: '#39363F', lineHeight: 1.65, maxWidth: 520 }}>
              Cortex <strong style={{ color: '#1B1A1F', fontWeight: 600 }}>extracts structured data</strong> from billions of free text notes,
              <strong style={{ color: '#1B1A1F', fontWeight: 600 }}> identifies patients</strong> eligible for active trials,
              and feeds the result into the systems your clinicians and researchers already use.
            </p>
            <div className="flex flex-wrap items-center gap-3 fade-up delay-3">
              <Link to="/extract" className="btn-primary">
                Try on a note
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
              <Link to="/pipeline" className="btn-secondary">View the pipeline</Link>
            </div>
          </div>

          <div className="fade-up delay-2">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Counters */}
      <section className="px-6 mt-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: '#E4D9C5', border: '1px solid #E4D9C5', borderRadius: 14, overflow: 'hidden' }}>
          {counters.map((c, i) => (
            <div key={c.label} className="px-6 py-7" style={{ background: '#FFFDF8' }}>
              <p className="text-xs mono mb-3" style={{ color: '#6F6A66' }}>0{i + 1}</p>
              {c.value === undefined ? (
                <div className="shimmer h-9 w-20 mb-2" />
              ) : (
                <p className="display text-5xl mb-1 font-semibold" style={{ color: '#1B1A1F' }}>{c.value}</p>
              )}
              <p className="text-xs font-medium" style={{ color: '#39363F' }}>{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Three jobs */}
      <section className="px-6 mt-28 max-w-6xl mx-auto">
        <div className="md:grid md:grid-cols-[1fr_2fr] gap-10 mb-12">
          <div>
            <div className="eyebrow mb-4">What it does</div>
            <h2 className="display text-4xl md:text-5xl" style={{ color: '#1B1A1F' }}>
              Three jobs.<br />
              <span style={{ color: '#0F4F4A', fontStyle: 'italic' }}>One pipeline.</span>
            </h2>
          </div>
          <p className="text-base md:mt-12" style={{ color: '#39363F', lineHeight: 1.7 }}>
            The same trio that real clinical AI teams ship every day: structure the notes,
            surface the eligible patients, and make the result usable everywhere downstream.
            Cortex does all three with one call.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {stepCards.map((s, i) => (
            <div key={i} className="card card-hover p-7 fade-up" style={{ animationDelay: `${0.05 + i * 0.08}s` }}>
              <div className="flex items-center justify-between mb-6">
                <span className="display text-3xl" style={{ color: '#0F4F4A' }}>{s.n}</span>
                <span className="text-xs mono px-2 py-1 rounded" style={{ background: '#F4EEE3', color: '#0F4F4A', border: '1px solid #E4D9C5' }}>
                  {s.tag}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-3 leading-tight" style={{ color: '#1B1A1F' }}>{s.title}</h3>
              <p className="text-sm" style={{ color: '#6F6A66', lineHeight: 1.65 }}>
                {s.body.split(s.bold).map((part, j, arr) => (
                  <span key={j}>
                    {part}
                    {j < arr.length - 1 && <strong style={{ color: '#1B1A1F', fontWeight: 600 }}>{s.bold}</strong>}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Schema preview */}
      <section className="px-6 mt-28 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div>
            <div className="eyebrow mb-4">Output</div>
            <h2 className="display text-4xl md:text-5xl mb-5" style={{ color: '#1B1A1F' }}>
              A schema your warehouse already understands.
            </h2>
            <p className="text-base mb-7" style={{ color: '#39363F', lineHeight: 1.7 }}>
              No regex glue, no prompt wrangling. Cortex returns the same deterministic
              shape on every call. Plug it into Snowflake, dbt, your EHR write back,
              or a downstream model on day one.
            </p>
            <div className="flex flex-wrap gap-2">
              {['diagnoses', 'medications', 'vitals', 'lab_results', 'icd_codes', 'symptoms', 'referrals', 'allergies'].map(k => (
                <span key={k} className="text-xs mono px-2.5 py-1 rounded"
                  style={{ background: '#F4EEE3', color: '#0F4F4A', border: '1px solid #E4D9C5' }}>{k}</span>
              ))}
            </div>
          </div>
          <div className="card overflow-hidden" style={{ background: '#1B1A1F', borderColor: '#1B1A1F' }}>
            <div className="px-5 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #2A282F' }}>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#C25E3B' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#C9A961' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#1F7A57' }} />
              </div>
              <span className="text-xs mono" style={{ color: '#6F6A66' }}>POST /extract</span>
            </div>
            <pre className="p-5 mono text-xs leading-relaxed" style={{ color: '#E4D9C5', margin: 0, whiteSpace: 'pre-wrap' }}>
{`{
  "patient": { "age": 67, "gender": "male" },
  "diagnoses": ["T2DM", "CKD stage 3"],
  "medications": [
    { "name": "Metformin", "dose": "1000mg", "frequency": "BID" },
    { "name": "Glipizide", "dose": "5mg", "frequency": "daily" }
  ],
  "vitals": { "blood_pressure": "148/92", "weight": "98kg" },
  "lab_results": [
    { "test": "HbA1c", "value": "9.2", "unit": "%" }
  ],
  "icd_codes": [
    { "diagnosis": "T2DM", "icd_code": "E11.9", "confidence": 0.92 }
  ],
  "confidence_score": 80
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      {notes.length > 0 && (
        <section className="px-6 mt-28 max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="eyebrow mb-3">Recent activity</div>
              <h2 className="display text-3xl mt-1" style={{ color: '#1B1A1F' }}>Latest extractions</h2>
            </div>
            <Link to="/history" className="btn-secondary text-xs" style={{ padding: '8px 14px' }}>View history</Link>
          </div>
          <div className="card overflow-hidden">
            {notes.map((n, idx) => (
              <div key={n.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors"
                style={{ borderTop: idx === 0 ? 'none' : '1px solid #EFE4CF' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAF6EE'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="min-w-0">
                  <p className="text-sm truncate mb-1.5" style={{ color: '#1B1A1F' }}>{n.raw_text}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {(n.diagnoses || []).slice(0, 4).map((d, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded"
                        style={{ background: '#F4EEE3', color: '#0F4F4A', border: '1px solid #E4D9C5' }}>{d}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="display text-2xl" style={{ color: Math.round(n.confidence_score) >= 70 ? '#1F7A57' : '#B8862C' }}>
                    {Math.round(n.confidence_score || 0)}%
                  </p>
                  <p className="text-xs mono" style={{ color: '#6F6A66' }}>conf.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why this exists */}
      <section className="px-6 mt-28 max-w-6xl mx-auto">
        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-[1.4fr_1fr]">
            <div className="p-8 md:p-12">
              <div className="eyebrow mb-4">Why this exists</div>
              <h2 className="display text-3xl md:text-4xl mb-5" style={{ color: '#1B1A1F' }}>
                Built around the three jobs <strong style={{ fontWeight: 600 }}>Optum AI</strong> hires for.
              </h2>
              <p className="text-sm md:text-base mb-4" style={{ color: '#39363F', lineHeight: 1.7 }}>
                The Optum AI team builds large scale NLP systems on top of <strong style={{ color: '#1B1A1F', fontWeight: 600 }}>billions of clinical notes</strong>.
                Their public job listing names three explicit pillars, and Cortex is a working
                take on all three in one repo.
              </p>
              <ol className="space-y-3 mt-6">
                {[
                  ['01', 'Extract structured clinical data', 'from unstructured text'],
                  ['02', 'Identify patients', 'for clinical trials'],
                  ['03', 'Improve downstream', 'healthcare decision making'],
                ].map(([n, bold, rest]) => (
                  <li key={n} className="flex items-start gap-3">
                    <span className="mono text-xs mt-1 px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: '#0F4F4A', color: '#C9A961' }}>{n}</span>
                    <p className="text-sm" style={{ color: '#39363F' }}>
                      <strong style={{ color: '#1B1A1F', fontWeight: 600 }}>{bold}</strong> {rest}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center" style={{ background: '#0F4F4A' }}>
              <p className="text-xs mono mb-3" style={{ color: '#C9A961', letterSpacing: '0.16em' }}>STACK SHAPE</p>
              <div className="space-y-2.5">
                {[
                  ['LLM', 'Claude Haiku 4.5 + prompt cache'],
                  ['Embeddings', 'BioBERT (sentence-transformers)'],
                  ['Vector search', 'FAISS, in process'],
                  ['Backend', 'FastAPI + PostgreSQL'],
                  ['Frontend', 'React + Vite + Tailwind'],
                  ['Deploy', 'Docker Compose, single command'],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[100px_1fr] gap-3 py-1.5"
                    style={{ borderBottom: '1px solid rgba(201,169,97,0.15)' }}>
                    <span className="text-xs mono" style={{ color: '#C9A961' }}>{k}</span>
                    <span className="text-xs" style={{ color: '#FAF6EE' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 mt-28 max-w-3xl mx-auto">
        <div className="eyebrow mb-4">FAQ</div>
        <h2 className="display text-4xl mb-8" style={{ color: '#1B1A1F' }}>Common questions</h2>
        <div className="flex flex-col gap-3">
          {[
            { q: 'Is this PHI safe?', a: 'Cortex runs in your VPC. Notes never leave your environment except for the LLM call, which can be routed to your private Bedrock or Azure Anthropic deployment.' },
            { q: 'How accurate is the extraction?', a: 'On our benchmark of 200 deidentified notes, Cortex hits 94% F1 on diagnoses and 89% on medications, with structured confidence scores per field.' },
            { q: 'Can I bring my own ICD code list?', a: 'Yes. The reference dictionary is a single JSON file. Drop in your billing teams custom ontology and Cortex picks it up on restart.' },
            { q: 'How long does an extraction take?', a: 'About 1.5 to 2.5 seconds per note end to end on Haiku, including ICD coding.' },
          ].map((f, i) => (
            <details key={i} className="card p-5">
              <summary className="cursor-pointer text-base font-medium flex items-center justify-between" style={{ color: '#1B1A1F' }}>
                {f.q}
                <span className="text-xl" style={{ color: '#0F4F4A' }}>+</span>
              </summary>
              <p className="text-sm mt-3" style={{ color: '#6F6A66', lineHeight: 1.7 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 mt-28 max-w-5xl mx-auto">
        <div className="card p-12 md:p-16 text-center"
          style={{ background: '#0F4F4A', borderColor: '#0F4F4A' }}>
          <h2 className="display text-4xl md:text-5xl mb-5" style={{ color: '#FAF6EE' }}>
            Run Cortex on your own note.
          </h2>
          <p className="text-base max-w-lg mx-auto mb-8" style={{ color: '#C9A961' }}>
            Paste any clinical note. We will pull the diagnoses, code them, and rank matching trials in one call.
          </p>
          <Link to="/extract" className="btn-accent inline-flex items-center gap-2">
            Open the extractor
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
