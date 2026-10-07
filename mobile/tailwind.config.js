/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope_400Regular'],
        'm-medium': ['Manrope_500Medium'],
        'm-semibold': ['Manrope_600SemiBold'],
        'm-bold': ['Manrope_700Bold'],
      }
    },
  },
  plugins: [],
}
