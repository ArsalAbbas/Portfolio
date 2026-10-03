// The UX Designer's notes on you, written up from what src/scripts/behaviour.ts has seen this
// visit, and kept up to date while you watch.

import { snapshot } from '../../../scripts/behaviour'
import { save } from '../../../scripts/store'
import { $, coarsePointer } from '../../../scripts/util'

const SECTION_NAMES: Record<string, string> = {
  top: 'the title screen',
  quests: 'Quests',
  skills: 'the skill tree',
  blog: 'the blog',
  character: 'Character',
  continue: 'the very end',
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function duration(s: number) {
  if (s < 60) return plural(Math.floor(s), 'second')
  const m = Math.floor(s / 60)
  return `${plural(m, 'minute')} ${Math.floor(s % 60)} s`
}

function partOfDay() {
  const h = new Date().getHours()
  if (h < 5) return 'in the middle of the night'
  if (h < 12) return 'in the morning'
  if (h < 17) return 'in the afternoon'
  if (h < 21) return 'in the evening'
  return 'late at night'
}

function notes() {
  const v = snapshot()
  const secs = v.ms / 1000
  const metres = v.scrolled / 3780
  const favourite = Object.entries(v.dwell)
    .filter(([k]) => k !== 'top')
    .sort((a, b) => b[1] - a[1])[0]
  const lingered = Object.entries(v.linger).sort((a, b) => b[1] - a[1])[0]

  const lines = [
    v.number > 1 ? `Visit number ${v.number}. They came back.` : 'First visit.',
    `On the site for ${duration(secs)}${v.pages > 1 ? `, across ${v.pages} pages` : ''}.`,
    `Scrolled ${metres < 1 ? `${Math.round(metres * 100)} cm` : `${metres.toFixed(1)} m`}, and ${Math.round(Math.min(1, v.deepest) * 100)}% of the way down this page.`,
    v.clicks
      ? `${plural(v.clicks, 'click')}, the first after ${(v.firstClick / 1000).toFixed(1)} s.` +
        (v.rage ? ` ${plural(v.rage, 'rage click')}${v.rageOnFace ? ', mostly on my face' : ''}.` : '')
      : 'Hasn’t clicked anything yet. Cautious.',
  ]
  if (lingered && lingered[1] > 600) lines.push(`Lingered longest on “${lingered[0]}” (${(lingered[1] / 1000).toFixed(1)} s).`)
  if (favourite && favourite[1] > 3000) lines.push(`Spent the most time in ${SECTION_NAMES[favourite[0]] ?? favourite[0]}.`)
  lines.push(
    `${coarsePointer() ? 'On a touchscreen' : 'Using a mouse or trackpad'}, ${partOfDay()}, with the lights ${document.documentElement.dataset.theme === 'dark' ? 'off' : 'on'}.`,
  )
  if (v.keys > 15) lines.push(`${v.keys} key presses. Prefers the keyboard.`)

  const verdict =
    v.rage >= 2
      ? 'Impatient, but determined. I respect it.'
      : v.keys > 40
        ? 'Keyboard warrior. Mice are for other people.'
        : v.deepest > 0.75 && secs < 90
          ? 'Speedrunner. Skims first, reads later.'
          : secs > 240
            ? 'Thorough. Reads everything, including this.'
            : v.hovers > 30
              ? 'Explorer. Pokes at everything to see what happens.'
              : 'Curious. A good sign.'
  return { lines, verdict }
}

export function mountFieldNotes(el: HTMLElement) {
  const list = $('[data-notes]', el)
  const id = $('[data-subject]', el)
  if (!list) return
  if (id) id.textContent = `#${save.subject}`
  let visible = false
  const render = () => {
    if (!visible) return
    const { lines, verdict } = notes()
    const items = lines.map((text) => Object.assign(document.createElement('li'), { textContent: text }))
    items.push(Object.assign(document.createElement('li'), { className: 'verdict', textContent: `Verdict: ${verdict}` }))
    list.replaceChildren(...items)
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    render()
  }).observe(el)
  setInterval(render, 1000)
}
