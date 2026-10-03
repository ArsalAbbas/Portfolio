// The drawings on the quest cards only move while you can see them.

import { $$, whileVisible } from '../../scripts/util'

export function initQuests() {
  for (const card of $$('.quest')) whileVisible(card, (on) => card.classList.toggle('is-playing', on), 0.15)
}
