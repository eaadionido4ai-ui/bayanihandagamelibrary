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

// Info tags (the i buttons and Credits). Every tag shows the validation notice, then
// blocks of [label, name, position, office].
export const VALIDATION = 'Subject for code and content validation';
const EA = ['Edward Andrew A. Dionido', 'Science Research Specialist II', 'UPRI'];
export const CREDITS_LIBRARY = [['Conceptualized and developed with AI assistance by', ...EA]];
export const CREDITS_HV = [['Concept by', 'Celine Tatco', 'Senior Project Associate', 'UPRI'], ['Developed with AI assistance by', ...EA]];

// Handaventures: five choose-your-path stories that take a hazard from before, through during, to after.
// They have a place of their own, like TANGHALAN: a card on Home below the four pillars and a tile on Games,
// so the pillars hold only their standalone games. They open from that storybook card, play in a frame
// (public/stories/, built from stories/ by scripts/build-stories.mjs), and the Hero ending earns the story's
// badge. sid is the story's own id inside the engine. journey: what the story covers before, during and
// after its hazard (null where the story has no scene yet).
export const HV = {
  id: 'hv', name: 'Handaventures', icon: '📖', tagline: 'Be ready for anything.',
  short: 'Choose-your-path stories about what to do before, during and after a hazard. Every choice changes the ending.',
};
export const JOURNEY = [['before', 'Before'], ['during', 'During'], ['after', 'After']];
const story = (o) => ({ series: 'hv', ...o });
export const STORIES = [
  story({
    id: 'hv-kulog', sid: 'typhoon', file: 'bagyong-kulog.html', art: 'kulog', name: 'Bagyong Kulog', icon: '🌀', hazard: 'Typhoon',
    short: 'A typhoon is heading to your town. Help your family get ready before it arrives.',
    desc: 'A typhoon named Bagyong Kulog is heading to your town. Talk with your family, make choices, and see what happens.',
    badge: ['Storm Hero', '🌀'],
    journey: { before: 'Hear the news, pack the go bag and get the house ready.', during: 'Stay safe inside through the brownout and the strong winds.', after: 'Stay away from a fallen wire the morning after.' },
    endings: [['hero', 'Typhoon Ready Hero', '⭐'], ['safe', 'Safe and Sound', '🏠'], ['lucky', 'Lucky Night', '🍀'], ['eye', 'Caught in the Eye', '🌀']],
    tip: 'A sunny morning can fool you. Typhoons can arrive fast, and getting ready takes time.',
  }),
  story({
    id: 'hv-agos', sid: 'flood', file: 'bagyong-agos.html', art: 'agos', name: 'Bagyong Agos', icon: '🌊', hazard: 'Flood',
    short: 'Heavy rain and a rising creek. Decide when to move things up and when to go.',
    desc: 'Bagyong Agos is bringing heavy rain, and your house is near a creek. Talk with your family, make choices, and see what happens when the water rises.',
    badge: ['Flood Hero', '🌊'],
    journey: { before: 'Move things up high and pack the go bag as the creek rises.', during: 'Leave early and stay at the evacuation center.', after: 'Go home safely and get a floodwater scratch checked.' },
    endings: [['hero', 'Flood Smart Hero', '⭐'], ['safe', 'High and Dry', '🏠'], ['lucky', 'Lucky Escape', '🍀'], ['back', 'Back Through the Water', '🌊']],
    tip: 'Never play, wade or swim in floodwater. It can hide open manholes and sharp things, and it can carry germs.',
  }),
  story({
    id: 'hv-shake', sid: 'quake', file: 'big-shake.html', art: 'shake', name: 'The Big Shake', icon: '🏫', hazard: 'Earthquake',
    short: 'The ground shakes during class. What will you do when it starts?',
    desc: 'It is a normal Monday at school, until the ground starts to shake. Talk with your teacher and classmates, make choices, and see what happens.',
    badge: ['Shake Hero', '🏫'],
    journey: { before: 'Spot things in the classroom that could fall.', during: 'Duck, cover and hold while the ground shakes.', after: 'Walk out, stay in the open through an aftershock and go home safely.' },
    endings: [['hero', 'Quake Ready Hero', '⭐'], ['safe', 'Steady and Safe', '🏠'], ['lucky', 'Shaky Day', '🍀'], ['back', 'Back Inside', '🏫']],
    tip: 'After an earthquake, wait in an open area away from buildings, walls, trees and power lines.',
  }),
  story({
    id: 'hv-smoke', sid: 'fire', file: 'smoke-at-night.html', art: 'smoke', name: 'Smoke at Night', icon: '🔥', hazard: 'Fire',
    short: 'The smoke alarm beeps in the middle of the night. Get your family out safely.',
    desc: 'It is a quiet Friday night at home, until the smoke alarm starts beeping. Talk with your family, make choices, and see what happens.',
    badge: ['Smoke Hero', '🔥'],
    journey: { before: 'Notice too many plugs on one warm extension cord.', during: 'Hear the smoke alarm, get out and call for help.', after: 'Talk about how you feel the next morning.' },
    endings: [['hero', 'Fire Safe Hero', '⭐'], ['safe', 'Out and Safe', '🏠'], ['lucky', 'Smoky Night', '🍀'], ['back', 'Back Into the Smoke', '🔥']],
    tip: 'Too many plugs on one extension cord can overheat and start a fire. Tell a grown-up if a cord feels warm.',
  }),
  story({
    id: 'hv-lockdown', sid: 'lockdown', file: 'lockdown-at-school.html', art: 'lockdown', name: 'Lockdown at School', icon: '🔒', hazard: 'Lockdown',
    short: 'The principal calls a lockdown. Stay calm and quiet with your class.',
    desc: 'It is a normal Wednesday at school, until the principal calls a lockdown. Listen to your teacher, make choices, and see what happens.',
    badge: ['Calm Hero', '🔒'], grownUp: true,
    journey: { before: null, during: 'Stay quiet and out of sight, and never open the door.', after: 'Wait to meet your family, then talk about how you feel.' },
    note: 'For grown-ups first: this story is about a school lockdown because a dangerous person may be on campus. No one is hurt, and no weapons or violence are shown. Please preview it, play it together with your child, and follow your own school\'s lockdown procedure.',
    endings: [['hero', 'Calm and Quiet Hero', '⭐'], ['safe', 'Safe Behind the Door', '🏠'], ['lucky', 'Close Call', '🍀'], ['door', 'Never Open the Door', '🚪']],
    tip: 'During a lockdown, stay quiet, stay out of sight, and listen to your teacher. Never open the door for anyone.',
  }),
];
export const isStory = (g) => !!g && g.series === 'hv';

// Handaventures in each pillar's list on Games: a card for the part of the stories that belongs to the pillar,
// with what each story teaches there, hazard by hazard. stop: before, during or after (as in JOURNEY);
// does: finishes "In the Before part of three stories, ..."; parts: [story id, what you do in that part].
// The card opens the shelf. Spotting and removing dangers belongs to Stop Hazards Early, the news and the
// go bag to Get Ready, the hazard itself to Act Fast, and the day after to Bounce Back.
export const HV_PILLAR = {
  mit: {
    stop: 'before', does: 'you spot dangers early',
    parts: [
      ['hv-shake', 'Point out things in the classroom that could fall.'],
      ['hv-smoke', 'Tell a grown-up when a cord with too many plugs feels warm.'],
      ['hv-kulog', 'Bring loose things inside before the wind can throw them.'],
    ],
  },
  prep: {
    stop: 'before', does: 'you help your family get ready',
    parts: [
      ['hv-kulog', 'Listen to the news and pack the go bag while it is still calm.'],
      ['hv-agos', 'Move important things up high and pack the go bag.'],
    ],
  },
  resp: {
    stop: 'during', does: 'you act fast to stay safe',
    parts: [
      ['hv-kulog', 'Stay inside, away from windows, through the strong winds.'],
      ['hv-agos', 'Leave early and stay at the evacuation center.'],
      ['hv-shake', 'Duck, cover and hold while the ground shakes.'],
      ['hv-smoke', 'Get down low, get out and call for help.'],
      ['hv-lockdown', 'Stay quiet and out of sight, and never open the door.'],
    ],
  },
  rec: {
    stop: 'after', does: 'you help your family bounce back',
    parts: [
      ['hv-kulog', 'Stay far away from a fallen wire and tell a grown-up.'],
      ['hv-agos', 'Go home safely and get a floodwater scratch checked.'],
      ['hv-shake', 'Stay in the open through an aftershock, then go home safely.'],
      ['hv-smoke', 'Talk about how you feel the next morning.'],
      ['hv-lockdown', 'Wait for your family, then talk about how you feel.'],
    ],
  },
};

// The pictures in the Handaventures card's carousel on Home and Games: one for each stop of four stories
// (public/stories/peek/<art>-<stop>.webp, taken from the stories by design/handaventures/peeks.cjs), in an order
// that takes turns between the stories and the stops. The card shows five a day, and any five in a row cover
// before, during and after. Lockdown at School stays out: it is a story to play with a grown-up first.
export const HV_PEEKS = [
  ['hv-kulog', 'before'], ['hv-agos', 'during'], ['hv-shake', 'after'], ['hv-smoke', 'before'],
  ['hv-kulog', 'during'], ['hv-agos', 'after'], ['hv-shake', 'before'], ['hv-smoke', 'during'],
  ['hv-kulog', 'after'], ['hv-agos', 'before'], ['hv-shake', 'during'], ['hv-smoke', 'after'],
];

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
  // The order games (Oct 2026), pages of their own built from games/ into public/games/ by scripts/build-games.mjs.
  // They play in a frame (frame:), at the level picked here (frameModes, passed as &level=). A round where every step
  // is safe, with the player's own order, earns the badge at either level.
  // Quake in Order takes the place of the paused Duck, Cover, and Hold drill, whose code stays in the engine.
  {
    id: 'quake', p: 'resp', name: 'Quake in Order', icon: '🏗️', frame: 'games/quake-in-order.html', frameModes: ['easy', 'hard'],
    short: 'Put the earthquake steps in order, then watch your class act them out in 3D.',
    desc: 'The ground shakes during math class. Put the steps of Duck, Cover, and Hold in order, then watch what happens. Whoever sits nearest the door opens it first.',
    badge: ['Quake Ready', '🏗️'], modesLabel: 'Pick a level',
    modes: [['🙂', 'Easy', 'Duck, cover and hold. Tonton sits nearest the door, so he opens it.'], ['🎯', 'Difficult', 'Your seat is next to the door. Open it, then duck, cover, hold, wait, walk out, and line up at the field.']],
    byMode: [
      {
        steps: [['1', 'Read the story', 'It is math class. Tonton sits nearest the door, so he opens it when the ground shakes.'], ['2', 'Put the steps in order', 'Drag the 3 cards, or use the arrows. The first step goes at the top.'], ['3', 'Simulate', 'Watch your class act out your order in 3D, step by step.'], ['4', 'See how it went', 'Each step shows whether it kept you safe, and why. Change your order and try again.']],
        tip: 'Whoever sits nearest the door opens it first. A strong quake can bend the door frame and jam the door shut.',
      },
      {
        steps: [['1', 'Read the story', 'It is math class, and your seat is right next to the door. Then the ground starts to shake.'], ['2', 'Put the steps in order', 'Drag the 7 cards, or use the arrows. The first step goes at the top.'], ['3', 'Simulate', 'Watch your class act out your order in 3D, step by step.'], ['4', 'See how it went', 'Each step shows whether it kept you safe, and why. Change your order and try again.']],
        tip: 'If your seat is next to the door, open it first. A strong quake can bend the door frame and jam the door shut.',
      },
    ],
    note: 'Get every step safe to earn the Quake Ready badge. On the results, See it done right shows the right order.',
    remind: 'In a real earthquake, duck, cover and hold on under a sturdy desk until the shaking stops. Then walk out calmly with your class.',
  },
  // Heart in Order and Press On bring back the paused CPR and bleeding games. Both happen in a first aid class, on a
  // practice manikin and a practice arm, so no one is hurt and no blood is shown.
  {
    id: 'cpr', p: 'resp', name: 'Heart in Order', icon: '💓', frame: 'games/heart-in-order.html', frameModes: ['easy', 'hard'],
    short: 'Put the CPR steps in order, then watch them done on Manny, the class practice manikin.',
    desc: 'It is first aid class, and Manny, the practice manikin, is on the mat. Put the steps of hands-only CPR in order, then watch what happens.',
    badge: ['CPR Hero', '❤️'], modesLabel: 'Pick a level',
    modes: [['🙂', 'Easy', 'Check, call 911, and push hard and fast. Good for younger players.'], ['🎯', 'Difficult', 'All seven steps, from looking around first to the AED and keeping going until help takes over.']],
    byMode: [
      { steps: [['1', 'Read the story', 'Nurse Lea asks the class to pretend Manny fell down and is not moving.'], ['2', 'Put the steps in order', 'Drag the 3 cards, or use the arrows. The first step goes at the top.'], ['3', 'Simulate', 'Watch your order done on Manny in 3D, step by step.'], ['4', 'See how it went', 'Each step shows whether it helped, and why. Then practice pushing to the beat.']] },
      { steps: [['1', 'Read the story', 'Nurse Lea asks the class to pretend Manny fell down and is not moving.'], ['2', 'Put the steps in order', 'Drag the 7 cards, or use the arrows. The first step goes at the top.'], ['3', 'Simulate', 'Watch your order done on Manny in 3D, step by step.'], ['4', 'See how it went', 'Each step shows whether it helped, and why. Then practice pushing to the beat.']] },
    ],
    tip: 'Push hard and fast in the middle of the chest, 100 to 120 times a minute, and do not stop until help takes over.',
    note: 'Get every step right to earn the CPR Hero badge. After a round, try pushing to the beat.',
    remind: 'In real life, call 911 and get a grown-up. Learn CPR from a trained teacher, on a practice manikin like Manny.',
  },
  {
    id: 'bleed', p: 'resp', name: 'Press On', icon: '🩹', frame: 'games/press-on.html', frameModes: ['easy', 'hard'],
    short: 'Put the steps for stopping bad bleeding in order, then watch them done on a practice arm.',
    desc: 'It is first aid class, and a practice arm with a pretend cut is on the mat. Put the steps for stopping bad bleeding in order, then watch what happens.',
    badge: ['Bleeding Stopper', '🩹'], modesLabel: 'Pick a level',
    modes: [['🙂', 'Easy', 'Get help, find the cut, then cover it and press hard. Good for younger players.'], ['🎯', 'Difficult', 'All seven steps, from looking around first to gloves, gauze, and pressing until help takes over.']],
    byMode: [
      { steps: [['1', 'Read the story', 'Nurse Lea asks the class to pretend the practice arm is bleeding a lot.'], ['2', 'Put the steps in order', 'Drag the 3 cards, or use the arrows. The first step goes at the top.'], ['3', 'Simulate', 'Watch your order done on the practice arm in 3D, step by step.'], ['4', 'See how it went', 'Each step shows whether it helped, and why. Then practice pressing and holding.']] },
      { steps: [['1', 'Read the story', 'Nurse Lea asks the class to pretend the practice arm is bleeding a lot.'], ['2', 'Put the steps in order', 'Drag the 7 cards, or use the arrows. The first step goes at the top.'], ['3', 'Simulate', 'Watch your order done on the practice arm in 3D, step by step.'], ['4', 'See how it went', 'Each step shows whether it helped, and why. Then practice pressing and holding.']] },
    ],
    tip: 'Press hard on the cut with both hands and do not let go. If it soaks through, add more cloth on top.',
    note: 'Get every step right to earn the Bleeding Stopper badge. After a round, try pressing and holding for 10 seconds.',
    remind: 'In real life, call 911 and get a grown-up. Learn first aid from a trained teacher.',
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
  // Paused for improvement (Oct 2026): shown as Coming soon, code kept. Remove soon: true to bring it back.
  {
    id: 'cares', p: 'rec', soon: true, name: 'CARES: Community and Resilience', icon: '🏘️', short: 'Build a community by a stream, protect it, then simulate a flood.',
    desc: 'Build a community beside a stream, reach your population goal, and add green and gray protection. Then pick a hazard and simulate: water flows to the lowest ground, so see whose homes stay safe.',
    badge: ['Community Builder', '🏘️'], modesLabel: 'Pick a map',
    modes: [['🌊', 'River in the lowlands', 'A river runs along the low ground. Build up on the high ground and keep back from the water.'], ['💧', 'River on one side', 'The river runs down the west side. The safe high ground is across to the east.'], ['🏔️', 'Valley in the middle', 'A stream cuts a valley down the middle. High ground rises on both sides.'], ['🐌', 'The river bend', 'The river bends around a corner. The safe high ground is the far side, away from the bend.']],
    steps: [['1', 'Build', 'Tap the ground to place houses. Reach your people goal. Build on high ground, not on the low land by the stream.'], ['2', 'Protect', 'Add green protection like trees, mangroves, and a retention pond, and gray protection like dikes, canals, and pumps.'], ['3', 'Choose a hazard', 'Pick a flood or a stronger storm at the top.'], ['4', 'Simulate', 'Press Simulate. Water settles in the lowest ground first, so see whose homes stay dry.']],
    tip: 'Green infrastructure works with nature to soak up and slow water, while gray infrastructure blocks or moves it. The strongest communities use both.',
    note: 'Water always flows downhill and pools in low places.',
    next: 'Next map',
    remind: 'Water always flows downhill and pools in low places. Keep the waterway clear.',
  },
  ...STORIES,
];

export const LIVE = G.filter((g) => !g.soon);

// Champion ID badge order, as on the web app's scorecard.
export const BADGES = ['hazard', 'gobag', 'fire', 'nobody', 'bleed', 'cpr', 'quake', 'path', 'cares', 'cleanup', 'sapa', 'hv-kulog', 'hv-agos', 'hv-shake', 'hv-smoke', 'hv-lockdown'];

export const RANKS = [[0, 'Getting Ready'], [1, 'Rising Champion'], [2, 'Junior Champion'], [4, 'DRRM Champion'], [6, 'Master DRRM Champion']];

export const TIPS = [
  ['Pack a flashlight in your go bag. If the lights go out, you can still find your way.', 'gobag'],
  ['When the ground shakes: drop, cover, and hold on. Walk out only when the shaking stops.', 'quake'],
  ['When the ground shakes, whoever sits nearest the door opens it first, so a bent door frame cannot trap the class.', 'quake'],
  ['If someone falls down and will not wake up, call 911 or get a grown-up right away. Then push hard and fast in the middle of the chest.', 'cpr'],
  ['If someone is bleeding a lot, call 911, then press hard on the cut with a clean cloth and do not let go.', 'bleed'],
  ['Only fight a small fire, and only with a clear way out behind you.', 'fire'],
  ['Tall cabinets can tip over in an earthquake. Ask a grown-up to tie them to the wall.', 'hazard'],
  ['After a flood, never touch wet outlets or fallen wires. Tell an adult right away.', 'cleanup'],
  ['Know where your evacuation area is, and walk the route with your family.', 'path'],
  ['Trash in creeks blocks the water. Keep waterways clear so homes stay dry.', 'sapa'],
  ['Trees and mangroves soak up and slow down water. Strong communities use green and gray protection.', 'cares'],
  ['A sunny morning can fool you. Typhoons can arrive fast, and getting ready takes time.', 'hv-kulog'],
  ['Never play or wade in floodwater. It can hide open manholes and carry germs that make people sick.', 'hv-agos'],
  ['After an earthquake, wait in an open area away from buildings, walls, trees and power lines.', 'hv-shake'],
  ['If a cord or outlet feels warm, tell a grown-up. Too many plugs on one cord can start a fire.', 'hv-smoke'],
];

export const TRIVIA = [
  ['Bayanihan is the spirit of neighbors helping neighbors. Long ago, a whole barangay would lift a family\'s house together and carry it to a new spot!', null],
  ['BAYANIHanda plays on three Filipino words: bayani, a hero; handa, meaning ready; and bayanihan, neighbors helping neighbors.', null],
  ['PASS is how you use a fire extinguisher: Pull, Aim, Squeeze, Sweep.', 'fire'],
  ['An AED is a small machine that can help a heart beat right again. It talks you through every step, so anyone can use it.', 'cpr'],
  ['Mangrove roots are like a green wall by the sea. They slow down big waves and storm surge.', 'cares'],
  ['Water always flows downhill and pools in the lowest places. Homes on high ground stay drier in a flood.', 'cares'],
  ['Small creeks are branches of the river system. When we block them, the water overflows into homes.', 'sapa'],
  ['Tsunami and storm surge flood low ground, so the safest place to go is high ground.', 'path'],
  ['Finding and fixing hazards before a disaster is called mitigation.', 'hazard'],
];

export const creditsOf = (g) => (g && (g.id === HV.id || isStory(g)) ? CREDITS_HV : CREDITS_LIBRARY);

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
