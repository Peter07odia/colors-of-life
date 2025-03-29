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
    },
  },
  plugins: [],
} 