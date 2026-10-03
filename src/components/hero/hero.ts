// The title screen comes alive: the clock and status, the level bar filling up, a hello from
// the avatar, and the shapes you can throw.

import { level } from '../../data/site'
import { $, reducedMotion } from '../../scripts/util'
import { AvatarCtl } from '../avatar/avatar'
import { startClock } from './status'
import { initToys } from './toys'

export function initHero() {
  const hero = $('[data-hero]')
  const stage = hero && $('[data-stage]', hero)
  const svg = stage && $<SVGSVGElement>('[data-avatar]', stage)
  if (!hero || !stage || !svg) return

  const bubble = $('[data-bubble]', stage)
  const avatar = new AvatarCtl(svg, bubble, JSON.parse(bubble?.dataset.lines ?? '[]'))
  startClock()
  fillLevelBar()
  initToys(hero, stage, avatar)

  if (reducedMotion()) return
  setTimeout(() => avatar.say('Hi! I’m Arsal.', 2600), 600)
  setTimeout(() => avatar.say('Psst. You can grab those shapes and throw them.', 4200), 4200)
}

/** The bar starts empty and fills up to how far through the year I am. */
function fillLevelBar() {
  const { lvl, progress, next } = level()
  const n = $('[data-lvl]')
  const bar = $('[data-xp]')
  const label = $('[data-next]')
  if (n) n.textContent = String(lvl)
  if (label) label.textContent = `Next level ${next.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
  if (bar) {
    bar.style.setProperty('--p', '0')
    requestAnimationFrame(() => requestAnimationFrame(() => bar.style.setProperty('--p', progress.toFixed(3))))
  }
}
