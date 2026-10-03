import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { site } from '../data/site'
import { getPosts, postUrl } from '../lib/posts'

export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((post) => !post.data.draft)
  return rss({
    title: `${site.name}’s blog`,
    description: 'Engineering write-ups: what I’m building, what broke, and what I learned fixing it.',
    site: context.site ?? 'http://localhost:4321',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
      categories: post.data.tags,
    })),
    customData: '<language>en-gb</language>',
  })
}
