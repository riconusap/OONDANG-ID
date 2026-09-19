/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FDFBF7',
          dark: '#161412',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1E1B18',
          subtle: '#F6F3ED',
        },
        ink: {
          DEFAULT: '#201D1A',
          muted: '#5F5852',
          light: '#8E857E',
          inverse: '#FFFFFF',
          dark: '#F7F4F0',
        },
        primary: {
          DEFAULT: '#B4533C',
          hover: '#98422F',
          light: '#FDF2EE',
          dark: '#E0755C',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#cbdad0',
          300: '#a6c0b1',
          400: '#7ea18e',
          500: '#5c836e',
          600: '#476856',
          700: '#3a5446',
          800: '#31443a',
          900: '#293931',
          DEFAULT: '#5c836e',
        },
        amber: {
          DEFAULT: '#C27803',
          light: '#FEF7EB',
          dark: '#D98906',
        },
        border: {
          DEFAULT: '#EAE4DC',
          dark: '#332E29',
        },
        wedding: {
          dark: '#111111',
          gray: '#1f1f1f',
          beige: '#eae5de',
          gold: '#c0a062',
          brown: '#4a4036',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        'wedding-sans': ['Inter', 'sans-serif'],
        'wedding-serif': ['Playfair Display', 'serif'],
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
