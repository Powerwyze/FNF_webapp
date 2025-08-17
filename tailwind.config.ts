import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fnf: {
          red: '#DC2626',
          orange: '#EA580C',
          yellow: '#FCD34D',
          black: '#000000',
          'dark-gray': '#1F1F1F',
          gray: '#374151',
          'light-gray': '#6B7280',
          accent: '#DC2626'
        }
      },
      fontFamily: {
        'bebas': ['Bebas Neue', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 24px rgba(0,0,0,0.3)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.5)',
        'glow-orange': '0 0 20px rgba(234, 88, 12, 0.5)',
        'glow-yellow': '0 0 20px rgba(252, 211, 77, 0.5)',
      },
      backgroundImage: {
        'fnf-gradient': 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #FCD34D 100%)',
        'fnf-dark-gradient': 'linear-gradient(180deg, #000000 0%, #1F1F1F 100%)',
      }
    },
  },
  safelist: [
    'border-red-500',
    'border-purple-500',
    'border-green-500',
    'border-blue-500',
    'border-yellow-500',
  ],
  plugins: [],
}

export default config


