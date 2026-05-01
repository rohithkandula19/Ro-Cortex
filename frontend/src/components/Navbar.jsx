import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/extract', label: 'Extract' },
    { to: '/trials', label: 'Trial Matcher' },
    { to: '/pipeline', label: 'Pipeline' },
    { to: '/history', label: 'History' },
  ]
  return (
    <nav style={{ background: 'rgba(10,10,24,0.85)', borderBottom: '1px solid #1A1A2E', backdropFilter: 'blur(12px)' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #7B2FBE 100%)' }}>
          <span className="text-xs font-bold mono" style={{ color: '#080810' }}>RO</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold" style={{ color: '#FFFFFF', letterSpacing: '0.02em' }}>Cortex</span>
          <span className="text-[10px] mono" style={{ color: '#555566' }}>clinical intelligence</span>
        </div>
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
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#00FF88' }} />
        <span className="mono text-xs" style={{ color: '#A0A0B0' }}>operational</span>
      </div>
    </nav>
  )
}
