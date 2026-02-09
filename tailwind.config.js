/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'elegoo-orange': '#FF6B35',
        'elegoo-blue': '#004E89',
      },
    },
  },
  plugins: [],
}
