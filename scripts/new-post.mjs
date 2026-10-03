// npm run new-post "My post title"  →  src/content/blog/my-post-title.md, as a draft.
// Drafts show up in `npm run dev` only. Set `draft: false` when it's ready to publish.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const title = process.argv.slice(2).join(' ').trim()
if (!title) {
  console.error('Give it a title: npm run new-post "My post title"')
  process.exit(1)
}

const slug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
const dir = join(import.meta.dirname, '..', 'src', 'content', 'blog')
const file = join(dir, `${slug}.md`)
if (existsSync(file)) {
  console.error(`There's already a post at ${file}`)
  process.exit(1)
}

mkdirSync(dir, { recursive: true })
const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
description: 'One sentence about what this is. It shows on the blog page and in link previews.'
date: ${today}
tags: []
draft: true
---

Start writing here.
`,
)
console.log(`Created ${file}\nIt's a draft for now: you'll see it in npm run dev, not in the built site.`)
