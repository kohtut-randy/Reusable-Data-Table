import Head from 'next/head'

export type PageMetaProps = {
  /** Page-specific part of the title. The brand suffix is appended here. */
  title: string
  description: string
}

const TITLE_SUFFIX = 'CRUX Staff'

/* Every route sets its own title and description through this one component.
 *
 * It exists because axe flagged a missing `<title>` on all three pages: Next's Pages
 * Router has no automatic per-route title, and a single default in `_document` would
 * give every page the same name in a tab strip and in a screen reader's window list. */
export const PageMeta = ({ title, description }: PageMetaProps) => (
  <Head>
    <title>{`${title} | ${TITLE_SUFFIX}`}</title>
    <meta name='description' content={description} />
  </Head>
)
