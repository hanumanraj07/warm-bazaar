const artwork = {
  cart: (
    <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4a261" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1B4332" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="19" y="29" width="82" height="55" rx="18" fill="url(#cartGrad)" />
      <path d="M34 39h9l6 27h34l7-20H45" stroke="#1B4332" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="55" cy="84" r="5" fill="#1B4332" />
      <circle cx="82" cy="84" r="5" fill="#1B4332" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="prodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B4332" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="18" y="22" width="84" height="76" rx="20" fill="url(#prodGrad)" />
      <path d="M37 41h46M37 58h46M37 75h26" stroke="#1B4332" strokeWidth="5" strokeLinecap="round" />
      <circle cx="83" cy="75" r="10" fill="#F4A261" />
    </svg>
  ),
  ledger: (
    <svg viewBox="0 0 120 120" className="h-28 w-28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ledgerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E76F51" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f4a261" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="24" y="18" width="72" height="84" rx="18" fill="url(#ledgerGrad)" />
      <path d="M43 42h34M43 58h34M43 74h20" stroke="#E76F51" strokeWidth="5" strokeLinecap="round" />
      <circle cx="78" cy="74" r="9" fill="#1B4332" />
    </svg>
  ),
}

export default function EmptyState({
  variant = 'cart',
  title,
  subtitle,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/80 bg-gradient-to-br from-white/90 to-surface/80 px-6 py-14 text-center shadow-[0_4px_20px_rgba(27,67,50,0.06)]">
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-surface to-surface-card shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)]">
        {artwork[variant] || artwork.cart}
      </div>
      <h3 className="mt-6 text-xl font-bold text-text-primary">{title}</h3>
      <p className="mt-3 max-w-xs text-sm leading-6 text-text-muted">{subtitle}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
