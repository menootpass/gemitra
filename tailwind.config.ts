import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gemitra-blue': '#213DFF',
        'gemitra-green': '#16A86E',
      },
      fontFamily: {
        sans: ['var(--font-open-sans)', 'sans-serif'],
        serif: ['var(--font-work-sans)', 'serif'],
      },
      backgroundImage: {
        'gradient-indie': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-blue': '0 0 20px rgba(33, 61, 255, 0.5)',
      },
      backdropBlur: {
        'glass': '4px',
      },
    },
  },
  plugins: [],
}

export default config
