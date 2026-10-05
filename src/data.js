// Content for the app shell. Copy comes from the original web app; the
// mascot lines, tips and trivia come from the design.

export const AV = [
  { id: 'turtle', e: '🐢', bg: '#cdebe0' }, { id: 'eagle', e: '🦅', bg: '#ffe1c4' }, { id: 'dragon', e: '🐉', bg: '#d9ccf6' }, { id: 'butterfly', e: '🦋', bg: '#ffd9df' },
  { id: 'whale', e: '🐋', bg: '#d6ecff' }, { id: 'frog', e: '🐸', bg: '#e4f0c4' }, { id: 'cat', e: '🐱', bg: '#ffe9b8' }, { id: 'fox', e: '🦊', bg: '#ffd9c4' },
];

export const P = {
  mit: { id: 'mit', name: 'Stop Hazards Early', sub: 'Prevention and Mitigation', icon: '🛡️', text: '#2a6b8f', ring: '#2a6b8f', grad: 'linear-gradient(135deg,#6db4d6,#2a6b8f)', banner: 'linear-gradient(135deg,#3f8fb5,#1f5675)', border: '#bfe0ef', tint: '#e6f3f9', lead: 'Spot dangers before they happen and stop them from turning into disasters.' },
  prep: { id: 'prep', name: 'Get Ready', sub: 'Preparedness', icon: '🎒', text: '#128253', ring: '#128253', grad: 'linear-gradient(135deg,#5fd39b,#128253)', banner: 'linear-gradient(135deg,#1e9c66,#0c5c3a)', border: '#bfe9d4', tint: '#e5f6ee', lead: 'Get your family and your go bag ready before anything happens.' },
  resp: { id: 'resp', name: 'Act Fast', sub: 'Response', icon: '🚨', text: '#b35205', ring: '#e8700b', grad: 'linear-gradient(135deg,#ffb04d,#f2760c)', banner: 'linear-gradient(135deg,#e06a0a,#a84d04)', border: '#ffd9ad', tint: '#fff1e3', lead: 'Learn what to do in the first minutes when a disaster strikes.' },
  rec: { id: 'rec', name: 'Bounce Back', sub: 'Recovery and Rehabilitation', icon: '🏘️', text: '#7a53c6', ring: '#7a53c6', grad: 'linear-gradient(135deg,#c3a6ff,#7a53c6)', banner: 'linear-gradient(135deg,#8c66d9,#5a3a9e)', border: '#ddcdfa', tint: '#f1ebfd', lead: 'After a disaster, help your home and your community bounce back.' },
};

export const PO = ['mit', 'prep', 'resp', 'rec'];

// modes: [icon, name, description]. steps: [number, title, text].
// badgeStars: stars needed for the badge, as scored by the game itself.
export const G = [
  {
    id: 'sapa', p: 'mit', name: 'Guide the Stream', icon: '🏞️', short: 'Open a channel so the creek reaches the sea instead of flooding homes.',
    desc: 'Clear the silt and open a channel so the creek reaches the sea instead of flooding homes. Inspired by Ang Sapa.',
    badge: ['Water Warden', '💧'], modesLabel: 'Pick a puzzle',
    modes: [['🏞️', 'Puzzle 1 · Clear the creek', 'Clear the silt and route the creek past the rock to the sea.'], ['🏠', 'Puzzle 2 · Around the barangay', 'A whole barangay sits in the way. Guide the water safely around it.'], ['💧', 'Puzzle 3 · The blocked culvert', 'The waterway is plugged with silt. Clear it so the creek can flow.']],
    steps: [['1', 'Clear', 'Tap silt and garbage to clear the waterway.'], ['2', 'Build', 'Tap ground to lay a channel from the creek toward the sea.'], ['3', 'Route', 'Guide it around the houses and the rock. Tap a channel again to remove it.'], ['4', 'Let it rain', 'When the channel reaches the sea, release the rain. The water flows out and homes stay dry.']],
    tip: 'Small creeks are branches of the river system. When we block or build over them, the water overflows into homes.',
    note: 'Inspired by the "Ang Sapa" series of Dr. Alfredo Mahar Lagmay of Project NOAH and the UP Resilience Institute. Drag to look around, and pinch or use the plus and minus buttons to zoom.',
    credit: 'Inspired by the Ang Sapa series of Dr. Alfredo Mahar Lagmay (Project NOAH, UP Resilience Institute).',
    remind: 'Keep the waterway open and let the water find its path to the sea.',
  },
  {
    id: 'hazard', p: 'mit', name: 'Hazard Hunt', icon: '🗺️', short: 'Spot the things that turn dangerous in an earthquake or a typhoon.',
    desc: 'Pick a place, then spot the things that turn dangerous in an earthquake or a typhoon, and learn how to fix them.',
    badge: ['Hazard Hunt', '🗺️'], modesLabel: 'Pick a place',
    modes: [['🏠', 'At home', 'Hunt for hazards in the living room, from tall cabinets to overloaded outlets.'], ['🏫', 'At school', 'Hunt for hazards in the classroom, from tall shelves to blocked exits.'], ['🏙️', 'On the street', 'See how the same street changes: something helpful on a calm day can turn risky in a typhoon or a flood.']],
    steps: [['1', 'Look', 'Drag to look around the room. Pinch or use the plus and minus buttons to zoom.'], ['2', 'Tap', 'Tap anything that could be dangerous in an earthquake or a typhoon.'], ['3', 'Learn', 'A card tells you why it is a hazard and how to make it safe.'], ['4', 'Find them all', 'Spot every hazard in the room to finish and earn your badge.']],
    tip: 'Finding and fixing hazards before a disaster is called mitigation. It is one of the smartest ways to keep families and classrooms safe.',
    remind: 'Ask a grown-up to help fix the hazards you found, like tying tall cabinets to the wall.',
  },
  {
    id: 'gobag', p: 'prep', name: 'Go Bag Packing 3D', icon: '🎒', short: 'Grab the right supplies from the room and pack a smart go bag.',
    desc: 'Grab the right supplies from the room and pack a smart go bag.',
    badge: ['Go Bag', '🎒'], modesLabel: 'Pick how you want to play',
    modes: [['🧺', 'On the table', 'All the items are laid out on a table. Good for a first try.'], ['🏗️', 'Messy pile', 'A living room with everything dumped in a heap on the rug. Dig through and pick what matters.'], ['🚪', 'Search the kitchen', 'Harder. Walk around a kitchen with the joystick and open cabinets, drawers, and the fridge to find what you need.']],
    steps: [['1', 'Look', 'Drag to look around the room. Pinch or use the plus and minus buttons to zoom. Tap the top-view button for a view from above.'], ['2', 'Tap', 'Tap an item to learn what it does.'], ['3', 'Pack', 'Pack it or leave it behind.'], ['4', 'Zip', 'Zip up when you are ready.']],
    tip: 'Your bag has limited room, so choose the supplies that matter most.',
    note: 'Drag downward or tap the top-view button for a top view. Pinch or use the plus and minus buttons to zoom.',
    remind: 'Keep your family go bag near the door, and check it with a grown-up every few months.',
  },
  {
    id: 'fire', p: 'resp', name: 'Fire Extinguisher 3D', icon: '🧯', short: 'Pull, Aim, Squeeze, Sweep. Put out the fire the PASS way.',
    desc: 'Pull, Aim, Squeeze, Sweep. Put out the fire the PASS way.',
    badge: ['Fire Out', '🧯'], modesLabel: 'Choose your challenge',
    modes: [['🙂', 'Easy', 'Take your time, and you will never run out of spray.'], ['⏱️', 'Difficult', 'Watch your extinguisher and beat the clock.']],
    stepsTitle: 'Remember PASS',
    steps: [['P', 'Pull', 'Pull the safety pin.'], ['A', 'Aim', 'Aim low, at the base.'], ['S', 'Squeeze', 'Hold the spray button.'], ['S', 'Sweep', 'Sweep side to side.']],
    tip: 'Stand a safe distance away, about two big steps back.',
    note: 'Drag to look and aim. On a computer you can hold the mouse button on the scene to spray, and move the mouse to sweep. Use the side buttons to step nearer or back.',
    remind: 'Only fight a small fire, and only with a clear way out behind you. If the fire is big, spreading, or the room fills with smoke, get out fast, close the door, pull the fire alarm, and call for help.',
  },
  { id: 'nobody', p: 'resp', soon: true, name: 'Nobody Left Behind', icon: '🚪', short: 'Watch a classroom evacuation and notice if anyone is still inside.', badge: ['No One Left', '🚪'] },
  { id: 'bleed', p: 'resp', soon: true, name: 'Stop the Bleed', icon: '🩹', short: 'Put on gloves, cover the wound, then press hard to stop the bleeding.', badge: ['Stop Bleed', '🩹'] },
  { id: 'cpr', p: 'resp', soon: true, name: 'Hands-Only CPR', icon: '💓', short: 'Call for help, then push hard and fast on the chest in time with the beat.', badge: ['CPR Hero', '❤️'] },
  {
    id: 'quake', p: 'resp', name: 'Duck, Cover, and Hold', icon: '🏗️', short: 'Watch the coach, then copy the moves: drop, cover, hold on, walk out.',
    desc: 'Watch the coach, then copy the moves: drop, cover under the sturdy table, hold on, then walk out.',
    badge: ['Quake Ready', '🏗️'], badgeStars: 2,
    steps: [['1', 'Watch the coach', 'The coach shows you a move, then adds another each round: drop, cover, hold on, walk out.'], ['2', 'Copy the moves', 'Tap the same moves back in the same order using the Drop, Cover, Hold on, and Walk out buttons.'], ['3', 'Keep the order right', 'Drop first, then cover under the sturdy table, hold on until the shaking stops, and only then walk out.'], ['4', 'Learn it by heart', 'Each round is a little faster, so the right order sticks in your memory.']],
    tip: 'Try it with your whole body too. When the coach drops, covers, and holds, copy the move yourself.',
    note: 'Practicing the drill this way makes the right moves automatic when a real earthquake comes.',
    start: 'Start the drill',
    remind: 'In a real earthquake, hold on under a sturdy table until the shaking stops. Then walk out calmly.',
  },
  {
    id: 'path', p: 'resp', name: 'Safe Path', icon: '🧭', short: 'Move tile by tile to the evacuation area, away from danger.',
    desc: 'Move tile by tile to the evacuation area, keeping away from coasts, trees, poles, and buildings when a hazard strikes.',
    badge: ['Safe Path', '🧭'], modesLabel: 'Pick a level',
    modes: [['✏️', 'Level 1 · Trace the route', 'Draw a line from your home to the evacuation tent, around houses, trees, and water.'], ['🎲', 'Level 2 · Tile escape', 'Step tile by tile and roll the die. Stay clear of coasts, trees, poles, and buildings when a hazard strikes.'], ['⛰️', 'Level 3 · High ground', 'Roll the early warning first, then climb this topographic map to safe, high ground away from floods, surge, and landslides.']],
    // Each level is its own game in the engine, with its own how-to.
    byMode: [
      {
        steps: [['1', 'Start at home', 'Your route begins at the yellow home tile.'], ['2', 'Drag a line', 'Drag your finger to nearby tiles to draw the path.'], ['3', 'Go around', 'You cannot cross houses, trees, or water. Go around them.'], ['4', 'Reach the tent', 'End at the green evacuation tent. Shorter routes earn more stars.']],
        tip: 'You cannot cross houses, trees, or water. Go around them.',
        note: 'Drag back along your line to undo. Use Clear route to start over. Pinch or use the buttons to zoom.',
      },
      {
        steps: [['1', 'Move', 'Tap a tile next to you to step there.'], ['2', 'Roll', 'Roll the die. It may bring an earthquake or typhoon.'], ['3', 'Stay safe', 'Keep off tiles near coasts, trees, poles, and buildings.'], ['4', 'Reach', 'Get to the green evacuation tent, safe and quick.']],
        tip: 'Orange warning markers show risky tiles. If a hazard strikes while you stand on one, you lose a heart.',
        note: 'Drag to look around the map. Pinch or use the plus and minus buttons to zoom, and tap the eye to reveal a safe route.',
      },
      {
        steps: [['1', 'Warning first', 'Roll the die to get the next early warning.'], ['2', 'Read the map', 'Green rings are safe. Red rings are in danger from that warning.'], ['3', 'Move to safety', 'Step onto a safe tile and climb away from the low coast.'], ['4', 'Reach the shelter', 'Get to the evacuation shelter on the high ground.']],
        tip: 'Tsunami and storm surge flood low ground, so go high.',
        note: 'Thunderstorms strike tall trees, poles, and the exposed peak. Heavy rain can trigger landslides on steep slopes. Higher, browner tiles are higher ground.',
      },
    ],
    next: 'Next level',
    remind: 'Know where your evacuation area is, and walk the route with your family before a disaster comes.',
  },
  {
    id: 'cleanup', p: 'rec', name: 'House Cleanup', icon: '🧹', short: 'Clean up safely after a flood or a typhoon, and sort the waste.',
    desc: 'Clean up safely after a flood inside the house or a typhoon outside. Decide what to keep, what to throw, and what is too dangerous to touch, then sort the waste into the right bin.',
    badge: ['Cleanup Crew', '🧹'], modesLabel: 'Pick a cleanup',
    modes: [['🌊', 'After a flood', 'Clean up inside the house. Watch for dirty floodwater and wet electricity.'], ['🌀', 'After a typhoon', 'Clear the yard outside. Watch for fallen wires and sharp debris.']],
    steps: [['1', 'Stay safe first', 'Switch off the main power at the fusebox, then open the tools box for your gloves and boots.'], ['2', 'Drag to clean', 'Press and drag an item across the scene to where it belongs.'], ['3', 'Sort the waste', 'Drag trash into the right bin: biodegradable, recyclable, or special.'], ['4', 'Keep the good things', 'Drag things you can wash and reuse to the Keep box.'], ['5', 'Do not touch hazards', 'Never drag a hazard. Tap it once to report it to an adult. Drag on empty ground to look around.']],
    tip: 'Never touch fallen wires, wet outlets, dirty floodwater, or broken glass.',
    next: 'Other cleanup',
    remind: 'Green bin is biodegradable, blue bin is recyclable, and red bin is hazardous or special waste.',
  },
  {
    id: 'cares', p: 'rec', name: 'CARES: Community and Resilience', icon: '🏘️', short: 'Build a community by a stream, protect it, then simulate a flood.',
    desc: 'Build a community beside a stream, reach your population goal, and add green and gray protection. Then pick a hazard and simulate: water flows to the lowest ground, so see whose homes stay safe.',
    badge: ['Community Builder', '🏘️'], modesLabel: 'Pick a map',
    modes: [['🌊', 'River in the lowlands', 'A river runs along the low ground. Build up on the high ground and keep back from the water.'], ['💧', 'River on one side', 'The river runs down the west side. The safe high ground is across to the east.'], ['🏔️', 'Valley in the middle', 'A stream cuts a valley down the middle. High ground rises on both sides.'], ['🐌', 'The river bend', 'The river bends around a corner. The safe high ground is the far side, away from the bend.']],
    steps: [['1', 'Build', 'Tap the ground to place houses. Reach your people goal. Build on high ground, not on the low land by the stream.'], ['2', 'Protect', 'Add green protection like trees, mangroves, and a retention pond, and gray protection like dikes, canals, and pumps.'], ['3', 'Choose a hazard', 'Pick a flood or a stronger storm at the top.'], ['4', 'Simulate', 'Press Simulate. Water settles in the lowest ground first, so see whose homes stay dry.']],
    tip: 'Green infrastructure works with nature to soak up and slow water, while gray infrastructure blocks or moves it. The strongest communities use both.',
    note: 'Water always flows downhill and pools in low places.',
    next: 'Next map',
    remind: 'Water always flows downhill and pools in low places. Keep the waterway clear.',
  },
];

export const LIVE = G.filter((g) => !g.soon);

// Champion ID badge order, as on the web app's scorecard.
export const BADGES = ['hazard', 'gobag', 'fire', 'nobody', 'bleed', 'cpr', 'quake', 'path', 'cares', 'cleanup', 'sapa'];

export const RANKS = [[0, 'Getting Ready'], [1, 'Rising Champion'], [2, 'Junior Champion'], [4, 'DRRM Champion'], [6, 'Master DRRM Champion']];

export const TIPS = [
  ['Pack a flashlight in your go bag. If the lights go out, you can still find your way.', 'gobag'],
  ['When the ground shakes: drop, cover, and hold on. Walk out only when the shaking stops.', 'quake'],
  ['Only fight a small fire, and only with a clear way out behind you.', 'fire'],
  ['Tall cabinets can tip over in an earthquake. Ask a grown-up to tie them to the wall.', 'hazard'],
  ['After a flood, never touch wet outlets or fallen wires. Tell an adult right away.', 'cleanup'],
  ['Know where your evacuation area is, and walk the route with your family.', 'path'],
  ['Trash in creeks blocks the water. Keep waterways clear so homes stay dry.', 'sapa'],
  ['Trees and mangroves soak up and slow down water. Strong communities use green and gray protection.', 'cares'],
];

export const TRIVIA = [
  ['Bayanihan is the spirit of neighbors helping neighbors. Long ago, a whole barangay would lift a family\'s house together and carry it to a new spot!', null],
  ['BAYANIHanda plays on three Filipino words: bayani, a hero; handa, meaning ready; and bayanihan, neighbors helping neighbors.', null],
  ['PASS is how you use a fire extinguisher: Pull, Aim, Squeeze, Sweep.', 'fire'],
  ['Mangrove roots are like a green wall by the sea. They slow down big waves and storm surge.', 'cares'],
  ['Water always flows downhill and pools in the lowest places. Homes on high ground stay drier in a flood.', 'cares'],
  ['Small creeks are branches of the river system. When we block them, the water overflows into homes.', 'sapa'],
  ['Tsunami and storm surge flood low ground, so the safest place to go is high ground.', 'path'],
  ['Finding and fixing hazards before a disaster is called mitigation.', 'hazard'],
];

export const LEAD = 'Edward Andrew A. Dionido, Lead Science Research Specialist II, UP Resilience Institute. Built with the assistance of AI.';

export const MAX_PLAYERS = 10;

export const av = (id) => AV.find((a) => a.id === id) || AV[0];
export const game = (id) => G.find((g) => g.id === id) || G[0];
export const pillarOf = (g) => P[g.p] || P.mit;

// Steps, tip and note for a game in a given mode (Safe Path differs per level).
export function howTo(g, mode) {
  const m = (g.byMode && g.byMode[mode]) || {};
  return { steps: m.steps || g.steps || [], tip: m.tip || g.tip || '', note: m.note || g.note || '' };
}

export function rankOf(count) {
  let r = RANKS[0];
  RANKS.forEach((x) => { if (count >= x[0]) r = x; });
  return r;
}

export function nextRank(count) {
  const n = RANKS.find((x) => x[0] > count);
  return n ? { need: n[0] - count, name: n[1], min: n[0] } : null;
}
