# BAYANIHanda Game Library

Play, learn, and be ready. DRRM learning games for children, built as an offline
Android app from the Claude Design handoff (`project/BAYANIHanda App.dc.html`, option 1b
navigation) with the real 3D games from the original web app
(`project/uploads/BAYANIHanda-Game-Library.html`).

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ at http://localhost:4173
```

Wider than 900px, the app uses the tablet layout (side rail); narrower, it uses the
phone layout (bottom bar with the raised Ask Bayani button).

## Website (GitHub Pages)

Every push to `main` builds the app and publishes it with
`.github/workflows/deploy.yml`. In the repository's **Settings → Pages**, set
**Source** to **GitHub Actions** (once). The app is then at
https://eaadionido4ai-ui.github.io/bayanihandagamelibrary/.

Opening `index.html` straight from the repository won't work: it is the
development entry point and needs the build step.

## Android

The web build is wrapped with Capacitor. You need Android Studio and the Android SDK.

```sh
npx cap add android     # first time only: creates android/
npm run android:sync    # build the web app and copy it into android/
npm run android:open    # open in Android Studio, then Run or build an APK
```

Set your own `appId` in `capacitor.config.json` before publishing.

The launcher icon comes from `assets/` (the Bayanihan house logo). After `npx cap add android`,
generate the Android icon sizes with:

```sh
npx @capacitor/assets generate --android
```

## Brand

Logo 1b, the Bayanihan house: four neighbours in the pillar colours lifting a house together.

| File | Used for |
| --- | --- |
| `public/brand/icon-rounded.svg` | Browser tab icon (`public/icon.svg`); in the app via the `Logo` component in `src/ui/art.jsx` |
| `public/brand/icon-square.svg` | Home-screen icons (`public/*.png`) and Android launcher sources (`assets/`); phones apply their own mask |
| `public/brand/logo-horizontal.svg` | Documents and presentations; the Home header recreates it with `Logo` and `Wordmark` |

## How it fits together

| Part | Where | What it does |
| --- | --- | --- |
| App shell | `src/` (React) | Every screen from the design: splash, welcome, players, Home with Bayani and the daily tip, Games, game intro, results, Champion ID, Settings with About and Behind BAYANIHanda, Ask Bayani. |
| Game engine | `public/engine/` | Three.js and the web app's game code, copied out unchanged by `npm run extract-engine`. |
| In-game screens | `src/engine/screens.html` | Each game's canvas and HUD markup, also extracted unchanged. |
| Bridge | `src/engine/bridge.js` | Starts games with the mode picked on the intro screen, shows the game layer, turns each game's result into the new Results screen, opens the app's sheets from the in-game buttons, and handles speech. |
| HUD style | `src/engine/game-hud.css` | Restyles the real HUDs to the design: corner buttons, status pill, Bayani hint bubble, side buttons, bottom sheets. |
| Museum | `src/museum/`, `src/screens/Tanghalan.jsx` | TANGHALAN, the walkable 3D museum (below). |

To pick up a newer version of the web app, replace the file in `project/uploads/` and
run `npm run extract-engine`. The bridge relies on the engine's element ids, on
`window.BYANI.App`, and on the game objects it exposes (`FireGame`, `GoBag`, …).

Players and badges use the web app's own storage keys (`bayanihanda_players_v1`,
`bayanihanda_badges_v1::<player>`), so progress carries over. Champion ID names and
photos stay in memory only, as the app's privacy note promises.

### Fix to the original engine

Duck, Cover, and Hold never started in the web app ("3D view is not available on this
device"), because `QuakeGame` calls a `_label` helper it doesn't define. The bridge
lends it Hazard Hunt's identical helper at startup (`applyEngineFixes` in
`src/engine/bridge.js`), so `public/engine/games.js` stays an exact copy.

## For grown-ups

Settings has a "For grown-ups" section behind a multiplication question:

- **Teacher's corner** (coming soon): dimmed mockups of the planned lesson guides,
  class progress and printables. Lesson content still needs writing and review.
- **Build with us**: how to contribute games, lessons and translations. Contact us
  opens an email to eadionido@up.edu.ph (`CONTACT_EMAIL` in `src/screens/GrownUps.jsx`).

## TANGHALAN, the museum

TANGHALAN (Three-dimensional Animated Gallery Highlighting Youth-Generated Artworks,
Learnings and Narratives) is a walkable 3D museum inside the library. It opens from a card under the adventures on
Home and from the end of the Games list, so the games stay first.

- **One connected space.** Nine rooms in a 3 × 3 grid open into each other: the Lobby, the
  Bulwagan ng Bayanihan (featured hall), a room for each pillar, the Kuwentuhan Corner for
  stories, and two game rooms.
- **Your player walks in third person** with the joystick (or WASD and the arrow keys).
  Drag to look around, pinch or scroll to zoom. Bayani walks beside you.
- **Artworks hang on the walls; stories, poems, letters and comics sit on story stands and
  reading walls.** Walk up to one and tap Look or Read: the work opens with the child's
  words in Filipino or English, read aloud line by line, a sticker to give, and Bayani's
  tip with a button to the matching game.
- **Game rooms.** The Go Bag Room and the Fire Safety Room each have a game station that
  starts Go Bag Packing 3D or Fire Extinguisher 3D. After the game, the Museum button on the
  results (or Back) returns you to the same spot.
- **The map** shows where you are and the rooms you visited, and can take you to any room.
- **Progress** (works seen, rooms visited, stickers) is saved per player in
  `bayanihanda_museum_v1::<player>`.

**The works are samples** of how the virtual museum is envisioned: the names, ages and
places are made up, and every work, placard and the welcome board say so. To show real
works, collected through teachers with parents' consent:

1. Put the picture in `public/tanghalan/works/<id>.webp` (about 1024 px wide).
2. Add or edit its entry in `src/museum/content.js`: room, wall or stand position, title,
   first name, age, grade, province, the child's words or story text in Filipino and
   English, Bayani's tip and the game it leads to.
3. Remove the sample notes (`SAMPLE_NOTE` in `content.js`, the strip in
   `src/screens/Tanghalan.jsx`, the placards in `src/museum/world.js`).

| Part | Where |
| --- | --- |
| Rooms, doors, works, game stations | `src/museum/content.js` |
| The 3D museum (three.js from `public/engine/`) | `src/museum/world.js`, `characters.js`, `runtime.js` |
| Screen, controls, sheets, Home and Games cards | `src/screens/Tanghalan.jsx` |
| Read-aloud, progress | `src/museum/speech.js`, `store.js` |
| Sample pictures and how they are drawn | `design/tanghalan/` (see its README) |

## Not done yet

- **Saving, sharing and printing inside the Android app.** Save downloads a PNG of the ID,
  Share opens the system share sheet where the browser supports it, and Print uses the
  browser's print dialog. The Android WebView supports none of these on its own; it needs
  Capacitor plugins (`@capacitor/filesystem`, `@capacitor/share`, and a print plugin).
- **Hands-Only CPR and Stop the Bleed** are playable in the engine but stay "Coming soon",
  as in the web app. **Nobody Left Behind** doesn't exist yet.
- **TANGHALAN shows sample works.** Real works need parents' consent forms and review
  before they replace the samples.
- **Not yet tested on a phone.** Everything was checked in Chromium at phone (412×915)
  and tablet (1280×800) sizes, with software WebGL.

## Design source

`project/` and `chats/` hold the Claude Design handoff bundle: the prototype, the bottom
navigation options and the design conversation.
