// The UX researcher in me, taking notes on how you use the site, for the field notes on the
// Character page. It all stays in this browser: a running tally for this visit in
// sessionStorage, and a count of visits in localStorage.

import { bump, save } from './store'

const KEY = 'arsal:visit'

interface Visit {
  /** time spent on the site this visit, in ms, not counting the page you're on */
  ms: number
  pages: number
  scrolled: number
  clicks: number
  /** ms into the visit */
  firstClick: number
  rage: number
  rageOnFace: number
  hovers: number
  keys: number
  /** how long the pointer rested on each quest, skill or class, in ms */
  linger: Record<string, number>
  /** how long each section was in the middle of the screen, in ms */
  dwell: Record<string, number>
}

const fresh = (): Visit => ({ ms: 0, pages: 0, scrolled: 0, clicks: 0, firstClick: 0, rage: 0, rageOnFace: 0, hovers: 0, keys: 0, linger: {}, dwell: {} })

let visit = fresh()
const opened = performance.now()
/** how far down this page you've been, from 0 to 1 */
let deepest = 0
let section = ''
let sectionSince = 0
let resting: { key: string; since: number } | null = null

const add = (map: Record<string, number>, key: string, ms: number) => (map[key] = (map[key] ?? 0) + ms)

/** What the pointer is resting on, if it's something worth noting. */
function subject(target: EventTarget | null) {
  const el = target instanceof Element ? target.closest('.node, .quest, .toy, .picker button, .post-row') : null
  if (!el) return ''
  if (el.matches('.node')) return [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())?.textContent?.trim() ?? ''
  if (el.matches('.picker button')) return (el as HTMLElement).dataset.name ?? ''
  if (el.matches('.toy')) return `the ${el.querySelector('.toy__label')?.textContent ?? ''} shape`
  return el.querySelector('h3, h4')?.childNodes[0]?.textContent?.trim() ?? ''
}

/** Adds the time spent on the current section, and on whatever the pointer is resting on. */
function settle() {
  const now = performance.now()
  if (section) add(visit.dwell, section, now - sectionSince)
  sectionSince = now
  if (resting) {
    add(visit.linger, resting.key, now - resting.since)
    resting.since = now
  }
}

/** The visit so far, including this page. */
export function snapshot() {
  settle()
  return { ...visit, ms: visit.ms + performance.now() - opened, deepest, number: Math.max(1, save.counters.visits ?? 1) }
}

function persist() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...snapshot(), deepest: undefined, number: undefined }))
  } catch {
    /* the notes will cover this page only */
  }
}

/** Starts watching. Runs on every page, so the notes cover the whole visit. */
export function trackBehaviour() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) visit = { ...fresh(), ...JSON.parse(raw) }
    else bump('visits')
  } catch {
    /* no session storage: every page is a fresh start */
  }
  visit.pages++
  addEventListener('pagehide', persist)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && persist())

  let lastY = scrollY
  addEventListener(
    'scroll',
    () => {
      visit.scrolled += Math.abs(scrollY - lastY)
      lastY = scrollY
      deepest = Math.max(deepest, (scrollY + innerHeight) / document.documentElement.scrollHeight)
    },
    { passive: true },
  )

  let recent: { x: number; y: number; t: number }[] = []
  addEventListener(
    'pointerdown',
    (e) => {
      const now = performance.now()
      visit.clicks++
      if (!visit.firstClick) visit.firstClick = visit.ms + now - opened
      // three quick clicks in the same spot is a rage click
      recent = recent.filter((c) => now - c.t < 700 && Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40)
      recent.push({ x: e.clientX, y: e.clientY, t: now })
      if (recent.length === 3) {
        visit.rage++
        if ((e.target as Element | null)?.closest?.('[data-avatar]')) visit.rageOnFace++
      }
    },
    { passive: true },
  )

  addEventListener(
    'pointerover',
    (e) => {
      const key = subject(e.target)
      if (resting && resting.key !== key) {
        add(visit.linger, resting.key, performance.now() - resting.since)
        resting = null
      }
      if (key && !resting) {
        resting = { key, since: performance.now() }
        visit.hovers++
      }
    },
    { passive: true },
  )

  addEventListener('keydown', () => visit.keys++, { passive: true })

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        settle()
        section = (e.target as HTMLElement).dataset.section ?? 'top'
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('[data-section]').forEach((s) => io.observe(s))
}
