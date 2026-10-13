// @title Ready for Bagyong Agos
// @brand Bagyong Agos
// @sets home,school
// @out bagyong-agos.html
  /* Story: a typhoon brings days of heavy rain and the creek floods. Home, then the school evacuation center. */
  const STORY = {
    id:'flood', hazard:'flood', heading:'Ready for Bagyong Agos?',
    intro:'Bagyong Agos is bringing heavy rain, and your house is near a creek. Talk with your family, make choices, and see what happens when the water rises. Safe choices earn <b>safety stars</b>, and there are <b>4 endings</b> to find.',
    storageKey:'agos-endings-v1', radioLabel:'Radio · PAGASA update',
    cast:['mama','papa','lola','migo','tonton','tanod','radio'],
    grownups:'For grown-ups: made for kids about 7 to 12 years old. Play together and talk about each choice. Bagyong Agos, the barangay and the family in this story are made up.',
    start:'f_rain', startVis:{set:'home', sky:'rainy', fx:'rain wind breezy'}, startChip:'Sunday afternoon',
    endVis:{set:'home', sky:'sunny', fx:'still mud waterline'}, endChip:'Tuesday · 12:00 PM', endStatus:{k:'rain', level:'none'},
    special:{flag:'back', ending:'back'},
    endings:{
      hero:{name:'Flood Smart Hero', text:'You stayed out of the floodwater, helped your family get ready, and left early when the barangay said to go.', line:{who:'mama', mood:'happy', say:'You kept us safe and dry, anak. We’re so proud of you!'}},
      safe:{name:'High and Dry', text:'Your family made it through the flood safely. A few choices were risky, but you learned from them. You’re almost a Flood Smart Hero!', line:{who:'papa', mood:'happy', say:'We’re all safe and dry. Next time, we’ll be even more ready.'}},
      lucky:{name:'Lucky Escape', text:'Everyone is okay, but some choices could have gotten someone hurt or sick. Play again and look for the safer path!', line:{who:'lola', mood:'worried', say:'We were lucky this time, apo. Floodwater is never a game.'}},
      back:{name:'Back Through the Water', color:'#6656C4', icon:'wave', text:'You went back into the floodwater in the middle of the flood. Never go back home until officials say it is safe, even for something you love.', line:{who:'tanod', mood:'worried', say:'Floodwater can rise again fast. Next time, stay at the evacuation center, okay?'}}
    },
    scenes:{
      f_rain:{
        vis:{set:'home', sky:'rainy', fx:'rain wind breezy flood1'}, time:'Sunday · 2:00 PM', status:{k:'rain', level:'yellow'}, title:'Rain, rain, rain',
        text:[
          {who:'radio', say:'PAGASA Yellow Rainfall Warning. Heavy rain from Bagyong Agos is falling over the area. Flooding is possible in low-lying places. Be alert.'},
          'Your house is near the creek. Rainwater is starting to fill the street.',
          {who:'migo', mood:'happy', say:'{sib}, look! The street is a swimming pool! Let’s go play in the water!'},
          {who:'you', think:'It looks fun… but where did all that water come from?'}
        ],
        choices:[
          {label:'Stay inside and keep Migo out of the floodwater.', say:'No, Migo. Floodwater is dirty, and it can hide holes. Let’s stay inside.', kind:'good', head:'Good thinking!', result:[{who:'mama', mood:'happy', say:'Thank you, anak. Floodwater can make people very sick.'}], tip:'Never play, wade or swim in floodwater. It can hide open manholes and sharp things, and it can carry germs that cause leptospirosis, a serious sickness.', next:'f_moveup'},
          {label:'Play in the water with Migo for a while.', say:'Okay, just for a few minutes!', mood:'happy', kind:'bad', flag:'waded', head:'Ouch!', result:['You splash around in the brown water.', {sfx:'OUCH!'}, 'Something sharp under the water scratches your foot.', {who:'mama', mood:'shock', say:'Get out of the water, both of you! Come inside now.'}], tip:'Never play, wade or swim in floodwater. It can hide open manholes and sharp things, and it can carry germs that cause leptospirosis, a serious sickness.', next:'f_moveup'}
        ]
      },
      f_moveup:{
        vis:{set:'home', sky:'rainy', fx:'rain wind breezy flood1'}, time:'Sunday · 4:00 PM', status:{k:'rain', level:'orange'}, title:'Move things up',
        text:[
          {who:'radio', say:'PAGASA Orange Rainfall Warning. Flooding is threatening in low-lying areas and near rivers. Be prepared.'},
          'The water in the street is now ankle-deep, and it keeps rising.',
          {who:'papa', say:'Let’s move our important things up high, where the water can’t reach them.'}
        ],
        choices:[
          {label:'Help carry papers, medicine and food to the high shelf.', say:'I’ll carry the papers and Lola’s medicine, Pa!', mood:'happy', kind:'good', head:'Great teamwork!', result:[{who:'papa', mood:'happy', say:'Thank you! Now the important things will stay dry.'}], tip:'Before water comes into the house, move important papers, medicine, food and small appliances to a high place. Put papers in plastic bags.', next:'f_bag'},
          {label:'Keep watching TV. The water is still outside.', say:'The water’s still outside, Pa. I’ll finish my show first.', kind:'bad', head:'It’s time to help!', result:[{who:'papa', mood:'worried', say:'Water can come inside faster than you think. Please help me now.'}, 'You help, but some of the papers on the low shelf already got wet.'], tip:'Floodwater can rise fast. Moving things up early keeps them safe and saves time for leaving.', next:'f_bag'}
        ]
      },
      f_bag:{
        type:'bag', pick:4, items:['papers','candle','medicine','console','flashlight','clothes','water','whistle'],
        vis:{set:'home', sky:'rainy', fx:'rain wind breezy flood1'}, time:'Sunday · 5:00 PM', status:{k:'rain', level:'orange'}, title:'Pack the Go Bag',
        text:[
          {who:'mama', say:'The barangay might ask us to evacuate tonight. Let’s get the Go Bag ready.'},
          {who:'mama', mood:'happy', say:'Pick 4 things. Remember, things can get wet, so think waterproof!'},
          {who:'you', think:'What will we need at the evacuation center?'}
        ],
        goodLine:{who:'mama', mood:'happy', say:'Great packing, anak! Everything we need is ready to go.'},
        badLine:{who:'mama', mood:'worried', say:'Hmm, some of these won’t help us at the evacuation center.'},
        tip:'For a flood, pack important papers in a plastic bag, medicine, a flashlight, water, a whistle and dry clothes. Leave out candles and gadgets.',
        next:'f_evac'
      },
      f_evac:{
        vis:{set:'home', sky:'dusk', fx:'rain wind storm flood2'}, light:'on', time:'Sunday · 6:30 PM', status:{k:'rain', level:'red'}, title:'Time to go',
        text:[
          {who:'radio', say:'PAGASA Red Rainfall Warning. Serious flooding is expected in low-lying areas. Take action, and follow your barangay’s evacuation orders.'},
          {sfx:'WEE-OO!'},
          {who:'tanod', say:'Attention, families near the creek! Please go to the evacuation center at the school now!'},
          {who:'lola', mood:'worried', say:'I have lived here through many floods. I’m staying in my house.'}
        ],
        choices:[
          {label:'Help Lola get ready and walk with her.', say:'Lola, the tanod says we have to go now. I’ll carry your bag. Let’s go together!', mood:'worried', kind:'good', head:'You helped Lola!', result:[{who:'lola', mood:'happy', say:'Hay, you’re right, apo. Let’s go together.'}], tip:'When the barangay says to evacuate, go early while it is still safe. Waiting until the water is deep makes leaving much more dangerous.', next:'f_walk'},
          {label:'Stay home with Lola. The water is only knee-deep.', say:'I’ll stay with Lola. The water isn’t that deep yet.', kind:'bad', head:'It’s not safe to stay!', result:[{who:'papa', mood:'worried', say:'No, anak. We all go together, right now.'}, 'Papa and the tanod help Lola, and your family leaves just in time.'], tip:'When the barangay says to evacuate, go early while it is still safe. Waiting until the water is deep makes leaving much more dangerous.', next:'f_walk'}
        ]
      },
      f_walk:{
        vis:{set:'home', sky:'dusk', fx:'rain wind storm flood2'}, light:'on', time:'Sunday · 7:00 PM', status:{k:'rain', level:'red'}, title:'The way to the school',
        text:[
          'Your family steps outside. The street is flooded, and the water is flowing fast toward the creek.',
          {who:'tonton', say:'Hey! I know a shortcut through the empty lot. It’s faster!'},
          {who:'tanod', say:'Everyone, wait here for the rescue truck. Stay together!'}
        ],
        choices:[
          {label:'Wait for the rescue truck with your family.', say:'Thanks, Tonton, but let’s wait for the truck with the tanod.', kind:'good', head:'Safe choice!', fxVis:{set:'home', sky:'dusk', fx:'rain wind storm flood2 truck'}, result:[{sfx:'BEEP BEEP!'}, 'The rescue truck rolls through the water and takes everyone to the school.'], tip:'Even shallow moving water can knock you down, and it can hide open manholes and drains. Wait for rescuers, or use the route they choose.', next:'f_center'},
          {label:'Take Tonton’s shortcut through the water.', say:'Okay, let’s go the fast way!', kind:'bad', head:'Whoa, the current!', fxVis:{set:'home', sky:'dusk', fx:'rain wind storm flood3'}, result:['The water in the empty lot is deeper than it looks. It pushes hard against your legs!', {who:'tanod', mood:'shock', say:'Stop! Come back here, the current is strong!'}, 'The tanod helps you both back to the group, and you all ride the rescue truck.'], tip:'Even shallow moving water can knock you down, and it can hide open manholes and drains. Wait for rescuers, or use the route they choose.', next:'f_center'}
        ]
      },
      f_center:{
        vis:{set:'school', sky:'night', fx:'rain wind tents evac'}, time:'Sunday · 9:00 PM', status:{k:'rain', level:'red'}, title:'At the evacuation center',
        text:[
          'The school is now an evacuation center. Your family gets a tent and a place to sleep.',
          {who:'mama', say:'Let’s stay together here. And remember, wash your hands before we eat.'},
          {who:'migo', mood:'shock', say:'{sib}! My toy truck is still at home! I want it!'},
          {who:'tonton', say:'The rain stopped for a bit. We could run back and get it!'}
        ],
        choices:[
          {label:'Stay at the center and comfort Migo.', say:'Migo, we can’t go back now. Come, let’s draw a new truck together.', kind:'good', head:'Kind and smart!', result:[{who:'migo', mood:'happy', say:'Okay… can I make it red?'}, {who:'mama', mood:'happy', say:'That was very kind, anak.'}], tip:'Never go back home during a flood, even for something you love. The water can rise again quickly. Stay at the evacuation center until officials say it is safe.', next:'f_home'},
          {label:'Sneak back home with Tonton to get the toy.', say:'Let’s be quick before anyone notices!', kind:'bad', flag:'back', head:'Danger in the dark!', fxVis:{set:'home', sky:'night', fx:'rain wind storm flood3'}, result:['You and Tonton slip out of the gate. The street is dark and full of water.', {sfx:'SPLASH!'}, 'The water is suddenly up to your waist!', {who:'tanod', mood:'shock', say:'Hoy! Get back here!'}, 'A rescuer brings you both back to the center.', {who:'mama', mood:'worried', say:'Anak, you scared me so much.'}], tip:'Never go back home during a flood, even for something you love. The water can rise again quickly. Stay at the evacuation center until officials say it is safe.', next:'f_home'}
        ]
      },
      f_home:{
        vis:{set:'home', sky:'sunny', fx:'still mud waterline'}, time:'Tuesday · 9:00 AM', status:{k:'rain', level:'none'}, title:'Going home',
        text:[
          {who:'radio', say:'Good morning! The rainfall warning has been lifted, and the floodwater has gone down.'},
          'Your family walks home. Mud is everywhere, and you can see a dirty water line on the wall.',
          {who:'migo', mood:'happy', say:'{sib}, let’s go inside and check our room!'}
        ],
        choices:[
          {label:'Wait outside until Papa checks that the electricity is safe.', say:'Wait, Migo! Papa needs to check the electricity first.', kind:'good', head:'Smart and safe!', result:[{who:'papa', mood:'happy', say:'Good thinking! The power stays off until an electrician says it’s safe. And boots on, everyone.'}], tip:'After a flood, stay out until grown-ups check the house. Wet wires and outlets can be dangerous. Wear boots in the mud, and never touch switches with wet hands.', next:s => s.flags.waded ? 'f_scratch' : 'END'},
          {label:'Run inside barefoot and turn on the lights.', say:'Race you inside, Migo!', mood:'happy', kind:'bad', head:'Stop! Don’t touch that!', result:[{who:'papa', mood:'shock', say:'Stop! Don’t touch the switch! Everything is still wet!'}, 'Papa makes sure the main power stays off, and everyone puts on boots.'], tip:'After a flood, stay out until grown-ups check the house. Wet wires and outlets can be dangerous. Wear boots in the mud, and never touch switches with wet hands.', next:s => s.flags.waded ? 'f_scratch' : 'END'}
        ]
      },
      f_scratch:{
        vis:{set:'home', sky:'sunny', fx:'still mud waterline'}, time:'Tuesday · 11:00 AM', status:{k:'rain', level:'none'}, title:'The scratch',
        text:[
          'Remember the scratch you got while playing in the floodwater?',
          {who:'you', mood:'worried', think:'My foot looks red and puffy where I got scratched…'}
        ],
        choices:[
          {label:'Tell Mama about the scratch from the floodwater.', say:'Ma, I got a scratch when I played in the floodwater.', mood:'worried', kind:'good', head:'Brave and honest!', result:[{who:'mama', mood:'worried', say:'Thank you for telling me. Let’s go to the health center today.'}, 'The doctor cleans the scratch and gives you medicine so you don’t get sick.'], tip:'If you waded in floodwater, especially with a cut, tell a grown-up and see a doctor. Leptospirosis can be prevented and treated when it is caught early.', next:'END'},
          {label:'Keep it a secret so Mama won’t get mad.', think:'I’ll just hide it…', mood:'worried', kind:'bad', head:'Secrets can make you sick!', result:['Two days later, you have a fever and your foot hurts.', {who:'mama', mood:'worried', say:'Why didn’t you tell me? Let’s see the doctor right away.'}, 'The doctor gives you medicine and you get better, but it would have been easier if you told Mama sooner.'], tip:'If you waded in floodwater, especially with a cut, tell a grown-up and see a doctor. Leptospirosis can be prevented and treated when it is caught early.', next:'END'}
        ]
      }
    }
  };
