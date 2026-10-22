# Handaventures design sources

Handaventures is the story series of the game library (`stories/`, `src/screens/Stories.jsx`).
This folder holds what makes the pictures for its card on Home and Games.

| File | What it is |
| --- | --- |
| `peeks.cjs` | Takes the pictures for the carousel on the Handaventures card: one scene for each stop (before, during and after) of Bagyong Kulog, Bagyong Agos, The Big Shake and Smoke at Night, in cartoon style, and writes them to `public/stories/peek/<story>-<stop>.webp` (WebP, 640 x 360). It plays each story along its hero path, as the story tests do, and saves the scene at a chosen line without the scene's corner labels and frame (the card draws its own). |

Lockdown at School stays out of the carousel on purpose. It is a story to preview and play
with a grown-up first, so its pictures should not turn up by themselves on Home.

To take the pictures, from the repository root, after `npm install` and with Playwright's
Chromium installed (`npm i -D playwright && npx playwright install chromium`):

```sh
node scripts/build-stories.mjs --standalone   # the stories as single files (npm run test:stories does this too)
node design/handaventures/peeks.cjs           # the pictures for the card
```

Run `peeks.cjs` again after a story's scenes change, so the card shows the stories as they
are. Each story's entry in `SHOTS` (in `peeks.cjs`) names the hero path to play and, for
each stop, the scene, the part of the scene (`choose` or `feedback`) and how many lines in
to take the picture.

The order the pictures appear in is `HV_PEEKS` in `src/data.js`. The card shows five a day,
and the order takes turns between the stories and the stops, so any five in a row cover
before, during and after.
