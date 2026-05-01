import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/extract', label: 'NER Extract' },
    { to: '/trials', label: 'Trial Matcher' },
    { to: '/pipeline', label: 'Full Pipeline' },
    { to: '/history', label: 'History' },
  ]
  return (
    <nav style={{ background: '#0A0A18', borderBottom: '1px solid #1A1A2E' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold mono" style={{ color: '#00D4FF' }}>RO Cortex</span>
        <span className="text-xs px-2 py-0.5 rounded-full mono"
          style={{ background: '#00FF8822', color: '#00FF88', border: '1px solid #00FF8844' }}>
          Clinical NLP
        </span>
      </div>
      <div className="flex items-center gap-1">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              color: loc.pathname === l.to ? '#00D4FF' : '#A0A0B0',
              background: loc.pathname === l.to ? 'rgba(0,212,255,0.1)' : 'transparent',
            }}>{l.label}</Link>
        ))}
      </div>
      <div className="mono text-xs" style={{ color: '#333355' }}>
        Powered by ClinicalBERT + Claude
      </div>
    </nav>
  )
}
