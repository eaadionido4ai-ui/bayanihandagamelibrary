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
npm run test:stories   # play every Handaventures story in a simulated browser
npm run test:games     # check Quake in Order (its rules, and the way the library shows it)
npm run tour:pitch     # the presenter's 3D tour: one offline file in tour/standalone/
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

Logo 1b, the Bayanihan house: four neighbors in the pillar colors lifting a house together.

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
| Stories | `stories/`, `scripts/build-stories.mjs`, `src/screens/Stories.jsx` | Handaventures, the story series (below). |
| Games in a frame | `games/`, `scripts/build-games.mjs`, `src/screens/GameFrame.jsx` | Games that are pages of their own, like Quake in Order (below). |
| Island tour | `tour/`, `scripts/build-tour.mjs`, `src/screens/Tour.jsx`, `src/tour.js` | Bayani's 3D island tour of the library, and the presenter's tour for pitches (below). |

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
`src/engine/bridge.js`), so `public/engine/games.js` stays an exact copy. Since October
2026 the library shows Quake in Order in its place (below); the drill's code stays in
the engine.

## For grown-ups

Settings has a "For grown-ups" section behind a multiplication question:

- **Teacher's corner** (coming soon): dimmed mockups of the planned lesson guides,
  class progress and printables. Lesson content still needs writing and review.
- **Build with us**: how to contribute games, lessons and translations. Contact us
  opens an email to eadionido@up.edu.ph (`CONTACT_EMAIL` in `src/screens/GrownUps.jsx`).

## Handaventures, the story series

Handaventures ("Be ready for anything.") is a series of five choose-your-path stories about
what to do before, during and after a hazard. A child talks with family, makes choices and
sees what happens; every choice changes the ending, and each story has four endings.

Handaventures has a place of its own, like TANGHALAN: the four pillars on Home and Games
hold only their standalone games, each one standing for its pillar, and the stories sit
beside them (October 2026, after the judges asked for games that teach what to do before,
during and after a hazard).

| Story | Hazard | Hero badge |
| --- | --- | --- |
| Bagyong Kulog | Typhoon | Storm Hero |
| Bagyong Agos | Flood | Flood Hero |
| The Big Shake | Earthquake | Shake Hero |
| Smoke at Night | Fire | Smoke Hero |
| Lockdown at School | Lockdown (play it with a grown-up first) | Calm Hero |

- **One card stands for the series.** On Home it sits below the four pillar cards, next to
  the TANGHALAN card; on Games it heads More to explore, next to the museum. Where there is
  room (a tablet, or a phone turned sideways) the two cards sit side by side at the same
  height; on a phone held upright, Handaventures comes first and TANGHALAN below it. Tapping
  it opens the shelf with the five stories and the player's progress (endings found, hero
  badges), and Back returns to where it was opened.
- **Before, during and after.** Every story shows the stops it covers: chips on the shelf,
  and in its intro one line each for what happens before, during and after the hazard. A
  stop with no scene yet is dashed and says Coming soon (Lockdown at School has no before
  scene yet). The lines are `journey` on each story in `src/data.js`.
- **Each story has an intro:** Bayani's tip, chat style or cartoon style, Ate or Kuya,
  how to play, and the endings found so far. Then the story plays inside the app, in the
  library's look, with a back button to the intro.
- **Progress is kept per player** in `bayanihanda_stories_v1::<player>` (the endings
  found). Reaching a story's Hero ending earns its badge, stored with the other badges, so
  it shows on the Champion ID. The style and character picked are remembered on the device
  in `bayanihanda_story_prefs_v1`.

How it is built:

| Part | Where |
| --- | --- |
| Shared story engine (scenes, chat and cartoon styles, endings) | `stories/engine.html` |
| The five stories (script, choices, endings, lessons) | `stories/story-*.js` |
| Build: one page per story, offline fonts | `scripts/build-stories.mjs` writes `public/stories/*.html` and `public/stories/fonts/` |
| Cover pictures and character faces | `public/stories/art/` |
| Storybook card, shelf, intro, story frame | `src/screens/Stories.jsx` |
| Story list, badges, endings, tips, before, during and after | `STORIES`, `HV` and `JOURNEY` in `src/data.js` |
| Progress and preferences | `src/stories.js` |
| Tests | `stories/tests/` |

The story pages are built from `stories/` every time you run `npm run dev` or
`npm run build` (so the GitHub Pages deploy and `npm run android:sync` include them), and
are not committed. To change a story, edit its `stories/story-*.js` file, or
`stories/engine.html` for all of them.

Inside the app a story opens as
`stories/<file>.html?embed=1&mode=chat|vn&hero=ate|kuya&found=<endings>`: it skips its
own start screen, wears the library's look, keeps nothing on the device by itself, and
tells the library when an ending is found, when the style changes and when the player
goes back (`postMessage` with `source: 'handaventures'`).

`npm run test:stories` plays every ending of every story in both styles and as both
characters, then checks each story the way the library shows it. It also writes
`stories/standalone/`, single-file copies of the stories (with web fonts) that work
outside the app.

## Bayani's island tour

Bayani shows new players around BAYANIHanda Island, a small 3D island with one landmark for each part of
the library: the four pillar signs, the HANDAventures story board, the creek and the game tablet, the
TANGHALAN museum and the Champion ID medal.

- **First visit:** once Home is in view, Bayani offers the tour in a welcome sheet: "Yes, show me!" or
  "Maybe later".
- **Later visits:** until the player takes the tour, Bayani's greeting card on Home offers it, with
  "Show me!" and "Later". "Later" waits until the app is opened again.
- **Anytime:** Ask Bayani has a Tour tab (not during a game, since the tour opens full screen).
- **The tour:** one stop at a time, at the child's pace. Bayani reads each stop aloud (the voice button
  turns that off), stepping stones show how far along the child is, and **Try it!** opens the real thing:
  the Games screen, the story shelf, a game, the museum or the Champion ID. **Skip** ends it, and Back
  returns to where it was opened. The last screen has "Tour again" and "Start playing".
- **Only what kids can play now:** the library tells the tour which games are open, so a stop that names
  games leaves out any game that is "Coming soon" (the Learn by doing stop names up to three).
- **Progress** is kept per player in `bayanihanda_tour_v1::<player>` (`offered`, and `done` once the player
  finishes the tour, skips it or leaves it with Try it).
- **No 3D on the device?** The tour still runs, over a picture of the island.

How it is built:

| Part | Where |
| --- | --- |
| The tour, one file with two modes: Bayani's tour for kids, and the presenter's tour for talks and pitches | `tour/tour.html` |
| Pictures: app screens for the presenter's tour, kids' art on the island, the island picture | `tour/screens/`, `tour/art/`, `tour/island.webp` |
| Build | `scripts/build-tour.mjs` writes `public/tour/` (every `npm run dev` and `npm run build`; not committed) |
| Frame, welcome sheet, Ask Bayani tab | `src/screens/Tour.jsx` |
| Bayani's card offer | `src/screens/Home.jsx` |
| Offer and progress | `src/tour.js`, `openTour` and `closeTour` in `src/Shell.jsx` |

Inside the app the tour opens as
`tour/index.html?embed=1&name=<player>&sound=0|1&voice=0|1&live=<open game ids>` and tells the library
what Bayani says, when the tour is done, and where to go when it closes (`postMessage` with
`source: 'bayani-tour'`: `say`, `hush`, `done`, `close`).

**The presenter's tour** (`npm run tour:pitch`) is the same island with a one-minute guided mode, numbered
stops, the app's screens beside the island and a presenter script. It writes
`tour/standalone/BAYANIHanda-3D-Tour.html`, one file that runs with no internet, and `tour/standalone/web/`
for a web host. When the app's screens change, retake the pictures in `tour/screens/`.

## Quake in Order

Quake in Order (Act Fast) takes the place of the paused Duck, Cover, and Hold drill. It is
math class, the player's seat is right next to the door, and the ground starts to shake.
The player puts seven steps in order (open the door, duck, cover, hold, wait, walk out, go
to the open field), taps Simulate, and a 3D classroom acts out exactly that order: the
door jams if no one opened it, the desk slides if no one holds on, and the teacher counts
everyone at the field. Each step is graded safe, could be better, or not safe, with the
reason, and See it done right plays the right order.

- **The badge.** A round where every step is safe, with the player's own order, earns
  Quake Ready, the badge Duck, Cover, and Hold had.
- **In the library** it opens like the other games (card, intro, Start) and plays in a
  frame as `games/quake-in-order.html?embed=1`: the library's Engaging look, a back button
  and a Done button that return to the intro, and nothing kept on the device by itself. It
  tells the library when a round ends, what Bayani should read aloud and when the player
  leaves (`postMessage` with `source: 'bayani-game'`: `result`, `say`, `hush`, `exit`).
- **No 3D on the device?** It still plays, with drawings in place of the classroom.
- **On its own** (`npm run test:games` writes `games/standalone/Quake-in-Order.html`), it is
  one file with everything inside, with a switch between the Engaging and Minimalist looks,
  for review and sharing.

| Part | Where |
| --- | --- |
| The game: story, steps, rules, 3D classroom, results | `games/quake-in-order/` (`template.html`, `style.css`, `app.js`) |
| Build | `scripts/build-games.mjs` writes `public/games/` (every `npm run dev` and `npm run build`; not committed) |
| Card, intro, badge | the `quake` entry in `src/data.js` (`frame:` marks a game that plays in a frame) |
| Frame | `src/screens/GameFrame.jsx`, `startGame` and `gameEnded` in `src/Shell.jsx` |
| Tests | `games/tests/` |

## Credits on the info tags

Every game's info tag (the **i** button) starts with the notice **Subject for code and
content validation**, then says who made it:

- Games and features: *Conceptualized and developed with AI assistance by* Edward Andrew
  A. Dionido, Science Research Specialist II, UPRI.
- Handaventures: *Concept by* Celine Tatco, Senior Project Associate, UPRI, and
  *Developed with AI assistance by* Edward Andrew A. Dionido, Science Research
  Specialist II, UPRI.

The texts are in `src/data.js` (`VALIDATION`, `CREDITS_LIBRARY`, `CREDITS_HV`). Behind
BAYANIHanda in Settings shows the same credit.

## TANGHALAN, the museum

TANGHALAN (Three-dimensional Animated Gallery Highlighting Youth-Generated Artworks,
Learnings and Narratives) is a walkable 3D museum inside the library. It opens from a card under the adventures on
Home and from the end of the Games list, so the games stay first; the card sits beside the Handaventures card where
there is room.

- **The museum card** is a carousel: rooms in 3D and kids' drawings in turn, a different few each
  day. It moves on by itself every few seconds (not with reduced motion, and never while someone is
  using it), and it can be swiped. Tapping a picture walks you straight into its room. The room
  pictures are in `public/tanghalan/peek/`, taken from the museum itself by
  `design/tanghalan/peeks.cjs`; the rooms it uses are `PEEK_ROOMS` in `src/museum/content.js`.

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
| Screen, controls, sheets, the museum card on Home and Games | `src/screens/Tanghalan.jsx` |
| Room pictures for the museum card | `public/tanghalan/peek/`, made by `design/tanghalan/peeks.cjs` |
| Read-aloud, progress | `src/museum/speech.js`, `store.js` |
| Sample pictures and how they are drawn | `design/tanghalan/` (see its README) |

## Not done yet

- **Saving, sharing and printing inside the Android app.** Save downloads a PNG of the ID,
  Share opens the system share sheet where the browser supports it, and Print uses the
  browser's print dialog. The Android WebView supports none of these on its own; it needs
  Capacitor plugins (`@capacitor/filesystem`, `@capacitor/share`, and a print plugin).
- **Hands-Only CPR and Stop the Bleed** are playable in the engine but stay "Coming soon",
  as in the web app. **Nobody Left Behind** doesn't exist yet.
- **CARES is paused for improvement** (October 2026). It keeps its code and shows as a
  "Coming soon" card; its badge shows as "Soon" on the Champion ID, and the daily tips and
  museum works linked to it no longer offer a Play button. To bring it back, remove
  `soon: true` from its entry in `src/data.js`. Duck, Cover, and Hold, paused at the same
  time, is now Quake in Order.
- **Lockdown at School has no before scene yet,** so its before stop shows as Coming soon.
- **TANGHALAN shows sample works.** Real works need parents' consent forms and review
  before they replace the samples.
- **Handaventures and the games are subject for code and content validation,** as their
  info tags say.
- **Not yet tested on a phone.** Everything was checked in Chromium at phone (412×915)
  and tablet (1280×800) sizes, with software WebGL.

## Design source

`project/` and `chats/` hold the Claude Design handoff bundle: the prototype, the bottom
navigation options and the design conversation.
