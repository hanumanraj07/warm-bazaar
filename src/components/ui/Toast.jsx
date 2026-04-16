import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

const styles = {
  success: {
    icon: CheckCircle2,
    className: 'border-success/30 bg-gradient-to-r from-success to-emerald-500 text-white shadow-[0_8px_32px_rgba(16,185,129,0.35)]',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning/30 bg-gradient-to-r from-warning to-amber-500 text-white shadow-[0_8px_32px_rgba(245,158,11,0.35)]',
  },
  error: {
    icon: XCircle,
    className: 'border-danger/30 bg-gradient-to-r from-danger to-rose-600 text-white shadow-[0_8px_32px_rgba(239,68,68,0.35)]',
  },
}

export default function Toast() {
  const toast = useStore((state) => state.toast)

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`fixed left-1/2 top-4 z-[90] flex w-[min(92vw,26rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold ${
            (styles[toast.type] || styles.success).className
          }`}
        >
          {(() => {
            const Icon = (styles[toast.type] || styles.success).icon
            return <Icon size={20} />
          })()}
          <span className="flex-1">{toast.message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
