/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#05045E',
          light: '#1A1878',
          darker: '#14123F',
        },
        indigo: {
          DEFAULT: '#4338F2',
          light: '#807FF9',
        },
        sky: '#3FA9F5',
        bg: '#F1F0F9',
        surface: '#F3F3FB',
        'surface-alt': '#F8F7FF',
        ink: {
          DEFAULT: '#14123F',
          soft: '#4E4C82',
          muted: '#6E6B99',
          faint: '#8B89B8',
        },
        line: {
          DEFAULT: '#E2E8F0',
          soft: '#F1F0F9',
          accent: '#E7E6FB',
          checkbox: '#C7C6E8',
        },
        success: {
          DEFAULT: '#22B07D',
          bg: '#E9F9F1',
        },
        warning: {
          DEFAULT: '#B45309',
          bg: '#FEF3E2',
        },
        danger: {
          DEFAULT: '#7A1F1F',
          light: '#FF6B6B',
          bg: '#FFE3E3',
          'bg-soft': '#FFEDED',
        },
        accent: {
          purple: '#807FF9',
          'purple-bg': '#F3EEFF',
          blue: '#3FA9F5',
          'blue-bg': '#EAF6FF',
          indigo: '#4338F2',
          'indigo-bg': '#EEF0FF',
          orange: '#FF9F4A',
          'orange-bg': '#FFF1E9',
        },
      },
      borderRadius: {
        xl2: '14px',
        xl3: '16px',
        xl4: '22px',
      },
      boxShadow: {
        card: '0 2px 10px rgba(5,4,94,0.06)',
        panel: '0 4px 24px rgba(5,4,94,0.12)',
        modal: '0 30px 80px rgba(5,4,94,0.3)',
        cta: '0 8px 20px rgba(67,56,242,0.3)',
      },
    },
  },
  plugins: [],
}
