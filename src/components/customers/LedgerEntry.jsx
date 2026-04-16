import { formatDate, formatINR, formatTime } from '../../utils/helpers'

export default function LedgerEntry({ transaction }) {
  const isBill = transaction.type === 'BILL'

  return (
    <div className="flex items-center gap-3 rounded-[1.4rem] border border-border/70 bg-surface-card px-3 py-3 shadow-card">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
          isBill ? 'bg-danger/12 text-danger' : 'bg-success/12 text-success'
        }`}
      >
        {isBill ? '+' : '−'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{transaction.description}</p>
        <p className="text-xs text-text-muted">
          {formatDate(transaction.date)} • {formatTime(transaction.date)}
        </p>
      </div>
      <div className="text-right">
        <p className={`rupee text-sm font-bold ${isBill ? 'text-danger' : 'text-success'}`}>
          {isBill ? '+' : '−'}
          {formatINR(transaction.amount)}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{transaction.type}</p>
      </div>
    </div>
  )
}
