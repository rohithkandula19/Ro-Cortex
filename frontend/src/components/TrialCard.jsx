export default function TrialCard({ match }) {
  const eligible = match.eligible
  const score = Math.round(match.final_score)
  const scoreColor = score >= 70 ? '#22A06B' : score >= 40 ? '#F59E0B' : '#E5484D'

  return (
    <div className="card p-5"
      style={{ borderColor: eligible ? '#BBE5CD' : '#F1E2D4', background: eligible ? '#F4FBF7' : '#FFFFFF' }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs mono px-2 py-0.5 rounded-full"
              style={{ background: '#FFFFFF', border: '1px solid #F1E2D4', color: '#3C3C4C' }}>
              {match.trial_id}
            </span>
            {eligible && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: '#DCFCE7', color: '#15803D' }}>
                Eligible
              </span>
            )}
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#161624' }}>{match.title}</p>
          <p className="text-xs leading-relaxed" style={{ color: '#6B6B7C' }}>{match.description}</p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="display text-3xl" style={{ color: scoreColor }}>{score}</p>
          <p className="text-xs mono" style={{ color: '#6B6B7C' }}>match</p>
        </div>
      </div>

      <div className="h-1.5 rounded-full mb-4" style={{ background: '#F5E6D7' }}>
        <div className="h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(score, 100)}%`, background: scoreColor }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {match.match_reasons?.length > 0 && (
          <div>
            <p className="text-xs mono mb-1.5" style={{ color: '#15803D' }}>WHY IT FITS</p>
            {match.match_reasons.map((r, i) => (
              <p key={i} className="text-xs mb-0.5" style={{ color: '#3C3C4C' }}>· {r}</p>
            ))}
          </div>
        )}
        {match.disqualifiers?.length > 0 && (
          <div>
            <p className="text-xs mono mb-1.5" style={{ color: '#E5484D' }}>BLOCKERS</p>
            {match.disqualifiers.map((d, i) => (
              <p key={i} className="text-xs mb-0.5" style={{ color: '#3C3C4C' }}>· {d}</p>
            ))}
          </div>
        )}
      </div>

      {match.conditions?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {match.conditions.map((c, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full mono"
              style={{ background: '#FFFAF6', color: '#6B6B7C', border: '1px solid #F5E6D7' }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  )
}
