/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF5EA',
          200: '#F5E6C8',
          300: '#EBD297',
          400: '#E0BD65',
          500: '#D4AF37', // primary metallic gold
          600: '#B8860B', // dark goldenrod
          700: '#996F08',
          800: '#755406',
          900: '#4A3403',
          bright: '#FFD700',
          champagne: '#FFF5E0',
          muted: '#A39985',
          surface: 'rgba(212, 175, 55, 0.05)',
          border: 'rgba(212, 175, 55, 0.22)',
          borderHover: 'rgba(212, 175, 55, 0.55)',
        },
        dark: {
          base: '#050505',
          bg: '#0A0A0A',
          surface: '#121212',
          surface2: '#181818',
          surface3: '#242424',
          border: 'rgba(255, 255, 255, 0.08)',
          divider: 'rgba(212, 175, 55, 0.12)',
        },
        finance: {
          bg: '#0A0A0A',
          surface: '#121212',
          surface2: '#181818',
          surface3: '#222222',
          border: 'rgba(212, 175, 55, 0.15)',
          borderFocus: 'rgba(212, 175, 55, 0.5)',
          text: '#FFFFFF',
          muted: '#A39985',
          subtle: '#736D61',
          gold: '#D4AF37',
          green: '#10B981',
          greenLight: 'rgba(16, 185, 129, 0.15)',
          red: '#F43F5E',
          redLight: 'rgba(244, 63, 94, 0.15)',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          teal: '#14B8A6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px -2px rgba(212, 175, 55, 0.22)',
        'glow-gold-lg': '0 0 30px -4px rgba(212, 175, 55, 0.35)',
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'glow-red': '0 0 20px -5px rgba(244, 63, 94, 0.25)',
        'card': '0 4px 25px -2px rgba(0, 0, 0, 0.75)',
        'card-gold': '0 4px 25px -2px rgba(0, 0, 0, 0.85), 0 0 15px -3px rgba(212, 175, 55, 0.12)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F5E6C8 0%, #D4AF37 50%, #996F08 100%)',
        'gold-btn': 'linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #B8860B 100%)',
        'gold-btn-hover': 'linear-gradient(135deg, #FFE89C 0%, #E5C158 50%, #D4AF37 100%)',
        'gold-card': 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, rgba(18, 18, 18, 0.98) 100%)',
      }
    },
  },
  plugins: [],
}
