# arsal

My site: a small RPG made of circles, triangles, squares and crosses, with an engineering blog.

## Run it

```sh
nvm use          # Node 22, from .nvmrc
npm install
npm run dev      # http://localhost:4321
npm run build    # type-checks, then builds the static site into dist/
npm run preview  # serves dist/
```

Needs Node 22.12 or newer.

## Write a post

```sh
npm run new-post "My post title"
```

That creates `src/content/blog/my-post-title.md` as a draft. Drafts show up in `npm run dev` only; set `draft: false` in the frontmatter to publish. Posts are plain Markdown (or MDX) with a title, a one-line description, a date and optional tags.

## Where things live

Two pages: the work on the home page, and the person behind it on `/character/`.

The words are in `src/data`, so most edits never touch a component:

- `src/data/site.ts`: name, links, email, and the four sections
- `src/data/quests.ts`: what I work on, area by area
- `src/data/skills.ts`: the skill tree
- `src/data/character.ts`: the work roles and categories, dishes, what's on the shelf in the room, and the kalimba's notes. It's a persona, not a profile: the gist, never the full list
- `src/data/secrets.ts`: the easter eggs you can type, one word each, and what in the hideout gives each one away

`src/components` has one folder per part of the site. Each keeps its markup, styles and script side by side:

- `layout/`: the bar along the top, the footer, the controller on phones, and everything in `<head>`
- `hero/`, `quests/`, `skills/`, `logbook/`, `continue/`: the home page, top to bottom
- `character/`: the Character page, with each panel's toy in `character/widgets/`
- `avatar/`: the drawing of me, and what makes it blink and talk
- `shared/`: shapes, emblems and section headings

The Travel slideshow shows whatever pictures are in `src/assets/travel/` (create it if it's missing), in name order. Name each file for the view, not the place: `misty-hills.jpg` is what a screen reader hears as "Misty hills". Until there's a picture there, Travel shows no slideshow.

`src/scripts` has what every page shares: the theme, toasts, confetti and easter eggs, and the field notes. `src/styles/global.css` lists every stylesheet, in order.

Logo and icon credits are in `public/logos/CREDITS.txt`.

Nothing a visitor does is sent anywhere. A few counters (visits, pokes, cups brewed) and this visit's field notes stay in the visitor's own browser.
