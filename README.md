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
npm run test:games     # check the order games (their rules, and the way the library shows them)
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

Weather Studio records the player's voice (after a grown-up's OK), so after `npx cap add android` add the microphone
permission to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

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
| Games in a frame | `games/`, `scripts/build-games.mjs`, `src/screens/GameFrame.jsx` | Games that are pages of their own: the order games (Quake in Order, Heart in Order and Press On), and the test games Weather Studio, Handa vs. Hazard and Bayanihan Mode (below). |
| Island tour | `tour/`, `scripts/build-tour.mjs`, `src/screens/Tour.jsx`, `src/tour.js` | Bayani's 3D island tour of the library, and the presenter's tour for pitches (below). |

To pick up a newer version of the web app, replace the file in `project/uploads/` and
run `npm run extract-engine`. The bridge relies on the engine's element ids, on
`window.BYANI.App`, and on the game objects it exposes (`FireGame`, `GoBag`, …).

Players and badges use the web app's own storage keys (`bayanihanda_players_v1`,
`bayanihanda_badges_v1::<player>`), so progress carries over. The details a grown-up adds
when making a player (the birthday, the grown-up and their consent) are kept beside them in
`bayanihanda_profiles_v1` (`src/profiles.js`; see "Players, ages and grown-ups" below).
Champion ID names and photos stay in memory only, as the app's privacy note promises.

### Fix to the original engine

Duck, Cover, and Hold never started in the web app ("3D view is not available on this
device"), because `QuakeGame` calls a `_label` helper it doesn't define. The bridge
lends it Hazard Hunt's identical helper at startup (`applyEngineFixes` in
`src/engine/bridge.js`), so `public/engine/games.js` stays an exact copy. Since October
2026 the library shows Quake in Order in its place (below); the drill's code stays in
the engine.

The same function redraws the two 3D first aid kits (October 2026). The web app drew the
kits in Go Bag Packing 3D and Hazard Hunt with a red cross, an emblem the Philippines
protects for the Red Cross (RA 10530, which also covers look-alikes). The bridge wraps
`GoBag._make` and `HazardHunt._prop` so both kits come out as the first aid sign instead,
a white cross on green (ISO 7010 E003), as in the order games.

## Players, ages and grown-ups

Since October 2026 a player has a birthday and a grown-up, and the games carry age labels
(EA's call).

- **The new player page** asks for the avatar and nickname, the birthday (the month and day
  picked from lists, the year typed in, any year from 1900 to this year), and a part for the
  grown-up: who is setting up the player (a parent or guardian, or a teacher), their name,
  the school for a teacher, a short privacy notice and a consent box (the Data Privacy Act
  of 2012, RA 10173). "Let's play" turns on once everything is filled in, and the page lists
  what is still missing. A year that is too short, out of range or makes a day that has not
  come yet gets a short note on what to fix. The next new player starts with the same
  grown-up, so a teacher can set up a class quickly; the consent box is ticked for each
  child.
- **Grown-ups can play too** (EA's call, October 2026). When the birthday shows a player is
  18 or older (the age of majority in the Philippines), the grown-up part turns into "Your
  privacy": the same notice in the player's own words and their own consent ("I am 18 or
  older..."). No parent, guardian or teacher is asked for or kept, and every game and level
  is open with no grown-up check. The consent records who gave it (`by: 'grownup'` or
  `'self'`); if the birthday is changed between a child's and a grown-up's, the box has to
  be ticked again by the right person.
- **On this device only.** The details live in `bayanihanda_profiles_v1`
  (`src/profiles.js`) and are never sent anywhere. Edit players shows and changes them
  (with the day the consent was given), and removing a player deletes them.
- **Players made before this** are asked once, when picked, to have a grown-up fill in the
  details ("Fill it in now" or "Later"). Until then they carry "Add details" on the players
  screen, can still be renamed without the grown-up part, and only the levels for ages 10
  to 15 ask for a grown-up.
- **Age labels** (`AGE`, `ageOf` and `agesOf` in `src/data.js`): every game and story is for
  ages 6 to 10 (yellow), and the Difficult level of the games with Easy and Difficult (Fire
  Extinguisher 3D, Quake in Order, Heart in Order and Press On, `levelAges` on each) is for
  ages 10 to 15 (pink). The labels show on the game cards, the game intros and each level,
  the story intros and the story shelf. A label carries 👪 when the player is younger than
  it (`src/ui/age.jsx`).
- **A grown-up plays along.** When a player is younger than a level's label (under 10 on
  Difficult, under 6 on anything), Start shows "Play with a grown-up": a grown-up answers
  a times-table question to start, or a Difficult level can be played at Easy instead. A
  passed check holds for that player until the app is closed (`grownUpOk` in
  `src/Shell.jsx`, `SuperviseSheet` in `src/screens/GrownUps.jsx`).

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
during and after a hazard). Each pillar's list on Games then ends with a Handaventures card
for the part of the stories that belongs to that pillar.

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
- **The card has a carousel,** like the museum card: scenes from the stories, a different
  five each day, each marked Before, During or After with the story's name. It moves on by
  itself every few seconds (not with reduced motion, and never while someone is using it),
  and it can be swiped. Tapping a picture opens that story's intro, and Back returns to the
  card. The pictures are in `public/stories/peek/`, taken from the stories themselves by
  `design/handaventures/peeks.cjs` (see its README); their order is `HV_PEEKS` in
  `src/data.js`. Lockdown at School stays out of the carousel, since it is a story to play
  with a grown-up first.
- **A card in each pillar.** After the games in each pillar on Games comes a Handaventures
  card for the part of the stories that belongs to that pillar, with what each story
  teaches there, hazard by hazard. Stop Hazards Early has the Before part where you spot
  dangers (things that could fall, a warm cord with too many plugs, loose things the wind
  could throw); Get Ready has the Before part where the family gets ready (the news, the go
  bag, moving things up high); Act Fast has the During part of every story; Bounce Back has
  the After part of every story. The card opens the shelf. Its lines are `HV_PILLAR` in
  `src/data.js`, and the pillar counts on Home still count games only.
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
| Pictures for the card's carousel | `public/stories/peek/`, made by `design/handaventures/peeks.cjs` |
| Storybook card, the card in each pillar, shelf, intro, story frame | `src/screens/Stories.jsx` (the carousel itself is `src/ui/reel.jsx`, shared with TANGHALAN) |
| Story list, badges, endings, tips, before, during and after | `STORIES`, `HV` and `JOURNEY` in `src/data.js` |
| The part of the stories in each pillar, the carousel's pictures | `HV_PILLAR` and `HV_PEEKS` in `src/data.js` |
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

## The order games: Quake in Order, Heart in Order and Press On

Three games under Act Fast share one engine. The player puts the steps of a response in order, taps Simulate,
and a 3D scene acts out exactly that order. Each step is graded safe, could be better, or not safe, with the
reason; See it done right plays the right order. Each game has two levels, picked on the library's intro.

- **Quake in Order** takes the place of the paused Duck, Cover, and Hold drill. It is math class and the ground
  starts to shake. *Easy*: duck, cover and hold, while Tonton, who sits nearest the door, opens it; the game
  repeats that whoever sits nearest the door opens it first. *Difficult*: the player's own seat is next to the
  door, so the seven steps are open the door, duck, cover, hold, wait, walk out, and line up at the open field.
  The door jams if no one opened it, the desk slides if no one holds on, and the teacher counts everyone at the
  field.
- **Heart in Order** (CPR) and **Press On** (bleeding control) bring back the paused first aid games. Both happen
  in a first aid class, on Manny the practice manikin and on a practice arm with a pretend cut, so no one is hurt
  and no blood is shown. *Easy* follows Check, Call, Compress (CPR) and Alert, Bleeding, Compress (bleeding), for
  younger players. *Difficult* has seven steps each, from looking around first (water near a plugged-in fan;
  broken glass) to keeping going until help takes over. Where first aid courses differ, both orders count as
  right: calling 911 before or after checking breathing, and gloves before or after the call. After a round, a
  hands-on practice: push to the beat (100 to 120 a minute), or press and hold for 10 seconds.
- **Gentle outcomes.** A not safe step is explained and can be retried; nothing shows anyone hurt. Nurse Lea steps
  in when someone goes near before looking around.
- **The badge.** A round where every step is safe, with the player's own order, earns the game's badge at either
  level: Quake Ready, CPR Hero, Bleeding Stopper.
- **In the library** each opens like the other games (card, intro with the level, Start) and plays in a frame as
  `games/<game>.html?embed=1&level=easy|hard&sound=0|1`: the library's Engaging look, a back button and a Done
  button that return to the intro, and nothing kept on the device by itself. It tells the library when a round
  ends, what Bayani should read aloud and when the player leaves (`postMessage` with `source: 'bayani-game'`:
  `result`, `say`, `hush`, `exit`).
- **No 3D on the device?** They still play, with drawings in place of the scene.
- **On their own** (`npm run test:games` writes `games/standalone/Quake-in-Order.html`, `Heart-in-Order.html` and
  `Press-On.html`), each is one file with everything inside, a level picker, and a switch between the Engaging
  and Minimalist looks, for review and sharing.

| Part | Where |
| --- | --- |
| The engine: screens, ordering, simulation player, results, practice, library link | `games/shared/core.js`, `core.css`, `template.html` |
| 3D helpers (shapes, figures, poses, tracks, camera, labels) | `games/shared/kit3d.js` |
| The first aid classroom (Nurse Lea, the class, signs, the AED) | `games/shared/aidroom.js` |
| Each game: words, steps, levels, rules, scene, pictures | `games/quake-in-order/game.js`, `games/heart-in-order/game.js`, `games/press-on/game.js` |
| Build | `scripts/build-games.mjs` writes `public/games/` (every `npm run dev` and `npm run build`; not committed) |
| Cards, intros, levels, badges | the `quake`, `cpr` and `bleed` entries in `src/data.js` (`frame:` and `frameModes:`) |
| Frame | `src/screens/GameFrame.jsx`, `startGame` and `gameEnded` in `src/Shell.jsx` |
| Tests | `games/tests/` (`npm run test:games`): every order of every level, the library flow, the single files |

The first aid scenes use the green first aid sign (a white cross on green), never the red cross, which RA 10530
protects. "Stop the Bleed" is a trademark of the US Department of Defense, so the bleeding game has a name of its
own.

## Weather Studio, a test game

A weather desk for kids under Get Ready, added in October 2026 as a **test game**: its card and intro carry a
purple 🧪 TEST GAME label (`test: true` in `src/data.js`, `TestChip` in `src/ui/age.jsx`), and it stays out of the
badge count and ranks (`LIVE`) until it is final. The name is a working title.

- **One preset forecast and one preset flood map.** Friday, 6 PM: Bayani's forecast (Bagyong Kulog 300 km away,
  Signal No. 1). Saturday, 8 AM: the player's own news, from which they work out Signal No. 2 and an orange rain
  warning. Then a flood hazard map of a made-up Barangay Handa, colored the UP NOAH way (yellow low, orange
  medium, red high, no color), then the safety tips, then the player reads the forecast on air from a cue card
  written from their own picks.
- **Two levels.** *Easy* (ages 6 to 10): Signals 1 to 3 in plain words, the rain colors as be alert, be prepared
  and take action, then which color means high, three places to check, and the safer place for families.
  *Difficult* (ages 10 to 15): all five signals with lead times and wind speeds (PAGASA), the rain amounts per
  color, what a 100-year rain means, sorting four places by hazard with no hints, the safest of three roads, and
  why the riverside is red. The map's colors and its right answers come from the same numbers.
- **Voice.** Bayani reads the forecast with the device's own voices only, so nothing is sent out to be spoken.
  The Android WebView has no speech, so there it shows captions.
- **Recording** needs a grown-up's OK (a times-table question), stays in memory on the device, and is gone on
  delete or when the game closes. Where the microphone is not available, Present offers practice out loud or a
  clip from the phone's recorder app. The Android app needs the microphone permission for this (below).
- **In the library** it plays in a frame like the order games, as
  `games/weather-studio.html?embed=1&level=easy|hard&sound=0|1&voice=0|1&name=...` (`frameName` on its entry
  passes the voice setting and the nickname). It opens at Watch, and Bayani waits for Play, since the frame has
  had no tap yet. Back from Watch and "Back to the library" send `exit`. The library's grown-up check runs before
  a younger player starts Difficult, so the game skips its own.
- **On its own** (`npm run test:games` writes `games/standalone/Weather-Studio.html`) it opens at a title screen
  with a level picker, and asks a grown-up before Difficult.

| Part | Where |
| --- | --- |
| The game, one page | `games/weather-studio/page.html` (the build fills in the fonts at `<!--@FONTS-->` and the credits icon at `<!--@PEOPLE-->`) |
| Build | `PAGES` in `scripts/build-games.mjs` writes `public/games/weather-studio.html` (not committed) |
| Card, intro, levels | the `weather` entry in `src/data.js` |
| Tests | `games/tests/weather-studio.test.cjs` (`npm run test:games`): both levels to the end, the library link, the map's zones |

## Handa vs. Hazard, a test card game

A digital card game for ages 6 to 15, added in October 2026 as a **test game**, with the same 🧪 TEST GAME label
as Weather Studio: it stays out of the badge count and ranks until it is final. Hazard cards stack and grow
stronger, and the player stacks Before, During and After cards to match them.

- **A round.** A hazard arrives at level 1. The player picks 2 of 4 supply cards, plays Before cards, and taps
  Ready for the storm update: another card of the same hazard stacks it one level higher (3 at most), and a
  different hazard goes to the early warning and comes next. Then During cards, and the hazard hits. If the
  player's Handa (Before plus During cards) matches its level, no home is hurt and the player earns a star; if
  not, as many homes are damaged as the Handa is short by. After cards fix damaged homes, or earn a star when
  none needs fixing. Bayanihan cards count +1 for any hazard at any step, and a hand keeps up to 8 cards between
  rounds.
- **Two levels.** *Easy* (ages 6 to 10): typhoon, flood, earthquake and fire in five rounds, one storm update a
  round, and the cards that fit glow. *Difficult* (ages 10 to 15): landslides and storm surges join in, six
  rounds, two storm updates a round, no hints, and real scales for the levels: PAGASA's wind signals for
  typhoons, PAGASA's yellow, orange and red rainfall warnings for floods, and the PHIVOLCS Earthquake Intensity
  Scale (V Strong, VI Very Strong, VII Destructive) for earthquakes.
- **Under all four pillars.** The game has Before, During and After cards, so it belongs to every pillar. Its
  entry lists them (`pillars: ['mit', 'prep', 'resp', 'rec']`) and gives the card a line of its own under each
  one (`byPillar`): Before cards that remove dangers under Stop Hazards Early, Before cards that get you ready
  under Get Ready, During cards under Act Fast, and After cards under Bounce Back. Games, Home and the teacher's
  corner list games with `inPillar(g, pid)` from `src/data.js`; a game with no `pillars` stays under its one
  pillar (`p`). The intro says "All four pillars". Home's pillar cards count it as a game, while their badge
  rings count only the games that earn a badge.
- **Voice.** In the library, the library reads Bayani's lines aloud (the game sends `say`, and `hush` to stop),
  since a frame has had no tap of its own and a phone would stay silent for the first line. `frameVoice` on its
  entry passes the voice setting, so with Bayani's voice off a line is read only when the speaker button is
  tapped. On its own, the game speaks with the device's own voices only.
- **In the library** it plays in a frame as `games/handa-vs-hazard.html?embed=1&level=easy|hard&sound=0|1&voice=0|1`
  and opens at round 1. Back and "Back to the library" on the end screen send `exit`. The library's grown-up
  check runs before a younger player starts Difficult, so the game skips its own. It asks for no names and keeps
  nothing on the device.
- **On its own** (`npm run test:games` writes `games/standalone/Handa-vs-Hazard.html`) it opens at a title screen
  with a level picker, and asks a grown-up before Difficult.

| Part | Where |
| --- | --- |
| The game, one page | `games/handa-vs-hazard/page.html` (the build fills in the fonts at `<!--@FONTS-->` and the credits icon at `<!--@PEOPLE-->`) |
| Build | `PAGES` in `scripts/build-games.mjs` writes `public/games/handa-vs-hazard.html` (not committed) |
| Card, intro, levels, pillars, credits | the `cards` entry in `src/data.js` (`pillars`, `byPillar`, `credits: CREDITS_CARDS`) |
| Tests | `games/tests/handa-vs-hazard.test.cjs` (`npm run test:games`): both levels to the end, 36 seasons on fixed seeds that check the stacking and damage rules, the library's voice, Back, and the title screen on its own |

## Bayanihan Mode, a test game for 2 to 4 players

Handa vs. Hazard for a group on one phone, added in October 2026 as a **test game** with the same 🧪 TEST GAME label:
it stays out of the badge count and ranks until it is final. Bayanihan Mode is a working title. It uses the same
cards as Handa vs. Hazard, in the library's own look (the sky background, white cards, Baloo 2 and Nunito, the pillar
colors and Bayani).

- **Setup.** 2 to 4 players type a nickname each (inside the library, the player's own nickname is the first one)
  and pick how to play: *All together*, one barangay with 6 homes and one shared Handa, or *Teams*, Team Agila and
  Team Kalabaw with 3 homes each, for 2 or 4 players. Names stay in the page's memory for one game and are never
  saved.
- **A round.** The phone is passed around, and a "Pass the phone to Ana" screen hides each hand between turns. On a
  Before turn a player takes 1 supply card, then may play 1 card that fits and give 1 card to another player. The
  storm update turns over two hazard cards (a matching one stacks the hazard, 3 at most; another hazard goes to the
  early warning). During turns follow, then the hazard hits, then After turns, where After cards fix damaged homes or
  earn a star. A season is 4 rounds, and the first player moves along each round.
- **A bigger group needs more Handa.** A side needs the hazard's level times its players, divided by 2 and rounded
  up; a side that is short loses that many homes, at most the hazard's level. In Teams, giving a card to the other
  team earns your team a star; more safe homes wins, stars break a tie, and an even game is "Both teams win!"
- **Balance.** `node games/bayanihan-mode/balance.cjs` plays thousands of seeded seasons. With the numbers in
  `engine.js` (`LV` and `SET`), careful players keep every home safe in about 95% of Easy seasons and 65 to 80% of
  Difficult ones, and a young player who picks at random earns the top badge in about 55 to 65% of Easy seasons.
- **The end.** A barangay badge (Handa Hero, Ready Barangay or Keep Practicing) or the winning team, a helper badge for
  every player (Best Helper, Fixer, Quick Responder or Early Bird), and what to remember for each hazard faced.
- **Under all four pillars,** like Handa vs. Hazard, with a line of its own under each (`byPillar`).
- **In the library** it plays in a frame as
  `games/bayanihan-mode.html?embed=1&level=easy|hard&sound=0|1&voice=0|1&name=...` (`frameName` on its entry). The
  level comes from the library's intro, so the game shows no level picker, and the library's grown-up check runs
  before a younger player starts Difficult. The library reads Bayani's lines aloud (`say` and `hush`). Back on the
  setup and "Back to the library" at the end send `exit`.
- **On its own** (`npm run test:games` writes `games/standalone/Bayanihan-Mode.html`) it opens at its own setup with a
  banner and a level picker, and asks a grown-up before Difficult.

| Part | Where |
| --- | --- |
| The game, one page | `games/bayanihan-mode/page.html` (the build fills in the fonts at `<!--@FONTS-->`, the credits icon at `<!--@PEOPLE-->` and the rules from `engine.js`) |
| The rules | `games/bayanihan-mode/engine.js`, plain ES5 and seeded, shared by the page, the tests and `balance.cjs` |
| Build | `PAGES` in `scripts/build-games.mjs` (its `scripts` field fills the rules slot) writes `public/games/bayanihan-mode.html` (not committed) |
| Card, intro, levels, pillars, credits | the `bayanihan` entry in `src/data.js` |
| Tests | `games/tests/bayanihan-mode.test.cjs` (`npm run test:games`): 400 seasons on the rules, whole games in the library's copy all together and in teams, and the single file |

## Credits on the info tags

Every game's info tag (the **i** button) starts with the notice **Subject for code and
content validation**, then says who made it:

- Games and features: *Conceptualized and developed with AI assistance by* Edward Andrew
  A. Dionido, Science Research Specialist II, UPRI.
- Handaventures: *Concept by* Celine Tatco, Senior Project Associate, UPRI, and
  *Developed with AI assistance by* Edward Andrew A. Dionido, Science Research
  Specialist II, UPRI.
- Handa vs. Hazard: *Concept by* Edward Andrew A. Dionido, Science Research Specialist
  II, UPRI, and Celine Tatco, Senior Project Associate, UPRI, and *Developed with AI
  assistance by* Edward Andrew A. Dionido, Science Research Specialist II, UPRI. The
  game's own About sheet says the same. Bayanihan Mode carries the same credits.

The texts are in `src/data.js` (`VALIDATION`, `CREDITS_LIBRARY`, `CREDITS_HV`,
`CREDITS_CARDS`). A game with credits of its own carries them on its entry (`credits:`),
and a block with no label adds one more person under the label above it. Behind
BAYANIHanda in Settings shows the library's credit.

**Other affiliations.** Wherever Edward Andrew A. Dionido's name appears in the credits (every
info tag, Behind BAYANIHanda, the About sheets of the order games, Weather Studio, Handa vs.
Hazard and Bayanihan Mode, and the presenter's tour script), a small cap icon beside it shows his
other affiliation when tapped: MS Environmental Science (Ongoing), College of Professional and
Graduate Studies, De La Salle University Dasmariñas. Tapping it again hides it. Other
affiliations are listed once, by name, in `games/shared/people.json`. The app shell reads that
file (`PEOPLE` in `src/data.js`), and the builds put it, with `games/shared/people.js`, into
every game page and the tour at `<!--@PEOPLE-->`. To give another person the icon, or to update
a line when a degree is finished, change only that file.

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
  The carousel itself is `src/ui/reel.jsx`, which the Handaventures card uses too.

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
- **The engine's Hands-Only CPR and Stop the Bleed** stay in its code. Since October 2026
  the library shows Heart in Order and Press On in their place (above). **Nobody Left
  Behind** doesn't exist yet.
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
- **The privacy notice and consent wording** need a review by UP's data protection office
  before the library is used with classes.
- **Play time limits** (rest reminders and a daily limit by age) are planned, using the
  players' birthdays.
- **Weather Studio is a test game.** It needs EA's review and a pilot test, a final name,
  and a check of its PAGASA and UP NOAH wording by the validators. On Android it has no
  voice (the WebView has no speech) and needs the microphone permission above. Its badge
  does not count until the Test Game label comes off.
- **Handa vs. Hazard is a test game.** It needs a review by EA and Celine Tatco, a pilot
  test with players, and a check of its card advice and its PAGASA and PHIVOLCS wording by
  the validators. On Android, Bayani's lines show in his speech bubble with no voice (the
  WebView has no speech). Its badge does not count until the Test Game label comes off.
- **Bayanihan Mode is a test game,** with a working title. It needs the same review as Handa
  vs. Hazard, and a pilot with groups of 2 to 4 players to check how long turns take and
  whether the balance feels right.
- **Not yet tested on a phone.** Everything was checked in Chromium at phone (412×915)
  and tablet (1280×800) sizes, with software WebGL.

## Design source

`project/` and `chats/` hold the Claude Design handoff bundle: the prototype, the bottom
navigation options and the design conversation.
