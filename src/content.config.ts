import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// One Markdown (or MDX) file per post in src/content/blog. Files starting with "_" are ignored.
// `npm run new-post "My title"` creates one with this frontmatter filled in.
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** drafts appear in `npm run dev` only, never in the built site */
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }
