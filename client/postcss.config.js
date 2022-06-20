module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-for'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-each'),
  ]
}
