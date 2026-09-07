/* Tailwind v4 through PostCSS, which is how Next.js consumes it. There is deliberately
   no tailwind.config.js: the whole theme lives in src/styles/crux-tokens.css behind
   `@theme`. */
const config = {
  plugins: ['@tailwindcss/postcss'],
}

export default config
