// What I work on, by area. Broad strokes only: no internal systems, customers or numbers.
// The specifics live on my résumé.

import type { Hue, ShapeName } from './site'

/** the little animated drawing at the top of each card, in src/components/quests/art */
export type QuestArt = 'voice' | 'backend' | 'frontend' | 'design'

export interface Quest {
  title: string
  shape: ShapeName
  hue: Hue
  art: QuestArt
  /** the problem, in a sentence */
  line: string
  /** the kinds of things I build there */
  things: string[]
  /** a closing thought, like the flavour text on an RPG item */
  flavour: string
}

export const quests: Quest[] = [
  {
    title: 'Voice AI',
    shape: 'triangle',
    hue: 'green',
    art: 'voice',
    line: 'AI agents that hold real conversations, on the phone and on the web.',
    things: [
      'Agents that listen, reply and know when to stop talking',
      'Voices that sound human, in more than one language',
      'Tools to build, test and understand agents',
      'Giving agents knowledge and memory',
    ],
    flavour: 'People usually reply within about a fifth of a second. An agent has to think inside that gap.',
  },
  {
    title: 'Backend systems',
    shape: 'square',
    hue: 'blue',
    art: 'backend',
    line: 'The parts nobody sees: services, data, and what happens when a lot of it arrives at once.',
    things: ['APIs and services', 'Data models, caching and background jobs', 'Real-time audio and events', 'Monitoring that spots trouble first'],
    flavour: 'The best backend work is invisible. That’s rather the point.',
  },
  {
    title: 'Frontend systems',
    shape: 'circle',
    hue: 'red',
    art: 'frontend',
    line: 'Interfaces that feel fast and obvious, on the web and on phones.',
    things: ['Web apps and dashboards', 'Mobile apps', 'Design systems and shared components', 'Turning slow screens into fast ones'],
    flavour: 'Where I started, as an intern. I still notice every janky scroll.',
  },
  {
    title: 'Product design',
    shape: 'star',
    hue: 'pink',
    art: 'design',
    line: 'Working out what to build, and for whom, before writing the code.',
    things: ['User research and testing', 'Flows, wireframes and prototypes', 'Design docs that settle debates early'],
    flavour: 'I was a designer before I was an engineer. It never wore off.',
  },
]
