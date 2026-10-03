// The Engineer's numbers count up the first time you see them, and Ship it throws confetti.

import { burstFrom } from '../../../scripts/effects'
import { bump } from '../../../scripts/store'
import { $, $$, onceVisible, pick, reducedMotion } from '../../../scripts/util'
import type { WidgetCtx } from './index'

const SHIPPED = [
  'Shipped. On a Friday, too.',
  'Deployed. Watching the logs…',
  'LGTM.',
  'It’s in production. No take-backs.',
  'Release notes? I’ll write them later.',
]

export function mountStats(el: HTMLElement, { say }: WidgetCtx) {
  // "1,800+" counts up as 1800 with a "+" after it; words like "Too many" just sit there
  const nums = $$('b[data-count]', el)
    .map((b) => {
      const [, digits = '', rest = ''] = /^([\d,]*)(.*)$/.exec(b.dataset.count ?? '') ?? []
      return { b, n: Number(digits.replace(/,/g, '')), rest }
    })
    .filter((x) => x.n > 0)
  onceVisible(
    el,
    () => {
      if (reducedMotion()) return
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1400)
        const eased = 1 - (1 - p) ** 3
        nums.forEach(({ b, n, rest }) => (b.textContent = Math.round(n * eased).toLocaleString('en-IN') + rest))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },
    0.5,
  )
  $('[data-ship]', el)?.addEventListener('click', (e) => {
    burstFrom(e.currentTarget as Element, 22)
    const n = bump('ships')
    say(n === 5 ? 'Five deploys in a row. Someone’s getting paged.' : pick(SHIPPED))
  })
}
