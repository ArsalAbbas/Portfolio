// Food: spin the roulette and it slows down on something to eat. Never the same twice in a row.

import { bump } from '../../../scripts/store'
import { $, $$, reducedMotion } from '../../../scripts/util'
import type { WidgetCtx } from './index'

const VERDICTS: Record<string, string> = {
  biryani: 'Biryani. It’s always biryani.',
  kebab: 'Galouti it is. Excellent taste.',
  momos: 'Extra chutney, please.',
  chole: 'Chole bhature. Nap scheduled.',
  pizza: 'Thin crust. No arguments.',
  chai: 'Chai break. Non-negotiable.',
}

export function mountDishes(el: HTMLElement, { say }: WidgetCtx) {
  const btn = $<HTMLButtonElement>('[data-dish-spin]', el)
  if (!btn) return
  const list: { id: string; name: string; note: string }[] = JSON.parse(btn.dataset.dishes ?? '[]')
  const plates = $$<SVGGElement>('[data-dish]', el)
  const name = $('[data-dish-name]', el)
  const note = $('[data-dish-note]', el)
  let at = 0
  const show = (i: number) => {
    at = i
    plates.forEach((g) => g.classList.toggle('is-on', g.dataset.dish === list[i].id))
    if (name) name.textContent = list[i].name
    if (note) note.textContent = list[i].note
  }
  btn.addEventListener('click', () => {
    if (list.length < 2) return
    // anything but what's on the plate now
    let target = Math.floor(Math.random() * (list.length - 1))
    if (target >= at) target++
    const land = () => {
      btn.disabled = false
      bump('meals')
      say(VERDICTS[list[at].id] ?? 'Good choice.')
    }
    if (reducedMotion()) return void (show(target), land())
    btn.disabled = true
    // spin round twice, slowing down, and stop on the target
    const steps = list.length * 2 + ((target - at + list.length) % list.length)
    let i = 0
    const next = () => {
      show((at + 1) % list.length)
      if (++i < steps) setTimeout(next, 45 + (i / steps) ** 2.2 * 300)
      else land()
    }
    next()
  })
}
