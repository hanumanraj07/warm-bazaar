import { ArrowDownCircle, CreditCard, Maximize2, NotebookText, TrendingUp, Wallet, AlertTriangle, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import AlertList from '../components/dashboard/AlertList'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton'
import { formatINR, formatTime, formatDate } from '../utils/helpers'
import { useDashboard } from '../hooks/useDashboard'

export default function Dashboard() {
  const { dashboard, isLoading, isError, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonCard className="min-h-[240px]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <SkeletonList count={3} />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        variant="error"
        title="Failed to load dashboard"
        subtitle={error?.message || 'Something went wrong. Please try again.'}
      />
    )
  }

  if (!dashboard) return null

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-white via-white to-primary/[0.03] p-6 shadow-[0_4px_24px_rgba(27,67,50,0.08)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary/60">Today Sales</p>
            </div>
            <p className="rupee mt-3 text-5xl font-bold text-primary">{formatINR(dashboard.todaySales)}</p>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-sm text-text-muted">{dashboard.todayBills} bills closed</p>
              <span className="rounded-full bg-success/15 px-3 py-1 text-sm font-semibold text-success">
                Profit: {formatINR(dashboard.todayProfit)}
              </span>
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 px-5 py-3.5 text-right shadow-[0_2px_12px_rgba(27,67,50,0.08)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60">Shop rhythm</p>
            <p className="mt-1 text-sm font-semibold text-primary">7 day comparison</p>
          </div>
        </div>
        <div className="mt-6">
          <SalesChart data={dashboard.weeklyChart} />
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Monthly Revenue', value: dashboard.monthlyRevenue, hint: 'Gross billed this month', icon: <TrendingUp size={20} /> },
          { label: 'Monthly Profit', value: dashboard.netProfit, hint: 'After expenses', tone: 'success', icon: <TrendingUp size={20} /> },
          { label: 'Total Udhar', value: dashboard.totalUdhar, hint: 'Outstanding from customers', tone: 'accent', icon: <NotebookText size={20} /> },
          { label: 'Total Payable', value: dashboard.totalPayable, hint: 'You owe suppliers', tone: 'danger', icon: <Wallet size={20} /> },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="overflow-hidden rounded-[2rem] border border-warning/40 bg-gradient-to-br from-warning/15 to-warning/5 p-5 shadow-[0_4px_24px_rgba(245,158,11,0.1)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20 text-warning">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-warning">Low Stock</p>
              <p className="text-2xl font-bold text-warning">{dashboard.lowStock?.length || 0}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">Products need restocking</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="overflow-hidden rounded-[2rem] border border-danger/40 bg-gradient-to-br from-danger/15 to-danger/5 p-5 shadow-[0_4px_24px_rgba(239,68,68,0.1)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/20 text-danger">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-danger">Expiring Soon</p>
              <p className="text-2xl font-bold text-danger">{dashboard.expiringSoon?.length || 0}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">Items expiring within 2 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="overflow-hidden rounded-[2rem] border border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 p-5 shadow-[0_4px_24px_rgba(27,67,50,0.1)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Cash Status</p>
              <p className="text-sm font-bold text-primary">
                {dashboard.cashStatus?.isOpen ? 'Day Open' : 'Day Not Opened'}
              </p>
            </div>
          </div>
          {dashboard.cashStatus?.isOpen && (
            <p className="text-xs text-text-muted">
              Expected: {formatINR(dashboard.cashStatus.expectedCash || 0)}
            </p>
          )}
        </motion.div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="panel-card overflow-hidden rounded-[2rem] border border-border/60 p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-danger">Low Stock Alerts</p>
              <h2 className="mt-2 text-xl font-bold text-text-primary">Items that need attention</h2>
            </div>
            <span className="rounded-2xl bg-danger/10 px-3 py-1.5 text-sm font-semibold text-danger">{dashboard.lowStock?.length || 0}</span>
          </div>
          {dashboard.lowStock && dashboard.lowStock.length ? (
            <AlertList products={dashboard.lowStock} />
          ) : (
            <EmptyState
              variant="products"
              title="Stock looks healthy"
              subtitle="No urgent low-stock alerts right now."
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="panel-card overflow-hidden rounded-[2rem] border border-border/60 p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary/60">Recent Bills</p>
              <h2 className="mt-2 text-xl font-bold text-text-primary">Last 5 checkouts</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="space-y-3">
            {dashboard.recentBills && dashboard.recentBills.length ? (
              dashboard.recentBills.map((bill, index) => (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  className="group overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-white to-surface/60 px-4 py-3.5 shadow-[0_2px_12px_rgba(27,67,50,0.04)] transition-all hover:shadow-[0_4px_16px_rgba(27,67,50,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{formatTime(bill.time)}</p>
                      <p className="text-xs text-text-muted">
                        {bill.mode} {bill.customer ? `• ${bill.customer}` : '• Walk-in'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rupee text-base font-bold text-primary">{formatINR(bill.amount)}</span>
                      {bill.profit > 0 && (
                        <p className="text-[10px] text-success">+{formatINR(bill.profit)}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState
                variant="ledger"
                title="No bills yet"
                subtitle="Bills will appear here after you start billing."
              />
            )}
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="panel-card overflow-hidden rounded-[2rem] border border-border/60 p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary/60">Top Selling Products</p>
            <h2 className="mt-2 text-xl font-bold text-text-primary">What's moving fastest</h2>
          </div>
        </div>

        {dashboard.topSelling && dashboard.topSelling.length ? (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {dashboard.topSelling.map((product, index) => (
              <motion.div
                key={product.productId || product.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group min-w-[200px] overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-white to-surface/60 p-5 shadow-[0_2px_12px_rgba(27,67,50,0.04)] transition-all hover:shadow-[0_8px_24px_rgba(27,67,50,0.1)] hover:-translate-y-1"
              >
                <p className="text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">{product.name}</p>
                <p className="rupee mt-4 text-3xl font-bold text-primary">{product.sold}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">units sold</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="products"
            title="No sales yet"
            subtitle="Top selling items will appear once bills start coming in."
          />
        )}
      </motion.section>
    </div>
  )
}
