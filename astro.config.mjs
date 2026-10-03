import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

// The public address, used by the RSS feed, the sitemap and link previews. Vercel provides it
// at build time; set SITE_URL to use your own domain.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321')

export default defineConfig({
  site,
  integrations: [mdx(), sitemap()],
  prefetch: { prefetchAll: true },
  markdown: {
    // code is coloured with CSS variables, so it follows the light and dark themes
    shikiConfig: { theme: 'css-variables' },
  },
  devToolbar: { enabled: false },
})
