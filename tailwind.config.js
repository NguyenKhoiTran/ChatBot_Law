/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#1e1f23',
        inputBg: '#2a2b32',
      },
      fontFamily: {
        sans: ['Google Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
