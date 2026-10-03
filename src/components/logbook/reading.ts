// Fills the reading bar as you scroll through a blog post.

import { $, clamp } from '../../scripts/util'

export function initReading() {
  const article = $('[data-article]')
  const bar = $('.read-xp span')
  if (!article || !bar) return

  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const r = article.getBoundingClientRect()
      bar.style.setProperty('--read', clamp((innerHeight - r.top) / r.height, 0, 1).toFixed(4))
      ticking = false
    })
  }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  onScroll()
}
