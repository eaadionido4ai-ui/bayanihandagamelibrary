// @title Ready for the Smoke Alarm
// @brand Smoke at Night
// @sets room,home
// @out smoke-at-night.html
  /* Story: a fire hazard at home in the evening, then a night-time fire that starts next door. */
  const STORY = {
    id:'fire', hazard:'fire', heading:'Ready for the Smoke Alarm?',
    intro:'It’s a quiet Friday night at home, until the smoke alarm starts beeping. Talk with your family, make choices, and see what happens. Safe choices earn <b>safety stars</b>, and there are <b>4 endings</b> to find.',
    storageKey:'smoke-endings-v1',
    cast:['mama','papa','lola','migo','neighbor','firefighter'],
    grownups:'For grown-ups: made for kids about 7 to 12 years old. Play together, then make and practice a home fire escape plan with two ways out and a meeting place. The family and the fire in this story are made up.',
    start:'r_cord', startVis:{set:'room', room:'living', sky:'night', fx:'still'}, startChip:'Friday night',
    endVis:{set:'home', sky:'morning', fx:'still neighbor soot'}, endChip:'Saturday · 9:00 AM', endStatus:{k:'text', t:'Fire out', s:'Everyone is safe', tone:'ok'},
    special:{flag:'back', ending:'back'},
    endings:{
      hero:{name:'Fire Safe Hero', text:'You spotted a fire hazard, crawled low under the smoke, got out and stayed out, and called for help.', line:{who:'firefighter', mood:'happy', say:'You did everything right tonight. You’re a real fire safety hero!'}},
      safe:{name:'Out and Safe', text:'Your family got out safely. A few choices were risky, but you learned from them. You’re almost a Fire Safe Hero!', line:{who:'papa', mood:'happy', say:'We’re all safe. Let’s practice our escape plan this weekend.'}},
      lucky:{name:'Smoky Night', text:'Everyone is okay, but some choices could have gotten someone hurt. Play again and look for the safer path!', line:{who:'lola', mood:'worried', say:'We were lucky this time, apo. Fire moves fast, so we must move faster.'}},
      back:{name:'Back Into the Smoke', color:'#6656C4', icon:'flame', text:'You ran back toward the burning house. Once you are out, stay out, and tell firefighters about anyone still inside, including pets.', line:{who:'firefighter', mood:'worried', say:'Tell us who is still inside, and we will do the rescuing. Going back in is never safe.'}}
    },
    scenes:{
      r_cord:{
        vis:{set:'room', room:'living', sky:'night', fx:'still octopus'}, time:'Friday · 7:00 PM', status:{k:'text', t:'At home', s:'Friday night', tone:'info'}, title:'Too many plugs',
        text:[
          'Friday night. Everyone is home, charging phones and watching TV.',
          {who:'papa', say:'Anak, can you plug in the rice cooker for me? Use the extension cord.'},
          'The extension cord already has the TV, the electric fan and two chargers plugged in. It feels warm.',
          {who:'you', think:'That’s a lot of plugs in one cord… and why is it warm?'}
        ],
        choices:[
          {label:'Tell Papa the cord is full and feels warm.', say:'Pa, the cord is already full, and it feels warm!', kind:'good', head:'Great catch!', fxVis:{set:'room', room:'living', sky:'night', fx:'still'}, result:[{who:'papa', mood:'happy', say:'Good catch! Too many plugs can overheat and start a fire. I’ll use the wall outlet instead.'}], tip:'Too many plugs on one extension cord, sometimes called octopus wiring, can overheat and start a fire. Tell a grown-up if a cord or outlet feels warm.', next:'r_alarm'},
          {label:'Squeeze in one more plug.', say:'There’s still a little room. I’ll squeeze it in!', kind:'bad', head:'Bzzt! Danger!', fxVis:{set:'room', room:'living', sky:'night', fx:'still octopus spark'}, result:[{sfx:'BZZT!'}, 'The cord sparks for a second!', {who:'papa', mood:'shock', say:'Unplug it! Never overload the cord.'}, 'Papa unplugs some things and moves the rice cooker to the wall outlet.'], tip:'Too many plugs on one extension cord, sometimes called octopus wiring, can overheat and start a fire. Tell a grown-up if a cord or outlet feels warm.', next:'r_alarm'}
        ]
      },
      r_alarm:{
        vis:{set:'room', room:'bedroom', sky:'night', fx:'still dark smoke1 alarm'}, time:'Saturday · 2:00 AM', status:{k:'text', t:'Smoke alarm', s:'Beeping!', tone:'alarm'}, title:'Beep! Beep!',
        text:[
          {sfx:'BEEP! BEEP!'},
          'You wake up in the dark. The smoke alarm is beeping, and you smell smoke!',
          {who:'migo', mood:'shock', say:'{sib}! What’s that smell? I’m scared! Let’s hide under the bed!'}
        ],
        choices:[
          {label:'Wake Migo, get down low and crawl toward the door.', say:'Migo, don’t hide! Get down low and follow me!', mood:'worried', kind:'good', head:'Low and go!', result:['You both get down on your hands and knees. The air is clearer near the floor.', {who:'mama', mood:'shock', say:'Kids! Stay low and come to the door!'}], tip:'Never hide from a fire under a bed or in a closet, because firefighters may not find you. Smoke rises, so the cleaner air is down low. Crawl under the smoke to get out.', next:'r_door'},
          {label:'Hide under the bed with Migo.', say:'Quick, Migo, under the bed!', mood:'shock', kind:'bad', head:'Don’t hide!', fxVis:{set:'room', room:'bedroom', sky:'night', fx:'still dark smoke2 alarm'}, result:['You crawl under the bed. The room fills with more smoke.', {who:'papa', mood:'shock', say:'Kids! Where are you?!'}, 'Papa finds you and pulls you both out.'], tip:'Never hide from a fire under a bed or in a closet, because firefighters may not find you. Smoke rises, so the cleaner air is down low. Crawl under the smoke to get out.', next:'r_door'}
        ]
      },
      r_door:{
        vis:{set:'room', room:'bedroom', sky:'night', fx:'still dark smoke2 alarm'}, time:'Saturday · 2:01 AM', status:{k:'text', t:'Smoke alarm', s:'Beeping!', tone:'alarm'}, title:'The closed door',
        text:[
          'You reach the bedroom door. It’s closed.',
          {who:'you', mood:'worried', think:'Is there fire on the other side?'}
        ],
        choices:[
          {label:'Touch the door with the back of your hand first.', say:'Let me check if it’s hot first.', kind:'good', head:'Smart check!', result:['The door feels cool. You open it slowly. There is smoke in the hallway, but no fire.', {who:'papa', say:'This way! Stay low and follow my voice!'}], tip:'Before you open a door during a fire, feel it with the back of your hand. If it is hot, don’t open it. Use another way out, like a window.', next:'r_out'},
          {label:'Pull the door open fast.', say:'Let’s get out, quick!', mood:'shock', kind:'bad', head:'Careful!', result:['You yank the door open. A big puff of smoke rolls in!', {sfx:'COUGH! COUGH!'}, 'Luckily there is no fire in the hallway. You drop low and follow Papa’s voice.'], tip:'Before you open a door during a fire, feel it with the back of your hand. If it is hot, don’t open it. Use another way out, like a window.', next:'r_out'}
        ]
      },
      r_out:{
        vis:{set:'home', sky:'night', fx:'still neighbor smoke fireglow'}, light:'off', time:'Saturday · 2:03 AM', status:{k:'text', t:'Fire!', s:'The house next door is burning', tone:'alarm'}, title:'Out of the house',
        text:[
          'You make it outside! Smoke is pouring from the house next door, and the fire is spreading toward your kitchen.',
          {who:'papa', say:'Everyone to our meeting place, by the mango tree across the street!'},
          {who:'migo', mood:'shock', say:'Wait! Where’s Bantay? He’s still inside!'}
        ],
        choices:[
          {label:'Go to the meeting place and tell Papa about Bantay.', say:'Pa, our dog Bantay is still in the kitchen!', mood:'worried', kind:'good', head:'Get out, stay out!', result:[{who:'papa', say:'Thank you for telling me. I’ll tell the firefighters right away. We do not go back in.'}], tip:'Get out and stay out. Go to your family’s meeting place so everyone can be counted, and tell firefighters about anyone still inside, including pets.', next:'r_call'},
          {label:'Run back inside to get Bantay.', say:'I’ll get Bantay!', mood:'shock', kind:'bad', flag:'back', head:'Stop! Never go back in!', result:['You run back toward the door. Thick smoke rushes out at you!', {sfx:'COUGH! COUGH!'}, {who:'papa', mood:'shock', say:'No! Come back!'}, 'Papa pulls you away from the door just in time.'], tip:'Get out and stay out. Never go back inside a burning house for pets or things. Tell firefighters, and let them do the rescuing.', next:'r_call'}
        ]
      },
      r_call:{
        vis:{set:'home', sky:'night', fx:'still neighbor smoke fireglow'}, light:'off', time:'Saturday · 2:04 AM', status:{k:'text', t:'Emergency hotline', s:'Call 911', tone:'alarm'}, title:'Call for help',
        text:[
          {who:'mama', mood:'worried', say:'My phone is still inside! Who has a phone?'},
          {who:'neighbor', mood:'worried', say:'Here, use mine!'},
          {who:'you', think:'What number do we call for a fire?'}
        ],
        choices:[
          {label:'Call 911 and say there’s a fire, and where.', say:'Hello, 911? There’s a fire on Mabini Street, near the creek!', kind:'good', head:'Help is coming!', fxVis:{set:'home', sky:'night', fx:'still neighbor smoke fireglow firetruck'}, result:[{sfx:'WEE-OO!'}, 'Fire trucks arrive in just a few minutes.'], tip:'In the Philippines, call 911 for police, fire and medical emergencies. Stay calm, say what is happening and where you are, and answer the questions.', next:'r_fire'},
          {label:'Take a video of the fire to post online first.', say:'Wait, let me take a video first!', kind:'bad', head:'Help comes first!', fxVis:{set:'home', sky:'night', fx:'still neighbor smoke fireglow firetruck'}, result:[{who:'mama', mood:'shock', say:'Not now! We call for help first.'}, 'Tita Bing calls 911, and the fire trucks arrive.'], tip:'Calling for help comes first. In the Philippines, call 911 for police, fire and medical emergencies, and say what is happening and where.', next:'r_fire'}
        ]
      },
      r_fire:{
        vis:{set:'home', sky:'night', fx:'still neighbor smoke fireglow firetruck'}, light:'off', time:'Saturday · 2:15 AM', status:{k:'text', t:'Firefighters on scene', s:'Stay back', tone:'info'}, title:'The firefighters arrive',
        text:[
          'Firefighters jump out and spray water on the fire. A crowd gathers on the street.',
          {who:'firefighter', say:'Is everyone out? Is anyone still inside?'},
          {who:'papa', say:'All of us are out, but our dog is in the kitchen!'},
          {who:'migo', mood:'happy', say:'{sib}, let’s go closer and watch the fire truck!'}
        ],
        choices:[
          {label:'Stay back with your family and let the firefighters work.', say:'Let’s stay here, Migo. They need space to work.', kind:'good', head:'Thank you for staying back!', fxVis:{set:'home', sky:'night', fx:'still neighbor smoke firetruck'}, result:['The firefighters put out the fire. Then one of them walks out of the smoke holding something.', {who:'firefighter', mood:'happy', say:'Look who we found! Your dog is okay.'}, {who:'migo', mood:'happy', say:'Bantay!'}], tip:'Stay far from the fire and the fire trucks. Firefighters need space to work, and hoses and falling things can be dangerous.', next:'r_after'},
          {label:'Go closer to watch the fire truck and hoses.', say:'Cool! Let’s go see the hoses up close!', mood:'happy', kind:'bad', head:'Too close!', result:[{who:'firefighter', mood:'shock', say:'Kids, stay back! The hose can knock you down.'}, 'You run back to your family. Later, the firefighters put out the fire and bring Bantay out safe.'], tip:'Stay far from the fire and the fire trucks. Firefighters need space to work, and hoses and falling things can be dangerous.', next:'r_after'}
        ]
      },
      r_after:{
        vis:{set:'home', sky:'morning', fx:'still neighbor soot'}, time:'Saturday · 8:00 AM', status:{k:'text', t:'Fire out', s:'Everyone is safe', tone:'ok'}, title:'The next morning',
        text:[
          'The fire is out. Your kitchen is damaged, and the house next door is badly burned, but everyone is safe.',
          {who:'you', mood:'worried', think:'I keep thinking about the smoke and the beeping…'},
          {who:'lola', say:'Apo, you’re very quiet this morning.'}
        ],
        choices:[
          {label:'Tell Lola and Mama how you feel.', say:'I keep thinking about last night, Lola. I still feel scared.', mood:'worried', kind:'good', head:'Sharing helps!', result:[{who:'lola', mood:'happy', say:'Thank you for telling me, apo. It’s okay to feel scared.'}, {who:'mama', say:'Let’s make our family fire escape plan together, so we all know what to do.'}], tip:'It is normal to feel scared or sad after a fire. Talk to a grown-up you trust. Making and practicing a family escape plan can help you feel ready.', next:'END'},
          {label:'Keep the scary feelings to yourself.', think:'I’ll just keep it inside…', mood:'worried', kind:'meh', head:'You don’t have to carry it alone', result:['For days, you don’t sleep well.', {who:'lola', say:'Apo, whenever you’re ready to talk, I’m here.'}], tip:'It is normal to feel scared or sad after a fire. Talk to a grown-up you trust. Making and practicing a family escape plan can help you feel ready.', next:'END'}
        ]
      }
    }
  };
