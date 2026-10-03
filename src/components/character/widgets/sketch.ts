// The sketch in Sketching draws itself the first time you see it, and again whenever you ask.

import { $, onceVisible, pick, reducedMotion } from '../../../scripts/util'
import type { WidgetCtx } from './index'

const CRITIQUES = ['Fridge-worthy.', 'It’s a rough draft.', 'I’ve captured your good side. Mine, I mean.', 'Everyone’s a critic.']

export function mountSketch(el: HTMLElement, { say }: WidgetCtx) {
  const svg = $<SVGSVGElement>('.sketch', el)
  if (!svg) return
  const last = svg.lastElementChild
  const draw = () => {
    if (reducedMotion()) return
    svg.classList.remove('is-waiting', 'is-drawing')
    void svg.getBoundingClientRect()
    svg.classList.add('is-drawing')
  }
  // hidden until it starts drawing, so it doesn't flash up finished first
  if (!reducedMotion()) svg.classList.add('is-waiting')
  onceVisible(el, draw, 0.4)
  last?.addEventListener('animationend', () => say(pick(CRITIQUES)))
  $('[data-redraw]', el)?.addEventListener('click', draw)
}
