import { AnimatePresence, motion } from 'framer-motion'
import Button from './Button'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-surface-dark/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[71] w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.9rem] border border-border/80 bg-surface-card p-5 shadow-warm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-warm">Please confirm</p>
            <h3 className="mt-2 text-xl font-semibold text-text-primary">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">{message}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm}>
                Delete
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
