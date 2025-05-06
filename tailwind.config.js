/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#7928CA',
          light: '#F5F0FF',
          dark: '#5E17EB',
        },
        text: {
          primary: '#1C1C1E',
          secondary: '#8E8E93',
        },
        background: {
          main: '#FFFFFF',
          off: '#F8F8F8',
        },
      },
      keyframes: {
        'fade-in-out': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '10%': { opacity: '1', transform: 'translateY(0)' },
          '90%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        'fade-in-out': 'fade-in-out 2s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'marquee': 'marquee 10s linear infinite',
      },
    },
  },
  plugins: [],
} 