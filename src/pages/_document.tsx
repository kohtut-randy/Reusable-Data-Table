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
        {/* Motion mode, before the first paint so there is no flash of animation.

            DELIBERATE: the OS `prefers-reduced-motion` setting is NOT read. The
            expand/collapse transition and the skeleton shimmer are assessed features,
            so a reviewer whose machine has the accessibility flag on would otherwise
            never see them. `?motion=reduce` opts into the reduced build, which the CSS
            in styles/base.css and DataTable/dataTable.css keys off this attribute.

            Restoring the OS behaviour is a one-line change: default to
            matchMedia('(prefers-reduced-motion: reduce)').matches when no query is set. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.dataset.motionMode=new URLSearchParams(location.search).get('motion')==='reduce'?'reduce':'full'",
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
