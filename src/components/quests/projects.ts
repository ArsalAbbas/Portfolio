// The setup prompt on a project card: one click copies it, ready to paste into Claude Code. And
// the screenshot that pops up when you hover a card goes below it when there's no room above.

import { $$ } from '../../scripts/util'

export function initProjects() {
  for (const card of $$('[data-project]')) {
    const shot = card.querySelector<HTMLElement>('.project__shot')
    if (!shot) continue
    const place = () => {
      const box = card.getBoundingClientRect()
      const bar = document.querySelector('.hud')?.getBoundingClientRect().bottom ?? 0
      card.classList.toggle('project--below', box.top - shot.offsetHeight < bar + 8)
      // it's centred on the card, and slides sideways if that would put it off the screen (with
      // room for the tilt, which swings a top corner out)
      const left = box.left + box.width / 2 - shot.offsetWidth / 2
      const nudge = Math.max(32 - left, Math.min(0, innerWidth - 32 - (left + shot.offsetWidth)))
      card.style.setProperty('--nudge', `${Math.round(nudge)}px`)
    }
    card.addEventListener('pointerenter', place)
    card.addEventListener('focusin', place)
  }

  for (const button of $$<HTMLButtonElement>('[data-copy]')) {
    const label = button.textContent
    let timer = 0
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '')
        button.textContent = 'Copied. Paste it into Claude Code'
      } catch {
        button.textContent = 'Couldn’t copy it'
      }
      clearTimeout(timer)
      timer = window.setTimeout(() => (button.textContent = label), 2600)
    })
  }
}
