// Where I've worked and what I've made, under the quest cards. Just the roles and their dates:
// what I do there is in the quest cards. Same rule as ./quests.ts: never how things work inside,
// who they're for, or any numbers.

import type { ImageMetadata } from 'astro'
import autopost from '../assets/projects/autopost.webp'
import floorplan from '../assets/projects/floorplan.webp'
import linkchat from '../assets/projects/linkchat.webp'
import woosh from '../assets/projects/woosh.webp'
import type { Hue, ShapeName } from './site'

export interface Stint {
  /** a role, or a degree */
  title: string
  when: string
}

export interface Place {
  name: string
  href?: string
  line: string
  hue: Hue
  stints: Stint[]
}

/** newest first */
export const places: Place[] = [
  {
    name: 'SquadStack.ai',
    href: 'https://squadstack.ai',
    line: 'Voice AI for sales · Noida, India',
    hue: 'red',
    stints: [
      {
        title: 'Product Engineer II',
        when: 'Apr 2026 – now',
      },
      {
        title: 'Product Engineer I',
        when: 'Jul 2024 – Mar 2026',
      },
      {
        title: 'Product Engineer Intern',
        when: 'Jan – Jun 2024',
      },
    ],
  },
  {
    name: 'Vellore Institute of Technology',
    line: 'Vellore, India',
    hue: 'yellow',
    stints: [
      {
        title: 'B.Tech, Information Technology',
        when: '2020 – 2024',
      },
    ],
  },
]

export interface Project {
  name: string
  year: string
  line: string
  tags: string[]
  /** a prompt that sets it up, for pasting into Claude Code */
  prompt?: string
  /** where it runs, for one you can just open */
  live?: string
  /**
   * a screenshot that pops up when you hover the card. Every one shows made-up or public
   * things only: a pretend home folder, a pretend chat, this project's own code
   */
  shot?: { src: ImageMetadata; alt: string }
  /** where it's headed next, when it isn't out yet */
  soon?: string
  /** for one that isn't finished: how far along it is, from 0 to 1, and that in words */
  progress?: { done: number; label: string }
  shape: ShapeName
  hue: Hue
}

/** newest first */
export const projects: Project[] = [
  {
    name: 'Woosh',
    year: '2026',
    line: 'A Mac app that shows what’s filling your disk as a treemap, and splits what you can clear into safe caches and things to look at first.',
    tags: ['Swift', 'SwiftUI', 'macOS'],
    shot: { src: woosh, alt: 'Woosh showing a home folder as a treemap, with what’s safe to remove listed beside it' },
    soon: 'Available on the App Store soon',
    shape: 'circle',
    hue: 'yellow',
  },
  {
    name: 'Floorplan',
    year: '2026',
    line: 'A read-only map of your code: folders, files, classes and functions as a map and graphs, plus a structural diff of what Claude Code changed.',
    tags: ['TypeScript', 'React', 'React Flow', 'Tree-sitter'],
    shot: { src: floorplan, alt: 'Floorplan showing one file of its own code, with the files it imports and the files that import it' },
    prompt:
      'Set up Floorplan for me: clone https://github.com/ArsalAbbas1/floorplan, follow the “Run it” section of its README, and open this project in it. Then tell me the two /plugin commands from its “Claude Code” section.',
    shape: 'square',
    hue: 'blue',
  },
  {
    name: 'This site',
    year: '2026',
    line: 'A portfolio that plays like a game: shapes to throw, a skill tree, a blog, and an About me page full of small toys.',
    tags: ['Astro', 'TypeScript', 'CSS'],
    shape: 'triangle',
    hue: 'green',
  },
  {
    name: 'AutoPost',
    year: '2025',
    line: 'An API client, like Postman, where you describe a request in plain words and it fills in the rest. The client works; the AI that fills it in isn’t built yet.',
    tags: ['React', 'JavaScript', 'Tailwind CSS'],
    shot: { src: autopost, alt: 'AutoPost with a request and its JSON response, and the AI Assist chat open beside it with a request typed in' },
    progress: { done: 0.5, label: 'Half done' },
    shape: 'cross',
    hue: 'red',
  },
  {
    name: 'LinkChat',
    year: '2023',
    line: 'Chat rooms that live at a link. Start one, share the link, and talk: no accounts, and whoever joins later can catch up.',
    tags: ['JavaScript', 'Firebase'],
    shot: { src: linkchat, alt: 'A LinkChat room: three people planning a game night, and who’s here down the side' },
    live: 'https://linkchat-2598e.web.app',
    shape: 'star',
    hue: 'pink',
  },
]
