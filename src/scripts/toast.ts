import { shapeSvg, type Shape } from './util'

interface Toast {
  kicker: string
  title: string
  hue?: 'red' | 'green' | 'pink' | 'blue' | 'yellow'
  shape?: Shape
  action?: { label: string; run: () => void }
  ms?: number
}

export function toast({ kicker, title, hue = 'yellow', shape = 'star', action, ms = 4200 }: Toast) {
  const host = document.querySelector('.toasts')
  if (!host) return
  const el = document.createElement('div')
  el.className = 'toast'
  el.style.setProperty('--hue', `var(--${hue})`)
  el.innerHTML = `<span class="toast__icon">${shapeSvg(shape)}</span><span><small></small><b></b></span>`
  el.querySelector('small')!.textContent = kicker
  el.querySelector('b')!.textContent = title
  if (action) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = action.label
    btn.addEventListener('click', () => {
      action.run()
      leave()
    })
    el.append(btn)
  }
  host.append(el)
  // keep at most three on screen
  while (host.children.length > 3) host.firstElementChild?.remove()
  const timer = setTimeout(leave, ms)
  function leave() {
    clearTimeout(timer)
    el.classList.add('is-leaving')
    el.addEventListener('animationend', () => el.remove(), { once: true })
  }
}
