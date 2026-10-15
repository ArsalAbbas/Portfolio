// The setup prompt on a project card: one click copies it, ready to paste into Claude Code.

import { $$ } from '../../scripts/util'

export function initProjects() {
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
