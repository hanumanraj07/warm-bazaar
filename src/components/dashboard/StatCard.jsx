import { formatINR } from '../../utils/helpers'

export default function StatCard({ label, value, hint, tone = 'default', icon }) {
  const tones = {
    default: 'border-border/60 bg-gradient-to-br from-white to-surface/80 text-text-primary',
    accent: 'border-accent/40 bg-gradient-to-br from-accent/15 to-accent/5 text-accent-warm',
    danger: 'border-danger/30 bg-gradient-to-br from-danger/12 to-danger/5 text-danger',
    success: 'border-success/30 bg-gradient-to-br from-success/12 to-success/5 text-success',
  }

  const iconBg = {
    default: 'from-primary/15 to-primary/5',
    accent: 'from-accent/20 to-accent/10',
    danger: 'from-danger/20 to-danger/10',
    success: 'from-success/20 to-success/10',
  }

  return (
    <div className={`overflow-hidden rounded-[1.8rem] border p-5 shadow-[0_4px_20px_rgba(27,67,50,0.06)] transition-all hover:shadow-[0_8px_30px_rgba(27,67,50,0.1)] hover:-translate-y-0.5 ${tones[tone] || tones.default}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">{label}</p>
          <p className="rupee mt-3 text-2xl font-bold">{typeof value === 'number' ? formatINR(value) : value}</p>
        </div>
        {icon ? (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${iconBg[tone] || iconBg.default} shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-current`}>
            {icon}
          </div>
        ) : null}
      </div>
      {hint ? <p className="mt-3 text-xs text-text-muted">{hint}</p> : null}
    </div>
  )
}
