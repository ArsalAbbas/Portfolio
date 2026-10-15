// Table tennis in Sports, against me, first to 5. Seen from the side: you move your paddle up
// and down, and where the ball meets it decides the shot. The top edge hits hard and deep, the
// bottom edge soft and short, and the very edges miss the table or find the net. A high ball
// gets smashed. I play by the same rules, but misjudge the fast ones now and then.

import { $, clamp, pick } from '../../../scripts/util'
import type { WidgetCtx } from './index'

type Side = 'you' | 'arsal'
const other = (s: Side): Side => (s === 'you' ? 'arsal' : 'you')

// the court, in the drawing's units: ./PingPong.astro draws the same things in the same places
const TABLE = { l: 40, r: 260, y: 100 }
const NET = { x: 150, top: 86 }
const FLOOR = 134
/** the ball's radius, and its height when it sits on the table */
const R = 4.5
const REST = TABLE.y - R
/** gravity, and how much of its speed the ball keeps off the table */
const G = 240
const BOUNCE = 0.82
/** the paddles' x, and the lines they meet the ball on */
const PADDLE = { you: 22, arsal: 278 }
const FACE = { you: 29, arsal: 271 }
/** how far from a paddle's centre it still meets the ball, and the outer part of that where it slips */
const REACH = 13 + R
const EDGE = 0.86
const TOP = 18
const BOTTOM = 112
/** a ball above this gets smashed */
const SMASH = 54
const WIN = 5

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
}

/** Moves the ball on, and says what it hit: the table, the net or the floor. */
function advance(b: Ball, dt: number) {
  const px = b.x
  b.vy += G * dt
  b.x += b.vx * dt
  b.y += b.vy * dt
  if ((px - NET.x) * (b.x - NET.x) < 0 && b.y > NET.top - R && b.y < TABLE.y) {
    b.x = NET.x - Math.sign(b.vx) * (R + 2)
    b.vx *= -0.2
    return 'net'
  }
  if (b.vy > 0 && b.y >= REST && b.y < TABLE.y + 6 && b.x >= TABLE.l && b.x <= TABLE.r) {
    b.y = REST
    b.vy *= -BOUNCE
    return 'table'
  }
  if (b.vy > 0 && b.y >= FLOOR - R) {
    b.y = FLOOR - R
    b.vy *= -0.4
    b.vx *= 0.6
    return 'floor'
  }
  return null
}

/** The velocity that lands the ball at x1 going `speed`, or slower and higher if that's what clears the net. */
function aim(x: number, y: number, x1: number, speed: number) {
  const dir = Math.sign(x1 - x)
  for (let vx = speed; ; vx -= 10) {
    const t = Math.abs(x1 - x) / vx
    const vy = (REST - y - (G * t * t) / 2) / t
    // aimed short of the net, it never gets there
    if ((x1 - NET.x) * dir < 0 || vx <= 80) return { vx: vx * dir, vy }
    const tn = Math.abs(NET.x - x) / vx
    if (y + vy * tn + (G * tn * tn) / 2 < NET.top - R - 2) return { vx: vx * dir, vy }
  }
}

/**
 * A serve: one bounce on the server's side, then over the net to land on the other. Given both
 * bounces, there's one speed that does it, which falls out of the two arcs:
 * vx² = G·d1·(d2/BOUNCE − d1) / (2·drop), d1 and d2 being the two distances, drop the fall to the table.
 */
function serveFrom(x: number, y: number, dir: number) {
  const drop = Math.max(REST - y, 12)
  const half = NET.x - TABLE.l
  let v = { vx: 0, vy: 0 }
  // the first bounce as far into the server's half as still clears the net: from low down, that's
  // close to the server's end
  for (const a of [0.45, 0.3, 0.15, 0.05]) {
    const xa = (dir > 0 ? TABLE.l : TABLE.r) + dir * half * (a + Math.random() * 0.1)
    const xb = NET.x + dir * half * (0.5 + Math.random() * 0.35)
    const d1 = Math.abs(xa - x)
    const d2 = Math.abs(xb - xa)
    const vx = Math.sqrt((G * d1 * (d2 / BOUNCE - d1)) / (2 * drop))
    const land = (G * d2) / vx / (2 * BOUNCE)
    v = { vx: vx * dir, vy: land - (G * d1) / vx }
    const tn = Math.abs(NET.x - xa) / vx
    if (REST - BOUNCE * land * tn + (G * tn * tn) / 2 < NET.top - R - 1) break
  }
  return v
}

/** Where a shot lands, as a distance past the net (negative: short of it), and how fast it goes. */
function shot(off: number, y: number, arsal: boolean) {
  if (off < -EDGE) return { depth: 116 + Math.random() * 10, speed: 230, smash: false }
  if (off > EDGE) return { depth: -1, speed: 150, smash: false }
  // 0 off the top of the paddle, 1 off the bottom
  const t = (off + EDGE) / (2 * EDGE)
  if (y < SMASH && (arsal ? Math.random() < 0.6 : t < 0.7)) return { depth: arsal ? 60 + Math.random() * 30 : 85 - t * 25, speed: 300, smash: true }
  if (arsal) {
    // mine go anywhere, a little faster the deeper they go, so they never loop out of sight
    const depth = 35 + Math.random() * 65
    return { depth, speed: 140 + depth / 2 + Math.random() * 30, smash: false }
  }
  return { depth: 100 - t * 70, speed: 230 - t * 110, smash: false }
}

let audio: AudioContext | null = null

/** The speakers, set up on the first tap, since browsers only allow sound after one. */
function speakers() {
  if (!audio && 'AudioContext' in window) audio = new AudioContext()
  if (audio?.state === 'suspended') void audio.resume()
}

/** The tock of a ball on a paddle or the table: a short, quiet blip. */
function tock(hz: number) {
  if (!audio) return
  const t = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.frequency.value = hz
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.1, t + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  osc.connect(gain).connect(audio.destination)
  osc.start(t)
  osc.stop(t + 0.08)
}

export function mountPingPong(el: HTMLElement, { say }: WidgetCtx) {
  const court = $('[data-court]', el)
  const svg = court && $<SVGSVGElement>('svg', court)
  const ballEl = $<SVGCircleElement>('[data-ball]', el)
  const paddles = { you: $<SVGGElement>('[data-paddle="you"]', el), arsal: $<SVGGElement>('[data-paddle="arsal"]', el) }
  const scores = { you: $('[data-score="you"]', el), arsal: $('[data-score="arsal"]', el) }
  const button = $<HTMLButtonElement>('[data-serve]', el)
  const call = $('[data-call]', el)
  if (!court || !svg || !ballEl || !paddles.you || !paddles.arsal || !button || !call) return

  const score = { you: 0, arsal: 0 }
  const pad = { you: 60, arsal: 60 }
  const ball: Ball = { x: FACE.you + 1, y: 60, vx: 0, vy: 0 }
  let state: 'idle' | 'serve' | 'rally' | 'dead' | 'over' = 'idle'
  let server: Side = 'you'
  /** counts down to my serve, and to the next serve after a point */
  let timer = 0
  // the rally: who hit last, and where the ball has bounced since
  let hitter: Side = 'you'
  let serving = false
  let ownBounce = false
  let landed = false
  /** your shot clipped the end of the table */
  let edgeBall = false
  /** where your paddle and mine are heading */
  let aimYou = 60
  let aimArsal = 60
  let keys = 0

  function draw() {
    paddles.you!.setAttribute('transform', `translate(${PADDLE.you} ${pad.you.toFixed(1)})`)
    paddles.arsal!.setAttribute('transform', `translate(${PADDLE.arsal} ${pad.arsal.toFixed(1)})`)
    ballEl!.setAttribute('cx', ball.x.toFixed(1))
    ballEl!.setAttribute('cy', ball.y.toFixed(1))
  }

  function maybeSay(text: string, chance: number) {
    if (Math.random() < chance) say(text)
  }

  const whoServes = (): Side => (Math.floor((score.you + score.arsal) / 2) % 2 === 0 ? 'you' : 'arsal')

  function toServe() {
    state = 'serve'
    server = whoServes()
    timer = 0.9
    if (server === 'arsal') aimArsal = 40 + Math.random() * 30
    button!.disabled = server !== 'you'
    call!.textContent = server === 'you' ? 'Your serve: tap the table, or press Space.' : 'Arsal’s serve.'
  }

  function start() {
    score.you = score.arsal = 0
    scores.you!.textContent = scores.arsal!.textContent = '0'
    button!.textContent = 'Serve'
    court!.classList.add('is-live')
    toServe()
    say('Your serve.')
  }

  /** I read the shot you just hit: where it'll cross my line, give or take a misjudgement. */
  function read() {
    const b = { ...ball }
    let y: number | null = null
    for (let i = 0; i < 900 && y === null; i++) {
      const px = b.x
      if (advance(b, 1 / 240) === 'floor') break
      if ((px - FACE.arsal) * (b.x - FACE.arsal) <= 0) y = b.y
    }
    if (y === null) return void (aimArsal = 62)
    // fast shots are harder, and so is a big lead: it keeps the game close
    const pressure = clamp((Math.abs(ball.vx) - 140) / 160, 0, 1)
    const slip = clamp(0.08 + 0.42 * pressure + 0.06 * (score.arsal - score.you), 0.03, 0.6)
    const off = Math.random() < slip ? EDGE + Math.random() * 0.5 : Math.random() * 0.55
    aimArsal = clamp(y - (Math.random() < 0.5 ? -1 : 1) * off * REACH, TOP, BOTTOM)
  }

  function hit(side: Side, off: number) {
    const dir = side === 'you' ? 1 : -1
    const s = shot(off, ball.y, side === 'arsal')
    const v = aim(ball.x, ball.y, NET.x + dir * s.depth, s.speed)
    ball.vx = v.vx
    ball.vy = v.vy
    hitter = side
    serving = ownBounce = landed = edgeBall = false
    tock(1150)
    if (side === 'you') read()
    else {
      aimArsal = 62
      if (s.smash) say('Smash!')
    }
  }

  function serve() {
    const dir = server === 'you' ? 1 : -1
    ball.x = FACE[server] + dir
    ball.y = pad[server]
    const v = serveFrom(ball.x, ball.y, dir)
    ball.vx = v.vx
    ball.vy = v.vy
    hitter = server
    serving = true
    ownBounce = landed = edgeBall = false
    state = 'rally'
    button!.disabled = true
    call!.textContent = ''
    tock(1150)
    if (server === 'you') read()
    else aimArsal = 62
  }

  function point(winner: Side) {
    if (state !== 'rally') return
    state = 'dead'
    timer = 1.1
    score[winner]++
    scores[winner]!.textContent = String(score[winner])
    call!.textContent = `Point to ${winner === 'you' ? 'you' : 'Arsal'}. ${score.you}–${score.arsal}`
    if (score[winner] === WIN) return
    if (winner === 'arsal') maybeSay(pick(['Mine.', 'Too quick?', 'Close one.']), 0.35)
    else if (edgeBall) maybeSay('That was in.', 0.7)
    else maybeSay(pick(['Nice one.', 'Good shot.', 'Oof.']), 0.3)
  }

  function over() {
    state = 'over'
    const won = score.you > score.arsal
    call!.textContent = won ? `You win, ${score.you}–${score.arsal}.` : `Arsal wins, ${score.arsal}–${score.you}.`
    button!.textContent = 'Play again'
    button!.disabled = false
    court!.classList.remove('is-live')
    // the ball back on your paddle, ready for the next game
    ball.x = FACE.you + 1
    ball.y = pad.you
    draw()
    say(won ? 'Best of three?' : pick(['Good game.', 'Good game. Again?']))
  }

  function bounce() {
    const side: Side = ball.x < NET.x ? 'you' : 'arsal'
    tock(820)
    // a serve bounces on the server's side first
    if (side === hitter && serving && !ownBounce) ownBounce = true
    // any other bounce on the hitter's side, or a serve that skipped it, is the hitter's fault
    else if (side === hitter || (serving && !ownBounce)) point(other(hitter))
    // a second bounce on the other side means they couldn't get it back
    else if (landed) point(hitter)
    else {
      landed = true
      edgeBall = hitter === 'you' && ball.x > TABLE.r - 12
    }
  }

  function step(dt: number) {
    // your paddle follows the pointer, or the arrow keys; mine has a top speed
    if (keys) aimYou = pad.you = clamp(pad.you + keys * 170 * dt, TOP, BOTTOM)
    else pad.you += (aimYou - pad.you) * Math.min(1, dt * 18)
    pad.arsal += clamp(aimArsal - pad.arsal, -130 * dt, 130 * dt)

    if (state === 'serve') {
      // you serve from anywhere above the table
      if (server === 'you') pad.you = clamp(pad.you, 28, 80)
      ball.x = FACE[server] + (server === 'you' ? 1 : -1)
      ball.y = pad[server]
      if (server === 'arsal' && (timer -= dt) <= 0) serve()
      return
    }
    if (state === 'dead' && (timer -= dt) <= 0) {
      if (Math.max(score.you, score.arsal) >= WIN) return over()
      return toServe()
    }

    for (let i = 0; i < 3; i++) {
      const h = dt / 3
      const px = ball.x
      const py = ball.y
      const touch = advance(ball, h)
      if (state !== 'rally') continue
      // the side it's heading for gets to hit it once it has bounced there
      const side = other(hitter)
      const face = FACE[side]
      if (landed && (px - face) * (ball.x - face) <= 0 && px !== ball.x) {
        const y = py + ((ball.y - py) * (face - px)) / (ball.x - px)
        const off = (y - pad[side]) / REACH
        if (Math.abs(off) <= 1) {
          ball.x = face
          ball.y = y
          hit(side, off)
          continue
        }
      }
      if (touch === 'table') bounce()
      else if (touch === 'floor' || ball.x < -12 || ball.x > 312) point(landed ? hitter : other(hitter))
    }
  }

  // runs only while a game is on and you can see it
  let visible = false
  let raf = 0
  let last = 0
  const live = () => state === 'serve' || state === 'rally' || state === 'dead'
  function frame(now: number) {
    raf = 0
    if (!visible || !live()) return
    step(Math.min(0.033, (now - last) / 1000))
    last = now
    draw()
    raf = requestAnimationFrame(frame)
  }
  function wake() {
    if (raf || !visible || !live()) return
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  new IntersectionObserver(([e]) => ((visible = e.isIntersecting), wake())).observe(court)

  /** a tap, a click or Space: starts a game, or serves when it's yours */
  function act() {
    speakers()
    if (state === 'idle') start()
    if (state === 'serve' && server === 'you') serve()
    wake()
  }

  /** Between games your paddle moves straight away, with the ball on it. */
  function carry(y: number) {
    aimYou = pad.you = ball.y = y
    draw()
  }
  function follow(e: PointerEvent) {
    const box = svg!.getBoundingClientRect()
    aimYou = clamp(((e.clientY - box.top) / box.height) * 140, TOP, BOTTOM)
    keys = 0
    if (!live()) carry(aimYou)
  }
  court.addEventListener('pointermove', follow)
  court.addEventListener('pointerdown', (e) => {
    follow(e)
    if (state !== 'over') act()
  })
  button.addEventListener('click', () => {
    if (state === 'over') state = 'idle'
    act()
  })
  el.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && e.target === court) {
      e.preventDefault()
      if (state === 'over') state = 'idle'
      act()
    }
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (live() || e.target === court)) {
      e.preventDefault()
      keys = e.key === 'ArrowUp' ? -1 : 1
      // a quick tap still moves it a little
      if (!live()) carry(clamp(pad.you + keys * 8, TOP, BOTTOM))
      else if (!e.repeat) aimYou = pad.you = clamp(pad.you + keys * 6, TOP, BOTTOM)
    }
  })
  el.addEventListener('keyup', (e) => {
    if ((e.key === 'ArrowUp' && keys < 0) || (e.key === 'ArrowDown' && keys > 0)) keys = 0
  })
  // a key let go of somewhere else
  addEventListener('blur', () => (keys = 0))

  draw()
}
