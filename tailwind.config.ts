import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#39ff14',
          'green-dark': '#2ecc40',
          'green-light': '#7fff00',
        },
        dark: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          'surface-light': '#2a2a2a',
          border: '#333333',
        },
        light: {
          bg: '#f5f5f5',
          surface: '#ffffff',
          'surface-light': '#f9fafb',
          border: '#e5e7eb',
        },
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(57, 255, 20, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(57, 255, 20, 0.8)',
          },
        },
        'glow': {
          '0%': {
            textShadow: '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)',
          },
          '100%': {
            textShadow: '0 0 20px rgba(57, 255, 20, 0.8), 0 0 30px rgba(57, 255, 20, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config

