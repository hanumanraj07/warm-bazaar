import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Bell, Boxes, ChevronLeft, ChevronRight, LogOut, ReceiptText, Store, Truck, Users } from 'lucide-react'
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Billing from './pages/Billing'
import Inventory from './pages/Inventory'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Toast from './components/ui/Toast'
import { formatDate, formatTime } from './utils/helpers'
import { useProducts } from './hooks/useProducts'
import { useCustomers } from './hooks/useCustomers'
import { useSuppliers } from './hooks/useSuppliers'
import { authService } from './services/services'

const MotionSpan = motion.span

const navigation = [
  { to: '/billing', label: 'Billing', icon: ReceiptText, shortLabel: 'POS', color: '#1B4332' },
  { to: '/inventory', label: 'Inventory', icon: Boxes, shortLabel: 'Stock', color: '#2D6A4F' },
  { to: '/customers', label: 'Customers', icon: Users, shortLabel: 'Udhar', color: '#F4A261' },
  { to: '/suppliers', label: 'Suppliers', icon: Truck, shortLabel: 'Vendors', color: '#E76F51' },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3, shortLabel: 'Today', color: '#2A9D8F' },
]

const pageCopy = {
  '/billing': {
    eyebrow: 'Counter Ready',
    title: 'Fast billing for the kirana rush',
    subtitle: 'Search, tap recent items, and finish the bill without breaking flow.',
  },
  '/inventory': {
    eyebrow: 'Shelf Control',
    title: 'Stock checks before gaps become losses',
    subtitle: 'Keep low-stock items visible and adjust product details right from the list.',
  },
  '/customers': {
    eyebrow: 'Udhar Ledger',
    title: 'Track who owes what, clearly',
    subtitle: 'Review pending balances, record payments, and nudge customers on WhatsApp.',
  },
  '/suppliers': {
    eyebrow: 'Purchase Ledger',
    title: 'Stay ahead of supplier dues',
    subtitle: 'Monitor purchases, record payments, and keep vendor balances tidy.',
  },
  '/dashboard': {
    eyebrow: 'Daily Pulse',
    title: 'A quick view of how the shop is moving',
    subtitle: "Today's sales, ledger exposure, low-stock alerts, and your top movers in one place.",
  },
}

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

function MobileNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/30 bg-white/85 px-2 pb-2 pt-2 backdrop-blur-xl xl:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.8rem] bg-surface/90 p-1.5 shadow-[0_8px_32px_rgba(27,67,50,0.12)]">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[1.2rem] px-2 text-[10px] font-semibold transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <MotionSpan
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 rounded-[1.2rem] bg-primary/10 shadow-[0_2px_12px_rgba(27,67,50,0.15)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <div className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function Sidebar({ collapsed, onToggle }) {
  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <aside
      className={`hidden h-full shrink-0 border-r border-white/10 bg-gradient-to-b from-[#1A1A2E] to-[#16162a] text-white transition-all duration-300 xl:flex ${
        collapsed ? 'w-[88px]' : 'w-[240px]'
      }`}
    >
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4a261] to-[#e76f51] text-[#1A1A2E] shadow-lg">
              <Store size={22} />
            </div>
            {!collapsed ? (
              <div>
                <p className="font-display text-base font-bold">Sharma Kirana</p>
                <p className="text-xs text-white/60">POS + Inventory</p>
              </div>
            ) : null}
          </div>
          <button
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/15 hover:scale-105 active:scale-95"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="flex-1 space-y-2 px-3 py-5">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-[56px] items-center rounded-2xl px-3 text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'bg-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'justify-center' : 'gap-3'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon size={20} />
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute -left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                    {!collapsed ? (
                      <div>
                        <span className="block">{item.label}</span>
                        <span className="block text-[11px] font-medium text-white/55">{item.shortLabel}</span>
                      </div>
                    ) : null}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>

        <div className="mt-auto px-3 pb-4">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-white/70 transition-all hover:bg-red-500/20 hover:text-red-400 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!collapsed ? <span>Logout</span> : null}
          </button>

          <div className={`mt-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 ${collapsed ? 'text-center' : ''}`}>
            <p className="font-display text-sm font-semibold text-white">Warm Bazaar</p>
            {!collapsed ? (
              <p className="mt-1 text-xs leading-5 text-white/60">
                Built for quick billing, ledger clarity, and low-friction stock checks.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  )
}

function TopBar() {
  const { pathname } = useLocation()
  const [now, setNow] = useState(() => new Date())
  const { products } = useProducts()
  const { customers } = useCustomers()
  const { suppliers } = useSuppliers()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const notificationCount = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : []
    const safeCustomers = Array.isArray(customers) ? customers : []
    const safeSuppliers = Array.isArray(suppliers) ? suppliers : []
    const lowStock = safeProducts.filter((product) => product.stock <= product.lowThreshold).length
    const overdueCustomers = safeCustomers.filter((customer) => customer.pending > 0).length
    const pendingSuppliers = safeSuppliers.filter((supplier) => supplier.pending > 0).length
    return Math.min(lowStock + overdueCustomers + pendingSuppliers, 99)
  }, [customers, products, suppliers])

  const copy = pageCopy[pathname] ?? pageCopy['/billing']

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-border/40 bg-surface/80 px-4 pb-4 pt-3 backdrop-blur-xl xl:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-light/80">
              {copy.eyebrow}
            </p>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-[1.35rem] font-bold leading-tight text-text-primary xl:text-[1.75rem]"
          >
            {copy.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-1 max-w-2xl text-sm leading-6 text-text-muted"
          >
            {copy.subtitle}
          </motion.p>
        </div>

        <div className="flex shrink-0 items-start gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden rounded-2xl border border-border/60 bg-gradient-to-br from-white to-surface-card/90 px-4 py-2.5 text-right shadow-[0_4px_16px_rgba(27,67,50,0.08)] sm:block"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">Today</p>
            <p className="mt-0.5 font-display text-sm font-semibold text-primary">{formatDate(now)}</p>
            <p className="rupee text-xs font-medium text-text-muted">{formatTime(now)}</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-br from-white to-surface-card/90 text-primary shadow-[0_4px_16px_rgba(27,67,50,0.08)] transition-all hover:shadow-[0_8px_24px_rgba(27,67,50,0.12)]"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gradient-to-br from-[#e76f51] to-[#f4a261] px-1.5 text-[10px] font-bold text-white shadow-lg"
              >
                {notificationCount}
              </motion.span>
            ) : null}
          </motion.button>
        </div>
      </div>
    </header>
  )
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-dvh overflow-hidden bg-transparent text-text-primary">
      <div className="flex h-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-hidden px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4 xl:px-6 xl:pb-6">
            <div className="h-full overflow-y-auto no-scrollbar">
              <Outlet />
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate replace to="/billing" />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
