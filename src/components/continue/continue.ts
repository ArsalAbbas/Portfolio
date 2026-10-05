// The continue screen: YES says thanks once it's picked, and NO goes back to the start.

import { $, reducedMotion } from '../../scripts/util'

export function initContinue() {
  const root = $('[data-continue]')
  if (!root) return
  const thanks = $('[data-thanks]', root)
  $('[data-yes]', root)?.addEventListener('click', () => {
    if (thanks) thanks.textContent = 'Coin inserted. Talk soon.'
  })
  // on the home page the start is the top of this page; anywhere else, the link goes there
  $('[data-no]', root)?.addEventListener('click', (e) => {
    if (!$('[data-hero]')) return
    e.preventDefault()
    scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
  })
}
