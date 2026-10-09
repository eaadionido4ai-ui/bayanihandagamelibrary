# TANGHALAN design sources

TANGHALAN (Technology-Assisted Navigable Gallery Highlighting Art, Learning and
Narratives) is the planned museum wing of the game library: one connected 3D space
where players walk from room to room, look at learners' art and read or listen to
their stories and poems. The app shows it as a "coming soon" placeholder
(`src/screens/Tanghalan.jsx`). These files make that placeholder's pictures.

| File | What it is |
| --- | --- |
| `gallery.js` | The museum scene, built with the app's own three.js (`public/engine/three.min.js`) in the games' low-poly style: the main hall with archways into a room for each pillar, a doorway to the Kuwentuhan Corner, framed works, story stands with open books, the player and Bayani. A starting point for the real museum. |
| `art.js` | Sample children's works drawn in code (crayon drawings, a poem, a story, a letter, a comic). Placeholders until real, consented works arrive. |
| `screens.html` | Mockup of the app screens: Home entry, museum map, walking, an artwork, a story stand. |
| `overview.html` | Pitch slide. |
| `preview.html` | The two 3D stills used inside the app's placeholder. |
| `mock.js`, `common.css`, `fonts.css`, `fonts/` | Shared pieces. Gochi Hand and Patrick Hand are under the SIL Open Font License. |
| `render.cjs` | Renders the mockups to `out/` and the placeholder images to `public/tanghalan/`. |

To render, from the repository root, after `npm install` and with Playwright's Chromium
installed (`npm i -D playwright && npx playwright install chromium`):

```sh
node design/tanghalan/render.cjs
```

Names, ages and places in the samples are made up.
