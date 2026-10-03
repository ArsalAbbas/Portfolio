// Character select: pick one and the avatar suits up. Each one has a small toy in its
// panel, started the first time the panel opens.

import type { Costume } from '../../data/character'
import { $, $$, onceVisible, reducedMotion } from '../../scripts/util'
import { AvatarCtl } from '../avatar/avatar'
import { mountWidget } from './widgets'

export function initCharacter() {
  const root = $('[data-character]')
  const frame = root && $('[data-frame]', root)
  const svg = frame && $<SVGSVGElement>('[data-avatar]', frame)
  if (!root || !frame || !svg) return

  const tabs = $$<HTMLButtonElement>('[role="tab"]', root)
  const panels = $$('[data-panel]', root)
  const name = $('[data-class-name]', root)
  const hobby = $('[data-class-hobby]', root)
  const avatar = new AvatarCtl(svg, $('[data-bubble]', root), JSON.parse(tabs[0]?.dataset.lines ?? '[]'))
  const say = (text: string) => avatar.say(text)
  const mounted = new Set<string>()
  let current = tabs[0]?.dataset.class ?? 'engineer'

  function mount(id: string) {
    const widget = panels.find((p) => p.dataset.panel === id)?.querySelector<HTMLElement>('[data-widget]')
    if (!widget || mounted.has(id)) return
    mounted.add(id)
    mountWidget(widget, { say })
  }

  function select(tab: HTMLButtonElement, focus = false) {
    const id = tab.dataset.class!
    tabs.forEach((t) => {
      t.setAttribute('aria-selected', String(t === tab))
      t.tabIndex = t === tab ? 0 : -1
    })
    panels.forEach((p) => (p.hidden = p.dataset.panel !== id))
    if (focus) tab.focus()
    mount(id)
    if (id === current) return
    current = id
    svg!.dataset.class = id
    frame!.style.setProperty('--hue', `var(--${tab.dataset.hue})`)
    // the Engineer wears the real shirt; everyone else dresses in their colour
    if (tab === tabs[0]) svg!.style.removeProperty('--suit')
    else svg!.style.setProperty('--suit', `var(--${tab.dataset.hue})`)
    if (name) name.textContent = tab.dataset.name ?? ''
    if (hobby) hobby.textContent = tab.dataset.hobby ?? ''
    const lines: string[] = JSON.parse(tab.dataset.lines ?? '[]')
    // the first line is said now, so pokes start from the second
    avatar.setLines(lines.length > 1 ? [...lines.slice(1), lines[0]] : lines)
    avatar.mood('happy', 700)
    avatar.wobble()
    if (lines[0]) say(lines[0])
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab)))
  $('[role="tablist"]', root)?.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    select(tabs[(to + tabs.length) % tabs.length], true)
  })

  // the costumes in Stories, one after another, then back to normal
  const dressUp = $<HTMLButtonElement>('[data-costume-next]', root)
  if (dressUp) {
    const costumes: Costume[] = JSON.parse(dressUp.dataset.costumes ?? '[]')
    let worn = -1
    dressUp.addEventListener('click', () => {
      worn = worn + 1 < costumes.length ? worn + 1 : -1
      const costume = costumes[worn]
      if (costume) svg.dataset.costume = costume.id
      else delete svg.dataset.costume
      dressUp.textContent = worn < 0 ? 'Try a costume' : worn === costumes.length - 1 ? 'Back to normal' : 'Next costume'
      avatar.mood('happy', 700)
      avatar.wobble()
      say(costume?.line ?? 'Just me again.')
    })
  }

  // the photo behind the drawing
  const real = $<HTMLButtonElement>('[data-true-form]', root)
  real?.addEventListener('click', () => {
    const on = frame.classList.toggle('is-true')
    real.setAttribute('aria-pressed', String(on))
    real.textContent = on ? 'Back to shapes' : 'Reveal true form'
    say(on ? 'Yep, that’s what I actually look like.' : 'Back to circles and squares.')
  })

  // the eyes follow you while the card is on screen
  let inView = false
  new IntersectionObserver(([e]) => (inView = e.isIntersecting)).observe(frame)
  addEventListener('pointermove', (e) => inView && avatar.lookAt(e.clientX, e.clientY), { passive: true })

  // accio coffee: straight to Coffee, kettle already on
  const summon = (id: string) => {
    const tab = tabs.find((t) => t.dataset.class === id)
    if (!tab) return
    select(tab)
    root.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
    const brew = $<HTMLButtonElement>(`#panel-${id} [data-brew-start]`, root)
    if (brew && !brew.disabled) setTimeout(() => brew.click(), 700)
  }
  document.addEventListener('summon', (e) => summon((e as CustomEvent<string>).detail))
  try {
    const waiting = sessionStorage.getItem('arsal:summon')
    if (waiting) {
      sessionStorage.removeItem('arsal:summon')
      setTimeout(() => summon(waiting), 400)
    }
  } catch {
    /* nothing was waiting */
  }

  onceVisible(
    root,
    () => {
      mount(current)
      setTimeout(() => say('Pick one. Any one.'), 500)
    },
    0.3,
  )
}
