# TANGHALAN design sources

TANGHALAN (Three-dimensional Animated Gallery Highlighting Youth-Generated Artworks,
Learnings and Narratives) is the museum wing of the game library (`src/museum/`,
`src/screens/Tanghalan.jsx`). These files draw the museum's sample works and the concept
mockups.

| File | What it is |
| --- | --- |
| `art.js` | The sample children's works, drawn in code: crayon drawings, a poem, a story, a letter, a comic, and the open books on the story stands. They are samples of how the virtual museum is envisioned; names, ages and places are made up. |
| `works.html` | Loads `art.js` so `render.cjs` can draw the works. |
| `render.cjs` | Writes every work in `src/museum/content.js` to `public/tanghalan/works/` (WebP), then the mockups to `out/`. |
| `peeks.cjs` | Takes the 3D view of each room in `PEEK_ROOMS` (`src/museum/content.js`) for the museum card on Home and Games, and writes them to `public/tanghalan/peek/` (WebP, 640 x 360). It walks the built app, so run it with the app running. |
| `gallery.js`, `screens.html`, `overview.html`, `mock.js`, `common.css` | The concept mockups made before the museum was built (app screens and a pitch slide). |
| `fonts.css`, `fonts/` | Gochi Hand and Patrick Hand (SIL Open Font License) for the children's handwriting. |

To render, from the repository root, after `npm install` and with Playwright's Chromium
installed (`npm i -D playwright && npx playwright install chromium`):

```sh
node design/tanghalan/render.cjs              # works and mockups
node design/tanghalan/render.cjs --works-only # just public/tanghalan/works/

npm run build && npx vite preview --port 4173 # then, in another terminal:
node design/tanghalan/peeks.cjs               # the room pictures for the museum card
```

Run `peeks.cjs` again after the rooms change, so the card shows the museum as it is.

Real works replace the samples: put each picture in `public/tanghalan/works/` and edit its
entry in `src/museum/content.js` (see the main README).
