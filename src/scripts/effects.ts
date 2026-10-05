// Confetti, and the effects behind the easter eggs. Everything is drawn on one fixed layer
// above the page and removes itself when it's done.

import { pick, reducedMotion } from './util'

const HUES = ['--red', '--green', '--pink', '--blue', '--yellow']

function layer() {
  let el = document.querySelector<HTMLElement>('.fx-layer')
  if (!el) {
    el = document.createElement('div')
    el.className = 'fx-layer'
    el.setAttribute('aria-hidden', 'true')
    document.body.append(el)
  }
  return el
}

function spawn(className: string, x: number, y: number, vars: Record<string, string> = {}) {
  const el = document.createElement('i')
  el.className = className
  el.style.left = `${x}px`
  el.style.top = `${y}px`
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v)
  el.addEventListener('animationend', () => el.remove(), { once: true })
  layer().append(el)
  return el
}

const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.bottom > 0 && r.top < innerHeight
}

/** A handful of tiny shapes flying out from a point. */
export function burst(x: number, y: number, count = 18) {
  if (reducedMotion()) return
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const d = 50 + Math.random() * 110
    spawn(`bit bit--${pick(['circle', 'triangle', 'square'])}`, x - 6, y - 6, {
      '--dx': `${Math.cos(a) * d}px`,
      '--dy': `${Math.sin(a) * d - 30}px`,
      '--rot': `${(Math.random() - 0.5) * 720}deg`,
      '--c': `var(${pick(HUES)})`,
    })
  }
}

export function burstFrom(el: Element, count?: number) {
  const r = el.getBoundingClientRect()
  burst(r.left + r.width / 2, r.top + r.height / 2, count)
}

/** Winter is coming: a few seconds of snow. */
export function snow(ms = 6500) {
  if (reducedMotion()) return
  const until = performance.now() + ms
  const timer = setInterval(() => {
    if (performance.now() > until) return clearInterval(timer)
    spawn('flake', Math.random() * innerWidth, -16, {
      '--size': `${5 + Math.random() * 8}px`,
      '--fall': `${3.2 + Math.random() * 3}s`,
      '--drift': `${(Math.random() - 0.5) * 180}px`,
    })
  }, 60)
}

/** I'm ready: bubbles float up from the bottom of the screen. */
export function bubbles(count = 28) {
  if (reducedMotion()) return
  for (let i = 0; i < count; i++)
    setTimeout(() => {
      spawn('fizz', Math.random() * innerWidth, innerHeight + 10, {
        '--size': `${14 + Math.random() * 30}px`,
        '--rise': `${3 + Math.random() * 2.5}s`,
        '--sway': `${(Math.random() - 0.5) * 120}px`,
      })
    }, i * 110)
}

/** I'm Batman: a signal in the night sky, with my glasses where the bat would be. */
export function signal(ms = 4200) {
  const el = document.createElement('div')
  el.className = 'signal'
  el.innerHTML =
    '<span class="signal__beam"></span><span class="signal__disc"><svg viewBox="0 0 44 18"><rect x="2" y="3" width="16" height="12" rx="4"/><rect x="26" y="3" width="16" height="12" rx="4"/><path d="M18 8q4-3 8 0"/></svg></span>'
  layer().append(el)
  setTimeout(() => {
    el.classList.add('is-leaving')
    setTimeout(() => el.remove(), 600)
  }, ms)
}

/** The snap: half of what's on screen turns to dust, then thinks better of it. */
export function dust() {
  const targets = [...document.querySelectorAll<Element>('.quest, .node, .post-row, .toy, .chip, .picker button, .room__item')].filter(onScreen)
  const doomed = targets.filter(() => Math.random() < 0.5)
  doomed.forEach((el, i) => setTimeout(() => el.classList.add('is-dusted'), i * 60))
  setTimeout(() => {
    doomed.forEach((el) => {
      el.classList.remove('is-dusted')
      el.classList.add('is-undusting')
      el.addEventListener('animationend', () => el.classList.remove('is-undusting'), { once: true })
    })
  }, 3200 + doomed.length * 60)
}

/** ↑ ↑ ↓ ↓ ← → ← → B A: a golden glow on every avatar on the page. */
export function powerUp() {
  document.querySelectorAll<SVGElement>('[data-avatar]').forEach((a) => (a.dataset.powered = ''))
  const avatar = [...document.querySelectorAll('[data-avatar]')].find(onScreen)
  if (avatar) burstFrom(avatar, 36)
  else burst(innerWidth / 2, innerHeight / 2, 36)
}
