---
title: 'React Native for Web: one codebase, three platforms'
description: 'How React Native code ends up in a browser, what carries over for free, and what needs care before it feels at home on the web.'
date: 2024-11-28
tags: ['react-native', 'web']
---

React Native is for building iOS and Android apps with React. But the same components can run in a browser too, which makes one codebase for three platforms possible. Here's how that works, what carries over, and what needs care, as things stand at the end of 2024.

## How it works

The trick is a library called [React Native for Web](https://necolas.github.io/react-native-web/) (`react-native-web`). It reimplements React Native's components and APIs on top of React DOM. Point the web build at it instead of `react-native`, and this:

```tsx
import { Pressable, StyleSheet, Text } from 'react-native'

export function Card({ title, onOpen }: { title: string; onOpen: () => void }) {
  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600' },
})
```

renders native views on a phone and plain DOM elements in a browser: a `View` becomes a `div`, a `TextInput` an `input`, and so on. Styles from `StyleSheet.create` turn into atomic CSS, one tiny class per property and value, shared by every component that uses it, so the CSS stays small however big the app gets.

A few things carry over that surprise web developers:

- **Layout is React Native's flexbox.** Every `View` is a flex container, and the default direction is a column, not a row. That's why a screen looks the same on all three platforms.
- **There's no cascade.** Styles apply to the component you put them on. Text doesn't inherit anything from a `View`; only a `Text` nested in another `Text` inherits from it.
- **Accessibility props become ARIA.** `role` and `aria-label` end up as the same attributes in the DOM.

## Setting it up

React Native for Web installs from npm, next to React DOM:

```bash
npm install react-dom react-native-web
```

Then the bundler for your web build needs to do two things: use `react-native-web` wherever the code imports `react-native`, and pick a `.web` file over a plain one when both exist (handy, as you'll see below). With webpack, for example:

```js
// webpack.config.js, the relevant part
module.exports = {
  resolve: {
    alias: { 'react-native$': 'react-native-web' },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
}
```

The [setup guide](https://necolas.github.io/react-native-web/docs/setup/) shows the same alias for Babel, Jest and others. The project's Babel plugin, `babel-plugin-react-native-web`, is worth adding too: it keeps the parts of the library you don't use out of the bundle.

The app starts the same way it does on a phone, through `AppRegistry`, just pointed at an element on the page:

```tsx
// index.web.tsx
import { AppRegistry } from 'react-native'
import App from './App'

AppRegistry.registerComponent('App', () => App)
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') })
```

## Write once, adjust where needed

Most code is shared, but some things should differ by platform. There are two tools for that.

Platform files: put a `.web.tsx` file next to the regular one, and the web build picks it up instead.

```text
components/
  Map.tsx       iOS and Android: a native map
  Map.web.tsx   the web: an embedded map
```

And `Platform` checks, for small differences inside one file:

```tsx
import { Platform } from 'react-native'

// say what people will actually do
const hint = Platform.OS === 'web' ? 'Click to open' : 'Tap to open'
```

`Platform.select({ web: …, default: … })` does the same for objects, like styles.

## What needs care on the web

Getting it to render is the easy part. Making it feel like a website takes some attention:

- **Libraries.** Many React Native libraries call native iOS or Android code, and simply don't work in a browser. Check before you adopt one: the [React Native Directory](https://reactnative.directory) lets you filter by web support.
- **URLs.** On the web, every screen needs an address, so that the back button, refreshing and shared links all work. Whichever navigation library you use, make sure each screen maps to a path.
- **Links.** Give a `Text` an `href`, and React Native for Web renders a real `<a>`, so opening it in a new tab works the way people expect.
- **Mouse and keyboard.** Phones have neither; browsers have both. Add hover states (`Pressable` has `onHoverIn` and `onHoverOut`), make sure everything can be reached with Tab, and keep the focus visible.
- **Scrolling.** A `ScrollView` on the web is a scrolling box inside the page, not the page itself. It works, but some things browsers do for page scrolling, like mobile toolbars tucking away as you scroll, may not happen.
- **Screen sizes.** `StyleSheet` has no media queries. Use `useWindowDimensions` to adapt layouts, and design for wide screens, not just a stretched phone.
- **First load.** By default the page stays empty until the JavaScript arrives and renders it. React Native for Web can render on the server too (`AppRegistry.getApplication` hands you the app and its styles to turn into HTML), but that setup is yours to build. For pages people find through search, it's worth it. Either way, keep an eye on the bundle size.

## When it's a good fit

It shines for **app-like products**: dashboards, tools, anything behind a login, where the same screens exist on phone and web and one team looks after both. You write a feature once and ship it everywhere.

It's a weaker fit for **content sites**, like blogs, docs and marketing pages, where search, fast first loads and web conventions matter most. A web-first framework does those better, and you can still share the logic (API clients, validation, state) between the app and the site through a shared package.

## Worth watching

- **React Native 0.76** ([October](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture)) made the New Architecture the default. It also added CSS-style `boxShadow` and `filter` props, a sign of native styling moving closer to the web's.
- **[React Strict DOM](https://github.com/facebook/react-strict-dom)** is an experimental approach from the other side: write with a subset of React DOM's elements and CSS, and run that natively. Early days, but it's an interesting direction, with web APIs as the shared language.

---

One codebase won't give you three great platforms for free; the web still needs its own care. But for app-like products, React Native for Web gets you most of the way there.
