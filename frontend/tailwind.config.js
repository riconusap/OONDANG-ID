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
          DEFAULT: '#3D6B52',
          light: '#EBF2ED',
          dark: '#589372',
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
