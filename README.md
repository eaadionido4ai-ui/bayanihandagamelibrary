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

## How it fits together

| Part | Where | What it does |
| --- | --- | --- |
| App shell | `src/` (React) | Every screen from the design: splash, welcome, players, Home with Bayani and the daily tip, Games, game intro, results, Champion ID, Settings with About and Behind BAYANIHanda, Ask Bayani. |
| Game engine | `public/engine/` | Three.js and the web app's game code, copied out unchanged by `npm run extract-engine`. |
| In-game screens | `src/engine/screens.html` | Each game's canvas and HUD markup, also extracted unchanged. |
| Bridge | `src/engine/bridge.js` | Starts games with the mode picked on the intro screen, shows the game layer, turns each game's result into the new Results screen, opens the app's sheets from the in-game buttons, and handles speech. |
| HUD style | `src/engine/game-hud.css` | Restyles the real HUDs to the design: corner buttons, status pill, Bayani hint bubble, side buttons, bottom sheets. |

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

## Not done yet

- **Saving, sharing and printing inside the Android app.** Save downloads a PNG of the ID,
  Share opens the system share sheet where the browser supports it, and Print uses the
  browser's print dialog. The Android WebView supports none of these on its own; it needs
  Capacitor plugins (`@capacitor/filesystem`, `@capacitor/share`, and a print plugin).
- **Hands-Only CPR and Stop the Bleed** are playable in the engine but stay "Coming soon",
  as in the web app. **Nobody Left Behind** doesn't exist yet.
- **Not yet tested on a phone.** Everything was checked in Chromium at phone (412×915)
  and tablet (1280×800) sizes, with software WebGL.

## Design source

`project/` and `chats/` hold the Claude Design handoff bundle: the prototype, the bottom
navigation options and the design conversation.
