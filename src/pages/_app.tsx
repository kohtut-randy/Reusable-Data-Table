import type { AppProps } from 'next/app'
import { DashboardLayout } from 'layouts'
import 'styles/globals.css'

/* Route file, so it default-exports: the one carve-out to the named-export rule.
   The shell is applied here rather than per page, so no page can forget it. */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <DashboardLayout>
      <Component {...pageProps} />
    </DashboardLayout>
  )
}
