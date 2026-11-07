/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Lake Tana Brand Palette
        brand: {
          primary: '#145B46',   // Deep Lake Green
          secondary: '#1B8A83', // Lake Teal
          accent: '#D9A441',    // Warm Gold
          dark: '#0E3B2E',
          light: '#EAF4F1',
        },
        primary: {
          50: '#F0F7F4',
          100: '#DCEEE7',
          200: '#BCDEC9',
          300: '#91C6A9',
          400: '#4DA57B',
          500: '#145B46', // Primary default
          600: '#114E3C',
          700: '#0E3E30',
          800: '#0B3026',
          900: '#08231C',
          DEFAULT: '#145B46',
        },
        teal: {
          50: '#F0F9F8',
          100: '#DCF1EF',
          200: '#BCE4E0',
          300: '#8DD0CA',
          400: '#4BB4AC',
          500: '#1B8A83', // Secondary default
          600: '#16736D',
          700: '#125A56',
          800: '#0F4643',
          900: '#0B3230',
          DEFAULT: '#1B8A83',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F6EED8',
          200: '#EDDCB0',
          300: '#E3C783',
          400: '#DEB456',
          500: '#D9A441', // Accent default
          600: '#BE8C30',
          700: '#946C24',
          800: '#6E4F1B',
          900: '#4F3813',
          DEFAULT: '#D9A441',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          light: '#FFFFFF',
          muted: 'rgb(var(--color-bg) / <alpha-value>)',
          card: 'rgb(var(--color-surface-card) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          dark: '#132620',
          'dark-card': '#172D26',
          'dark-border': '#1E3A32',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          inverted: '#FFFFFF',
        },
        status: {
          success: '#198754',
          warning: '#E6A23C',
          danger: '#DC3545',
          info: '#0284C7',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Noto Sans Ethiopic',
          'Abyssinica SIL',
          'sans-serif',
        ],
        ethiopic: ['Noto Sans Ethiopic', 'Abyssinica SIL', 'sans-serif'],
        heading: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Noto Sans Ethiopic',
          'sans-serif',
        ],
      },
      boxShadow: {
        'lake-sm': '0 1px 3px rgba(20, 91, 70, 0.08)',
        'lake-md': '0 4px 12px rgba(20, 91, 70, 0.1)',
        'lake-lg': '0 10px 25px -3px rgba(20, 91, 70, 0.12), 0 4px 6px -2px rgba(20, 91, 70, 0.05)',
        'lake-xl': '0 20px 35px -5px rgba(20, 91, 70, 0.15), 0 10px 10px -5px rgba(20, 91, 70, 0.04)',
        'lake-inner': 'inset 0 2px 4px 0 rgba(20, 91, 70, 0.06)',
      },
      animation: {
        'zoom': 'zoom 20s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        zoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
