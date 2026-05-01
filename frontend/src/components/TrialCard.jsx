export default function TrialCard({ match }) {
  const scoreColor = match.final_score >= 70 ? '#00FF88' : match.final_score >= 40 ? '#FFD700' : '#FF3333'

  return (
    <div style={{
      background: '#0F0F1C',
      border: `1px solid ${match.eligible ? '#00FF8844' : '#1A1A2E'}`,
      borderRadius: 12,
      padding: '14px 16px',
      boxShadow: match.eligible ? '0 0 10px rgba(0,255,136,0.08)' : 'none'
    }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs mono px-2 py-0.5 rounded-full"
              style={{ background: '#00D4FF22', color: '#00D4FF', border: '1px solid #00D4FF44' }}>
              {match.trial_id}
            </span>
            {match.eligible && (
              <span className="text-xs mono px-2 py-0.5 rounded-full font-bold"
                style={{ background: '#00FF8822', color: '#00FF88', border: '1px solid #00FF8844' }}>
                ✓ ELIGIBLE
              </span>
            )}
          </div>
          <p className="text-sm font-semibold" style={{ color: '#E0E0F0' }}>{match.title}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#555566' }}>{match.description}</p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-2xl font-bold mono" style={{ color: scoreColor }}>
            {Math.round(match.final_score)}
          </p>
          <p className="text-xs mono" style={{ color: '#555566' }}>MATCH</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 rounded-full mb-3" style={{ background: '#1A1A2E' }}>
        <div className="h-1.5 rounded-full transition-all"
          style={{ width: `${match.final_score}%`, background: scoreColor }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {match.match_reasons?.length > 0 && (
          <div>
            <p className="text-xs mono mb-1" style={{ color: '#00FF88' }}>MATCH REASONS</p>
            {match.match_reasons.map((r, i) => (
              <p key={i} className="text-xs" style={{ color: '#A0A0B0' }}>• {r}</p>
            ))}
          </div>
        )}
        {match.disqualifiers?.length > 0 && (
          <div>
            <p className="text-xs mono mb-1" style={{ color: '#FF3333' }}>DISQUALIFIERS</p>
            {match.disqualifiers.map((d, i) => (
              <p key={i} className="text-xs" style={{ color: '#FF8888' }}>• {d}</p>
            ))}
          </div>
        )}
      </div>

      {match.conditions?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {match.conditions.map((c, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full mono"
              style={{ background: '#1A1A2E', color: '#555566' }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  )
}
