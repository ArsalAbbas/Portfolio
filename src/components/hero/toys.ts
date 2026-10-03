// The four shapes on the title screen. They orbit the avatar until you grab one; throw it and
// it flies, bounces off the edges, knocks the letters of my name about, and says ow if it hits
// the avatar's head. Then it drifts back into orbit.

import { $, $$, clamp, reducedMotion } from '../../scripts/util'
import type { AvatarCtl } from '../avatar/avatar'

interface Body {
  el: HTMLElement
  i: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  mode: 'orbit' | 'drag' | 'fly'
  /** set when you threw it (or something you threw hit it), so only your throws count */
  thrown: boolean
  flown: number
  spin: number
  turn: number
  grab: { dx: number; dy: number }
  trail: { x: number; y: number; t: number }[]
  moved: number
}

export function initToys(hero: HTMLElement, stage: HTMLElement, avatar: AvatarCtl) {
  const svg = avatar.svg
  const pointer = { x: innerWidth * 0.7, y: innerHeight * 0.4, active: false }
  addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    },
    { passive: true },
  )
  document.addEventListener('pointerleave', () => (pointer.active = false))

  const orb = $('[data-orb]', stage)
  const ripple = $('[data-ripple]', stage)
  const letters = $$('.hero__name .ch', hero)
  const still = reducedMotion()
  const bodies = still ? [] : $$('[data-toy]', stage).map(makeBody)

  // geometry, refreshed on resize
  let box = stage.getBoundingClientRect()
  let bounds = { l: 0, t: 0, r: 0, b: 0 }
  let head = { x: 0, y: 0, r: 0 }
  let orbSize = 0
  let letterBoxes: DOMRect[] = []
  function measure() {
    box = stage.getBoundingClientRect()
    const h = hero.getBoundingClientRect()
    bounds = { l: h.left - box.left, t: h.top - box.top, r: h.right - box.left, b: h.bottom - box.top }
    const a = svg.getBoundingClientRect()
    const s = a.width / 300
    head = { x: a.left - box.left + 150 * s, y: a.top - box.top + 121 * s, r: 60 * s }
    orbSize = orb?.clientWidth ?? 0
    letterBoxes = letters.map((l) => l.getBoundingClientRect())
  }
  measure()
  addEventListener('resize', measure)
  // scrolling moves the letters; measure them again the next time a throw needs them
  let lettersMoved = false
  addEventListener('scroll', () => (lettersMoved = true), { passive: true })

  function orbitTarget(b: Body, t: number) {
    // each shape starts its orbit in the corner where it rests before the script runs
    const a = t * 0.16 + (b.i * Math.PI) / 2 - (3 * Math.PI) / 4
    const w = box.width
    return {
      x: w / 2 + Math.cos(a) * w * 0.4 - b.r,
      y: w / 2 + Math.sin(a) * w * 0.47 - b.r - w * 0.02,
    }
  }

  function makeBody(el: HTMLElement, i: number): Body {
    const r = el.offsetWidth / 2
    const b: Body = { el, i, x: el.offsetLeft, y: el.offsetTop, vx: 0, vy: 0, r, mode: 'orbit', thrown: false, flown: 0, spin: 0, turn: 0, grab: { dx: 0, dy: 0 }, trail: [], moved: 0 }
    el.classList.add('is-live')

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      el.setPointerCapture(e.pointerId)
      b.mode = 'drag'
      b.moved = 0
      b.grab = { dx: e.clientX - box.left - b.x, dy: e.clientY - box.top - b.y }
      b.trail = [{ x: e.clientX, y: e.clientY, t: performance.now() }]
    })
    el.addEventListener('pointermove', (e) => {
      if (b.mode !== 'drag') return
      const last = b.trail[b.trail.length - 1]
      b.moved += Math.hypot(e.clientX - last.x, e.clientY - last.y)
      b.trail.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (b.trail.length > 6) b.trail.shift()
      b.x = e.clientX - box.left - b.grab.dx
      b.y = e.clientY - box.top - b.grab.dy
    })
    const release = () => {
      if (b.mode !== 'drag') return
      const first = b.trail[0]
      const last = b.trail[b.trail.length - 1]
      const dt = Math.max(16, last.t - first.t) / 1000
      b.vx = clamp((last.x - first.x) / dt, -2600, 2600)
      b.vy = clamp((last.y - first.y) / dt, -2600, 2600)
      b.mode = 'fly'
      b.thrown = true
      b.flown = 0
    }
    el.addEventListener('pointerup', release)
    el.addEventListener('pointercancel', release)
    // a drag isn't a click
    el.addEventListener('click', (e) => {
      if (b.moved > 8) e.preventDefault()
    })
    return b
  }

  // it all rests once the stage is out of sight, counting the strip under the bar as out of
  // sight, but anything you've thrown gets to land first
  let running = true
  const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hud')) || 0
  new IntersectionObserver(([e]) => (running = e.isIntersecting), { rootMargin: `-${bar}px 0px 0px 0px` }).observe(stage)

  let last = performance.now()
  let clockT = 0
  const hitLetter = new Map<HTMLElement, number>()
  function frame(now: number) {
    requestAnimationFrame(frame)
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now
    if (document.hidden || (!running && bodies.every((b) => b.mode === 'orbit'))) return
    clockT += dt

    for (const b of bodies) step(b, dt)
    collide()

    // eyes: on whatever you're throwing, else on you
    const busy = bodies.find((b) => b.mode === 'drag') ?? bodies.find((b) => b.mode === 'fly' && Math.hypot(b.vx, b.vy) > 200)
    if (busy) avatar.lookAt(box.left + busy.x + busy.r, box.top + busy.y + busy.r)
    else if (pointer.active) avatar.lookAt(pointer.x, pointer.y)
    else avatar.lookAhead()

    // the second set of rings drifts after the pointer (or on its own, unless motion is
    // reduced), and the two interfere. It strays up to 30% of the orb off-centre, which its
    // oversized layer covers
    if (ripple) {
      const px = pointer.active ? (pointer.x - box.left) / box.width : still ? 0.5 : 0.5 + Math.sin(clockT * 0.5) * 0.18
      const py = pointer.active ? (pointer.y - box.top) / box.height : still ? 0.5 : 0.5 + Math.cos(clockT * 0.37) * 0.18
      const x = (clamp(px, -0.1, 1.1) - 0.5) * 0.5 * orbSize
      const y = (clamp(py, -0.1, 1.1) - 0.5) * 0.5 * orbSize
      ripple.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
    }

    for (const [el, until] of hitLetter) if (now > until) {
      el.classList.remove('is-hit')
      hitLetter.delete(el)
    }
  }
  requestAnimationFrame(frame)

  function step(b: Body, dt: number) {
    if (b.mode === 'orbit') {
      const t = orbitTarget(b, clockT)
      const k = 26
      const c = 8.5
      b.vx += (k * (t.x - b.x) - c * b.vx) * dt
      b.vy += (k * (t.y - b.y) - c * b.vy) * dt
      b.spin += (Math.sin(clockT + b.i) * 8 - b.spin) * dt
    } else if (b.mode === 'fly') {
      b.flown += dt
      const drag = Math.exp(-0.9 * dt)
      b.vx *= drag
      b.vy *= drag
      b.vy += 380 * dt
      const speed = Math.hypot(b.vx, b.vy)
      b.spin = clamp(b.vx * 0.4, -500, 500)
      // bounce off the edges of the title screen
      if (b.x < bounds.l) ((b.x = bounds.l), (b.vx = Math.abs(b.vx) * 0.78))
      if (b.x + b.r * 2 > bounds.r) ((b.x = bounds.r - b.r * 2), (b.vx = -Math.abs(b.vx) * 0.78))
      if (b.y < bounds.t) ((b.y = bounds.t), (b.vy = Math.abs(b.vy) * 0.78))
      if (b.y + b.r * 2 > bounds.b) ((b.y = bounds.b - b.r * 2), (b.vy = -Math.abs(b.vy) * 0.6))
      // a direct hit on the head
      const cx = b.x + b.r - head.x
      const cy = b.y + b.r - head.y
      const d = Math.hypot(cx, cy)
      if (b.thrown && d < head.r + b.r * 0.8 && speed > 380) {
        const nx = cx / d
        const ny = cy / d
        const dot = b.vx * nx + b.vy * ny
        if (dot < 0) {
          b.vx -= 1.7 * dot * nx
          b.vy -= 1.7 * dot * ny
          avatar.hit()
        }
      }
      // knock the letters of my name about
      if (b.thrown && speed > 260) {
        if (lettersMoved) ((letterBoxes = letters.map((l) => l.getBoundingClientRect())), (lettersMoved = false))
        const px = box.left + b.x + b.r
        const py = box.top + b.y + b.r
        letterBoxes.forEach((r, i) => {
          if (px > r.left - b.r * 0.6 && px < r.right + b.r * 0.6 && py > r.top - b.r * 0.6 && py < r.bottom + b.r * 0.6) {
            letters[i].classList.add('is-hit')
            hitLetter.set(letters[i], performance.now() + 650)
          }
        })
      }
      if ((b.flown > 1.6 && speed < 260) || b.flown > 4) {
        b.mode = 'orbit'
        b.thrown = false
      }
    }
    if (b.mode !== 'drag') {
      b.x += b.vx * dt
      b.y += b.vy * dt
    }
    b.turn += b.spin * dt
    b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.turn.toFixed(1)}deg)`
  }

  function collide() {
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]
        const b = bodies[j]
        const dx = b.x + b.r - (a.x + a.r)
        const dy = b.y + b.r - (a.y + a.r)
        const d = Math.hypot(dx, dy)
        const min = (a.r + b.r) * 0.82
        if (d === 0 || d >= min) continue
        const nx = dx / d
        const ny = dy / d
        const push = (min - d) / 2
        if (a.mode !== 'drag') ((a.x -= nx * push), (a.y -= ny * push))
        if (b.mode !== 'drag') ((b.x += nx * push), (b.y += ny * push))
        const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
        if (rel < 0) {
          const j = -rel * 0.9
          if (a.mode !== 'drag') ((a.vx -= j * nx), (a.vy -= j * ny))
          if (b.mode !== 'drag') ((b.vx += j * nx), (b.vy += j * ny))
          // a hard knock from something you threw sends the other one flying too
          if (Math.abs(rel) > 400 && (a.thrown || b.thrown)) {
            for (const x of [a, b]) {
              if (x.mode === 'orbit') x.mode = 'fly'
              x.thrown = true
              x.flown = 0
            }
          }
        }
      }
  }
}
