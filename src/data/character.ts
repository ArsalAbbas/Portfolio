// The person behind the work, for the Character page. Pick one on the site and the avatar
// changes outfit. Add to anything here; every list can grow.
//
// It's a persona, not a profile: the gist of each thing I like, never the full list. Only the
// work gets job titles; everything else is a plain category.

import type { Hue, ShapeName } from './site'

/** also the outfit the avatar wears, in src/components/avatar */
export type ClassId = 'engineer' | 'researcher' | 'artist' | 'barista' | 'foodie' | 'traveller' | 'athlete' | 'bard'

/** the toy in each panel, in src/components/character/widgets */
export type Widget = 'stats' | 'fieldnotes' | 'sketch' | 'v60' | 'dishes' | 'route' | 'rally' | 'kalimba'

export interface Costume {
  id: 'wizard' | 'bat' | 'ninja' | 'pirate'
  line: string
}

export interface CharacterClass {
  id: ClassId
  /** a job title for the work, a plain category for everything else */
  name: string
  /** a few words under the name */
  hobby: string
  shape: ShapeName
  hue: Hue
  blurb: string
  /** what the avatar says when you pick it, then when you poke it */
  lines: string[]
  widget: Widget
  /** outfits the costume button cycles through */
  costumes?: Costume[]
  /** a small hint at the bottom of the panel, for keyboards only */
  psst?: string
}

export const classes: CharacterClass[] = [
  {
    id: 'engineer',
    name: 'Engineer',
    hobby: 'Day job',
    shape: 'circle',
    hue: 'red',
    blurb:
      'Product engineer at SquadStack.ai since January 2024. I started on the front end and kept walking: mobile apps, then the backend, then real-time voice AI.',
    lines: ['Ship it.', 'It works on my machine.', 'Have you tried turning it off and on again?', 'One more PR, then lunch.'],
    widget: 'stats',
  },
  {
    id: 'researcher',
    name: 'UX Designer',
    hobby: 'How humans behave',
    shape: 'star',
    hue: 'green',
    blurb:
      'In college I was a UX designer, and I never stopped watching how people actually use things. Fair warning: I’ve been taking notes on you.',
    lines: ['I see you hovering.', 'Interesting. Very interesting.', 'Users don’t read. You do, though.', 'Noted.'],
    widget: 'fieldnotes',
  },
  {
    id: 'artist',
    name: 'Sketching',
    hobby: 'Pencil and paper',
    shape: 'square',
    hue: 'blue',
    blurb: 'Whatever’s in front of me. Here’s a quick one of me.',
    lines: ['Hold still. I’m sketching you.', 'It’s a rough draft.', 'Everyone’s a critic.'],
    widget: 'sketch',
  },
  {
    id: 'barista',
    name: 'Coffee',
    hobby: 'Fuel',
    shape: 'circle',
    hue: 'yellow',
    blurb: 'Nothing fancy: just a good cup, made by hand.',
    lines: ['Coffee first. Then code.', 'Is it too late for another cup?', 'Kettle’s on.'],
    widget: 'v60',
  },
  {
    id: 'foodie',
    name: 'Food',
    hobby: 'What’s for lunch?',
    shape: 'square',
    hue: 'pink',
    blurb: 'Can’t decide what to eat? Neither can I. Let the wheel pick.',
    lines: ['Is it lunch yet?', 'I know a place.', 'That needs a squeeze of lemon.'],
    widget: 'dishes',
  },
  {
    id: 'traveller',
    name: 'Travel',
    hobby: 'New places',
    shape: 'triangle',
    hue: 'yellow',
    blurb: 'I’ve travelled to a lot of places, and I’m usually planning the next one. Mountains if I get to choose.',
    lines: ['Where to next?', 'Window seat, please.', 'I know a place.'],
    widget: 'route',
  },
  {
    id: 'athlete',
    name: 'Sports',
    hobby: 'Side quest',
    shape: 'cross',
    hue: 'green',
    blurb: 'Usually up for a game, once the work’s done.',
    lines: ['Smash!', 'That was in.', 'Best of three?', 'Your serve.'],
    widget: 'rally',
  },
  {
    id: 'bard',
    name: 'Stories',
    hobby: 'Books, films, songs',
    shape: 'star',
    hue: 'pink',
    blurb: 'A few long-running stories I keep up with, and lately a kalimba. Have a go.',
    lines: ['I’m ready! I’m ready!', 'Every good story has a twist.', 'One more episode. Then bed.'],
    widget: 'kalimba',
    costumes: [
      { id: 'wizard', line: 'Gryffindor. Obviously.' },
      { id: 'bat', line: 'I’m Batman.' },
      { id: 'ninja', line: 'Believe it!' },
      { id: 'pirate', line: 'I’m gonna be King of the Pirates!' },
    ],
    psst: 'A few of these stories left small secrets on this site. Try typing “winter is coming”.',
  },
]

/** What the avatar on the title screen says when poked. */
export const heroLines = [
  'Hi! I’m Arsal.',
  'Psst. You can throw those shapes.',
  'I build voice AI. The rest of me lives on the Character page.',
  'Okay, that tickles.',
]

/** On GitHub, since January 2024. Rounded down, so they stay true for a while. */
export const stats = [
  { label: 'Pull requests opened', value: '750+' },
  { label: 'Reviewed for teammates', value: '450+' },
  { label: 'Commits, give or take', value: '1,800+' },
  { label: 'Cups of coffee', value: 'Too many' },
]

export interface ShelfItem {
  /** a book stands spine out; a disc (an album, a film, a series) leans face out */
  kind: 'book' | 'disc'
  title: string
  hue?: Hue
}

/**
 * TODO(arsal): what's on the shelf in the room at the bottom of the Character page, if
 * anything. Poke one and the avatar names it. Plain spines fill out the rest, so it never looks
 * bare.
 */
export const shelf: ShelfItem[] = []

export const dishes = [
  { id: 'biryani', name: 'Biryani', note: 'Slow-cooked, Awadhi style.' },
  { id: 'kebab', name: 'Galouti kebab', note: 'So soft it melts in the mouth.' },
  { id: 'momos', name: 'Momos', note: 'Steamed, with fiery red chutney.' },
  { id: 'chole', name: 'Chole bhature', note: 'Puffed-up bhature, spicy chole, a green chilli.' },
  { id: 'pizza', name: 'Pizza', note: 'Thin crust, wood-fired.' },
  { id: 'chai', name: 'Chai', note: 'Not a dish. Still essential.' },
] as const

/** Nine notes in C major, from the middle of a kalimba outwards. Public-domain tunes only. */
export const kalimba = {
  notes: [
    { name: 'C', hz: 523.25 },
    { name: 'D', hz: 587.33 },
    { name: 'E', hz: 659.25 },
    { name: 'F', hz: 698.46 },
    { name: 'G', hz: 783.99 },
    { name: 'A', hz: 880.0 },
    { name: 'B', hz: 987.77 },
    { name: 'C', hz: 1046.5 },
    { name: 'D', hz: 1174.66 },
  ],
  /** Twinkle, Twinkle, Little Star: note numbers from `notes`, and beats */
  tune: [
    [0, 1], [0, 1], [4, 1], [4, 1], [5, 1], [5, 1], [4, 2],
    [3, 1], [3, 1], [2, 1], [2, 1], [1, 1], [1, 1], [0, 2],
  ] as [number, number][],
}
