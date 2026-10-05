// Travel's slideshow: a new view every few seconds while it's on screen, except while you're
// pointing at it or would rather things didn't move. The arrows, or a tap on the picture,
// change it by hand, and the little plane moves along with them. Only the views either side
// of a change are drawn, so each picture loads when its turn comes rather than all at once.

import { $, $$, reducedMotion } from '../../../scripts/util'

export function mountSlides(el: HTMLElement) {
  const views = $$('.slides__view', el)
  const hop = $<SVGSVGElement>('.hop', el)
  if (views.length < 2) return
  let at = 0
  let seen = false
  let held = false
  const show = (i: number) => {
    const was = at
    at = (i + views.length) % views.length
    if (at === was) return
    const next = (at + 1) % views.length
    views.forEach((v, j) => {
      // the view that's leaving stays underneath while the new one fades in over it
      v.classList.toggle('is-prev', j === was)
      v.classList.toggle('is-on', j === at)
      v.classList.toggle('is-next', j === next && j !== was)
      if (j === at) v.removeAttribute('aria-hidden')
      else v.setAttribute('aria-hidden', 'true')
    })
    hop?.style.setProperty('--p', ((at + 1) / (views.length + 1)).toFixed(3))
  }
  new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.5 }).observe(el)
  el.addEventListener('pointerenter', () => (held = true))
  el.addEventListener('pointerleave', () => (held = false))
  el.addEventListener('focusin', () => (held = true))
  el.addEventListener('focusout', () => (held = false))
  $('[data-slides-frame]', el)?.addEventListener('click', () => show(at + 1))
  $$('[data-step]', el).forEach((b) => b.addEventListener('click', () => show(at + Number(b.dataset.step))))
  if (!reducedMotion()) setInterval(() => seen && !held && !document.hidden && show(at + 1), 4000)
}
