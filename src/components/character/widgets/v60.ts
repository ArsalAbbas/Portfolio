// Coffee: a dripper, at ten times the speed. The kettle pours, the cup fills, the timer
// counts.

import { bump } from '../../../scripts/store'
import { $, clamp, pick } from '../../../scripts/util'
import type { WidgetCtx } from './index'

const TOTAL = 180
const SPEED = 10
/** when the kettle is pouring, in brew seconds */
const POURS = [
  [0, 12],
  [45, 62],
  [75, 98],
]

export function mountV60(el: HTMLElement, { say }: WidgetCtx) {
  const brew = $('[data-brew]', el)
  const timer = $('[data-timer]', el)
  const coffee = $<SVGElement>('.coffee', el)
  const btn = $<HTMLButtonElement>('[data-brew-start]', el)
  if (!brew || !timer || !btn) return

  btn.addEventListener('click', () => {
    btn.disabled = true
    btn.textContent = 'Brewing…'
    say('Three minutes. Well, eighteen seconds here.')
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(TOTAL, ((now - t0) / 1000) * SPEED)
      timer.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
      brew.classList.toggle('is-pouring', POURS.some(([a, b]) => t >= a && t < b))
      const fill = clamp((t - 15) / 150, 0, 1)
      coffee?.style.setProperty('--fill', (1 - (1 - fill) ** 2).toFixed(3))
      if (t < TOTAL) return void requestAnimationFrame(tick)
      btn.disabled = false
      btn.textContent = 'Brew another'
      const cups = bump('brews')
      say(cups > 3 ? `That’s cup number ${cups}. I’m not judging.` : pick(['Coffee’s ready. Back to work.', 'Ahh. Better.', 'Now we can start.']))
    }
    requestAnimationFrame(tick)
  })
}
