import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const links = [
    { to: '/', label: 'Overview' },
    { to: '/extract', label: 'Extract' },
    { to: '/trials', label: 'Trials' },
    { to: '/pipeline', label: 'Pipeline' },
    { to: '/history', label: 'History' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
      style={{ background: 'rgba(244,238,227,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(228,217,197,0.6)' }}>
      <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0F4F4A' }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M5 16h5l2-5 3 10 2-5h6l3-3" stroke="#C9A961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-base font-semibold tracking-tight" style={{ color: '#1B1A1F' }}>Cortex</span>
        <span className="hidden sm:inline text-xs px-1.5 py-0.5 rounded mono" style={{ background: '#E4D9C5', color: '#39363F' }}>v1.0</span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className="text-sm font-medium transition-all relative py-1"
            style={{ color: loc.pathname === l.to ? '#0F4F4A' : '#39363F' }}>
            {l.label}
            {loc.pathname === l.to && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-px" style={{ background: '#C9A961' }} />
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden md:inline-flex items-center gap-2 text-xs mono" style={{ color: '#6F6A66' }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#1F7A57' }} />
          live
        </span>
        <a href="https://github.com/rohithkandula19/Ro-Cortex" target="_blank" rel="noreferrer"
          className="hidden md:inline-flex btn-secondary text-xs" style={{ padding: '7px 14px' }}>
          GitHub
        </a>
        <button className="md:hidden p-2 rounded-lg" onClick={() => setOpen(o => !o)}
          style={{ border: '1px solid #E4D9C5', background: '#FFFDF8' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B1A1F" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 px-4 py-3 flex flex-col gap-1 slide-in"
          style={{ background: '#FAF6EE', borderBottom: '1px solid #E4D9C5' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{
                color: loc.pathname === l.to ? '#0F4F4A' : '#39363F',
                background: loc.pathname === l.to ? '#F4EEE3' : 'transparent',
              }}>{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}
