// The continue screen counts down from nine while it's on screen. Nothing happens at zero,
// apart from a joke.

import { $, reducedMotion } from '../../scripts/util'

export function initContinue() {
  const root = $('[data-continue]')
  const count = root && $('[data-count]', root)
  if (!root || !count) return
  const over = $('[data-over]', root)
  let n = 9
  let timer = 0

  const show = (value: number) => {
    count.textContent = String(value)
    count.classList.remove('is-tick')
    void count.offsetWidth
    count.classList.add('is-tick')
  }
  const stop = () => {
    clearInterval(timer)
    timer = 0
  }
  const tick = () => {
    show(--n)
    if (n > 0) return
    stop()
    if (over) over.textContent = 'Game over… just kidding. The buttons still work.'
  }

  new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !timer) {
        // a fresh countdown every time you come back to it
        if (n <= 0) {
          n = 9
          show(n)
          if (over) over.textContent = ''
        }
        timer = window.setInterval(tick, 1000)
      } else if (!e.isIntersecting && timer) stop()
    },
    { threshold: 0.35 },
  ).observe(root)

  $('[data-yes]', root)?.addEventListener('click', () => {
    stop()
    if (over) over.textContent = n > 0 ? 'Coin inserted. Talk soon.' : 'Better late than never. Talk soon.'
  })
  // on the home page the start is the top of this page; anywhere else, the link goes there
  $('[data-no]', root)?.addEventListener('click', (e) => {
    if (!$('[data-hero]')) return
    e.preventDefault()
    scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
  })
}
