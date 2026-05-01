export default function HeroVisual() {
  return (
    <div className="card overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04), 0 30px 80px rgba(15,79,74,0.14)' }}>
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #E4D9C5', background: '#FAF6EE' }}>
        <div className="flex items-center gap-2">
          <span className="relative inline-flex w-2 h-2 rounded-full pulse-ring" style={{ background: '#1F7A57', color: '#1F7A57' }} />
          <span className="text-xs mono" style={{ color: '#6F6A66' }}>live extraction</span>
        </div>
        <span className="text-xs mono" style={{ color: '#6F6A66' }}>POST /extract · 1.8s</span>
      </div>

      {/* ECG strip */}
      <div className="relative h-16 flex items-center" style={{ background: '#0F4F4A' }}>
        <svg viewBox="0 0 600 60" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ecgGrid" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0A3A36" />
              <stop offset="100%" stopColor="#0F4F4A" />
            </linearGradient>
          </defs>
          <rect width="600" height="60" fill="url(#ecgGrid)" />
          {[...Array(30)].map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="60" stroke="#1B6A63" strokeWidth="0.4" />
          ))}
          {[...Array(3)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={(i + 1) * 15} x2="600" y2={(i + 1) * 15} stroke="#1B6A63" strokeWidth="0.4" />
          ))}
          <path
            className="ecg-line"
            d="M 0 30 L 60 30 L 75 30 L 80 24 L 85 36 L 90 12 L 95 48 L 100 30 L 160 30 L 175 30 L 180 24 L 185 36 L 190 12 L 195 48 L 200 30 L 260 30 L 275 30 L 280 24 L 285 36 L 290 12 L 295 48 L 300 30 L 360 30 L 375 30 L 380 24 L 385 36 L 390 12 L 395 48 L 400 30 L 460 30 L 475 30 L 480 24 L 485 36 L 490 12 L 495 48 L 500 30 L 600 30"
            fill="none" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar" style={{ background: '#0F4F4A', color: '#C9A961' }}>JD</div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#1B1A1F' }}>Patient · 67M</p>
            <p className="text-xs" style={{ color: '#6F6A66' }}>Endocrine + renal</p>
          </div>
          <span className="text-xs mono px-2 py-1 rounded" style={{ background: '#E8F2EE', color: '#1F7A57' }}>80% conf</span>
        </div>

        <p className="text-xs mono mb-2" style={{ color: '#6F6A66' }}>NOTE</p>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: '#39363F' }}>
          67yo M with poorly controlled T2DM (HbA1c 9.2%), on Metformin 1000mg BID.
          BP 148/92. eGFR 52. Referred to endocrinology...
        </p>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs mono" style={{ color: '#0F4F4A' }}>↓ extracted</span>
          <div className="flex-1 h-px" style={{ background: '#E4D9C5' }} />
        </div>

        <div className="space-y-2">
          {[
            { icon: 'dx', label: 'Diagnosis', value: 'T2DM', code: 'E11.9' },
            { icon: 'dx', label: 'Diagnosis', value: 'CKD stage 3', code: 'N18.3' },
            { icon: 'rx', label: 'Med', value: 'Metformin 1000mg BID' },
            { icon: 'vit', label: 'Vital', value: 'BP 148/92' },
            { icon: 'lab', label: 'Lab', value: 'HbA1c 9.2%' },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-[28px_60px_1fr_auto] gap-3 items-center px-3 py-2 rounded-lg"
              style={{ background: '#FAF6EE', border: '1px solid #EFE4CF' }}>
              <Icon kind={row.icon} />
              <span className="text-xs mono" style={{ color: '#6F6A66' }}>{row.label}</span>
              <span className="text-sm" style={{ color: '#1B1A1F' }}>{row.value}</span>
              {row.code && <span className="text-xs mono" style={{ color: '#C25E3B' }}>{row.code}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Icon({ kind }) {
  const common = { width: 16, height: 16, fill: 'none', stroke: '#0F4F4A', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'dx') return (
    <svg {...common} viewBox="0 0 24 24"><path d="M12 2v6M9 5h6M5 16l4-4 3 3 7-7" /><circle cx="5" cy="20" r="1.5" /></svg>
  )
  if (kind === 'rx') return (
    <svg {...common} viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="6" rx="3" /><path d="M12 9v6" /></svg>
  )
  if (kind === 'vit') return (
    <svg {...common} viewBox="0 0 24 24"><path d="M3 12h4l2-7 4 14 2-7h6" /></svg>
  )
  if (kind === 'lab') return (
    <svg {...common} viewBox="0 0 24 24"><path d="M9 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V3" /><path d="M8 3h8" /></svg>
  )
  return null
}
