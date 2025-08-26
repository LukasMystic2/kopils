/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This line tells Tailwind to scan all .js, .jsx, etc. files in your src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [ require('@tailwindcss/typography'),],
}