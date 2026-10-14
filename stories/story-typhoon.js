// @title Ready for Bagyong Kulog
// @brand Bagyong Kulog
// @sets home
// @out bagyong-kulog.html
  /* Story: typhoon before and during landfall, no flooding. Line types: "text" = narration; {sfx}; {who, say, mood}; {who:'you', think, mood}; {who, say, via:'text'} = text message. */
  const STORY = {
    id:'typhoon', hazard:'typhoon', heading:'Ready for Bagyong Kulog?',
    intro:'A typhoon named Bagyong Kulog is heading to your town. Talk with your family, make choices, and see what happens. Safe choices earn <b>safety stars</b>, and there are <b>4 endings</b> to find.',
    storageKey:'kulog-endings-v1', radioLabel:'Radio · PAGASA update',
    cast:['mama','papa','lola','migo','tonton','radio'],
    grownups:'For grown-ups: made for kids about 7 to 12 years old. Play together and talk about each choice. Bagyong Kulog and the family in this story are made up.',
    start:'morning', startVis:'sunny', startChip:'Saturday morning',
    endVis:'morning', endChip:'Sunday · 8:00 AM', endStatus:{k:'signal', n:0},
    special:{flag:'eye', ending:'eye'},
    endings:{
      hero:{name:'Typhoon Ready Hero', text:'You got ready early, stayed calm and made safe choices all through Bagyong Kulog.', line:{who:'mama', mood:'happy', say:'You were so brave and smart, anak. We’re so proud of you!'}},
      safe:{name:'Safe and Sound', text:'Your family made it through Bagyong Kulog safely. A few choices were risky, but you learned from them. You’re almost a Typhoon Ready Hero!', line:{who:'papa', mood:'happy', say:'We’re all safe. And now you know even more about staying safe!'}},
      lucky:{name:'Lucky Night', text:'Everyone is okay, but some choices could have gotten someone hurt. Play again and look for the safer path!', line:{who:'lola', mood:'worried', say:'We were lucky this time, apo. Next typhoon, let’s make safer choices, okay?'}},
      eye:{name:'Caught in the Eye', color:'#6656C4', icon:'cyclone', text:'You learned about the eye of the typhoon the scary way! A sudden calm doesn’t mean the storm is over.', line:{who:'papa', mood:'worried', say:'Remember, the quiet middle is the eye. The storm isn’t over until PAGASA says so!'}}
    },
    scenes:{
      morning:{
        vis:'sunny', time:'Saturday · 7:30 AM', status:{k:'signal', n:1}, title:'News on the radio',
        text:[
          {who:'radio', say:'Good morning! PAGASA reports that Bagyong Kulog will pass over our area tonight. Tropical Cyclone Wind Signal No. 1 is now raised.'},
          'You look out the window. The sky is blue and sunny.',
          {who:'you', think:'A typhoon? But it’s so sunny outside!', mood:'worried'},
          {who:'mama', say:'Anak, the typhoon will be here tonight. Will you help us get ready?'}
        ],
        choices:[
          {label:'Help Mama get ready now.', say:'Yes, Ma! I’ll help.', mood:'happy', kind:'good', head:'Great start!', result:[{who:'mama', mood:'happy', say:'Thank you, anak! Let’s start with the Go Bag.'}], tip:'Get ready early, while the weather is still calm. Getting ready in strong wind is harder and more dangerous.', next:'gobag'},
          {label:'Play outside first while it’s still sunny.', say:'Later, Ma! It’s still sunny. I’ll play outside first!', mood:'happy', kind:'bad', head:'Hmm, not the best idea.', result:[{who:'mama', mood:'worried', say:'Okay, but come home the moment I call you.'}], tip:'A sunny morning can fool you. Typhoons can arrive fast, and getting ready takes time.', next:'play', path:'B'}
        ]
      },
      play:{
        vis:'cloudy', time:'Saturday · 2:00 PM', status:{k:'signal', n:2}, title:'Gray skies',
        text:[
          'You play tumbang preso with your friend Tonton. By afternoon, dark clouds roll in and the wind gets stronger.',
          {who:'radio', say:'PAGASA update: Signal No. 2 is now raised. Expect stronger winds this afternoon.'},
          {who:'tonton', mood:'happy', say:'Whoa, feel that wind! It’s perfect for my kite. Let’s fly it!'},
          {who:'mama', mood:'worried', say:'Anak! Come home now!'}
        ],
        choices:[
          {label:'Go home right away.', say:'Sorry, Tonton, Mama’s calling me. Bye!', kind:'good', head:'Good listening!', result:['You run home. Mama is waiting at the door.', {who:'mama', mood:'happy', say:'Thank you for coming right away, anak.'}], tip:'When grown-ups call you home before a storm, go right away. Families need to be together and ready.', next:'quickbag'},
          {label:'Fly the kite first, just for a few minutes.', say:'Just five minutes, Tonton! Let’s fly it!', mood:'happy', kind:'bad', head:'Uh oh…', result:[{sfx:'WHOOSH!'}, 'The wind grabs the kite and pulls it hard. Too hard!'], tip:'Strong wind before a typhoon is not playtime. Things can break and fly around.', next:'kite'}
        ]
      },
      kite:{
        vis:'kite', time:'Saturday · 2:15 PM', status:{k:'signal', n:2}, title:'Kite trouble',
        text:[
          'The wind yanks the kite toward the electric wires. It gets stuck right next to them!',
          {sfx:'CRACK!'},
          'A big coconut leaf breaks off the tree and falls near you.',
          {who:'tonton', mood:'worried', say:'My kite! Help me pull it down!'},
          {who:'you', think:'The kite is touching the wires… and the wind is so strong!', mood:'shock'}
        ],
        choices:[
          {label:'Let go of the string and run home.', say:'No, Tonton! Let it go. Let’s go home!', mood:'worried', kind:'good', head:'Phew, safe choice!', result:['You both run home fast.', {who:'mama', mood:'worried', say:'Anak! I was so worried. Come inside.'}], tip:'Never fly kites near electric wires, and never pull on anything stuck in them.', next:'quickbag'},
          {label:'Pull the string hard to free the kite.', say:'I’ll pull it free!', kind:'bad', head:'Stop!', result:[{who:'kuya', mood:'shock', say:'Hoy! Let go of that string! Get away from the wires!'}, 'You drop the string, and you both run home.'], tip:'A string touching electric wires can be very dangerous, especially when it’s wet. Let go and tell a grown-up.', next:'quickbag'}
        ]
      },
      gobag:{
        type:'bag', pick:4, vis:'sunny', time:'Saturday · 9:00 AM', status:{k:'signal', n:1}, title:'Pack the Go Bag',
        text:[
          {who:'mama', say:'This is our family Go Bag. It holds things we need if the power goes out or we have to leave home fast.'},
          {who:'mama', mood:'happy', say:'Can you pick 4 things to pack?'},
          {who:'you', think:'What would we really need in a typhoon?'}
        ],
        goodLine:{who:'mama', mood:'happy', say:'Great packing, anak! Our Go Bag is ready for Bagyong Kulog.'},
        badLine:{who:'mama', mood:'worried', say:'Hmm, let’s check what’s in here. Some things won’t help much in a typhoon.'},
        tip:'A good Go Bag has a flashlight, water, a first aid kit, a whistle and a power bank. Leave out candles and gadgets.',
        next:'yard'
      },
      quickbag:{
        type:'bag', pick:2, vis:'cloudy', time:'Saturday · 3:00 PM', status:{k:'signal', n:2}, title:'Hurry with the Go Bag',
        text:[
          {who:'mama', say:'You’re home! I packed our clothes and papers already.'},
          {who:'mama', mood:'worried', say:'There’s room for 2 more things. Quick, pick them!'}
        ],
        goodLine:{who:'mama', mood:'happy', say:'Great packing, anak! Our Go Bag is ready for Bagyong Kulog.'},
        badLine:{who:'mama', mood:'worried', say:'Hmm, let’s check what’s in here. Some things won’t help much in a typhoon.'},
        tip:'Pack your Go Bag early, before the typhoon comes, so you don’t have to rush. Leave out candles and gadgets.',
        next:'evening'
      },
      yard:{
        vis:'cloudy', time:'Saturday · 2:00 PM', status:{k:'signal', n:2}, title:'The wind picks up',
        text:[
          {who:'radio', say:'PAGASA update: Signal No. 2 is now raised. Expect stronger winds this afternoon.'},
          'Dark clouds roll in. The coconut tree starts to sway.',
          {who:'papa', say:'Let’s get the house ready before the wind gets worse.'},
          {who:'migo', mood:'happy', say:'{sib}, I want to help too!'}
        ],
        choices:[
          {label:'Bring the plant pots, toys and bike inside.', say:'Come on, Migo! Let’s bring everything inside.', mood:'happy', kind:'good', head:'Nice work!', result:['You and Migo carry the pots, toys and bike into the house.', {who:'papa', mood:'happy', say:'Great job, you two! Now nothing can fly around.'}], tip:'Strong wind can lift loose things and throw them. Bring them inside or tie them down.', next:'evening'},
          {label:'Climb the ladder to help Papa tie down the roof.', say:'Papa, I’ll climb up and help you with the roof!', mood:'happy', kind:'bad', head:'Get down, please!', result:[{who:'papa', mood:'shock', say:'No, anak! Stay on the ground. The roof is a job for grown-ups.'}], tip:'A strong gust can push you off a ladder or a roof. Kids help from the ground.', next:'evening'}
        ]
      },
      evening:{
        vis:'night', light:'off', time:'Saturday · 8:00 PM', status:{k:'signal', n:3}, title:'Brownout!',
        text:s => [
          s.path === 'B' ? {who:'papa', say:'While you were out, I tied down everything in the yard.'} : null,
          {who:'radio', say:'Signal No. 3 is now raised. Strong winds and heavy rain are expected tonight. Please stay indoors.'},
          'Rain pounds the yero roof. The coconut tree bends in the wind.',
          {sfx:'CLICK!'},
          'All the lights go out. Brownout!',
          {who:'migo', mood:'shock', say:'{sib}! It’s so dark! I’m scared!'},
          !has(s,'flashlight') ? {who:'you', mood:'worried', think:'I’ll check the Go Bag… Oh no, there’s no flashlight inside!'} : null
        ],
        choices:s => {
          const c = [];
          if (has(s,'flashlight')) c.push({label:'Turn on the flashlight from the Go Bag.', say:'Don’t worry, Migo. I packed a flashlight!', kind:'good', head:'Bright idea!', result:[{sfx:'CLICK!'}, 'The flashlight lights up the room.', {who:'migo', mood:'happy', say:'Yay! I’m not scared anymore.'}], tip:'Flashlights are the safest light in a brownout. Keep extra batteries in the Go Bag.', next:'bang', light:'flash'});
          c.push({label: has(s,'candle') ? 'Light the candles you packed.' : 'Light a candle from the kitchen.', say:'I’ll light a candle so we can see!', kind:'bad', head:'Careful!', result:['Wind sneaks through the window gaps. The flame flickers close to the curtain!', {who:'mama', mood:'shock', say:'Careful! Candles can start a fire. Let me blow it out.'}, 'Mama finds a flashlight in a drawer.'], tip:'Candles can tip over and start fires. Use a flashlight instead.', next:'bang', light:'candle'});
          c.push({label:'Use Mama’s phone as a flashlight.', say:'Ma, can I use your phone’s light?', kind:'meh', head:'It works, but…', result:[{who:'mama', mood:'worried', say:'Okay, but just for a while. We need the battery for news and calls.'}, 'Papa finds a flashlight in the cabinet.'], tip:'Save phone battery for news updates and calls for help. That’s why a flashlight goes in the Go Bag.', next:'bang', light:'phone'});
          return c;
        }
      },
      bang:{
        vis:'night', light:'flash', time:'Saturday · 10:30 PM', status:{k:'signal', n:3}, title:'BANG!',
        text:s => [
          has(s,'powerbank') ? {who:'mama', mood:'happy', say:'Good thing you packed the power bank. My phone is still charged, so I can read the barangay’s text alerts.'} : null,
          'The wind howls louder and louder.',
          {sfx:'BANG!'},
          'Something hits the side of the house!',
          {who:'migo', mood:'shock', say:'{sib}, what was that? Let’s look out the window!'}
        ],
        choices:[
          {label:'Take Migo to the small room in the middle of the house, away from windows.', say:'No, Migo. Come with me to the small room, away from the windows.', mood:'worried', kind:'good', head:'You kept Migo safe!', result:['You sit with Lola in the small room in the middle of the house.', {who:'lola', mood:'happy', say:'You kept your brother safe, apo. Come, I’ll tell you both a story.'}], tip:'Stay away from windows in strong wind. Flying things can break the glass. A small room in the middle of the house is safest.', next:'eye'},
          {label:'Peek out the window to see what made the noise.', say:'Okay, let’s take a quick peek!', kind:'bad', head:'Too close!', result:[{who:'mama', mood:'shock', say:'Get away from the window! The glass could break!'}, 'In the morning, you find out it was a sheet of yero from a neighbor’s roof.'], tip:'Wind can throw things hard enough to crack window glass. Never stand near windows during a typhoon.', next:'eye'}
        ]
      },
      eye:{
        vis:'eye', light:'flash', time:'Sunday · 1:00 AM', status:{k:'signal', n:3}, title:'Suddenly, quiet',
        text:[
          'After many hours, the wind stops. The rain stops too. Everything is very quiet.',
          {who:'you', think:'Wow, I can see stars! Is the typhoon over?'},
          {sfx:'BZZT!'},
          {who:'tonton', via:'text', mood:'happy', say:'Bagyo is over!! Let’s go outside and look!'}
        ],
        choices:[
          {label:'Stay inside and listen to the radio for PAGASA’s update.', say:'Wait, Tonton. I’ll check the radio first.', kind:'good', head:'Smart thinking!', result:[{who:'radio', say:'The eye of Bagyong Kulog is now passing over the area. Strong winds will return soon. Stay indoors!'}, {sfx:'WHOOSH!'}, 'The wind roars back, but you are safe inside.'], tip:'A sudden calm may be the eye of the typhoon, its quiet middle. The strong wind comes back soon. Wait until PAGASA or your barangay says it’s safe.', next:'after'},
          {label:'Run outside to see what happened.', say:'Yay! Let’s go see!', mood:'happy', kind:'bad', head:'Whoa! The wind is back!', result:['You step outside. It’s so still…', {sfx:'WHOOSH!'}, 'The wind comes back roaring from the other side!', {who:'papa', mood:'shock', say:'Anak! Get inside, now!'}, 'Papa carries you back into the house.'], tip:'That calm was the eye of the typhoon, its quiet middle. The strong wind always comes back. Stay inside until grown-ups say it’s safe.', next:'after', fxVis:'storm', flag:'eye'}
        ]
      },
      after:{
        vis:'morning', time:'Sunday · 7:00 AM', status:{k:'signal', n:0}, title:'The morning after',
        text:s => [
          {who:'radio', say:'Good morning! Bagyong Kulog has moved away. All wind signals are now lifted.'},
          has(s,'water') ? {who:'mama', mood:'happy', say:'The tap has no water this morning. Good thing you packed bottled water in the Go Bag!'} : {who:'lola', say:'The tap has no water this morning. Good thing I filled those big containers yesterday.'},
          'Branches and leaves are everywhere. On the street, an electric wire hangs down from the post and touches the ground.',
          {who:'migo', mood:'worried', say:'{sib}, look! A doggy is sniffing near the wire!'}
        ],
        choices:[
          {label:'Stay far away and tell Papa so he can report it to the barangay.', say:'Papa! A wire fell on the street. Please call the barangay!', mood:'worried', kind:'good', head:'Hero move!', result:[{who:'papa', mood:'happy', say:'Good job telling me right away. I’ll call the barangay now.'}, 'A neighbor calls the dog away. The barangay asks the electric company to fix the wire.'], tip:'Fallen wires can still have electricity in them. Never touch them or anything touching them. Tell a grown-up right away.', next:'END'},
          {label:'Use a long stick to push the wire away from the dog.', say:'I’ll push the wire away with this stick!', kind:'bad', head:'STOP!', result:[{who:'papa', mood:'shock', say:'Stop! Don’t touch it! Electricity can go through the stick!'}, 'You drop the stick. A neighbor calls the dog away, and Papa reports the wire to the barangay.'], tip:'Electricity can travel through wet sticks and wet ground. Never touch a fallen wire, even with a stick.', next:'END'}
        ]
      }
    }
  };
