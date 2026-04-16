import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Sheet({ isOpen, onClose, title, children, footer, heightClass = 'max-h-[80dvh]' }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#1A1A2E]/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.section
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose()
            }}
            className={`safe-bottom fixed inset-x-0 bottom-0 z-[61] flex flex-col rounded-t-[2rem] border-t border-white/30 bg-gradient-to-b from-white via-white to-surface/95 shadow-[0_-8px_40px_rgba(26,26,46,0.25)] backdrop-blur-xl ${heightClass}`}
          >
            <div className="flex justify-center pt-4">
              <div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="flex items-center justify-between px-6 pb-4 pt-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/60">Details</p>
                <h3 className="mt-1.5 text-2xl font-bold text-text-primary">{title}</h3>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-surface to-border/50 text-text-muted shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
              >
                <X size={20} />
              </motion.button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">{children}</div>
            {footer ? (
              <div className="border-t border-border/50 bg-gradient-to-r from-transparent via-surface/50 to-transparent px-6 pb-6 pt-5">
                {footer}
              </div>
            ) : null}
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  )
}
