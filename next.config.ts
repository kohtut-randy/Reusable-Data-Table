import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,

  // Pages Router only. No `app/` directory, no Server Components, no 'use client'.
  poweredByHeader: false,

  /* This repo sits inside a parent folder that has its own lockfile, so Turbopack would
     otherwise infer the wrong workspace root and warn on every start. */
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },

  /* `next dev` otherwise appends a generated block to AGENTS.md on every start.
     AGENTS.md here is a deliberate, reviewed artifact that documents this repo's
     conventions, so it stays under version control and out of a tool's hands. */
  agentRules: false,
}

export default config
