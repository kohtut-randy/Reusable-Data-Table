import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    /* data-theme='light' is what makes the shared token layer render this app in light
       mode while the companion landing page stays dark, off the SAME tokens.css. It
       works because the semantic-to-utility map lives in `@theme inline`. */
    <Html lang='en' data-theme='light'>
      <Head>
        <link rel='icon' href='/dynamic-table.svg' type='image/svg+xml' />
        <meta name='theme-color' content='#faf8f2' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
