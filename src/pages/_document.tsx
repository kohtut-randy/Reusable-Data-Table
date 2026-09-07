import { Head, Html, Main, NextScript } from 'next/document'

/* Route file, so it default-exports: the one carve-out to the named-export rule.
   Kept thin on purpose. */
export default function Document() {
  return (
    /* data-theme='light' is what makes the shared token layer render this app in light
       mode while the companion landing page stays dark, off the SAME tokens.css. It
       works because the semantic-to-utility map lives in `@theme inline`. */
    <Html lang='en' data-theme='light'>
      <Head>
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <meta name='theme-color' content='#faf8f2' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
