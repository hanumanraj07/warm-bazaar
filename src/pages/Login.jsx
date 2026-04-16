import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Store, Lock, Mail } from 'lucide-react'
import { authService } from '../services/services'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authService.login(email, password)
      navigate('/billing')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#1A1A2E] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-[#f4a261]/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-[#1B4332]/30 to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#f4a261] to-[#e76f51] shadow-lg"
            >
              <Store size={28} className="text-[#1A1A2E]" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-white">Sharma Kirana</h1>
            <p className="mt-1 text-sm text-white/60">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sharmakirana.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-white/30 focus:border-[#f4a261]/50 focus:outline-none focus:ring-2 focus:ring-[#f4a261]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-white placeholder:text-white/30 focus:border-[#f4a261]/50 focus:outline-none focus:ring-2 focus:ring-[#f4a261]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#f4a261] to-[#e76f51] py-3.5 font-semibold text-[#1A1A2E] shadow-lg transition-all hover:shadow-[0_8px_24px_rgba(244,162,97,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={20} className="mx-auto animate-spin" />
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-center text-xs font-medium text-white/40">Demo Credentials</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-white/60">Email:</span>
              <span className="font-mono text-white/80">admin@sharmakirana.com</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-white/60">Password:</span>
              <span className="font-mono text-white/80">admin123</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Warm Bazaar POS System
        </p>
      </motion.div>
    </div>
  )
}
