const withMT = require("@material-tailwind/html/utils/withMT");

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: ["./backend/views/**/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [],
});
