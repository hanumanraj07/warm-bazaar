import { motion } from 'framer-motion'
import { formatINR } from '../../utils/helpers'

export default function SalesChart({ data }) {
  const max = Math.max(...data.map((item) => item.amount), 1)

  return (
    <div className="mt-5">
      <div className="flex h-40 items-end gap-3">
        {data.map((item, index) => {
          const heightPercent = Math.max((item.amount / max) * 100, item.amount ? 20 : 8)
          const isToday = index === data.length - 1
          
          return (
            <div key={item.day} className="group relative flex flex-1 flex-col items-center gap-3">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
                className="flex h-full w-full items-end"
              >
                <div
                  className={`w-full rounded-t-2xl transition-all ${
                    isToday
                      ? 'bg-gradient-to-t from-primary via-primary-light to-accent shadow-[0_4px_20px_rgba(27,67,50,0.25)]'
                      : 'bg-gradient-to-t from-primary/70 to-primary/40 group-hover:from-primary group-hover:to-primary-light'
                  }`}
                  title={`${item.day}: ${formatINR(item.amount)}`}
                />
              </motion.div>
              <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                {item.day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
