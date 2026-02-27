import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Clash Display"', 'sans-serif'],
        body: ['"Satoshi"', '"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Logo palette: navy + gold/orange + vivid blue
        brand: {
          navy:    '#0A1628',
          blue:    '#1E6FDB',
          blue2:   '#2563EB',
          gold:    '#F59E0B',
          orange:  '#EA6C1E',
          light:   '#E8F0FE',
        },
        surface: {
          0: '#060E1C',
          1: '#0A1628',
          2: '#0F1F35',
          3: '#162844',
          4: '#1D3357',
        },
        ink: {
          DEFAULT: '#F0F4FF',
          2: '#9BB0CC',
          3: '#4D6A8A',
          4: '#2A4266',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1E6FDB 0%, #EA6C1E 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #EA6C1E 100%)',
        'surface-gradient': 'linear-gradient(180deg, #060E1C 0%, #0A1628 100%)',
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(30,111,219,0.35)',
        'glow-gold': '0 0 40px rgba(245,158,11,0.35)',
        'glow-sm': '0 0 20px rgba(30,111,219,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,111,219,0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'in-up': 'inUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'marquee': 'marquee 24s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        inUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
    },
  },
  plugins: [],
} satisfies Config
