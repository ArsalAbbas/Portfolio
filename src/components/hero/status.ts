// The clock on the title screen, and a guess at what I'm up to, going by the time in India.

import { $ } from '../../scripts/util'

function status(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', weekday: 'short', timeZone: 'Asia/Kolkata' }).formatToParts(now)
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 12)
  const weekend = /Sat|Sun/.test(parts.find((p) => p.type === 'weekday')?.value ?? '')
  if (h < 6) return { text: 'Probably asleep', away: true }
  if (h < 9) return { text: 'Making coffee', away: false }
  if (h === 13) return { text: 'At lunch', away: true }
  if (h < 19) return { text: weekend ? 'Out exploring' : 'Shipping', away: weekend }
  if (h < 21) return { text: 'Off the clock', away: true }
  return { text: 'Winding down', away: false }
}

export function startClock() {
  const el = $('[data-clock]')
  const label = $('[data-status]')
  if (!el) return
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
  const tick = () => {
    const now = new Date()
    el.textContent = fmt.format(now)
    if (!label) return
    const { text, away } = status(now)
    label.textContent = text
    label.parentElement?.toggleAttribute('data-away', away)
  }
  tick()
  setInterval(tick, 15000)
}
