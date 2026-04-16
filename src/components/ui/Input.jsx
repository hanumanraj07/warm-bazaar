import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Input = forwardRef(function Input(
  { label, prefix, suffix, error, className, inputClassName, ...props },
  ref,
) {
  return (
    <div className={cn('w-full', className)}>
      {label ? <label className="mb-1.5 block text-sm font-medium text-text-muted">{label}</label> : null}
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          className={cn(
            'w-full min-h-[52px] rounded-2xl border border-border bg-surface-card px-4 text-sm text-text-primary shadow-card outline-none transition placeholder:text-text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/10',
            prefix && 'pl-10',
            suffix && 'pr-12',
            error && 'border-danger focus:border-danger focus:ring-danger/10',
            inputClassName,
          )}
          {...props}
        />
        {suffix ? <span className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</span> : null}
      </div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  )
})

export default Input
