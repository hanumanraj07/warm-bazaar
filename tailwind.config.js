/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        accent: 'var(--accent)',
        'accent-warm': 'var(--accent-warm)',
        'accent-light': 'var(--accent-light)',
        surface: 'var(--surface)',
        'surface-card': 'var(--surface-card)',
        'surface-dark': 'var(--surface-dark)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        border: 'var(--border)',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(27, 67, 50, 0.08)',
        'card-hover': '0 8px 30px rgba(27, 67, 50, 0.15)',
        sheet: '0 -4px 24px rgba(26, 26, 46, 0.18)',
        'sheet-top': '0 -8px 40px rgba(26, 26, 46, 0.25)',
        warm: '0 20px 55px rgba(27, 67, 50, 0.12)',
        fab: '0 12px 28px rgba(27, 67, 50, 0.22)',
        'fab-hover': '0 16px 40px rgba(27, 67, 50, 0.28)',
        'inner-glow': 'inset 0 2px 4px rgba(27, 67, 50, 0.06)',
        'accent-glow': '0 0 30px rgba(244, 162, 97, 0.3)',
        'primary-glow': '0 0 30px rgba(27, 67, 50, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'bazaar-glow':
          'radial-gradient(circle at top left, rgba(244, 162, 97, 0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(27, 67, 50, 0.16), transparent 42%)',
        'gradient-primary': 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--accent) 0%, var(--accent-warm) 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        'gradient-dark': 'linear-gradient(180deg, var(--surface-dark) 0%, #252545 100%)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
