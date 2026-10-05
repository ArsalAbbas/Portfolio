// The hideout: poke anything in the room and the avatar has something to say about it. On a
// keyboard, a few things start by giving away a word to type, from src/data/secrets.ts. The lamp
// is a second light switch, the clock keeps India time, and the eyes follow you while the room is
// on screen.

import { secrets } from '../../data/secrets'
import { currentTheme, setTheme } from '../../scripts/theme'
import { $, coarsePointer, onceVisible, reducedMotion, whileVisible } from '../../scripts/util'
import { AvatarCtl } from '../avatar/avatar'

const FIGURE = ['Careful. That one’s a collectible.', 'Mint condition. Mostly.', 'Every desk needs a sidekick.']
const LINES: Record<string, string[]> = {
  window: ['Where to next?', 'Mountains, ideally.', 'Window seat, please.'],
  notes: ['Notes on you. All good ones.', 'Ideas. Some of them good.', 'Sticky notes: my real to-do app.'],
  figure: FIGURE,
  caped: FIGURE,
  robot: FIGURE,
  book: ['Saving that spot for something good.', 'That one’s still blank.'],
  disc: ['Track three is the good one.', 'On repeat, lately.'],
  plant: ['Still alive. Barely.', 'I water it. Sometimes.'],
  laptop: ['Shipping it.', 'One more commit.', 'It works on my machine.', 'Tests are green. For now.'],
  mug: ['Still warm.', 'Refill time?', 'Coffee first. Then code.'],
}

const time = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' })

export function initRoom() {
  const room = $('[data-room]')
  const scene = room && $<SVGSVGElement>('.room__scene', room)
  const svg = room && $<SVGSVGElement>('[data-avatar]', room)
  if (!room || !scene || !svg) return

  const avatar = new AvatarCtl(svg, $('[data-room-bubble]', room), ['Oh, hi.', 'Shh. Deploying.', 'Five more minutes.'])
  // a touchscreen has nothing to type with, so it just gets the chat
  const hints = coarsePointer() ? [] : secrets
  const said: Record<string, number> = {}
  const next = (kind: string) => {
    const words = hints.filter((s) => s.hint === kind).map((s) => `Psst: type “${s.word}” anywhere.`)
    const lines = [...words, ...(LINES[kind] ?? [])]
    said[kind] = (said[kind] ?? -1) + 1
    return lines[said[kind] % lines.length]
  }

  function hop(el: Element) {
    if (reducedMotion() || !el.classList.contains('room__item')) return
    el.classList.remove('is-hopping')
    void el.getBoundingClientRect()
    el.classList.add('is-hopping')
    el.addEventListener('animationend', () => el.classList.remove('is-hopping'), { once: true })
  }

  function poke(el: SVGElement) {
    const kind = el.dataset.poke ?? ''
    if (kind === 'lamp') {
      const r = el.getBoundingClientRect()
      const dark = currentTheme() !== 'dark'
      setTheme(dark ? 'dark' : 'light', { x: r.left + r.width * 0.3, y: r.top + r.height * 0.3 })
      return avatar.say(dark ? 'Lamp on. Much cosier.' : 'Daylight. Fine.')
    }
    if (kind === 'clock') return avatar.say(`It’s ${time.format(new Date())} here.`)
    hop(el)
    const title = el.dataset.title
    if (title) return avatar.say(kind === 'disc' ? `${title}. On repeat.` : `${title}. Ask me about it.`)
    const line = next(kind)
    if (line) avatar.say(line)
  }

  const pokeable = (target: EventTarget | null) => (target instanceof Element ? target.closest<SVGElement>('[data-poke]') : null)
  scene.addEventListener('click', (e) => {
    const el = pokeable(e.target)
    if (el) poke(el)
  })
  scene.addEventListener('keydown', (e) => {
    const el = pokeable(e.target)
    if (!el || (e.key !== 'Enter' && e.key !== ' ')) return
    e.preventDefault()
    poke(el)
  })

  // the hands, in India
  const hour = $('[data-hour]', scene)
  const minute = $('[data-minute]', scene)
  const tick = () => {
    const [h, m] = time.format(new Date()).split(':').map(Number)
    hour?.setAttribute('transform', `rotate(${(h % 12) * 30 + m / 2} 880 92)`)
    minute?.setAttribute('transform', `rotate(${m * 6} 880 92)`)
  }
  tick()
  setInterval(tick, 30_000)

  // the steam rises and the eyes follow you only while the room is on screen
  let inView = false
  whileVisible(room, (on) => {
    inView = on
    room.classList.toggle('is-playing', on)
  })
  addEventListener('pointermove', (e) => inView && avatar.lookAt(e.clientX, e.clientY), { passive: true })
  onceVisible(room, () => setTimeout(() => avatar.say('Welcome to the hideout.'), 600), 0.5)
}
