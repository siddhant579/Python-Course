/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Green + purple brand palette (green primary, purple secondary),
        // pastel pill badges - matches the reference site's edu-platform look.
        brand: {
          50: '#eafbf1',
          100: '#cdf6df',
          200: '#9dedc0',
          300: '#65dd9c',
          400: '#3ac97e',
          500: '#22a866', // primary green
          600: '#158a52',
          700: '#106d43',
          800: '#0f5738',
          900: '#0d4630',
          950: '#062a1c', // near-black green, for dark banners/headers
        },
        accent: {
          50: '#f3f1fe',
          100: '#e9e5fd',
          200: '#d5cdfb',
          300: '#b6a8f7',
          400: '#9a86f2',
          500: '#8266ec', // secondary purple
          600: '#6b4ddc',
          700: '#5a3ec0',
          800: '#4a339c',
          900: '#3e2d7d',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e0',
          300: '#b1b8c4',
          400: '#8791a3',
          500: '#69738a',
          600: '#535c71',
          700: '#444b5c',
          800: '#2e3341',
          900: '#1b1e27',
          950: '#101218',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 18, 24, 0.05), 0 1px 3px 0 rgba(16, 18, 24, 0.06)',
        cardHover: '0 4px 12px -2px rgba(16, 18, 24, 0.12)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
