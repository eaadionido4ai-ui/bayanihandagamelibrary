class Component extends DCLogic {
  D = {
    AV: [
      { id: 'turtle', e: '🐢', bg: '#cdebe0' }, { id: 'eagle', e: '🦅', bg: '#ffe1c4' }, { id: 'dragon', e: '🐉', bg: '#d9ccf6' }, { id: 'butterfly', e: '🦋', bg: '#ffd9df' },
      { id: 'whale', e: '🐋', bg: '#d6ecff' }, { id: 'frog', e: '🐸', bg: '#e4f0c4' }, { id: 'cat', e: '🐱', bg: '#ffe9b8' }, { id: 'fox', e: '🦊', bg: '#ffd9c4' },
    ],
    P: {
      mit: { id: 'mit', name: 'Stop Hazards Early', sub: 'Prevention and Mitigation', icon: '🛡️', text: '#2a6b8f', ring: '#2a6b8f', grad: 'linear-gradient(135deg,#6db4d6,#2a6b8f)', banner: 'linear-gradient(135deg,#3f8fb5,#1f5675)', border: '#bfe0ef', tint: '#e6f3f9', lead: 'Spot dangers before they happen and stop them from turning into disasters.' },
      prep: { id: 'prep', name: 'Get Ready', sub: 'Preparedness', icon: '🎒', text: '#128253', ring: '#128253', grad: 'linear-gradient(135deg,#5fd39b,#128253)', banner: 'linear-gradient(135deg,#1e9c66,#0c5c3a)', border: '#bfe9d4', tint: '#e5f6ee', lead: 'Get your family and your go bag ready before anything happens.' },
      resp: { id: 'resp', name: 'Act Fast', sub: 'Response', icon: '🚨', text: '#b35205', ring: '#e8700b', grad: 'linear-gradient(135deg,#ffb04d,#f2760c)', banner: 'linear-gradient(135deg,#e06a0a,#a84d04)', border: '#ffd9ad', tint: '#fff1e3', lead: 'Learn what to do in the first minutes when a disaster strikes.' },
      rec: { id: 'rec', name: 'Bounce Back', sub: 'Recovery and Rehabilitation', icon: '🏘️', text: '#7a53c6', ring: '#7a53c6', grad: 'linear-gradient(135deg,#c3a6ff,#7a53c6)', banner: 'linear-gradient(135deg,#8c66d9,#5a3a9e)', border: '#ddcdfa', tint: '#f1ebfd', lead: 'After a disaster, help your home and your community bounce back.' },
    },
    PO: ['mit', 'prep', 'resp', 'rec'],
    G: [
      { id: 'sapa', p: 'mit', name: 'Guide the Stream', icon: '🏞️', short: 'Open a channel so the creek reaches the sea instead of flooding homes.', desc: 'Clear the silt and open a channel so the creek reaches the sea instead of flooding homes. Inspired by Ang Sapa.', badge: ['Water Warden', '💧'], modesLabel: 'Pick a puzzle', modes: [['🏞️', 'Puzzle 1 · Clear the creek', 'Clear the silt and route the creek past the rock to the sea.'], ['🏠', 'Puzzle 2 · Around the barangay', 'A whole barangay sits in the way. Guide the water safely around it.'], ['💧', 'Puzzle 3 · The blocked culvert', 'The waterway is plugged with silt. Clear it so the creek can flow.']], stepsTitle: 'Guide the stream', steps: [['1', 'Clear', 'Tap silt and garbage to clear the waterway.'], ['2', 'Build', 'Tap ground to lay a channel from the creek toward the sea.'], ['3', 'Route', 'Guide it around the houses and the rock. Tap a channel again to remove it.'], ['4', 'Let it rain', 'When the channel reaches the sea, release the rain. The water flows out and homes stay dry.']], tip: 'Small creeks are branches of the river system. When we block or build over them, the water overflows into homes. Keep the waterway open and let the water find its path to the sea. Drag to look around, and pinch or use the plus and minus buttons to zoom.', note: 'Inspired by the "Ang Sapa" series of Dr. Alfredo Mahar Lagmay of Project NOAH and the UP Resilience Institute.', say: 'Small creeks are branches of the river system. When we block or build over them, the water overflows into homes. Keep the waterway open and let the water find its path to the sea.', title: 'The barangay stays dry!', again: 'Play again', next: 'Next puzzle', back: 'Puzzles', legend: [['🏞️', 'Creek, where the water starts'], ['🌊', 'Sea, guide the water here'], ['🏠', 'House, keep the water away'], ['🪨', 'Rock, you cannot build here'], ['🗑️', 'Silt, tap to clear the waterway'], ['💧', 'Channel, tap ground to build, tap again to remove']] },
      { id: 'hazard', p: 'mit', name: 'Hazard Hunt', icon: '🗺️', short: 'Spot the things that turn dangerous in an earthquake or a typhoon.', desc: 'Pick a place, then spot the things that turn dangerous in an earthquake or a typhoon, and learn how to fix them.', badge: ['Hazard Hunt', '🗺️'], modesLabel: 'Pick a place', modes: [['🏠', 'At home', 'Hunt for hazards in the living room, from tall cabinets to overloaded outlets.'], ['🏫', 'At school', 'Hunt for hazards in the classroom, from tall shelves to blocked exits.'], ['🏙️', 'On the street', 'See how the same street changes: something helpful on a calm day can turn risky in a typhoon or a flood.']], steps: [['1', 'Look', 'Drag to look around the room. Pinch or use the plus and minus buttons to zoom.'], ['2', 'Tap', 'Tap anything that could be dangerous in an earthquake or a typhoon.'], ['3', 'Learn', 'A card tells you why it is a hazard and how to make it safe.'], ['4', 'Find them all', 'Spot every hazard in the room to finish and earn your badge.']], tip: 'Finding and fixing hazards before a disaster is called mitigation. It is one of the smartest ways to keep families and classrooms safe.', say: 'Finding and fixing hazards before a disaster is called mitigation. It is one of the smartest ways to keep families and classrooms safe.', title: 'You spotted every hazard!', again: 'Play again', next: 'Next place', back: 'Places', legend: [['👈', 'Tap objects to inspect them'], ['⚠️', 'Hazards get an orange marker when found'], ['👀', 'Drag to look, pinch or plus and minus to zoom'], ['🎯', 'Find every hazard to finish']] },
      { id: 'gobag', p: 'prep', name: 'Go Bag Packing 3D', icon: '🎒', short: 'Grab the right supplies from the room and pack a smart go bag.', desc: 'Grab the right supplies from the room and pack a smart go bag.', badge: ['Go Bag', '🎒'], modesLabel: 'Pick how you want to play', modes: [['🧺', 'On the table', 'All the items are laid out on a table. Good for a first try.', 'Items on the table'], ['🏗️', 'Messy pile', 'A living room with everything dumped in a heap on the rug. Dig through and pick what matters.', 'Messy pile on the rug'], ['🚪', 'Search the kitchen', 'Harder. Walk around a kitchen with the joystick and open cabinets, drawers, and the fridge to find what you need.', 'Kitchen cabinets and drawers']], stepsTitle: 'Pack a smart go bag', steps: [['1', 'Look', 'Drag to look around the room. Pinch or use the plus and minus buttons to zoom. Tap the top-view button for a view from above.'], ['2', 'Tap', 'Tap an item to learn what it does.'], ['3', 'Pack', 'Pack it or leave it behind.'], ['4', 'Zip', 'Zip up when you are ready.']], tip: 'Drag downward or tap the top-view button for a top view. Pinch or use the plus and minus buttons to zoom. Your bag has limited room, so choose the supplies that matter most.', title: 'Bag packed!', again: 'Play again' },
      { id: 'fire', p: 'resp', name: 'Fire Extinguisher 3D', icon: '🧯', short: 'Pull, Aim, Squeeze, Sweep. Put out the fire the PASS way.', desc: 'Pull, Aim, Squeeze, Sweep. Put out the fire the PASS way.', badge: ['Fire Out', '🧯'], modesLabel: 'Choose your challenge', modes: [['🙂', 'Easy', 'Easy: take your time, and you will never run out of spray.'], ['⏱️', 'Difficult', 'Difficult: watch your extinguisher and beat the clock.']], stepsTitle: 'Remember PASS', steps: [['P', 'Pull', 'Pull the safety pin.'], ['A', 'Aim', 'Aim low, at the base.'], ['S', 'Squeeze', 'Hold the spray button.'], ['S', 'Sweep', 'Sweep side to side.']], tip: 'Drag to look and aim. On a computer you can hold the mouse button on the scene to spray, and move the mouse to sweep. Use the side buttons to step nearer or back, and stand a safe distance away, about two big steps back.', sayLabel: 'Real life reminder', say: 'Only fight a small fire, and only with a clear way out behind you. If the fire is big, spreading, or the room fills with smoke, get out fast, close the door, pull the fire alarm, and call for help.', title: 'Fire is out!', again: 'Play again', scene: 'Kitchen with a small fire' },
      { id: 'nobody', p: 'resp', soon: true, name: 'Nobody Left Behind', icon: '🚪', short: 'Watch a 3D classroom evacuation and look carefully to notice if any child or person is still left inside.', badge: ['No One Left', '🚪'] },
      { id: 'bleed', p: 'resp', soon: true, name: 'Stop the Bleed', icon: '🩹', short: 'Put on gloves, cover the wound, then press hard to stop the bleeding.', badge: ['Stop Bleed', '🩹'] },
      { id: 'cpr', p: 'resp', soon: true, name: 'Hands-Only CPR', icon: '💓', short: 'Call for help, then push hard and fast on the chest in time with the beat.', badge: ['CPR Hero', '❤️'] },
      { id: 'quake', p: 'resp', name: 'Duck, Cover, and Hold', icon: '🏗️', short: 'Watch the coach, then copy the moves: drop, cover, hold on, walk out.', desc: 'Watch the coach, then copy the moves: drop, cover under the sturdy table, hold on, then walk out.', badge: ['Quake Ready', '🏗️'], scene: 'Classroom with the coach', steps: [['1', 'Watch the coach', 'The coach shows you a move, then adds another each round: drop, cover, hold on, walk out.'], ['2', 'Copy the moves', 'Tap the same moves back in the same order using the Drop, Cover, Hold on, and Walk out buttons.'], ['3', 'Keep the order right', 'Drop first, then cover under the sturdy table, hold on until the shaking stops, and only then walk out.'], ['4', 'Learn it by heart', 'Each round is a little faster, so the right order sticks in your memory.']], tip: 'Try it with your whole body too. When the coach drops, covers, and holds, copy the move yourself. Practicing the drill this way makes the right moves automatic when a real earthquake comes.', say: 'Practicing the drill this way makes the right moves automatic when a real earthquake comes.', start: 'Start the drill', title: 'Drill complete', again: 'Practice again' },
      { id: 'path', p: 'resp', name: 'Safe Path', icon: '🧭', short: 'Move tile by tile to the evacuation area, away from coasts, trees, poles, and buildings.', desc: 'Move tile by tile to the evacuation area, keeping away from coasts, trees, poles, and buildings when a hazard strikes.', badge: ['Safe Path', '🧭'], mode: 1, modesLabel: 'Pick a level', modes: [['✏️', 'Level 1 · Trace the route', 'Draw a line from your home to the evacuation tent, around houses, trees, and water.'], ['🎲', 'Level 2 · Tile escape', 'Step tile by tile and roll the die. Stay clear of coasts, trees, poles, and buildings when a hazard strikes.'], ['⛰️', 'Level 3 · High ground', 'Roll the early warning first, then climb this topographic map to safe, high ground away from floods, surge, and landslides.']],
        mStepsTitle: ['Trace the route', 'Find the safe path', 'Climb to high ground'],
        mSteps: [
          [['1', 'Start at home', 'Your route begins at the yellow home tile.'], ['2', 'Drag a line', 'Drag your finger to nearby tiles to draw the path.'], ['3', 'Go around', 'You cannot cross houses, trees, or water. Go around them.'], ['4', 'Reach the tent', 'End at the green evacuation tent. Shorter routes earn more stars.']],
          [['1', 'Move', 'Tap a tile next to you to step there.'], ['2', 'Roll', 'Roll the die. It may bring an earthquake or typhoon.'], ['3', 'Stay safe', 'Keep off tiles near coasts, trees, poles, and buildings.'], ['4', 'Reach', 'Get to the green evacuation tent, safe and quick.']],
          [['1', 'Warning first', 'Roll the die to get the next early warning.'], ['2', 'Read the map', 'Green rings are safe. Red rings are in danger from that warning.'], ['3', 'Move to safety', 'Step onto a safe tile and climb away from the low coast.'], ['4', 'Reach the shelter', 'Get to the evacuation shelter on the high ground.']]],
        mTip: ['Drag back along your line to undo. Use Clear route to start over. Pinch or use the buttons to zoom.', 'Orange warning markers show risky tiles. If a hazard strikes while you stand on one, you lose a heart. Drag to look around the map. Pinch or use the plus and minus buttons to zoom, and tap the eye to reveal a safe route.', 'Tsunami and storm surge flood low ground, so go high. Thunderstorms strike tall trees, poles, and the exposed peak. Heavy rain can trigger landslides on steep slopes. Higher, browner tiles are higher ground.'],
        mSay: ['End at the green evacuation tent. Shorter routes earn more stars.', 'Keep off tiles near coasts, trees, poles, and buildings when a hazard strikes.', 'Tsunami and storm surge flood low ground, so go high. Thunderstorms strike tall trees, poles, and the exposed peak. Heavy rain can trigger landslides on steep slopes.'],
        mTitle: ['You reached safety!', 'You reached safety!', 'You reached high ground!'],
        mLegend: [
          [['🏠', 'Home, where you begin'], ['⛺', 'Evacuation area, your safe goal'], ['🌊', 'Coast and water, go around'], ['🌳', 'Tree, go around'], ['🏘️', 'House, go around']],
          [['🚩', 'Start, where you begin'], ['⛺', 'Evacuation area, your safe goal'], ['🌊', 'Coast and water, stay away'], ['🌳', 'Tree, stay away'], ['🏠', 'House, stay away'], ['⚡', 'Electricity pole, stay away'], ['⚠️', 'Risky tile, close to danger'], ['🎲', 'The die may bring an earthquake or typhoon']],
          [['⛰️', 'Higher, browner tiles are higher ground'], ['⛺', 'Evacuation shelter, your safe goal'], ['🌊', 'Coast and low ground: tsunami and surge flood here, so climb high'], ['⛈️', 'Thunderstorm: keep off the peak, trees, and poles'], ['🏔️', 'Landslide: steep slopes give way in heavy rain'], ['🌳', 'Tree, house, and pole are risky in storms'], ['🟢', 'Green ring safe, red ring in danger']]],
        again: 'Try again', next: 'Next map', back: 'More levels' },
      { id: 'cleanup', p: 'rec', name: 'House Cleanup', icon: '🧹', short: 'Clean up safely after a flood or a typhoon, then sort the waste into the right bin.', desc: 'Clean up safely after a flood inside the house or a typhoon outside. Decide what to keep, what to throw, and what is too dangerous to touch, then sort the waste into the right bin.', badge: ['Cleanup Crew', '🧹'], modesLabel: 'Pick a cleanup', modes: [['🌊', 'After a flood', 'Clean up inside the house. Watch for dirty floodwater and wet electricity.'], ['🌀', 'After a typhoon', 'Clear the yard outside. Watch for fallen wires and sharp debris.']], stepsTitle: 'How to clean up', steps: [['1', 'Stay safe first', 'Switch off the main power at the fusebox, then open the tools box for your gloves and boots.'], ['2', 'Drag to clean', 'Press and drag an item across the scene to where it belongs.'], ['3', 'Sort the waste', 'Drag trash into the right bin: biodegradable, recyclable, or special.'], ['4', 'Keep the good things', 'Drag things you can wash and reuse to the Keep box.'], ['5', 'Do not touch hazards', 'Never drag a hazard. Tap it once to report it to an adult. Drag on empty ground to look around.']], tip: 'Green bin is biodegradable, blue bin is recyclable, and red bin is hazardous or special waste. Never touch fallen wires, wet outlets, dirty floodwater, or broken glass.', say: 'Green bin is biodegradable, blue bin is recyclable, and red bin is hazardous or special waste. Never touch fallen wires, wet outlets, dirty floodwater, or broken glass.', title: 'Cleanup done!', again: 'Try again', next: 'Other cleanup' },
      { id: 'cares', p: 'rec', name: 'CARES: Community and Resilience', icon: '🏘️', short: 'Build a community beside a stream, add green and gray protection, then simulate a hazard.', desc: 'Build a community beside a stream, reach your population goal, and add green and gray protection. Then pick a hazard and simulate: water flows to the lowest ground, so see whose homes stay safe.', badge: ['Community Builder', '🏘️'], modesLabel: 'Pick a map', modes: [['🌊', 'River in the lowlands', 'A river runs along the low ground. Build up on the high ground and keep back from the water.'], ['💧', 'River on one side', 'The river runs down the west side. The safe high ground is across to the east.'], ['🏔️', 'Valley in the middle', 'A stream cuts a valley down the middle. High ground rises on both sides.'], ['🐌', 'The river bend', 'The river bends around a corner. The safe high ground is the far side, away from the bend.']], steps: [['1', 'Build', 'Tap the ground to place houses. Reach your people goal. Build on high ground, not on the low land by the stream.'], ['2', 'Protect', 'Add green protection like trees, mangroves, and a retention pond, and gray protection like dikes, canals, and pumps.'], ['3', 'Choose a hazard', 'Pick a flood or a stronger storm at the top.'], ['4', 'Simulate', 'Press Simulate. Water settles in the lowest ground first, so see whose homes stay dry.']], tip: 'Water always flows downhill and pools in low places. Green infrastructure works with nature to soak up and slow water, while gray infrastructure are built structures that block or move it. The strongest communities use both, and keep the waterway clear.', title: 'A resilient community!', again: 'Build again', legend: [['🏠', 'House, adds ten people. Build on high ground'], ['🌳', 'Green: trees, mangroves, pond soak up water'], ['🧱', 'Gray: dike, canal, pump block or move water'], ['💧', 'Water fills the lowest ground first']] },
    ],
    BADGES: ['hazard', 'gobag', 'fire', 'nobody', 'bleed', 'cpr', 'quake', 'path', 'cares', 'cleanup', 'sapa'],
    RANKS: [[0, 'Getting Ready'], [1, 'Rising Champion'], [2, 'Junior Champion'], [4, 'DRRM Champion'], [6, 'Master DRRM Champion']],
    TIPS: [
      ['A flashlight helps you see when the power goes out. Keep one in your go bag.', 'gobag'],
      ['Drop, cover under the sturdy table, hold on until the shaking stops, and only then walk out.', 'quake'],
      ['Only fight a small fire, and only with a clear way out behind you.', 'fire'],
      ['A tall cabinet that is not fixed to the wall can topple over during shaking. Anchor it with brackets or straps.', 'hazard'],
      ['Water and electricity together are deadly. Keep away from wet outlets and tell an adult.', 'cleanup'],
      ['Keep off tiles near coasts, trees, poles, and buildings when a hazard strikes.', 'path'],
      ['Piled garbage clogs the canal so water cannot drain. Never throw garbage into waterways.', 'sapa'],
      ['Water always flows downhill and pools in low places. Build homes on high ground.', 'cares'],
    ],
    TRIVIA: [
      ['The name BAYANIHanda plays on three Filipino words: bayani, a hero; handa, meaning ready; and bayanihan, the spirit of neighbors helping neighbors.', null],
      ['A whistle lets you call for help without shouting. Rescuers can hear it far away.', 'gobag'],
      ['Floodwater carries germs that cause leptospirosis. Do not wade in it.', 'cleanup'],
      ['Mangroves are green infrastructure. They grow beside the stream and slow and soak up water.', 'cares'],
      ['An earthquake near the coastline can be followed by a tsunami, so move to higher ground away from the sea.', 'path'],
      ['Small creeks are branches of the river system. When we block or build over them, the water overflows into homes.', 'sapa'],
      ['In a strong typhoon, a big old tree can snap and fall on the road, homes, or power lines.', 'hazard'],
      ['PASS means Pull, Aim, Squeeze, Sweep.', 'fire'],
    ],
    LEAD: 'Edward Andrew A. Dionido, Lead Science Research Specialist II, UP Resilience Institute. Built with the assistance of AI.',
    ITEMS: [
      { id: 'water', n: 'Water bottle', e: '💧', good: true, w: 3, info: 'Clean water keeps you going. Try to pack enough for three days.' },
      { id: 'food', n: 'Ready to eat food', e: '🥫', good: true, w: 2, info: 'Canned goods or crackers give you energy and do not spoil quickly.' },
      { id: 'flashlight', n: 'Flashlight', e: '🔦', good: true, w: 1, info: 'A flashlight helps you see when the power goes out.' },
      { id: 'batteries', n: 'Spare batteries', e: '🔋', good: true, w: 1, info: 'Extra batteries keep your flashlight and radio working.' },
      { id: 'firstaid', n: 'First aid kit', e: '🩹', good: true, w: 2, info: 'A first aid kit helps you clean and cover small cuts and scrapes.' },
      { id: 'whistle', n: 'Whistle', e: '🎺', good: true, w: 1, info: 'A whistle lets you call for help without shouting. Rescuers can hear it far away.' },
      { id: 'radio', n: 'Small radio', e: '📻', good: true, w: 2, info: 'A small radio brings you news and warnings even with no internet.' },
      { id: 'powerbank', n: 'Power bank', e: '🔌', good: true, w: 1, info: 'A power bank charges your phone so you can reach your family.' },
      { id: 'documents', n: 'Copies of IDs', e: '📄', good: true, w: 1, info: 'Copies of your IDs and papers, kept dry, help you prove who you are.' },
      { id: 'meds', n: 'Medicine', e: '💊', good: true, w: 1, info: 'Any medicine you take every day should come with you.' },
      { id: 'mask', n: 'Face mask', e: '😷', good: true, w: 1, info: 'A face mask protects you from dust, smoke, and germs.' },
      { id: 'cash', n: 'Some cash', e: '💵', good: true, w: 1, info: 'A little cash helps when card machines are down.' },
      { id: 'clothes', n: 'Dry clothes', e: '👕', good: true, w: 2, info: 'A dry change of clothes keeps you warm and comfortable.' },
      { id: 'toy', n: 'Small comfort toy', e: '🧸', good: true, w: 1, info: 'One small toy can help you feel calm and brave. Choose a little one.' },
      { id: 'contacts', n: 'Family phone list', e: '📝', good: true, w: 1, info: 'A written list of family numbers helps if your phone dies.' },
      { id: 'console', n: 'Game console', e: '🎮', good: false, w: 3, info: 'Fun, but it is heavy and needs power you may not have.' },
      { id: 'soda', n: 'Soda', e: '🥤', good: false, w: 2, info: 'Sweet drinks make you thirstier. Plain water is better.' },
      { id: 'icecream', n: 'Ice cream', e: '🍦', good: false, w: 2, info: 'It melts fast and makes a mess. Leave it in the freezer.' },
      { id: 'tv', n: 'Television', e: '📺', good: false, w: 3, info: 'Far too big and heavy to carry.' },
      { id: 'bricks', n: 'Bricks', e: '🧱', good: false, w: 3, info: 'Heavy and will only tire you out.' },
      { id: 'books', n: 'Stack of books', e: '📚', good: false, w: 3, info: 'A big stack of books is too heavy for a go bag.' },
      { id: 'hairdryer', n: 'Hair dryer', e: '💨', good: false, w: 2, info: 'It needs a wall plug and is not needed in an emergency.' },
      { id: 'balloon', n: 'Balloons', e: '🎈', good: false, w: 1, info: 'Fun, but they will not help you stay safe.' },
      { id: 'beachball', n: 'Beach ball', e: '🏐', good: false, w: 2, info: 'It takes up space you need for real supplies.' },
    ],
    CAP: 14,
    SCENES: [
      { key: 'home', name: 'At home', place: 'Living room', blurb: 'Find the things at home that become dangerous in an earthquake or a typhoon.', items: [
        { id: 'cabinet', e: '🗄️', n: 'Tall cabinet', x: 18, y: 31, hazard: true, ev: 'earthquake', why: 'A tall cabinet that is not fixed to the wall can topple over during shaking.', fix: 'Anchor it to the wall with brackets or straps.' },
        { id: 'shelf', e: '🏺', n: 'Heavy things up high', x: 40, y: 30, hazard: true, ev: 'earthquake', why: 'Heavy items on high shelves can fall on people when the ground shakes.', fix: 'Keep heavy things on low shelves.' },
        { id: 'tv', e: '📺', n: 'TV on a stand', x: 61, y: 31, hazard: true, ev: 'earthquake', why: 'An unsecured TV can slide off and fall.', fix: 'Strap the TV to the stand or the wall.' },
        { id: 'window', e: '🪟', n: 'Window with no shutter', x: 83, y: 30, hazard: true, ev: 'typhoon', why: 'In a typhoon, strong wind can shatter an unprotected window.', fix: 'Add storm shutters or board it up, and stay away during the storm.' },
        { id: 'outlet', e: '🔌', n: 'Overloaded outlet', x: 13, y: 48, hazard: true, ev: 'fire', why: 'Too many plugs in one outlet can overheat and start a fire.', fix: 'Unplug extra devices and avoid octopus wiring.' },
        { id: 'extinguisher', e: '🧯', n: 'Fire extinguisher', x: 16, y: 62, hazard: false, why: 'A fire extinguisher within reach is a good thing to have.' },
        { id: 'table', e: '🪑', n: 'Sturdy low table', x: 52, y: 52, hazard: false, why: 'A strong low table is safe. You can duck under it during shaking.' },
        { id: 'plant', e: '🪴', n: 'Potted plant on the floor', x: 83, y: 54, hazard: false, why: 'On the floor, a small plant is not a hazard.' },
        { id: 'clutter', e: '📦', n: 'Boxes blocking the door', x: 44, y: 70, hazard: true, ev: 'both', why: 'Clutter in the doorway blocks your way out in an emergency.', fix: 'Keep exits clear so everyone can leave quickly.' },
        { id: 'gobag', e: '🎒', n: 'Ready go bag', x: 76, y: 71, hazard: false, why: 'A packed go bag by the door is smart preparation. Well spotted.' }] },
      { key: 'school', name: 'At school', place: 'Classroom', blurb: 'Find the classroom things that become dangerous in an earthquake or a typhoon.', items: [
        { id: 'bookshelf', e: '📚', n: 'Tall bookshelf', x: 18, y: 31, hazard: true, ev: 'earthquake', why: 'A tall bookshelf that is not fixed can fall over during shaking.', fix: 'Bolt it to the wall.' },
        { id: 'fan', e: '🌀', n: 'Loose ceiling fan', x: 40, y: 30, hazard: true, ev: 'earthquake', why: 'A poorly fixed fan or light can drop during shaking.', fix: 'Have fixtures checked and properly secured.' },
        { id: 'tvcart', e: '📺', n: 'TV on a rolling cart', x: 61, y: 31, hazard: true, ev: 'earthquake', why: 'A TV on wheels can roll and topple over.', fix: 'Lock the wheels and strap the TV down.' },
        { id: 'pots', e: '🪴', n: 'Pots on the window ledge', x: 83, y: 30, hazard: true, ev: 'both', why: 'Pots on a high ledge can fall in strong wind or shaking.', fix: 'Move them down to the floor.' },
        { id: 'cwindow', e: '🪟', n: 'Window with no film', x: 13, y: 48, hazard: true, ev: 'typhoon', why: 'Plain glass can shatter into sharp pieces in a storm.', fix: 'Add safety film or shutters.' },
        { id: 'evacmap', e: '🗺️', n: 'Evacuation map', x: 16, y: 62, hazard: false, why: 'Knowing the evacuation route is good preparation.' },
        { id: 'desk', e: '🪑', n: 'Sturdy desk', x: 52, y: 52, hazard: false, why: 'A strong desk is safe. Duck under it during an earthquake.' },
        { id: 'firstaid', e: '🩹', n: 'First aid kit', x: 83, y: 54, hazard: false, why: 'A stocked first aid kit is good to have ready.' },
        { id: 'chairs', e: '🚪', n: 'Chairs blocking the exit', x: 44, y: 70, hazard: true, ev: 'both', why: 'Stacked chairs in the doorway block the escape route.', fix: 'Keep the exit clear at all times.' },
        { id: 'cext', e: '🧯', n: 'Fire extinguisher', x: 76, y: 71, hazard: false, why: 'A fire extinguisher is a good thing to have within reach.' }] },
      { key: 'street', name: 'On the street', place: 'Street', street: true, blurb: 'See how the same street changes when the hazard changes. The same thing can be a helpful asset one day and a risk the next.', items: [
        { id: 'tree', e: '🌳', n: 'Big old tree', x: 18, y: 33, asset: 'On a calm day this tree gives welcome shade and cools the street.', risk: { typhoon: { why: 'In a strong typhoon its big branches, or the whole trunk, can snap and fall on the road, homes, or power lines.', fix: 'Trim weak branches before storm season, and never shelter under it during a typhoon.' } } },
        { id: 'post', e: '⚡', n: 'Electric post and lines', x: 50, y: 31, asset: 'It carries the electricity the neighborhood needs every day.', risk: { typhoon: { why: 'Strong wind can snap the lines or topple the post, cutting power and dropping live wires.', fix: 'Stay well away from posts and hanging wires during a storm.' }, flood: { why: 'If a line falls into floodwater, the water can carry a deadly electric shock.', fix: 'Never wade through floodwater near fallen wires. Report them and switch off power if it is safe.' } } },
        { id: 'billboard', e: '🪧', n: 'Large billboard', x: 82, y: 31, asset: 'Most days it is just an advertising sign.', risk: { typhoon: { why: 'Its wide surface catches strong wind, and the whole frame can be blown down onto the street.', fix: 'Report old or weak billboards so the local government can secure or remove them.' } } },
        { id: 'evaccenter', e: '🏟️', n: 'Covered evacuation center', x: 15, y: 52, asset: 'This strong covered court is a safe place to gather and evacuate to in any hazard.', risk: {} },
        { id: 'building', e: '🏠', n: 'Sturdy concrete house', x: 50, y: 50, asset: 'A well-built house on higher ground is a safe shelter.', risk: {} },
        { id: 'lowroad', e: '🌊', n: 'Low creek crossing', x: 84, y: 52, asset: 'On a dry day it is just a low part of the road beside the creek.', risk: { flood: { why: 'It floods first when the creek rises, and fast water here can sweep away people and vehicles.', fix: 'Do not cross when it is flooded. Turn around and reach higher ground.' } } },
        { id: 'garbage', e: '🗑️', n: 'Garbage by the canal', x: 28, y: 70, asset: 'This is uncollected garbage piled beside the canal.', risk: { flood: { why: 'Piled garbage clogs the canal so water cannot drain, and the flood rises faster and higher.', fix: 'Keep canals clear and never throw garbage into waterways.' } } },
        { id: 'car', e: '🚗', n: 'Parked car', x: 68, y: 70, asset: 'Parked on a normal day it is no problem at all.', risk: { flood: { why: 'Floodwater can lift and carry a car, and it can block the road and the drainage.', fix: 'Move vehicles to higher ground before floods, and never drive into rising water.' } } }] },
    ],
    CLEAN: {
      flood: { title: 'Flood cleanup', place: 'inside the house', intro: 'The floodwater has gone down. Clean up safely. Wear boots and gloves, and never touch anything electrical that is wet.', items: [
        { id: 'food', e: '🍚', n: 'Spoiled rice and food', desc: 'Food touched by floodwater is not safe to eat.', act: 'toss', bin: 'bio', why: 'Spoiled food is biodegradable waste.' },
        { id: 'meds', e: '💊', n: 'Wet medicines', desc: 'Medicines soaked in floodwater can be unsafe.', act: 'toss', bin: 'special', why: 'Wet medicine is special waste. Never pour it down the drain.' },
        { id: 'can', e: '🥫', n: 'Muddy tin can', desc: 'A rinsed metal can can be recycled.', act: 'toss', bin: 'recycle', why: 'Rinse the can and put it in the recyclable bin.' },
        { id: 'plates', e: '🍽️', n: 'Muddy plates and spoons', desc: 'Sturdy dishes can be washed and disinfected.', act: 'keep', why: 'Wash and disinfect sturdy dishes, then keep them.' },
        { id: 'photos', e: '🖼️', n: 'Wet family photos', desc: 'Important papers and photos can be dried and saved.', act: 'keep', why: 'Dry photos and papers carefully to save them.' },
        { id: 'outlet', e: '🔌', n: 'Wet electrical outlet', desc: 'Water and electricity together are deadly.', act: 'hazard', why: 'Keep away. Have an adult switch off the main power first.' },
        { id: 'water', e: '🦠', n: 'Dirty floodwater puddle', desc: 'Floodwater carries germs that cause leptospirosis.', act: 'hazard', why: 'Do not wade in it. Let an adult handle it with boots and gloves.' }] },
      typhoon: { title: 'Typhoon cleanup', place: 'outside the house', intro: 'The typhoon has passed. Clear the yard safely. Watch for sharp debris and never go near fallen wires.', items: [
        { id: 'branches', e: '🪵', n: 'Fallen branches and leaves', desc: 'Plant debris breaks down naturally.', act: 'toss', bin: 'bio', why: 'Branches and leaves are biodegradable.' },
        { id: 'wrapper', e: '🥤', n: 'Blown-in plastic cup', desc: 'Rinsed plastic can be recycled.', act: 'toss', bin: 'recycle', why: 'Rinse plastic and put it in the recyclable bin.' },
        { id: 'battery', e: '🔋', n: 'Old battery', desc: 'Batteries leak harmful chemicals.', act: 'toss', bin: 'special', why: 'Batteries are special waste, never regular trash.' },
        { id: 'plant', e: '🪴', n: 'Tipped potted plant', desc: 'The pot is fine, just knocked over.', act: 'keep', why: 'Stand the pot back up and keep the plant.' },
        { id: 'wire', e: '⚡', n: 'Fallen power line', desc: 'A downed line can still be live.', act: 'hazard', why: 'Never go near it. Tell an adult and report it to the power company.' },
        { id: 'roof', e: '🪚', n: 'Sharp roofing sheet', desc: 'The metal edge is sharp and heavy.', act: 'hazard', why: 'Do not drag it yourself. Ask an adult to move it.' },
        { id: 'glass', e: '🥛', n: 'Broken glass', desc: 'Broken glass can cut deeply.', act: 'hazard', why: 'Do not touch it. Ask an adult to clear it safely.' }] },
    },
    CLPOS: [[38, 30], [63, 31], [86, 42], [22, 52], [52, 50], [78, 62], [40, 70]],
    SAPA: [
      ['..S...', '......', '..G...', '.HXH..', '..G...', '......', '..E...'],
      ['S.....', '......', '.HHHH.', '....G.', '.HHHH.', '......', '.....E'],
      ['..S...', '..G...', 'XX.XX.', '..G...', 'XXGXX.', '..G...', '.H.H..', '..E...'],
    ],
    PATH: {
      LEVELS: [
        ['W.......', 'W..T....', 'W.......', 'W....B.E', 'W.......', 'W.P.....', 'W......S'],
        ['W....B..S', 'W....B...', 'W........', 'W..TT....', 'W........', 'WWW......', 'W......E.'],
        ['W........', 'W.T..B.T.', 'W........', 'W..P...B.', 'W........', 'W.B..T...', 'W........', '..S.....E'],
      ],
      TRACE: ['S.......', '.TT..B..', '........', '.B...T..', '....B...', '..T.....', '......TE'],
      L3F: ['...E.....', '..T....B.', '.........', '......T..', '.....P...', '..T....B.', '.........', '....S....', 'WWWWWWWWW'],
      L3E: ['555555555', '444444444', '344444444', '232222222', '222222222', '222222222', '222222222', '111111111', '000000000'],
    },
    QSEQ: [['drop', '⬇️', 'Drop', 'Drop to your hands and knees so the shaking cannot knock you down.'], ['cover', '🛡️', 'Cover', 'Get under the sturdy table and cover your head and neck.'], ['hold', '✊', 'Hold on', 'Hold on to the table leg until the shaking stops.'], ['evacuate', '🚶', 'Walk out', 'Once the shaking stops, walk calmly to the exit.']],
    CARES: {
      MAPS: [[35, 36, 37, 38, 39, 40, 41], [0, 7, 14, 21, 28, 35, 42], [3, 10, 17, 24, 31, 38, 45], [0, 7, 14, 21, 28, 29, 30, 31]],
      BLURB: ['A river runs along the low ground. Build up on the high ground and keep back from the water.', 'The river runs down the west side. The safe high ground is across to the east.', 'A stream cuts a valley down the middle. High ground rises on both sides.', 'The river bends around a corner. The safe high ground is the far side, away from the bend.'],
      TOOLS: [['H', '🏠', 'House', 'home', 'Adds ten residents. Build these on high ground away from the stream.'], ['D', '🧱', 'Dike', 'gray', 'Gray infrastructure. A floodwall that keeps its cell and the cells beside it dry.'], ['C', '〰️', 'Canal', 'gray', 'Gray infrastructure. Drainage that carries water away and lowers the flood.'], ['P', '⚙️', 'Pump', 'gray', 'Gray infrastructure. A pumping station that pushes floodwater out.'], ['M', '🌿', 'Mangrove', 'green', 'Green infrastructure. Plants beside the stream that slow and soak up water. Works next to the stream.'], ['R', '🫧', 'Retention pond', 'green', 'Green infrastructure. A pond that stores rainwater so it does not rush downstream.'], ['T', '🌳', 'Trees', 'green', 'Green infrastructure. Trees on the slopes that soak up rain and slow runoff. Plant them on higher ground.']],
      RED: { R: 0.6, M: 0.5, T: 0.3, C: 0.3, P: 0.5 }, CAP: 2.0, BASE: { flood: 2.5, storm: 3.5 }, GOAL: 60, PER: 10, W: 7,
    },
    SHARE: [['💬', 'Messenger', '#e6efff'], ['✉️', 'Gmail', '#fdeaea'], ['📞', 'Viber', '#efe8fb'], ['📁', 'Drive', '#e5f6ee'], ['📶', 'Nearby Share', '#e6f3f9'], ['🖼️', 'Gallery', '#fff5df'], ['📋', 'Copy', '#eef2f4'], ['⋯', 'More', '#eef2f4']],
    JUMPS: [['splash', 'Splash'], ['welcome', 'Welcome (first time)'], ['players', "Who's playing"], ['addPlayer', 'Add player'], ['home', 'Home'], ['games', 'Games'], ['intro', 'Game intro'], ['play:fire', 'Play · Fire Extinguisher 3D'], ['play:gobag', 'Play · Go Bag Packing 3D'], ['play:quake', 'Play · Duck, Cover, and Hold'], ['play:path:0', 'Play · Safe Path L1 Trace'], ['play:path:1', 'Play · Safe Path L2 Tile escape'], ['play:path:2', 'Play · Safe Path L3 High ground'], ['play:hazard', 'Play · Hazard Hunt'], ['play:sapa', 'Play · Guide the Stream'], ['play:cleanup', 'Play · House Cleanup'], ['play:cares', 'Play · CARES'], ['result', 'Results + badge earned'], ['id', 'Champion ID'], ['settings', 'Settings + About']],
  };

  SAMPLE = () => ({ players: [{ id: 'p1', nick: 'Mika', av: 'turtle' }, { id: 'p2', nick: 'Jun', av: 'fox' }, { id: 'p3', nick: 'Lia', av: 'butterfly' }], activeId: 'p1', badges: { p1: { gobag: true, hazard: true, quake: true }, p2: { fire: true } } });

  state = Object.assign({
    device: (this.props && this.props.device) === 'tablet' ? 'tablet' : 'phone', screen: 'splash', ws: 0, players: [], activeId: null, badges: {}, editMode: false,
    draft: { nick: '', av: 'turtle', id: null }, filter: 'all', gameId: 'fire', mode: 0, sub: 0, from: 'games', play: {}, result: null,
    ask: false, askKind: 'tip', askN: 0, homeN: 0, jump: 0, sheet: null, sd: null, snack: null, sound: true, voice: false,
    names: {}, photos: {}, aboutMore: false, scale: 1, zoom: 1,
  }, (this.props && this.props.startAs) === 'returning' ? this.SAMPLE() : {});

  componentDidMount() {
    this.fit = () => { const d = this.dims(this.state.device); const W = window.innerWidth - 32, H = window.innerHeight - 84; const sc = Math.max(0.3, Math.min(1, W / d.w, H / d.h)); if (Math.abs(sc - this.state.scale) > 0.004) this.setState({ scale: sc }); };
    window.addEventListener('resize', this.fit); this.fit(); this.armSplash();
  }
  componentWillUnmount() { window.removeEventListener('resize', this.fit); clearTimeout(this.splashT); clearTimeout(this.snT); this.clearTimers(); }
  componentDidUpdate(pp, ps) {
    if (ps.device !== this.state.device) this.fit();
    if (pp.device !== this.props.device && (this.props.device === 'phone' || this.props.device === 'tablet')) this.setState({ device: this.props.device });
  }
  dims(dev) { return dev === 'tablet' ? { w: 1312, h: 832, b: 16, r: 42, sr: 28 } : { w: 420, h: 880, b: 10, r: 48, sr: 38 }; }
  armSplash() { clearTimeout(this.splashT); this.splashT = setTimeout(() => { if (this.state.screen === 'splash') this.afterSplash(); }, 2600); }
  afterSplash() { if (this.state.players.length) this.go('players'); else this.go('welcome', { ws: 0 }); }
  later(fn, ms) { this.tq = this.tq || []; this.tq.push(setTimeout(fn, ms)); }
  clearTimers() { (this.tq || []).forEach(t => clearTimeout(t)); this.tq = []; if (this.fireT) { clearInterval(this.fireT); this.fireT = null; } }
  go(screen, extra) { this.clearTimers(); this.setState(Object.assign({ screen, ask: false, sheet: null }, extra || {})); if (screen === 'splash') this.armSplash(); }
  snackShow(t) { clearTimeout(this.snT); this.setState({ snack: t }); this.snT = setTimeout(() => this.setState({ snack: null }), 2600); }
  speak(t, force) { if (!t || !this.state.sound || (!force && !this.state.voice)) return; try { const u = new SpeechSynthesisUtterance(t); u.rate = 0.95; u.pitch = 1.15; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch (e) {} }
  av(id) { return this.D.AV.find(a => a.id === id) || this.D.AV[0]; }
  game(id) { return this.D.G.find(g => g.id === id) || this.D.G[0]; }
  me() { return this.state.players.find(p => p.id === this.state.activeId) || null; }
  earned(pid) { return this.state.badges[pid || this.state.activeId] || {}; }
  countOf(pid) { const e = this.earned(pid); return this.D.G.filter(g => !g.soon && e[g.id]).length; }
  rankOf(c) { let r = this.D.RANKS[0]; this.D.RANKS.forEach(x => { if (c >= x[0]) r = x; }); return r; }
  nextOf(c) { const n = this.D.RANKS.find(x => x[0] > c); return n ? { need: n[0] - c, name: n[1], min: n[0] } : null; }
  seed() { return this.state.players.length ? {} : this.SAMPLE(); }
  setPlay(patch) { this.setState(s => ({ play: Object.assign({}, s.play, patch) })); }
  hint(t) { this.setPlay({ hint: t }); this.speak(t); }
  gTip(g, m) { return g.mTip ? g.mTip[m] : g.tip; }
  gSteps(g, m) { return g.mSteps ? g.mSteps[m] : (g.steps || []); }
  gStepsTitle(g, m) { return g.mStepsTitle ? g.mStepsTitle[m] : (g.stepsTitle || 'How to play'); }
  gLegend(g, m) { return g.mLegend ? g.mLegend[m] : g.legend; }
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  restart() { this.clearTimers(); this.setState({ players: [], activeId: null, badges: {}, names: {}, photos: {}, editMode: false, filter: 'all', result: null }); this.go('splash'); }
  jumpTo(v) {
    if (v === 'splash') return this.restart();
    if (v === 'welcome') { this.setState({ players: [], activeId: null, badges: {} }); return this.go('welcome', { ws: 0 }); }
    const seed = this.seed(); if (seed.players) this.setState(seed);
    if (v === 'addPlayer') return this.newPlayer();
    if (v === 'intro') return this.go('intro', { gameId: 'fire', mode: 0, from: 'games' });
    if (v.indexOf('play:') === 0) { const parts = v.split(':'); const gm = this.game(parts[1]); return this.startGame(parts[1], parts[2] != null ? +parts[2] : (gm.mode || 0), 0); }
    if (v === 'result') { this.setState({ gameId: 'fire', mode: 0 }); setTimeout(() => this.finish(3, 'Time: 9s'), 0); return; }
    if (v === 'games') return this.go('games', { filter: 'all' });
    this.go(v);
  }

  newPlayer() { this.go('addPlayer', { draft: { nick: '', av: 'turtle', id: null } }); }
  editPlayer(p) { this.go('addPlayer', { draft: { nick: p.nick, av: p.av, id: p.id } }); }
  savePlayer() {
    const d = this.state.draft, nick = d.nick.trim(); if (!nick) return;
    if (d.id) { this.setState(s => ({ players: s.players.map(p => p.id === d.id ? Object.assign({}, p, { nick, av: d.av }) : p) })); this.go('players'); this.snackShow('Player saved'); return; }
    const id = 'p' + Date.now().toString(36);
    this.setState(s => ({ players: s.players.concat([{ id, nick, av: d.av }]), activeId: id }));
    this.go('home', { homeN: 0, jump: this.state.jump + 1, editMode: false });
    this.snackShow('Welcome, ' + nick + '!'); this.speak('Hi, ' + nick + '! Ready to learn and be a hero today?');
  }
  pickPlayer(p) { if (this.state.editMode) return this.editPlayer(p); this.setState({ activeId: p.id }); this.go('home', { homeN: 0, jump: this.state.jump + 1 }); this.speak('Hi, ' + p.nick + '!'); }
  removePlayer(id) {
    const players = this.state.players.filter(p => p.id !== id); const badges = Object.assign({}, this.state.badges); delete badges[id];
    const activeId = this.state.activeId === id ? (players[0] ? players[0].id : null) : this.state.activeId;
    this.setState({ players, badges, activeId, editMode: players.length ? this.state.editMode : false });
    if (!players.length) this.newPlayer(); else this.go('players');
    this.snackShow('Player removed');
  }

  openGame(id) { const g = this.game(id); if (g.soon) { this.snackShow('Coming soon! Bayani is still building this game.'); return; } const from = ['home', 'games', 'id', 'players'].indexOf(this.state.screen) >= 0 ? this.state.screen : 'games'; this.go('intro', { gameId: id, mode: g.mode || 0, from }); }
  startGame(id, mode, sub) {
    const gid = id || this.state.gameId; const m = mode == null ? this.state.mode : mode; const sb = sub == null ? 0 : sub;
    const play = this.initPlay(gid, m, sb); this.go('play', { gameId: gid, mode: m, sub: sb, play, zoom: 1 }); this.speak(play.hint);
    if (gid === 'quake') this.later(() => this.qRound(1), 1600);
    if (gid === 'fire') this.fireT = setInterval(() => this.fireTick(), 100);
  }
  initPlay(id, m, sub) {
    const D = this.D;
    if (id === 'fire') return { g: id, m, pin: false, spraying: false, ax: 0.5, ay: 0.4, aimBase: false, sweeping: false, intensity: 100, agent: 100, dist: 4.5, t0: Date.now(), sprayN: 0, baseN: 0, chipAim: false, chipSq: false, chipSw: false, hint: 'Pull the safety pin first.' };
    if (id === 'gobag') { const good = this.shuffle(D.ITEMS.filter(x => x.good)).slice(0, 9), bad = this.shuffle(D.ITEMS.filter(x => !x.good)).slice(0, 5); return { g: id, m, tray: this.shuffle(good.concat(bad)).map(x => x.id), packed: [], left: [], top: false, hint: 'Tap an item to learn about it.' }; }
    if (id === 'quake') return { g: id, m, round: 1, phase: 'watch', cue: null, idx: 0, mistakes: 0, flash: null, hint: 'Watch the coach, then copy the moves in the same order.' };
    if (id === 'path') { const g = this.pathGrid({ m, map: sub }); if (m === 0) return { g: id, m, map: 0, route: [g.start], hint: 'Your route begins at the yellow home tile. Tap the tiles next to it to draw your path.' }; return { g: id, m, map: m === 1 ? sub : 0, pos: g.start, steps: 0, hearts: 3, lost: 0, need: m === 2, rolling: false, die: null, hz: null, reveal: false, hint: m === 2 ? 'Roll for the next warning.' : 'Tap a tile next to you to step there.' }; }
    if (id === 'hazard') return { g: id, m, found: [], seen: [], wrong: 0, scn: 'typhoon', hint: D.SCENES[m].blurb };
    if (id === 'sapa') return { g: id, m, cells: D.SAPA[m].join('').split(''), hearts: 3, lost: 0, raining: false, wet: [], hint: (this.game('sapa').modes[m] || [])[2] };
    if (id === 'cleanup') { const k = m === 1 ? 'typhoon' : 'flood'; return { g: id, m, k, power: false, gear: false, done: [], mistakes: 0, hint: D.CLEAN[k].intro }; }
    if (id === 'cares') return { g: id, m, tiles: Array(49).fill(''), tool: 'H', scen: 'flood', sim: null, hint: D.CARES.BLURB[m] };
    return { g: id, m, hint: '' };
  }
  finish(stars, line, extra) {
    const s = this.state, g = this.game(s.gameId), pid = s.activeId;
    const mine = s.badges[pid] || {}; const had = !!mine[g.id]; const newB = stars === 3 && !had;
    const badges = newB ? Object.assign({}, s.badges, { [pid]: Object.assign({}, mine, { [g.id]: true }) }) : s.badges;
    this.go('result', { badges, result: Object.assign({ id: g.id, stars, line, newB, had: had && stars === 3 }, extra || {}), jump: s.jump + 1 });
    this.speak(((extra && extra.title) || g.title || '') + ' ' + line);
  }

  // FIRE
  fireAim(e) { const r = e.currentTarget.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }; }
  fireDown(e) { const a = this.fireAim(e); this.fdown = true; this.fx0 = a.x; this.setPlay({ ax: a.x, ay: a.y }); this.sprayOn(); }
  fireMove(e) { if (!this.fdown) return; const a = this.fireAim(e); this.sweepAcc = (this.sweepAcc || 0) + Math.abs(a.x - (this.fx0 == null ? a.x : this.fx0)); this.fx0 = a.x; this.setPlay({ ax: a.x, ay: a.y }); }
  fireUp() { if (!this.fdown) return; this.fdown = false; this.sprayOff(); }
  sprayOn() { const p = this.state.play; if (!p.pin) { this.hint('Pull the safety pin first.'); return; } if (p.agent <= 0) return; this.setPlay({ spraying: true, chipSq: true }); }
  sprayOff() { this.setPlay({ spraying: false }); }
  sweepTap(d) { const p = this.state.play; this.sweepAcc = (this.sweepAcc || 0) + 0.12; this.setPlay({ ax: Math.min(0.8, Math.max(0.2, p.ax + d * 0.12)) }); }
  fireTick() {
    const s = this.state, p = s.play; if (s.screen !== 'play' || p.g !== 'fire') return;
    const easy = p.m === 0, dt = 0.1;
    const aimBase = Math.abs(p.ax - 0.5) < 0.17 && p.ay >= 0.56 && p.ay <= 0.8;
    const sweeping = (this.sweepAcc || 0) > 0.05; this.sweepAcc = (this.sweepAcc || 0) * 0.55;
    const agentOk = easy || p.agent > 0;
    let intensity = p.intensity, agent = p.agent, sprayN = p.sprayN, baseN = p.baseN;
    if (p.spraying && p.pin && agentOk) {
      sprayN++; if (aimBase) baseN++;
      if (!easy) agent = Math.max(0, agent - dt * 6);
      let rate = (aimBase ? 1.0 : 0.25) * (sweeping ? 1.5 : 0.7);
      const d = p.dist; rate *= d < 1 ? 0.4 : d > 5 ? 0.25 : d > 4 ? 0.7 : 1.0;
      intensity = Math.max(0, intensity - rate * 8 * dt);
    }
    const fighting = p.pin && p.spraying && aimBase && agentOk;
    if (!easy && !fighting && intensity > 0) intensity = Math.min(100, intensity + 2.2 * dt);
    let hint = !p.pin ? 'Pull the safety pin first.' : (!easy && agent <= 0) ? 'The extinguisher is empty. Press restart.' : p.dist > 4.2 ? 'Step a little closer.' : p.dist < 1 ? 'Not too close. Step back a step.' : !p.spraying ? 'Hold the green Spray button.' : !aimBase ? 'Aim low, at the base of the fire.' : !sweeping ? 'Sweep from side to side.' : 'Great, keep sweeping the base!';
    if (intensity <= 0) {
      if (this.fireT) { clearInterval(this.fireT); this.fireT = null; }
      const secs = Math.max(1, Math.round((Date.now() - p.t0) / 1000)); let st = 3; if (!easy && secs > 22) st--; if ((sprayN ? baseN / sprayN : 1) < 0.7) st--;
      this.finish(Math.max(1, st), 'Time: ' + secs + 's'); return;
    }
    const patch = { intensity, agent, sprayN, baseN, aimBase, sweeping, chipAim: p.chipAim || (p.spraying && aimBase), chipSw: p.chipSw || (p.spraying && sweeping) };
    if (hint !== p.hint) { patch.hint = hint; this.speak(hint); }
    if (!easy && agent <= 0 && p.spraying) patch.spraying = false;
    this.setPlay(patch);
  }
  pullPin() { this.setPlay({ pin: true }); }
  stepFire(d) { const p = this.state.play; this.setPlay({ dist: Math.min(5.5, Math.max(0.5, p.dist + d)) }); }

  // GO BAG
  item(id) { return this.D.ITEMS.find(x => x.id === id); }
  bagW(ids) { return ids.reduce((a, id) => a + this.item(id).w, 0); }
  gbPack(it) {
    const p = this.state.play; if (p.packed.indexOf(it.id) >= 0) { this.setState({ sheet: null }); return; }
    if (this.bagW(p.packed) + it.w > this.D.CAP) { this.setState({ sheet: null }); this.hint('Your bag is too full. Take something out first, or zip it up.'); return; }
    const packed = p.packed.concat([it.id]); this.setState(s => ({ sheet: null, play: Object.assign({}, s.play, { packed, left: s.play.left.filter(x => x !== it.id) }) }));
    this.hint(it.n + ' is in your bag. ' + (this.D.CAP - this.bagW(packed)) + ' space left.');
  }
  gbLeave(it) { this.setState(s => ({ sheet: null, play: Object.assign({}, s.play, { left: s.play.left.concat([it.id]) }) })); this.hint(it.n + ' stays behind.'); }
  gbUnpack(id) { const p = this.state.play; this.setPlay({ packed: p.packed.filter(x => x !== id) }); this.hint(this.item(id).n + ' taken out of the bag.'); }
  gbZip() {
    const p = this.state.play; if (!p.packed.length) { this.hint('Your bag is empty! Tap items to pack them.'); return; }
    const tray = p.tray.map(id => this.item(id)), packed = p.packed;
    const totalGood = tray.filter(t => t.good).length, packedGood = tray.filter(t => t.good && packed.indexOf(t.id) >= 0).length, wrong = tray.filter(t => !t.good && packed.indexOf(t.id) >= 0);
    const missed = tray.filter(t => t.good && packed.indexOf(t.id) < 0);
    const ratio = totalGood ? packedGood / totalGood : 0; let st = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1; if (wrong.length >= 3) st = Math.max(1, st - 1);
    this.finish(st, 'You packed ' + packedGood + ' of ' + totalGood + ' useful items' + (wrong.length > 0 ? ', and ' + wrong.length + ' that could stay home.' : '.'), { review: { missed: missed.map(t => ({ e: t.e, n: t.n, info: t.info })), wrong: wrong.map(t => ({ e: t.e, n: t.n, info: t.info })) } });
  }

  // QUAKE
  qRound(r) {
    const D = this.D, seq = D.QSEQ.slice(0, r), gap = Math.max(520, 1000 - (r - 1) * 140);
    this.setPlay({ round: r, phase: 'watch', idx: 0, cue: null }); this.hint('Round ' + r + '. Watch the coach.');
    seq.forEach((m, i) => { this.later(() => { this.setPlay({ cue: m[0] }); this.hint('Coach: ' + m[2] + '. ' + m[3]); }, 700 + i * gap); });
    this.later(() => { this.setPlay({ cue: null, phase: 'copy' }); this.hint('Your turn! Copy the moves in the same order.'); }, 700 + seq.length * gap);
  }
  qTap(id) {
    const p = this.state.play, Q = this.D.QSEQ;
    if (p.phase !== 'copy' || p.flash) { this.hint('Watch the coach first.'); return; }
    const exp = Q[p.idx];
    if (id === exp[0]) {
      const idx = p.idx + 1; this.setPlay({ flash: { id, ok: true }, idx }); this.later(() => this.setPlay({ flash: null }), 380);
      if (idx === p.round) {
        if (p.round === Q.length) { this.setPlay({ phase: 'done' }); this.later(() => this.finish(p.mistakes === 0 ? 3 : p.mistakes <= 2 ? 2 : 1, Q.length + ' of ' + Q.length + ' rounds · ' + p.mistakes + ' mistake' + (p.mistakes === 1 ? '' : 's')), 600); return; }
        this.setPlay({ phase: 'wait' }); this.hint('Great! Next round is a little faster.'); this.later(() => this.qRound(p.round + 1), 1100);
      } else this.hint(exp[2] + '! What comes next?');
    } else {
      this.setPlay({ flash: { id, ok: false }, mistakes: p.mistakes + 1, phase: 'wait' }); this.later(() => this.setPlay({ flash: null }), 450);
      this.hint('Not quite. ' + exp[2] + ' comes next. Watch again.'); this.later(() => this.qRound(p.round), 1300);
    }
  }

  // SAFE PATH
  parseGrid(rows) { const h = rows.length, w = rows[0].length, cells = []; let start = -1, goal = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const ch = rows[y][x]; if (ch === 'S') start = y * w + x; if (ch === 'E') goal = y * w + x; cells.push(ch); } return { w, h, cells, start, goal }; }
  pathGrid(p) { const PT = this.D.PATH; if (p.m === 0) return this.parseGrid(PT.TRACE); if (p.m === 2) return this.parseGrid(PT.L3F); return this.parseGrid(PT.LEVELS[p.map || 0]); }
  pObst(ch) { return ch === 'T' || ch === 'B' || ch === 'P' || ch === 'W'; }
  pAt(g, x, y) { return x < 0 || y < 0 || x >= g.w || y >= g.h ? null : g.cells[y * g.w + x]; }
  pRisky(g, i) { if (this.pObst(g.cells[i])) return false; const x = i % g.w, y = Math.floor(i / g.w); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const n = this.pAt(g, x + dx, y + dy); if (n && this.pObst(n)) return true; } return false; }
  pNearest(g, i) { const x = i % g.w, y = Math.floor(i / g.w); let diag = null; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const n = this.pAt(g, x + dx, y + dy); if (n && this.pObst(n)) { if (Math.abs(dx) + Math.abs(dy) === 1) return n; diag = n; } } return diag; }
  pNbrs(g, i) { const x = i % g.w, y = Math.floor(i / g.w), r = []; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const n = this.pAt(g, x + d[0], y + d[1]); if (n !== null && !this.pObst(n)) r.push((y + d[1]) * g.w + (x + d[0])); }); return r; }
  pPath(g, from, to, avoid) { const q = [from], prev = {}, seen = {}; seen[from] = 1; while (q.length) { const cur = q.shift(); if (cur === to) { const path = [to]; let k = to; while (k !== from) { k = prev[k]; path.unshift(k); } return path; } this.pNbrs(g, cur).forEach(nx => { if (avoid && nx !== to && avoid(nx)) return; if (!seen[nx]) { seen[nx] = 1; prev[nx] = cur; q.push(nx); } }); } return null; }
  pAdj(g, a, b) { return Math.abs((a % g.w) - (b % g.w)) + Math.abs(Math.floor(a / g.w) - Math.floor(b / g.w)) === 1; }
  l3Elev(i) { const E = this.D.PATH.L3E, w = E[0].length; const e = parseInt(E[Math.floor(i / w)][i % w], 10); return isNaN(e) ? 0 : e; }
  l3Near(g, i, chs) { const x = i % g.w, y = Math.floor(i / g.w); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const n = this.pAt(g, x + dx, y + dy); if (n && chs.indexOf(n) >= 0) return true; } return false; }
  l3Slope(g, i) { const x = i % g.w, y = Math.floor(i / g.w), e = this.l3Elev(i); let m = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { if (this.pAt(g, x + d[0], y + d[1]) !== null) { const df = Math.abs(e - this.l3Elev((y + d[1]) * g.w + x + d[0])); if (df > m) m = df; } }); return m; }
  l3Danger(g, i, hz) { if (this.pObst(g.cells[i]) || i === g.goal || !hz || hz === 'clear') return false; const e = this.l3Elev(i); if (hz === 'tsunami' || hz === 'surge') return e <= 1 || this.l3Near(g, i, ['W']); if (hz === 'typhoon') return e <= 1 || this.l3Near(g, i, ['T', 'P', 'B']); if (hz === 'thunderstorm') return e >= 4 || this.l3Near(g, i, ['T', 'P']); if (hz === 'landslide') return this.l3Slope(g, i) >= 2; return false; }
  hz3Title(h) { return { tsunami: 'Tsunami', surge: 'Storm surge', typhoon: 'Typhoon', thunderstorm: 'Thunderstorm', landslide: 'Landslide' }[h] || 'All clear'; }
  hz3Icon(h) { return { tsunami: '🌊', surge: '🌊', typhoon: '🌀', thunderstorm: '⛈️', landslide: '🏔️' }[h] || '☀️'; }
  hz3Advice(h) { return { tsunami: 'Tsunami warning. Leave the low coast and climb to higher ground.', surge: 'Storm surge warning. The sea will rise over low ground. Move uphill, away from the water.', typhoon: 'Typhoon warning. Keep away from trees, poles, houses, and the coast.', thunderstorm: 'Thunderstorm warning. Do not stand under trees or poles, and stay off the highest open ground.', landslide: 'Landslide warning. Steep slopes can give way. Keep off steep ground.' }[h] || 'All clear. Choose any next step toward the tent.'; }
  hz3Msg(h, g, i) {
    if (h === 'tsunami') return 'The tsunami swept over this low ground near the sea. Head uphill, away from the water.';
    if (h === 'surge') return 'The storm surge flooded this low ground. Move to higher ground, away from the coast.';
    if (h === 'typhoon') { if (this.l3Near(g, i, ['T'])) return 'A tree came down beside you in the typhoon. Stay clear of trees in strong wind.'; if (this.l3Near(g, i, ['P'])) return 'A power line snapped nearby in the typhoon. Keep away from poles.'; if (this.l3Near(g, i, ['B'])) return 'Flying debris from a house struck near you. Keep your distance in a typhoon.'; return 'The surge reached this low ground. Move uphill, away from the coast.'; }
    if (h === 'thunderstorm') { if (this.l3Near(g, i, ['T', 'P'])) return 'Lightning struck a tall tree or pole beside you. Never shelter under them in a storm.'; return 'You were the tallest thing on high open ground when lightning struck. Move lower and off the peak.'; }
    if (h === 'landslide') return 'The steep slope gave way beneath you. Keep off steep ground during heavy rain.';
    return 'All clear.';
  }
  dieMsg(face, src) {
    if (face === 'quake') { if (src === 'W') return 'An earthquake struck while you were near the coastline. A tsunami can follow, so move to higher ground away from the sea.'; if (src === 'B') return 'An earthquake struck next to a building. Falling glass and debris are dangerous, so keep away from buildings during a quake.'; if (src === 'P') return 'An earthquake struck next to an electricity pole. It can topple and wires can spark, so stay clear of poles.'; if (src === 'T') return 'An earthquake struck near a tree. Branches can fall, so move to open, clear ground.'; return 'An earthquake struck. Move to open ground away from anything that can fall.'; }
    if (src === 'T') return 'A typhoon hit while you stood by a tree. Branches and trunks can fall in strong wind, so keep your distance.'; if (src === 'P') return 'A typhoon hit next to an electricity pole. Wires can snap and spark, so stay well away.'; if (src === 'W') return 'A typhoon hit near the coastline. A storm surge can flood the shore, so move inland to higher ground.'; if (src === 'B') return 'A typhoon hit near a building. Roofs and signs can fly off, so move to a safer open area.'; return 'A typhoon hit. Move away from anything that can be blown loose.';
  }
  pFinish(p, g, steps) {
    const short = (this.pPath(g, g.start, g.goal, null) || []).length - 1; const eff = short > 0 ? short / Math.max(steps, 1) : 1;
    const st = p.lost === 0 && eff >= 0.8 ? 3 : p.lost <= 1 && eff >= 0.55 ? 2 : 1;
    this.later(() => this.finish(st, 'Steps: ' + steps + ' · Hearts lost: ' + p.lost, { title: this.game('path').mTitle[p.m] }), 450);
  }
  pTap(i) {
    const p = this.state.play, g = this.pathGrid(p);
    if (p.m === 0) {
      const route = p.route.slice(), k = route.indexOf(i);
      if (k >= 0) { if (k < route.length - 1) { route.length = k + 1; this.setPlay({ route }); this.hint('Route shortened. Keep drawing.'); } return; }
      if (this.pObst(g.cells[i])) return this.hint('You cannot cross houses, trees, or water. Go around them.');
      if (!this.pAdj(g, route[route.length - 1], i)) return this.hint('Draw to a tile right next to the end of your line.');
      route.push(i); this.setPlay({ route });
      if (i === g.goal) { const short = (this.pPath(g, g.start, g.goal, null) || []).length - 1, steps = route.length - 1; this.later(() => this.finish(steps <= short ? 3 : steps <= short + 3 ? 2 : 1, 'Route: ' + steps + ' steps · Shortest: ' + short, { title: 'You reached safety!' }), 450); }
      else this.hint('Keep going to the green tent.');
      return;
    }
    if (p.rolling) return;
    if (p.need) return this.hint(p.m === 2 ? 'Roll the warning first!' : 'Roll the die first!');
    if (i === p.pos) return;
    if (!this.pAdj(g, p.pos, i)) return this.hint('Tap a tile right next to you.');
    if (this.pObst(g.cells[i])) return this.hint("You can't step there. Go around it.");
    const steps = p.steps + 1;
    if (p.m === 2 && this.l3Danger(g, i, p.hz)) {
      const hearts = p.hearts - 1, lost = p.lost + 1; this.setPlay({ pos: i, steps, hearts, lost, need: true }); this.hint(this.hz3Msg(p.hz, g, i));
      if (hearts <= 0) this.later(() => this.finish(1, 'Out of hearts. Climb away from danger next time.', { title: 'So close!' }), 700);
      return;
    }
    if (i === g.goal) { this.setPlay({ pos: i, steps }); this.pFinish(p, g, steps); return; }
    this.setPlay({ pos: i, steps, need: true });
    this.hint(p.m === 2 ? 'Safe! Roll for the next warning.' : this.pRisky(g, i) ? 'Careful, this tile is risky! Now roll the die.' : 'Now roll the die.');
  }
  pRoll() {
    const p = this.state.play; if (p.rolling) return; if (!p.need) return this.hint(p.m === 2 ? 'Make your move first.' : 'Move first, then roll the die.');
    this.setPlay({ rolling: true });
    this.later(() => {
      const q = this.state.play, g = this.pathGrid(q);
      if (q.m === 2) { const pool = ['clear', 'clear', 'tsunami', 'surge', 'typhoon', 'thunderstorm', 'landslide']; const hz = pool[Math.floor(Math.random() * pool.length)]; this.setPlay({ rolling: false, hz, need: false }); this.hint(this.hz3Advice(hz)); return; }
      const F = ['clear', 'clear', 'clear', 'clear', 'quake', 'typhoon'], face = F[Math.floor(Math.random() * F.length)];
      const caught = face !== 'clear' && this.pRisky(g, q.pos);
      const hearts = caught ? q.hearts - 1 : q.hearts, lost = caught ? q.lost + 1 : q.lost;
      this.setPlay({ rolling: false, die: face, hearts, lost, need: false });
      this.hint(caught ? this.dieMsg(face, this.pNearest(g, q.pos)) : face === 'clear' ? 'All clear. This is a safe spot.' : (face === 'quake' ? 'Earthquake' : 'Typhoon') + '! You stayed clear of danger. Well done.');
      if (hearts <= 0) this.later(() => this.finish(1, 'Out of hearts. Keep off risky tiles next time.', { title: 'So close!' }), 900);
    }, 650);
  }
  pReveal() { this.setPlay({ reveal: !this.state.play.reveal }); }
  pClear() { const g = this.pathGrid(this.state.play); this.setPlay({ route: [g.start] }); this.hint('Route cleared. Start again from home.'); }

  // HAZARD HUNT
  hzScene() { return this.D.SCENES[this.state.play.m] || this.D.SCENES[0]; }
  hzTotal(sc, scn) { return sc.street ? sc.items.filter(it => it.risk[scn]).length : sc.items.filter(it => it.hazard).length; }
  hzWord(ev) { return ev === 'typhoon' ? 'a typhoon' : ev === 'fire' ? 'a fire' : ev === 'both' ? 'an earthquake or a typhoon' : 'an earthquake'; }
  hzTap(it, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const p = this.state.play, sc = this.hzScene(); let card, found = p.found, wrong = p.wrong;
    const seen = p.seen.indexOf(it.id) >= 0 ? p.seen : p.seen.concat([it.id]);
    if (sc.street) {
      const r = it.risk[p.scn], nm = p.scn === 'flood' ? 'flood' : 'typhoon';
      if (r) { const k = it.id + ':' + p.scn; if (found.indexOf(k) < 0) found = found.concat([k]); card = { kind: 'haz', title: 'Risk in a ' + nm, sub: 'On a calm day: ' + it.asset, e: it.e, n: it.n, why: r.why, fix: r.fix }; }
      else { wrong++; card = { kind: 'safe', title: 'Not a risk in a ' + nm, e: it.e, n: it.n, why: it.asset }; }
    } else if (it.hazard) { if (found.indexOf(it.id) < 0) found = found.concat([it.id]); card = { kind: 'haz', title: 'Hazard spotted', sub: 'Dangerous in ' + this.hzWord(it.ev), e: it.e, n: it.n, why: it.why, fix: it.fix }; }
    else { wrong++; card = { kind: 'safe', title: 'Not a hazard', e: it.e, n: it.n, why: it.why }; }
    this.setState(s => ({ sheet: 'hz', sd: card, play: Object.assign({}, s.play, { found, wrong, seen }) }));
    this.speak(card.n + '. ' + card.why);
  }
  hzGot() {
    const p = this.state.play, sc = this.hzScene(); this.setState({ sheet: null });
    const done = sc.street ? (p.found.filter(k => k.indexOf(':typhoon') > 0).length >= this.hzTotal(sc, 'typhoon') && p.found.filter(k => k.indexOf(':flood') > 0).length >= this.hzTotal(sc, 'flood')) : p.found.length >= this.hzTotal(sc);
    if (done) { const n = p.found.length; this.later(() => this.finish(p.wrong === 0 ? 3 : p.wrong <= 3 ? 2 : 1, n + ' found · ' + p.wrong + ' wrong tap' + (p.wrong === 1 ? '' : 's'), { title: sc.street ? 'You spotted every risk!' : 'You spotted every hazard!' }), 300); return; }
    if (sc.street) { const t = this.hzTotal(sc, p.scn), f = p.found.filter(k => k.indexOf(':' + p.scn) > 0).length; this.hint(f >= t ? 'All ' + (p.scn === 'flood' ? 'flood' : 'typhoon') + ' risks found! Switch to the other hazard.' : 'Keep looking for ' + (p.scn === 'flood' ? 'flood' : 'typhoon') + ' risks.'); }
    else this.hint(p.found.length + ' of ' + this.hzTotal(sc) + ' hazards found. Keep looking!');
  }

  // GUIDE THE STREAM
  sGrid(p) { const rows = this.D.SAPA[p.m]; return { w: rows[0].length, h: rows.length, cells: p.cells }; }
  sAt(g, r, c) { return r < 0 || c < 0 || r >= g.h || c >= g.w ? null : g.cells[r * g.w + c]; }
  sReach(g) { let src = g.cells.indexOf('S'); const seen = {}, q = [src], out = []; seen[src] = 1; while (q.length) { const cur = q.shift(); out.push(cur); const r = Math.floor(cur / g.w), c = cur % g.w; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const R = r + d[0], C = c + d[1], ch = this.sAt(g, R, C), k = R * g.w + C; if (ch === 'C' && !seen[k]) { seen[k] = 1; q.push(k); } }); } return out; }
  sDone(g) { return this.sReach(g).some(i => { const r = Math.floor(i / g.w), c = i % g.w; return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => this.sAt(g, r + d[0], c + d[1]) === 'E'); }); }
  sHouses(g) { const out = {}; this.sReach(g).forEach(i => { const r = Math.floor(i / g.w), c = i % g.w; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { if (this.sAt(g, r + d[0], c + d[1]) === 'H') out[(r + d[0]) * g.w + c + d[1]] = 1; }); }); return Object.keys(out).map(Number); }
  sShortest(m) { const rows = this.D.SAPA[m], w = rows[0].length, h = rows.length, cells = rows.join('').split(''); const src = cells.indexOf('S'), sea = cells.indexOf('E'); const pass = ch => ch === '.' || ch === 'G' || ch === 'S' || ch === 'E'; const q = [[src, 0]], seen = {}; seen[src] = 1; while (q.length) { const cur = q.shift(); if (cur[0] === sea) return Math.max(0, cur[1] - 1); const r = Math.floor(cur[0] / w), c = cur[0] % w; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const R = r + d[0], C = c + d[1]; if (R < 0 || C < 0 || R >= h || C >= w) return; const k = R * w + C; if (seen[k] || !pass(cells[k])) return; seen[k] = 1; q.push([k, cur[1] + 1]); }); } return 99; }
  sTap(i) {
    const p = this.state.play; if (p.raining) return; const ch = p.cells[i];
    if (ch === 'S') return this.hint('This is the creek, where the water starts.');
    if (ch === 'E') return this.hint('This is the sea. Guide the water here.');
    if (ch === 'H') return this.hint('Keep the water away from houses.');
    if (ch === 'X') return this.hint('Rock. You cannot build here.');
    const cells = p.cells.slice(); cells[i] = ch === 'G' ? '.' : ch === '.' ? 'C' : '.';
    this.setPlay({ cells, wet: [] });
    const g = this.sGrid({ m: p.m, cells });
    this.hint(ch === 'G' ? 'Silt cleared! Now the water can pass here.' : this.sDone(g) ? 'The channel reaches the sea! Let it rain.' : 'Keep building toward the sea.');
  }
  sRain() {
    const p = this.state.play; if (p.raining) return; const g = this.sGrid(p);
    if (this.sDone(g)) { const used = p.cells.filter(c => c === 'C').length, opt = this.sShortest(p.m); const st = p.lost === 0 && used <= opt + 1 ? 3 : p.lost <= 1 && used <= opt + 4 ? 2 : 1; this.setPlay({ raining: true }); this.hint('The water flows out to the sea. Homes stay dry!'); this.later(() => this.finish(st, 'Channel pieces: ' + used + ' · Fewest possible: ' + opt), 1500); return; }
    const wet = this.sHouses(g), hearts = p.hearts - 1, lost = p.lost + 1;
    this.setPlay({ wet, hearts, lost });
    this.hint(wet.length ? 'The water spilled into ' + wet.length + ' home' + (wet.length > 1 ? 's' : '') + '! Finish the channel to the sea.' : 'The water has nowhere to go and floods the ground. Build the channel all the way to the sea.');
    if (hearts <= 0) this.later(() => this.finish(1, 'Out of hearts. The homes flooded.', { title: 'The homes flooded' }), 900);
  }

  // HOUSE CLEANUP
  clSc() { return this.D.CLEAN[this.state.play.k || 'flood']; }
  clExplain(it) { if (it.act === 'keep') return it.n + ' can be cleaned and kept. ' + it.why; if (it.act === 'hazard') return it.n + ' is dangerous. Do not touch it, and tell an adult. ' + it.why; return it.n + ' should be thrown away. ' + it.why; }
  clChip(p) { return p.power && p.gear ? 'Safe to clean' : !p.power && !p.gear ? 'Safety first: switch off power, get gear' : !p.power ? 'Next: switch off the main power' : 'Next: get your gloves and boots'; }
  clTap(it) { const p = this.state.play; if (p.done.indexOf(it.id) >= 0) return; if (!p.power || !p.gear) return this.hint(this.clChip(p) + '.'); this.setState({ sheet: 'clAct', sd: it }); this.speak(it.n + '. ' + it.desc); }
  clFuse() { const p = this.state.play; if (p.power) return this.hint('The main power is already off.'); this.setState({ sheet: 'clFuse' }); }
  clPower() { this.setState(s => ({ sheet: null, play: Object.assign({}, s.play, { power: true }) })); this.hint(this.state.play.gear ? 'Safe to clean. Tap an item to decide what to do.' : 'Power is off. Now open the tools box for your gloves and boots.'); }
  clGear() { this.setState(s => ({ sheet: null, play: Object.assign({}, s.play, { gear: true }) })); this.hint(this.state.play.power ? 'Safe to clean. Tap an item to decide what to do.' : 'Gear on. Now switch off the main power at the fusebox.'); }
  clAct(a) {
    const it = this.state.sd, p = this.state.play;
    if (a !== it.act) { this.setState(s => ({ sheet: null, play: Object.assign({}, s.play, { mistakes: s.play.mistakes + 1 }) })); this.hint('Not quite. ' + (it.act === 'hazard' ? 'This one is dangerous. Do not touch it.' : 'Think again about this one.')); return; }
    if (a === 'toss') { this.setState({ sheet: 'clBin' }); return; }
    this.clDone(it);
  }
  clBin(b) { const it = this.state.sd; if (b !== it.bin) { this.setPlay({ mistakes: this.state.play.mistakes + 1 }); this.hint('Not that bin. Try another one.'); return; } this.clDone(it); }
  clDone(it) {
    const p = this.state.play, done = p.done.concat([it.id]); this.setState(s => ({ sheet: null, play: Object.assign({}, s.play, { done }) })); this.hint(this.clExplain(it));
    const n = this.clSc().items.length; if (done.length >= n) { const mk = this.state.play.mistakes; this.later(() => this.finish(mk <= 1 ? 3 : mk <= 3 ? 2 : 1, n + ' of ' + n + ' sorted safely · ' + mk + ' mistake' + (mk === 1 ? '' : 's')), 900); }
  }

  // CARES
  cElev(m) { this.ce = this.ce || {}; if (this.ce[m]) return this.ce[m]; const C = this.D.CARES, W = C.W, N = W * W, st = C.MAPS[m], dist = Array(N).fill(999), q = st.slice(); st.forEach(i => { dist[i] = 0; }); while (q.length) { const cur = q.shift(); this.cNb(cur).forEach(n => { if (dist[n] > dist[cur] + 1) { dist[n] = dist[cur] + 1; q.push(n); } }); } const el = dist.map(d => Math.max(1, Math.min(5, 1 + d))); this.ce[m] = el; return el; }
  cNb(i) { const W = this.D.CARES.W, r = Math.floor(i / W), c = i % W, o = []; if (r > 0) o.push(i - W); if (r < W - 1) o.push(i + W); if (c > 0) o.push(i - 1); if (c < W - 1) o.push(i + 1); return o; }
  cStream(m, i) { return this.D.CARES.MAPS[m].indexOf(i) >= 0; }
  cTool(k) { return this.D.CARES.TOOLS.find(t => t[0] === k); }
  cRed(p) { const C = this.D.CARES, el = this.cElev(p.m); let s = 0; p.tiles.forEach((t, i) => { if (t === 'R') s += C.RED.R; else if (t === 'C') s += C.RED.C; else if (t === 'P') s += C.RED.P; else if (t === 'M' && this.cNb(i).some(n => this.cStream(p.m, n))) s += C.RED.M; else if (t === 'T' && el[i] >= 3) s += C.RED.T; }); return Math.min(C.CAP, s); }
  cSimulate(p) {
    const C = this.D.CARES, el = this.cElev(p.m), level = Math.max(0, C.BASE[p.scen] - this.cRed(p)); const flooded = [], wet = []; let total = 0, safe = 0;
    p.tiles.forEach((t, i) => { if (el[i] < level) flooded.push(i); if (t === 'H') { total += C.PER; const prot = t === 'D' || [i].concat(this.cNb(i)).some(n => p.tiles[n] === 'D'); if (el[i] < level && !prot) wet.push(i); else safe += C.PER; } });
    return { level, flooded, wet, pop: total, safe, pct: total ? safe / total : 0, goal: total >= C.GOAL };
  }
  cVerdict(r) { if (!r.goal) return 'Your community is too small. Add more houses to reach the goal, then keep them safe.'; if (r.pct >= 0.9) return 'A resilient community. Almost everyone stays safe because you built high, kept the stream clear, and used green and gray protection together.'; if (r.pct >= 0.7) return 'Fairly resilient, but some homes still flood. Move low houses to higher ground or add more protection.'; return 'Many homes flooded. Water settles in the lowest ground first, so build on higher ground and add green and gray infrastructure to hold the water back.'; }
  cTap(i) {
    const p = this.state.play; if (p.sim) return; const tiles = p.tiles.slice();
    if (this.cStream(p.m, i)) return this.hint('Keep the stream clear. You cannot build in the waterway.');
    if (tiles[i]) { tiles[i] = ''; this.setPlay({ tiles }); return; }
    tiles[i] = p.tool; this.setPlay({ tiles });
    const people = tiles.filter(t => t === 'H').length * this.D.CARES.PER, el = this.cElev(p.m)[i];
    if (p.tool === 'H') this.hint(people + ' of ' + this.D.CARES.GOAL + ' people.' + (el <= 2 ? ' This low ground floods first!' : ''));
  }
  cPick(k) { this.setPlay({ tool: k }); this.hint(this.cTool(k)[2] + '. ' + this.cTool(k)[4]); }
  cSim() {
    const p = this.state.play; if (p.sim) return; if (!p.tiles.some(t => t === 'H')) return this.hint('Build some houses first.');
    const r = this.cSimulate(p); this.setPlay({ sim: r }); this.hint('Water settles in the lowest ground first…');
    this.later(() => { const st = !r.goal ? 1 : r.pct >= 0.9 ? 3 : r.pct >= 0.7 ? 2 : 1; const v = this.cVerdict(r); this.finish(st, r.safe + ' of ' + r.pop + ' people stayed safe.', { title: st === 3 ? 'A resilient community!' : v.split('. ')[0].replace(/\.$/, '') + '.', say: v }); }, 1900);
  }

  openAsk() { this.setState({ ask: true, askKind: 'tip', askN: 0, jump: this.state.jump + 1 }); setTimeout(() => this.speak(this.askItem().text), 0); }
  askItem() {
    const s = this.state, D = this.D;
    if (s.askKind === 'trivia') { const t = D.TRIVIA[s.askN % D.TRIVIA.length]; return { kind: '❓ DID YOU KNOW?', text: t[0], game: t[1] }; }
    const list = [];
    if (['intro', 'play', 'result'].indexOf(s.screen) >= 0) { const g = this.game(s.gameId); list.push(['💡 TIP FOR ' + g.name.toUpperCase(), this.gTip(g, s.mode), g.id]); }
    if (s.screen === 'id') { const c = this.countOf(), n = this.nextOf(c); list.push(['🏆 CHAMPION TIP', n ? 'You have ' + c + ' badge' + (c === 1 ? '' : 's') + '. Earn ' + n.need + ' more to become ' + n.name + '!' : 'You are a Master DRRM Champion! Keep playing to stay sharp.', null]); }
    let tips = D.TIPS;
    if (s.screen === 'games' && s.filter !== 'all') tips = D.TIPS.filter(t => this.game(t[1]).p === s.filter).concat(D.TIPS.filter(t => this.game(t[1]).p !== s.filter));
    tips.forEach(t => list.push(['💡 SAFETY TIP', t[0], t[1]]));
    const it = list[s.askN % list.length]; return { kind: it[0], text: it[1], game: it[2] };
  }

  mascot(size, o) {
    const h = React.createElement; o = o || {};
    const arm = { x: 47, y: 39, width: 7, height: 18, rx: 3.5, fill: '#e8ab70' };
    if (o.wave) arm.style = { transformBox: 'fill-box', transformOrigin: '50% 10%', animation: 'bh-wave 1.1s ease-in-out infinite' };
    const svg = h('svg', { width: size, height: Math.round(size * 80 / 72), viewBox: '0 0 72 80', style: { display: 'block', overflow: 'visible' } },
      h('path', { d: 'M24 36 L48 36 L52 70 L20 70 Z', fill: '#f2760c', opacity: 0.92 }),
      h('rect', { x: 24, y: 37, width: 24, height: 26, rx: 8, fill: '#1f6f8b' }),
      h('polygon', { points: '36,41 38.2,46 43.6,46.4 39.4,49.9 40.8,55.2 36,52.2 31.2,55.2 32.6,49.9 28.4,46.4 33.8,46', fill: '#ffd24d' }),
      h('rect', { x: 18, y: 39, width: 7, height: 18, rx: 3.5, fill: '#e8ab70' }),
      h('rect', arm),
      h('rect', { x: 28, y: 61, width: 7, height: 14, rx: 3, fill: '#35506b' }),
      h('rect', { x: 37, y: 61, width: 7, height: 14, rx: 3, fill: '#35506b' }),
      h('circle', { cx: 36, cy: 24, r: 13, fill: '#e8ab70' }),
      h('path', { d: 'M23 23 a13 13 0 0 1 26 0 v-3 a13 13 0 0 0 -26 0 Z', fill: '#3a2a22' }),
      h('path', { d: 'M21 18 a15 10 0 0 1 30 0 Z', fill: '#ffc53d' }),
      h('rect', { x: 19, y: 16, width: 34, height: 4.5, rx: 2.25, fill: '#eaa100' }),
      h('g', { style: { transformBox: 'fill-box', transformOrigin: 'center', animation: 'bh-blink 4.2s infinite' } }, h('circle', { cx: 31, cy: 25, r: 1.9, fill: '#2a2320' }), h('circle', { cx: 41, cy: 25, r: 1.9, fill: '#2a2320' })),
      h('circle', { cx: 27.5, cy: 29, r: 2.1, fill: '#f29a7a', opacity: 0.55 }), h('circle', { cx: 44.5, cy: 29, r: 2.1, fill: '#f29a7a', opacity: 0.55 }),
      h('path', { d: 'M31 30 q5 4 10 0', stroke: '#2a2320', strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' })
    );
    const anim = [o.jump ? 'bh-jump .7s ease-out' : null, o.bob ? 'bh-bob 2.8s ease-in-out ' + (o.jump ? '.7s' : '0s') + ' infinite' : null].filter(Boolean).join(', ');
    return h('div', { key: o.key || 'm', style: { display: 'inline-block', transformOrigin: '50% 100%', animation: anim || 'none', marginBottom: o.mb || 0 } }, svg);
  }
  flame(w) {
    const h = React.createElement;
    return h('div', { style: { position: 'relative', width: w, height: Math.round(w * 1.35), animation: 'bh-flicker 1.4s ease-in-out infinite', transformOrigin: '50% 100%' } },
      h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: 'linear-gradient(#ffd24d, #ff9d2e 55%, #f2760c)' } }),
      h('div', { style: { position: 'absolute', left: '28%', right: '28%', bottom: '8%', height: '48%', borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: '#fff6d6' } }));
  }
  dots() { const h = React.createElement; return h('div', { style: { display: 'flex', gap: 8 } }, [0, 1, 2].map(i => h('span', { key: i, style: { width: 10, height: 10, borderRadius: '50%', background: '#fff', animation: 'bh-dot 1.2s ease-in-out ' + (i * 0.16) + 's infinite' } }))); }
  confetti(seed) {
    const h = React.createElement, C = ['#f2760c', '#ffc53d', '#1aa46a', '#2a6b8f', '#7a53c6', '#e2382b'], kids = [];
    for (let i = 0; i < 30; i++) {
      const r = n => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
      kids.push(h('span', { key: i, style: { position: 'absolute', top: -24, left: (r(1) * 100).toFixed(1) + '%', width: 7 + r(2) * 6, height: 10 + r(3) * 8, borderRadius: r(4) > 0.6 ? '50%' : 2, background: C[i % C.length], animation: 'bh-fall ' + (2.2 + r(5) * 1.8).toFixed(2) + 's linear ' + (r(6) * 0.8).toFixed(2) + 's both' } }));
    }
    return h('div', { key: 'cf' + seed, style: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 } }, kids);
  }

  hudVals(s, g, tablet) {
    const D = this.D, p = s.play || {}, M = (z, o) => this.mascot(z, o);
    const zbtn = { zoomIn: () => this.setState({ zoom: Math.min(1.3, +(s.zoom + 0.1).toFixed(2)) }), zoomOut: () => this.setState({ zoom: Math.max(0.8, +(s.zoom - 0.1).toFixed(2)) }) };
    const hud = Object.assign({
      quit: () => this.go('intro'), restart: () => this.startGame(s.gameId, s.mode, s.sub),
      howto: () => this.setState({ sheet: 'howto' }), settings: () => this.setState({ sheet: 'sound' }),
      hint: p.hint, mascot: M(36, { bob: true }), name: g.name, zoom: s.zoom,
      scene: p.top ? 'Top view' : ((g.modes && g.modes[s.mode] && g.modes[s.mode][3]) || g.scene || ''),
      hintTop: { fire: '206px', gobag: '100px', cares: '196px', hazard: p.m === 2 ? '192px' : '146px' }[p.g] || '146px',
      showLabel: ['fire', 'gobag', 'quake', 'cleanup'].indexOf(p.g) >= 0,
      fire: p.g === 'fire', gobag: p.g === 'gobag', quake: p.g === 'quake', path: p.g === 'path', hazard: p.g === 'hazard', sapa: p.g === 'sapa', cleanup: p.g === 'cleanup', cares: p.g === 'cares',
    }, zbtn);
    if (p.g === 'fire') {
      const sz = 0.25 + 0.75 * p.intensity / 100;
      hud.f = { chips: [['PULL', p.pin], ['AIM', p.chipAim], ['SQUEEZE', p.chipSq], ['SWEEP', p.chipSw]].map(c => ({ t: c[0], bg: c[1] ? '#128253' : 'rgba(255,255,255,.14)', bd: c[1] ? '#5fd39b' : 'rgba(255,255,255,.3)' })), fireW: p.intensity.toFixed(0) + '%', agentW: p.agent.toFixed(0) + '%', hard: p.m === 1, timer: '⏱️ ' + Math.round((Date.now() - p.t0) / 1000) + 's', flame: sz.toFixed(2), spraying: !!p.spraying, noPin: !p.pin, pull: () => this.pullPin(), ax: (p.ax * 100).toFixed(1), ay: (p.ay * 100).toFixed(1), retC: p.aimBase ? '#5fff9e' : 'rgba(255,255,255,.9)', sDown: e => { if (e && e.preventDefault) e.preventDefault(); this.fireDown(e); }, sMove: e => this.fireMove(e), sUp: () => this.fireUp(), down: e => { if (e && e.preventDefault) e.preventDefault(); this.sprayOn(); }, up: () => this.sprayOff(), sweepL: () => this.sweepTap(-1), sweepR: () => this.sweepTap(1), fwd: () => this.stepFire(-1), back: () => this.stepFire(1), dist: p.dist < 1 ? 'Too close' : p.dist > 5 ? 'Too far' : p.dist > 4 ? 'A bit far' : 'Good distance', distBg: p.dist < 1 || p.dist > 4 ? '#c62f22' : '#128253', noMenu: e => e.preventDefault() };
    }
    if (p.g === 'gobag') {
      const wt = this.bagW(p.packed);
      hud.gb = { items: p.tray.filter(id => p.packed.indexOf(id) < 0).map(id => { const x = this.item(id); return { e: x.e, n: x.n, op: p.left.indexOf(id) >= 0 ? 0.45 : 1, tap: () => this.setState({ sheet: 'gb', sd: x }) }; }), capW: Math.round(wt / D.CAP * 100) + '%', capBg: wt >= D.CAP - 1 ? 'linear-gradient(90deg,#ffb04d,#e2382b)' : 'linear-gradient(90deg,#3ee39b,#1aa46a)', count: 'Space used ' + wt + ' of ' + D.CAP + ' · ' + p.packed.length + (p.packed.length === 1 ? ' item' : ' items'), packed: p.packed.map(id => { const x = this.item(id); return { e: x.e, n: x.n, out: () => this.gbUnpack(id) }; }), hasPacked: p.packed.length > 0, zip: () => this.gbZip(), top: () => this.setPlay({ top: !p.top }) };
    }
    if (p.g === 'quake') {
      const cueM = p.cue ? D.QSEQ.find(m => m[0] === p.cue) : null;
      hud.q = { round: 'Round ' + p.round + ' of ' + D.QSEQ.length, mistakes: p.mistakes + ' mistake' + (p.mistakes === 1 ? '' : 's'), dots: D.QSEQ.map((m, i) => ({ on: i + 1 < p.round || p.phase === 'done', off: !(i + 1 < p.round || p.phase === 'done') })), cue: !!cueM, cueE: cueM ? cueM[1] : '', cueN: cueM ? cueM[2] : '', yourTurn: p.phase === 'copy', btns: D.QSEQ.map(m => { const f = p.flash && p.flash.id === m[0] ? p.flash.ok : null, cued = p.cue === m[0]; return { e: m[1], n: m[2], bg: f === true || cued ? '#128253' : f === false ? '#c62f22' : 'rgba(14,34,51,.82)', bd: f === true || cued ? '#5fd39b' : f === false ? '#ff9a8c' : 'rgba(255,255,255,.35)', op: p.phase === 'copy' || cued || f != null ? 1 : 0.55, tap: () => this.qTap(m[0]) }; }) };
    }
    if (p.g === 'path') {
      const gr = this.pathGrid(p), w = gr.w, cs = Math.min(46, Math.floor(((tablet ? 560 : 352) - (w - 1) * 4) / w)), cells = [];
      let route = {};
      if (p.m !== 0 && p.reveal) { const avoid = p.m === 2 ? (i => this.l3Danger(gr, i, p.hz)) : (i => this.pRisky(gr, i)); const pth = this.pPath(gr, p.pos, gr.goal, avoid) || this.pPath(gr, p.pos, gr.goal, null) || []; pth.forEach(i => { route[i] = 1; }); }
      const inRoute = {}; if (p.m === 0) p.route.forEach((i, k) => { inRoute[i] = k + 1; });
      const ELC = ['#3b8fd0', '#e4e4a6', '#bcd68a', '#9cc36e', '#b9a070', '#a0815a'];
      gr.cells.forEach((ch, i) => {
        const obst = this.pObst(ch), me = p.m !== 0 && p.pos === i, end = p.m === 0 && p.route[p.route.length - 1] === i;
        let bg = ch === 'W' ? '#3b8fd0' : ch === 'T' ? '#5d8a4e' : ch === 'B' ? '#c8b48c' : ch === 'P' ? '#9fb0bb' : ch === 'E' ? '#1aa46a' : (p.m === 0 && ch === 'S') ? '#ffd24d' : '#a8d58a';
        if (p.m === 2 && !obst && ch !== 'E') bg = ELC[this.l3Elev(i)];
        if (p.m === 1 && !obst && ch !== 'E' && ch !== 'S' && this.pRisky(gr, i)) bg = '#f0c463';
        if (p.m === 0 && inRoute[i] && ch !== 'S' && ch !== 'E') bg = '#ffe08a';
        const dang = p.m === 2 && p.hz && p.hz !== 'clear' && !obst ? this.l3Danger(gr, i, p.hz) : null;
        const e = me || end ? '🧒' : ({ W: '🌊', T: '🌳', B: p.m === 0 ? '🏘️' : '🏠', P: '⚡', E: '⛺', S: p.m === 0 ? '🏠' : '🚩' }[ch] || (p.m === 0 && inRoute[i] ? '•' : ''));
        const bd = me || end ? '#ffffff' : route[i] ? '#ffd24d' : dang === true ? '#ff5b4d' : dang === false ? '#3ee39b' : 'rgba(0,0,0,0)';
        cells.push({ e, bg, bd, risky: p.m === 1 && !me && this.pRisky(gr, i) && ch !== 'S', tap: () => this.pTap(i) });
      });
      const dieE = p.m === 2 ? (p.rolling ? '🎲' : p.hz ? this.hz3Icon(p.hz) : '🎲') : (p.rolling ? '🎲' : p.die === 'quake' ? '🌍' : p.die === 'typhoon' ? '🌀' : p.die === 'clear' ? '☀️' : '🎲');
      const dieL = p.rolling ? 'Rolling…' : p.m === 2 ? (p.hz ? this.hz3Title(p.hz) : 'Warning') : (p.die === 'quake' ? 'Earthquake' : p.die === 'typhoon' ? 'Typhoon' : p.die === 'clear' ? 'All clear' : 'Die');
      hud.pa = { cells, w, cs, fs: Math.round(cs * 0.5), trace: p.m === 0, notTrace: p.m !== 0, hearts: p.m !== 0 ? '❤️'.repeat(Math.max(0, p.hearts)) + '🤍'.repeat(3 - Math.max(0, p.hearts)) : '', steps: 'Steps: ' + (p.m === 0 ? p.route.length - 1 : p.steps), map: p.m === 1 ? 'Map ' + (p.map + 1) + ' of 3' : p.m === 2 ? 'Level 3' : 'Level 1', die: dieE, dieLab: dieL, rollLabel: p.m === 2 ? 'Roll the warning' : 'Roll the die', roll: () => this.pRoll(), rollOn: !!p.need && !p.rolling, rollOff: !(p.need && !p.rolling), reveal: () => this.pReveal(), clear: () => this.pClear() };
    }
    if (p.g === 'hazard') {
      const sc = D.SCENES[p.m] || D.SCENES[0];
      const total = sc.street ? this.hzTotal(sc, p.scn) : this.hzTotal(sc), f = sc.street ? p.found.filter(k => k.indexOf(':' + p.scn) > 0).length : p.found.length;
      hud.hz = { place: sc.name, count: sc.street ? (p.scn === 'flood' ? 'Flood' : 'Typhoon') + ' risks: ' + f + ' of ' + total : 'Hazards: ' + f + ' of ' + total, street: !!sc.street,
        typhoon: p.scn === 'typhoon', flood: p.scn === 'flood', tDone: this.hzTotal(sc, 'typhoon') <= p.found.filter(k => k.indexOf(':typhoon') > 0).length ? ' ✓' : '', fDone: this.hzTotal(sc, 'flood') <= p.found.filter(k => k.indexOf(':flood') > 0).length ? ' ✓' : '',
        setT: () => { this.setPlay({ scn: 'typhoon' }); this.hint('Typhoon! Find what turns risky in strong wind.'); }, setF: () => { this.setPlay({ scn: 'flood' }); this.hint('Flood! Find what turns risky when the water rises.'); },
        spots: sc.items.map(it => { const fk = sc.street ? it.id + ':' + p.scn : it.id, found = p.found.indexOf(fk) >= 0, seen = p.seen.indexOf(it.id) >= 0; return { e: it.e, n: it.n, x: it.x, y: it.y, found, ok: !found && seen && !sc.street && !it.hazard, plain: !found && !(seen && !sc.street && !it.hazard), tap: e => this.hzTap(it, e) }; }),
        miss: () => this.hint('Nothing there. Tap the things you can see.') };
    }
    if (p.g === 'sapa') {
      const gr = this.sGrid(p), reach = {}, wet = {}; this.sReach(gr).forEach(i => { reach[i] = 1; }); (p.wet || []).forEach(i => { wet[i] = 1; });
      const done = this.sDone(gr), n = p.cells.filter(c => c === 'C').length;
      hud.sa = { w: gr.w, cells: p.cells.map((ch, i) => ({ e: { S: '🏞️', E: '🌊', H: '🏠', X: '🪨', G: '🗑️', C: '💧' }[ch] || '', bg: wet[i] ? '#e2382b' : ch === 'S' ? '#3b8fd0' : ch === 'E' ? '#2a6fae' : ch === 'H' ? '#c8b48c' : ch === 'X' ? '#9aa5ad' : ch === 'G' ? '#9c7a52' : ch === 'C' ? (reach[i] ? (p.raining ? '#2f95e0' : '#5fb6e8') : '#a9d8f2') : '#8cc06a', anim: ch === 'C' && reach[i] && p.raining ? 'bh-rain .5s ease-in-out infinite' : 'none', tap: () => this.sTap(i) })),
        hearts: '❤️'.repeat(Math.max(0, p.hearts)) + '🤍'.repeat(3 - Math.max(0, p.hearts)), channel: 'Channel: ' + n, puzzle: 'Puzzle ' + (p.m + 1) + ' of 3', conn: done, notConn: !done, rain: () => this.sRain(), canRain: !p.raining, cantRain: !!p.raining };
    }
    if (p.g === 'cleanup') {
      const sc = this.clSc();
      hud.cl = { title: sc.title, chip: this.clChip(p), chipBg: p.power && p.gear ? '#1aa46a' : 'rgba(255,255,255,.16)', prog: p.done.length + ' of ' + sc.items.length + ' done', fuseDone: p.power, fuseTodo: !p.power, fuse: () => this.clFuse(), tools: () => this.setState({ sheet: 'clTools' }), gearGlow: p.power && !p.gear, gearGlowOff: !(p.power && !p.gear),
        items: sc.items.map((it, k) => ({ e: it.e, n: it.n, x: D.CLPOS[k][0], y: D.CLPOS[k][1], done: p.done.indexOf(it.id) >= 0, todo: p.done.indexOf(it.id) < 0, tap: () => this.clTap(it) })) };
    }
    if (p.g === 'cares') {
      const C = D.CARES, el = this.cElev(p.m), ELC = ['#3b8fd0', '#d8dd96', '#bcd27e', '#9cc46a', '#83ad57', '#6b9748'], fl = {}, wet = {};
      if (p.sim) { p.sim.flooded.forEach(i => { fl[i] = 1; }); p.sim.wet.forEach(i => { wet[i] = 1; }); }
      const people = p.tiles.filter(t => t === 'H').length * C.PER;
      hud.ca = { cells: p.tiles.map((t, i) => { const st = this.cStream(p.m, i), tl = t ? this.cTool(t) : null; return { e: tl ? tl[1] : st ? '〰️' : '', bg: st ? '#3b8fd0' : fl[i] ? '#58aee6' : ELC[el[i]], lv: st ? '' : String(el[i]), wet: !!wet[i], tap: () => this.cTap(i) }; }),
        people: 'People: ' + people + ' of ' + C.GOAL, placing: 'Placing: ' + this.cTool(p.tool)[2], flood: p.scen === 'flood', storm: p.scen === 'storm', setFlood: () => this.setPlay({ scen: 'flood' }), setStorm: () => this.setPlay({ scen: 'storm' }),
        tools: C.TOOLS.map(t => ({ e: t[1], n: t[2], on: p.tool === t[0], bd: t[3] === 'green' ? '#4bbf6b' : t[3] === 'gray' ? '#8fa3b0' : '#ffb020', bg: p.tool === t[0] ? 'rgba(255,197,61,.28)' : 'rgba(14,34,51,.82)', pick: () => this.cPick(t[0]) })),
        sim: () => this.cSim(), canSim: !p.sim, cantSim: !!p.sim };
    }
    return hud;
  }

  renderVals() {
    const s = this.state, D = this.D;
    const tablet = s.device === 'tablet', dm = this.dims(s.device);
    const me = this.me(), myAv = me ? this.av(me.av) : D.AV[0], nick = me ? me.nick : 'Player';
    const mine = this.earned(), count = this.countOf(), rank = this.rankOf(count), next = this.nextOf(count);
    const g = this.game(s.gameId), gp = D.P[g.p] || D.P.mit;
    const scr = s.screen, dark = scr === 'splash' || scr === 'play';
    const tabOf = { home: 'home', games: 'games', intro: 'games', id: 'id', players: 'players' };
    const isTab = ['home', 'games', 'id', 'players'].indexOf(scr) >= 0;
    const M = (size, o) => this.mascot(size, o);
    const TABS = { home: ['🏠', 'Home'], games: ['🎮', 'Games'], id: ['🏆', 'My ID'], players: [myAv.e, 'Players'] };
    const mkTab = k => ({ icon: TABS[k][0], label: TABS[k][1], on: tabOf[scr] === k, off: tabOf[scr] !== k, go: () => this.go(k, k === 'games' ? { filter: 'all' } : {}) });
    const sc = {}; ['splash', 'welcome', 'players', 'addPlayer', 'home', 'games', 'intro', 'play', 'result', 'id', 'settings'].forEach(k => { sc[k] = scr === k; });

    const today = new Date(), doy = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 864e5);
    const tip = D.TIPS[doy % D.TIPS.length], tg = this.game(tip[1]);
    const lines = [
      { t: 'Hi, ' + nick + '!', s: 'Ready to learn and be a hero today?' },
      { t: 'Tap me anytime!', s: 'I know lots of safety tips and fun facts.' },
      { t: count ? 'You have ' + count + ' badge' + (count > 1 ? 's' : '') + '!' : 'Earn your first badge!', s: next ? next.need + ' more to become ' + next.name + '.' : 'You are a Master DRRM Champion!' },
      { t: 'Did you know?', s: D.TRIVIA[Math.floor(s.homeN / 4) % D.TRIVIA.length][0] },
    ];
    const line = lines[s.homeN % lines.length], nextLine = lines[(s.homeN + 1) % lines.length];

    const da = this.av(s.draft.av), dn = s.draft.nick.trim();
    const askIt = this.askItem(), askG = askIt.game ? this.game(askIt.game) : null;
    const R = s.result || { id: 'fire', stars: 3, line: '', newB: false, had: false }, rg = this.game(R.id), rp = D.P[rg.p] || D.P.mit;
    const sd = s.sd || {};
    const rv = R.review || { missed: [], wrong: [] };
    const rTitle = R.title || (rg.mTitle ? rg.mTitle[s.mode] : rg.title) || '';
    const rSay = R.say || (rg.mSay ? rg.mSay[s.mode] : rg.say) || '';
    const hasNext = rg.id === 'cleanup' ? true : rg.id === 'path' ? (s.mode === 1 && s.sub < 2) : !!(rg.next && rg.modes && s.mode < rg.modes.length - 1);
    const howItems = (this.gLegend(g, s.mode) || this.gSteps(g, s.mode)).map(x => x.length === 3 ? { e: x[0], t: x[1] + ': ' + x[2] } : { e: x[0], t: x[1] });
    const cmode = (g.modes && g.modes[s.mode]) ? g.modes[s.mode] : null;

    return {
      tb: { jumpVal: '', phone: !tablet, tablet, setPhone: () => this.setState({ device: 'phone' }), setTablet: () => this.setState({ device: 'tablet' }), jumps: D.JUMPS.map(j => ({ v: j[0], l: j[1] })), onJump: e => { const v = e.target.value; if (v) this.jumpTo(v); }, restart: () => this.restart() },
      dv: { phone: !tablet, tablet, w: Math.round(dm.w * s.scale), h: Math.round(dm.h * s.scale), ow: dm.w, oh: dm.h, b: dm.b, r: dm.r, sr: dm.sr, scale: s.scale, dir: tablet ? 'row' : 'column', pad: tablet ? '46px 36px 36px' : '42px 18px 28px', pill: dark ? 'rgba(255,255,255,.55)' : 'rgba(22,48,63,.32)' },
      sb: { c: dark ? '#ffffff' : '#16303f' },
      nav: { bottom: isTab && !tablet, rail: tablet && (isTab || scr === 'intro' || scr === 'settings'), left: [mkTab('home'), mkTab('games')], right: [mkTab('id'), mkTab('players')], mascot: M(tablet ? 48 : 52, { bob: true, mb: -6 }), ask: () => this.openAsk(), settings: () => this.go('settings') },
      sc,
      splash: { flame: this.flame(48), dots: this.dots(), skip: () => this.afterSplash() },
      wl: { s0: s.ws === 0, s1: s.ws === 1, s2: s.ws === 2, dots: [0, 1, 2].map(i => ({ on: i === s.ws, off: i !== s.ws })), next: () => (s.ws < 2 ? this.setState({ ws: s.ws + 1 }) : this.newPlayer()), cta: s.ws < 2 ? 'Next' : "Let's start", skip: () => this.newPlayer(), showSkip: s.ws < 2, mascot: M(tablet ? 170 : 150, { wave: true, bob: true }) },
      ap: { title: s.draft.id ? 'Edit player' : 'New player', back: () => this.go(s.players.length ? 'players' : 'welcome', { ws: 2 }), av: da, previewName: dn || 'Your nickname', previewColor: dn ? '#16303f' : '#8fa3b0', avatars: D.AV.map(a => ({ id: a.id, e: a.e, bg: a.bg, ring: a.id === s.draft.av ? '#f2760c' : 'transparent', on: a.id === s.draft.av, pick: () => this.setState({ draft: Object.assign({}, s.draft, { av: a.id }) }) })), nick: s.draft.nick, onNick: e => { const v = e.target.value.slice(0, 14); this.setState(st => ({ draft: Object.assign({}, st.draft, { nick: v }) })); }, counter: s.draft.nick.length + '/14', ok: !!dn, notOk: !dn, save: () => this.savePlayer(), editing: !!s.draft.id, remove: () => this.setState({ sheet: 'remove', sd: s.players.find(x => x.id === s.draft.id) }), cta: s.draft.id ? 'Save' : "Let's play" },
      pl: { list: s.players.map(x => { const a = this.av(x.av), c = this.countOf(x.id); return { nick: x.nick, e: a.e, bg: a.bg, meta: c + ' badge' + (c === 1 ? '' : 's'), active: x.id === s.activeId, border: x.id === s.activeId ? '#f2760c' : '#d5e3ea', bstyle: s.editMode ? 'dashed' : 'solid', tap: () => this.pickPlayer(x), remove: () => this.setState({ sheet: 'remove', sd: x }) }; }), editing: s.editMode, editLabel: s.editMode ? 'Done' : 'Edit players', toggleEdit: () => this.setState({ editMode: !s.editMode }), canAdd: s.players.length < 10, add: () => this.newPlayer() },
      home: {
        mascot: M(tablet ? 84 : 72, { jump: true, bob: true, key: 'hm' + s.jump }), line, tapMascot: () => { this.setState({ homeN: s.homeN + 1, jump: s.jump + 1 }); this.speak(nextLine.t + ' ' + nextLine.s); }, speak: () => this.speak(line.t + ' ' + line.s, true),
        tip: { text: tip[0], icon: tg.icon, name: tg.name, open: () => this.openGame(tg.id) }, date: today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        avE: myAv.e, avBg: myAv.bg, nick, goPlayers: () => this.go('players'), goSettings: () => this.go('settings'), goId: () => this.go('id'),
        idPct: Math.round(count / 8 * 100), idLine: count + ' of 8 badges', rank: rank[1],
        pillars: D.PO.map(pid => { const P = D.P[pid], gs = D.G.filter(x => x.p === pid), live = gs.filter(x => !x.soon), soon = gs.length - live.length, done = live.filter(x => mine[x.id]).length; return Object.assign({}, P, { countLabel: live.length + (live.length === 1 ? ' game' : ' games') + (soon ? ' +' + soon + ' soon' : ''), prog: done + '/' + live.length, dash: (94.25 * (1 - done / live.length)).toFixed(2), open: () => this.go('games', { filter: pid }) }); }),
      },
      games: {
        sub: D.G.filter(x => !x.soon).length + ' games to play, ' + D.G.filter(x => x.soon).length + ' coming soon',
        chips: [{ id: 'all', icon: '✨', label: 'All', bg: '#16303f' }].concat(D.PO.map(pid => ({ id: pid, icon: D.P[pid].icon, label: D.P[pid].name, bg: D.P[pid].text }))).map(c => Object.assign({}, c, { on: s.filter === c.id, off: s.filter !== c.id, pick: () => this.setState({ filter: c.id }) })),
        hasBanner: s.filter !== 'all', banner: (() => { const P = D.P[s.filter] || D.P.mit; const live = D.G.filter(x => x.p === P.id && !x.soon); return Object.assign({}, P, { prog: live.filter(x => mine[x.id]).length + ' of ' + live.length + ' badges earned' }); })(),
        groups: (s.filter === 'all' ? D.PO : [s.filter]).map(pid => { const P = D.P[pid]; return { name: P.name, icon: P.icon, text: P.text, showHead: s.filter === 'all', games: D.G.filter(x => x.p === pid).map(x => ({ live: !x.soon, soon: !!x.soon, name: x.name, icon: x.icon, short: x.short, grad: P.grad, earned: !!mine[x.id], open: () => this.openGame(x.id), credit: e => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ sheet: 'credit', sd: x }); }, soonTap: () => this.snackShow('Coming soon! Bayani is still building this game.') })) }; }),
      },
      intro: { g, p: gp, back: () => this.go(s.from || 'games'), credit: () => this.setState({ sheet: 'credit', sd: g }), mascot: M(56, { bob: true }), tip: this.gTip(g, s.mode), speakTip: () => this.speak(this.gTip(g, s.mode), true), hasModes: !!g.modes, modesLabel: g.modesLabel, modes: (g.modes || []).map((m, i) => ({ icon: m[0], name: m[1], desc: m[2], on: i === s.mode, border: i === s.mode ? gp.ring : '#d5e3ea', tint: gp.tint, color: gp.text, pick: () => this.setState({ mode: i }) })), stepsTitle: this.gStepsTitle(g, s.mode), steps: this.gSteps(g, s.mode).map(x => ({ n: x[0], t: x[1], d: x[2], color: gp.text })), hasNote: !!g.note, note: g.note || '', start: () => this.startGame(s.gameId, s.mode, 0), startLabel: g.start || 'Start', earned: !!mine[g.id], badge: g.badge[0] },
      hud: this.hudVals(s, g, tablet),
      res: { s1: R.stars >= 1, s1off: R.stars < 1, s2: R.stars >= 2, s2off: R.stars < 2, s3: R.stars >= 3, s3off: R.stars < 3, title: rTitle, line: R.line, newB: R.newB, had: R.had, noB: R.stars < 3, badgeIcon: rg.badge[1], badgeName: rg.badge[0], badgeGrad: rp.grad, hasSay: !!rSay, say: rSay, sayLabel: rg.sayLabel || 'Bayani says', mascot: M(76, { jump: true, bob: true, key: 'rm' + s.jump }), confetti: R.stars >= 2 ? this.confetti(s.jump) : null, againLabel: rg.again || 'Play again', again: () => this.startGame(R.id, s.mode, s.sub), hasNext, nextLabel: rg.next || '', next: () => (rg.id === 'cleanup' ? this.startGame(R.id, s.mode === 1 ? 0 : 1, 0) : rg.id === 'path' ? this.startGame(R.id, 1, s.sub + 1) : this.startGame(R.id, s.mode + 1, 0)), hasBack: !!rg.back, backLabel: rg.back || '', back: () => this.go('intro'), home: () => this.go('home'), seeId: () => this.go('id'), speak: () => this.speak(rSay, true), tryLine: 'Get 3 stars to earn the ' + rg.badge[0] + ' badge.',
        hasReview: !!R.review, missed: rv.missed, hasMissed: rv.missed.length > 0, wrong: rv.wrong, hasWrong: rv.wrong.length > 0, perfect: !!R.review && !rv.missed.length && !rv.wrong.length },
      idc: {
        name: s.names[s.activeId] != null ? s.names[s.activeId] : nick, onName: e => { const v = e.target.value.slice(0, 28); this.setState(st => ({ names: Object.assign({}, st.names, { [st.activeId]: v }) })); },
        hasPhoto: !!s.photos[s.activeId], noPhoto: !s.photos[s.activeId], avE: myAv.e, avBg: myAv.bg, photoTap: () => this.setState({ sheet: 'photo' }), rank: rank[1], count,
        badges: D.BADGES.map(id => { const x = this.game(id); return { icon: x.badge[1], name: x.badge[0], earned: !x.soon && !!mine[id], locked: !x.soon && !mine[id], soon: !!x.soon }; }),
        nextTitle: next ? next.need + ' more badge' + (next.need > 1 ? 's' : '') + ' to become ' + next.name + '!' : 'You reached the top rank!', pct: next ? Math.round((count - rank[0]) / (next.min - rank[0]) * 100) : 100,
        ladder: D.RANKS.map(r => ({ name: r[1], min: r[0] + (r[0] === 1 ? ' badge' : ' badges'), reached: count >= r[0], notReached: count < r[0], current: r[1] === rank[1] ? 'YOU' : '' })),
        save: () => this.snackShow('Champion ID saved to Gallery'), share: () => this.setState({ sheet: 'share' }), print: () => this.setState({ sheet: 'print' }),
      },
      st: { sound: s.sound, soundOff: !s.sound, voice: s.voice, voiceOff: !s.voice, tSound: () => this.setState({ sound: !s.sound }), tVoice: () => { const v = !s.voice; this.setState({ voice: v }); if (v) setTimeout(() => this.speak('I will read tips and hints aloud.', true), 0); }, back: () => this.go('home'), players: () => this.go('players'), reset: () => this.setState({ sheet: 'reset' }), nick, aboutMore: s.aboutMore, aboutLess: !s.aboutMore, moreLabel: s.aboutMore ? 'See less' : 'See more', toggleAbout: () => this.setState({ aboutMore: !s.aboutMore }), behind: () => this.setState({ sheet: 'behind' }) },
      ask: { open: s.ask, close: () => this.setState({ ask: false }), hello: 'Hi, ' + nick + '!', tip: s.askKind === 'tip', tipOff: s.askKind !== 'tip', trivia: s.askKind === 'trivia', triviaOff: s.askKind !== 'trivia', setTip: () => this.setState({ askKind: 'tip', askN: 0, jump: s.jump + 1 }), setTrivia: () => this.setState({ askKind: 'trivia', askN: Math.floor(Math.random() * D.TRIVIA.length), jump: s.jump + 1 }), kind: askIt.kind, text: askIt.text, hasGame: !!askG, gameName: askG ? askG.name : '', gameIcon: askG ? askG.icon : '', play: () => { if (askG) this.openGame(askG.id); }, another: () => { this.setState({ askN: s.askN + 1, jump: s.jump + 1 }); }, speak: () => this.speak(askIt.text, true), mascot: M(tablet ? 112 : 104, { wave: true, bob: true, key: 'ak' + s.jump }) },
      sh: {
        open: !!s.sheet, close: () => this.setState({ sheet: null }), credit: s.sheet === 'credit', share: s.sheet === 'share', print: s.sheet === 'print', photo: s.sheet === 'photo', remove: s.sheet === 'remove', reset: s.sheet === 'reset', behind: s.sheet === 'behind', howto: s.sheet === 'howto', sound: s.sheet === 'sound', gb: s.sheet === 'gb', hz: s.sheet === 'hz', clFuse: s.sheet === 'clFuse', clTools: s.sheet === 'clTools', clAct: s.sheet === 'clAct', clBin: s.sheet === 'clBin',
        cr: { name: sd.name || '', icon: sd.icon || '', lead: 'Developed by ' + D.LEAD, hasNote: !!sd.note, note: sd.note || '' },
        targets: D.SHARE.map(t => ({ e: t[0], n: t[1], bg: t[2], go: () => { this.setState({ sheet: null }); this.snackShow(t[1] === 'Copy' ? 'Champion ID copied' : t[1] === 'Gallery' ? 'Champion ID saved to Gallery' : 'Shared to ' + t[1]); } })),
        idName: (s.names[s.activeId] != null ? s.names[s.activeId] : nick) || 'Champion', avE: myAv.e, avBg: myAv.bg, rank: rank[1], count,
        doPrint: () => { this.setState({ sheet: null }); this.snackShow('Sent to the printer'); }, doPdf: () => { this.setState({ sheet: null }); this.snackShow('Saved as PDF in Downloads'); },
        setPhoto: () => { this.setState(st => ({ sheet: null, photos: Object.assign({}, st.photos, { [st.activeId]: true }) })); this.snackShow('Photo added'); }, hasPhoto: !!s.photos[s.activeId], delPhoto: () => { this.setState(st => ({ sheet: null, photos: Object.assign({}, st.photos, { [st.activeId]: false }) })); },
        rmNick: sd.nick || '', rmYes: () => { if (sd.id) { this.setState({ sheet: null }); this.removePlayer(sd.id); } },
        nick, resetYes: () => { this.setState(st => ({ sheet: null, badges: Object.assign({}, st.badges, { [st.activeId]: {} }) })); this.snackShow('Badges reset for ' + nick); },
        howTitle: this.gLegend(g, s.mode) ? (g.id === 'hazard' || g.id === 'cares' ? 'How to play' : 'Map legend') : this.gStepsTitle(g, s.mode), howItems,
        st: { sound: s.sound, soundOff: !s.sound, voice: s.voice, voiceOff: !s.voice, tSound: () => this.setState({ sound: !s.sound }), tVoice: () => this.setState({ voice: !s.voice }) },
        item: { e: sd.e || '', n: sd.n || '', info: sd.info || '', desc: sd.desc || '', w: sd.w ? '🎒 Takes up ' + sd.w + ' space' + (sd.w > 1 ? 's' : '') + ' in your bag' : '' },
        card: { haz: sd.kind === 'haz', safe: sd.kind === 'safe', title: sd.title || '', sub: sd.sub || '', hasSub: !!sd.sub, e: sd.e || '', n: sd.n || '', why: sd.why || '', fix: sd.fix || '' },
        pack: () => this.gbPack(sd), leave: () => this.gbLeave(sd), hzGot: () => this.hzGot(),
        clPower: () => this.clPower(), clGear: () => this.clGear(), keep: () => this.clAct('keep'), toss: () => this.clAct('toss'), tell: () => this.clAct('hazard'), bio: () => this.clBin('bio'), recy: () => this.clBin('recycle'), spec: () => this.clBin('special'), binBack: () => this.setState({ sheet: 'clAct' }),
      },
      snack: { on: !!s.snack, text: s.snack || '', bottom: isTab && !tablet ? 110 : 34 },
    };
  }
}
