// @title Ready for the Big Shake
// @brand The Big Shake
// @sets room,school
// @out big-shake.html
  /* Story: a strong earthquake during a school day, then evacuation, an aftershock and pickup. */
  const STORY = {
    id:'quake', hazard:'earthquake', heading:'Ready for the Big Shake?',
    intro:'It’s a normal Monday at school, until the ground starts to shake. Talk with your teacher and classmates, make choices, and see what happens. Safe choices earn <b>safety stars</b>, and there are <b>4 endings</b> to find.',
    storageKey:'bigshake-endings-v1', radioLabel:'Radio · PHIVOLCS update',
    cast:['teacher','tonton','migo','mama','neighbor','pa','radio'],
    grownups:'For grown-ups: made for kids about 7 to 12 years old. Play together, then practice Duck, Cover and Hold at home. The school, the earthquake and the people in this story are made up.',
    start:'q_class', startVis:{set:'room', room:'class', sky:'sunny', fx:'still'}, startChip:'Monday morning',
    endVis:{set:'school', sky:'sunny', fx:'still students cracks'}, endChip:'Monday · 12:00 PM', endStatus:{k:'text', t:'Everyone accounted for', s:'Aftershocks may still happen', tone:'ok'},
    special:{flag:'back', ending:'back'},
    endings:{
      hero:{name:'Quake Ready Hero', text:'You spotted a hazard, ducked, covered and held, and followed your teacher every step of the way.', line:{who:'teacher', mood:'happy', say:'You were calm and careful today. I’m very proud of you!'}},
      safe:{name:'Steady and Safe', text:'You made it through the earthquake safely. A few choices were risky, but you learned from them. You’re almost a Quake Ready Hero!', line:{who:'mama', mood:'happy', say:'You’re safe, and that’s what matters most. Let’s practice at home, too.'}},
      lucky:{name:'Shaky Day', text:'Everyone is okay, but some choices could have gotten someone hurt. Play again and look for the safer path!', line:{who:'teacher', mood:'worried', say:'We were lucky today. Let’s practice our earthquake drill again soon.'}},
      back:{name:'Back Inside', color:'#6656C4', icon:'crack', text:'You ran back into the building during an aftershock. Never go back inside until the building is checked and grown-ups say it is safe.', line:{who:'teacher', mood:'worried', say:'Buildings can be damaged after a strong earthquake. We stay in the open area, always.'}}
    },
    scenes:{
      q_class:{
        vis:{set:'room', room:'class', sky:'sunny', fx:'still'}, time:'Monday · 9:00 AM', status:{k:'text', t:'Normal school day', s:'Grade 5 classroom', tone:'info'}, title:'Look around the room',
        text:[
          'Monday morning in Grade 5. Ma’am Joy is about to start the science lesson.',
          {who:'teacher', say:'Before we start, look around the room. Is there anything that could fall on us if the ground shakes?'},
          {who:'you', think:'Hmm… the clock, the books, that heavy box on top of the tall cabinet…'}
        ],
        choices:[
          {label:'Point at the heavy box on top of the tall cabinet.', say:'Ma’am, that heavy box on the cabinet could fall!', kind:'good', flag:'boxMoved', head:'Great eye!', fxVis:{set:'room', room:'class', sky:'sunny', fx:'still boxmoved'}, result:[{who:'teacher', mood:'happy', say:'You’re right! Let’s move it down to the floor right now.'}, 'Ma’am Joy puts the box safely on the floor.'], tip:'Heavy things up high can fall during an earthquake. Tell a grown-up so they can move them down low or strap them to the wall.', next:'q_shake'},
          {label:'Say the room looks fine.', say:'It all looks fine, Ma’am!', kind:'bad', head:'Look again!', result:[{who:'teacher', say:'Look up high. See the heavy box on the tall cabinet? I’ll move it after class.'}], tip:'Heavy things up high can fall during an earthquake. Tell a grown-up so they can move them down low or strap them to the wall.', next:'q_shake'}
        ]
      },
      q_shake:{
        vis:s => ({set:'room', room:'class', sky:'sunny', fx:'shake' + (s.flags.boxMoved ? ' boxmoved' : ' boxfallen')}),
        time:'Monday · 9:30 AM', status:{k:'text', t:'Earthquake!', s:'Intensity VI · Very strong', tone:'alarm'}, title:'The ground shakes!',
        text:s => [
          {sfx:'RUMBLE!'},
          'The floor starts to shake. The windows rattle, and the lights swing back and forth.',
          s.flags.boxMoved ? null : {sfx:'THUD!'},
          s.flags.boxMoved ? null : 'The heavy box falls off the cabinet and lands near a desk!',
          {who:'tonton', mood:'shock', say:'Earthquake! Let’s run outside!'},
          {who:'teacher', mood:'worried', say:'Duck, cover and hold!'}
        ],
        choices:[
          {label:'Duck under your desk, cover your head and hold on.', say:'Under the desk, Tonton! Hold on tight!', mood:'worried', kind:'good', head:'Duck, cover and hold!', result:['You crouch under the sturdy desk, cover your head and hold on to the desk leg.', {sfx:'CRASH!'}, 'Books slide off the shelf. After about a minute, the shaking stops.', {who:'teacher', mood:'happy', say:'Well done, everyone. Stay under your desks until I say so.'}], tip:'When the ground shakes, Duck, Cover and Hold. Get under a sturdy table, cover your head and neck, and hold on until the shaking stops. Running while the ground moves can make you fall or get hit.', next:'q_out'},
          {label:'Run for the door with Tonton.', say:'Come on, Tonton, run!', mood:'shock', kind:'bad', head:'Too risky!', result:['You stumble as the floor moves. A light swings right above you!', {who:'teacher', mood:'shock', say:'Stop! Get down and cover your head!'}, 'You crouch by the wall and cover your head until the shaking stops.'], tip:'When the ground shakes, Duck, Cover and Hold. Get under a sturdy table, cover your head and neck, and hold on until the shaking stops. Running while the ground moves can make you fall or get hit.', next:'q_out'}
        ]
      },
      q_out:{
        vis:s => ({set:'room', room:'class', sky:'sunny', fx:'still fallen cracks' + (s.flags.boxMoved ? ' boxmoved' : ' boxfallen')}),
        time:'Monday · 9:31 AM', status:{k:'text', t:'Shaking stopped', s:'Get ready to evacuate', tone:'info'}, title:'When the shaking stops',
        text:[
          'The shaking stops. Some books and a chair fell over, but everyone is okay.',
          {who:'pa', say:'Attention, everyone. Please evacuate to the school field now. Follow your teacher.'},
          {who:'teacher', say:'Line up. Leave your bags. Cover your head with your hands, and let’s go.'}
        ],
        choices:[
          {label:'Line up and walk out quietly with your class.', say:'No running, no pushing, no talking. Let’s go!', kind:'good', head:'Perfect evacuation!', result:[{who:'teacher', mood:'happy', say:'Perfect. Stay with the line and hold the railing on the stairs.'}], tip:'When the shaking stops, walk out with your class. Don’t run, don’t push, don’t talk, and don’t go back. Follow your teacher to the open evacuation area.', next:'q_field'},
          {label:'Stop to grab your bag and phone first.', say:'Wait, my bag!', mood:'worried', kind:'bad', head:'Leave it!', result:[{who:'teacher', mood:'worried', say:'Leave your things! Your bag can wait. You come first.'}, 'You drop the bag and hurry to catch up with the line.'], tip:'Your things can be replaced, but you can’t. Leave your bag and walk out right away with your class.', next:'q_field'}
        ]
      },
      q_field:{
        vis:{set:'school', sky:'sunny', fx:'still students'}, time:'Monday · 9:40 AM', status:{k:'text', t:'At the evacuation area', s:'School field', tone:'info'}, title:'On the school field',
        text:[
          'Your class reaches the school field. The sun is hot.',
          {who:'tonton', say:'Let’s wait in the shade by the building wall. It’s so hot here!'},
          {who:'teacher', say:'Class, stay in the open area with our section.'}
        ],
        choices:[
          {label:'Stay in the open field with your class.', say:'Let’s stay with Ma’am Joy in the open, Tonton.', kind:'good', head:'Good call!', result:[{who:'teacher', mood:'happy', say:'Thank you for staying with the class.'}], tip:'After an earthquake, wait in an open area away from buildings, walls, trees and power lines. Parts of buildings can fall, especially during aftershocks.', next:'q_after'},
          {label:'Wait in the shade next to the building wall.', say:'Okay, the shade looks nice!', mood:'happy', kind:'bad', head:'Not near the wall!', result:[{who:'teacher', mood:'shock', say:'Come away from the wall! Pieces can fall if the ground shakes again.'}, 'You hurry back to the open field.'], tip:'After an earthquake, wait in an open area away from buildings, walls, trees and power lines. Parts of buildings can fall, especially during aftershocks.', next:'q_after'}
        ]
      },
      q_after:{
        vis:{set:'school', sky:'sunny', fx:'shake students'}, time:'Monday · 9:50 AM', status:{k:'text', t:'Aftershock!', s:'Intensity IV · Moderately strong', tone:'alarm'}, title:'Another shake!',
        text:[
          {sfx:'RUMBLE!'},
          'The ground shakes again. It’s an aftershock!',
          {who:'tonton', mood:'shock', say:'Again?! Let’s run back inside to our classroom!'}
        ],
        choices:[
          {label:'Drop down, cover your head and stay in the open.', say:'Get down and cover your head, Tonton!', mood:'worried', kind:'good', head:'Exactly right!', fxVis:{set:'school', sky:'sunny', fx:'still students'}, result:['You crouch low in the field and cover your head and neck until it stops.', {who:'teacher', mood:'happy', say:'Good job! Aftershocks can happen after a strong earthquake. We stay right here.'}], tip:'Aftershocks can come minutes, hours or even days after a big earthquake. If you are outside, drop down, cover your head and stay away from buildings.', next:'q_migo'},
          {label:'Run back inside the building.', say:'Let’s go back to our room!', mood:'shock', kind:'bad', flag:'back', head:'Never go back in!', fxVis:{set:'school', sky:'sunny', fx:'still students pots'}, result:['You run toward the building.', {sfx:'CRASH!'}, 'A flowerpot falls from the second floor and breaks right behind you!', {who:'teacher', mood:'shock', say:'Never go back inside!'}, 'Ma’am Joy brings you back to the open field.'], tip:'Never go back into a building after an earthquake until it is checked and grown-ups say it is safe. Aftershocks can make damaged parts fall.', next:'q_migo'}
        ]
      },
      q_migo:{
        vis:{set:'school', sky:'sunny', fx:'still students'}, time:'Monday · 10:00 AM', status:{k:'text', t:'Head count', s:'Teachers are counting students', tone:'info'}, title:'Where is Migo?',
        text:[
          'Classes from every grade are on the field. Teachers are counting their students.',
          {who:'you', mood:'worried', think:'Where’s Migo? His Grade 1 class is on the other side of the field.'},
          {who:'tonton', say:'Go find him! Nobody will notice.'}
        ],
        choices:[
          {label:'Stay with your class and tell Ma’am Joy you’re worried about Migo.', say:'Ma’am, my brother Migo is in Grade 1. Can you check on him?', mood:'worried', kind:'good', head:'That’s the way!', result:[{who:'teacher', say:'Thank you for staying. I’ll ask his teacher right now.'}, 'A few minutes later, Ma’am Joy comes back.', {who:'teacher', mood:'happy', say:'Migo is safe with his class. You’ll see him soon.'}], tip:'After an earthquake, stay with your class so teachers can count everyone. If you leave, grown-ups may think you are missing and go looking for you.', next:'q_pickup'},
          {label:'Sneak across the field to find Migo.', say:'I’ll be right back!', kind:'bad', head:'Your teacher can’t find you!', result:[{who:'teacher', mood:'shock', say:'Has anyone seen my student? One is missing!'}, 'Ma’am Joy finds you across the field. She was very worried.'], tip:'After an earthquake, stay with your class so teachers can count everyone. If you leave, grown-ups may think you are missing and go looking for you.', next:'q_pickup'}
        ]
      },
      q_pickup:{
        vis:{set:'school', sky:'sunny', fx:'still students cracks'}, time:'Monday · 11:00 AM', status:{k:'text', t:'PHIVOLCS update', s:'Aftershocks expected', tone:'info'}, title:'Going home',
        text:[
          {who:'radio', say:'PHIVOLCS reports a magnitude 6.2 earthquake. Intensity VI was felt in the area. More aftershocks are expected.'},
          'Parents are arriving at the school gate.',
          {who:'neighbor', say:'Hi, dear! Your Mama is still on her way. Come, I’ll take you and Migo home.'}
        ],
        choices:[
          {label:'Ask Ma’am Joy before going with anyone.', say:'Ma’am, Tita Bing says she’ll take us home. Is that okay?', kind:'good', head:'Smart and safe!', result:[{who:'teacher', say:'Let me check your pickup list. Your Mama called. She wants you to wait for her.'}, 'Soon Mama arrives and hugs you and Migo tight.', {who:'mama', mood:'happy', say:'I’m so glad you’re both safe!'}], tip:'After a disaster, wait for your parent or the grown-up on your school’s pickup list. Always tell your teacher before you leave.', next:'END'},
          {label:'Go with Tita Bing right away.', say:'Okay, Tita, let’s go!', mood:'happy', kind:'bad', head:'Tell your teacher first!', result:[{who:'teacher', mood:'shock', say:'Wait! You can’t leave without telling me.'}, 'Ma’am Joy calls Mama, who is almost at the gate. You wait for her together.'], tip:'After a disaster, wait for your parent or the grown-up on your school’s pickup list. Always tell your teacher before you leave.', next:'END'}
        ]
      }
    }
  };
