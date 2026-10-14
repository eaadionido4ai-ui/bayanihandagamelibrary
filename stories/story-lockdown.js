// @title Ready for a Lockdown
// @brand Lockdown at School
// @sets room,school,home
// @out lockdown-at-school.html
  /* Story: a school lockdown because a dangerous person may be on campus. Told for kids: no one is hurt, and no weapons or violence are shown. */
  const STORY = {
    id:'lockdown', hazard:'lockdown', heading:'Ready for a Lockdown?',
    intro:'It’s a normal Wednesday at school, until the principal calls a lockdown. Listen to your teacher, make choices, and see what happens. Safe choices earn <b>safety stars</b>, and there are <b>4 endings</b> to find.',
    contentNote:'<b>For grown-ups first:</b> this story is about a school lockdown because a dangerous person may be on campus. No one is hurt, and no weapons or violence are shown. Please preview it, play it together with your child, and follow your own school’s lockdown procedure.',
    storageKey:'lockdown-endings-v1',
    cast:['teacher','tonton','police','mama','papa','migo','pa'],
    grownups:'For grown-ups: made for kids about 7 to 12 years old. Play together, keep the talk calm, and let your child ask questions. The school and the people in this story are made up.',
    start:'l_alert', startVis:{set:'room', room:'class', sky:'sunny', fx:'still'}, startChip:'Wednesday morning',
    endVis:{set:'home', sky:'night', fx:'still'}, endLight:'flash', endChip:'Wednesday · 8:00 PM', endStatus:{k:'text', t:'All clear', s:'Everyone is safe', tone:'ok'},
    special:{flag:'door', ending:'door'},
    endings:{
      hero:{name:'Calm and Quiet Hero', text:'You followed your teacher, stayed hidden and quiet, helped a friend stay calm, and waited for the all clear.', line:{who:'teacher', mood:'happy', say:'You were so calm and brave today. Thank you for helping your classmates.'}},
      safe:{name:'Safe Behind the Door', text:'You stayed safe during the lockdown. A few choices were risky, but you learned from them. You’re almost a Calm and Quiet Hero!', line:{who:'mama', mood:'happy', say:'You’re safe, and you were brave. Let’s talk about what you learned.'}},
      lucky:{name:'Close Call', text:'Everyone is okay, but some choices could have put your class in danger. Play again and look for the safer path!', line:{who:'teacher', mood:'worried', say:'We were lucky today. Let’s practice our lockdown drill together again.'}},
      door:{name:'Never Open the Door', color:'#6656C4', icon:'door', text:'You almost opened the door during the lockdown. Never open it for anyone. Only the grown-up in charge decides, and police open doors with a key.', line:{who:'police', say:'During a lockdown, the door stays locked. We will come to you with a key.'}}
    },
    scenes:{
      l_alert:{
        vis:{set:'room', room:'class', sky:'sunny', fx:'still'}, time:'Wednesday · 10:00 AM', status:{k:'text', t:'LOCKDOWN', s:'Stay hidden and quiet', tone:'alarm'}, title:'Lockdown!',
        text:[
          'Wednesday morning. Your class is working on a science project.',
          {who:'pa', say:'Lockdown, lockdown. A dangerous person may be on campus. Teachers, lock your doors. This is not a drill.'},
          {who:'teacher', say:'Everyone, go quietly to the back corner, away from the door and windows. Now.'},
          {who:'tonton', mood:'shock', say:'What’s happening? I want to look out the window!'}
        ],
        choices:[
          {label:'Go quietly to the corner with your class.', say:'Come on, Tonton. Ma’am Joy said the corner.', whisper:true, mood:'worried', kind:'good', head:'Quick and quiet!', fxVis:{set:'room', room:'class', sky:'sunny', fx:'still dark blinds'}, result:['Ma’am Joy locks the door, turns off the lights and closes the curtains.', {who:'teacher', whisper:true, say:'Good. Sit down low and stay very quiet.'}], tip:'In a lockdown, move quickly and quietly to the safe spot your teacher chooses, out of sight of the door and windows.', next:'l_phone'},
          {label:'Peek out the window to see what’s happening.', say:'Let me see what’s going on.', kind:'bad', head:'Away from the window!', fxVis:{set:'room', room:'class', sky:'sunny', fx:'still dark blinds'}, result:[{who:'teacher', mood:'shock', whisper:true, say:'Away from the window! Get down, now!'}, 'You hurry to the corner. Ma’am Joy locks the door, turns off the lights and closes the curtains.'], tip:'Never look out of windows or doors during a lockdown. Stay low and out of sight.', next:'l_phone'}
        ]
      },
      l_phone:{
        vis:{set:'room', room:'class', sky:'sunny', fx:'still dark blinds'}, time:'Wednesday · 10:02 AM', status:{k:'text', t:'LOCKDOWN', s:'Stay hidden and quiet', tone:'alarm'}, title:'Shh…',
        text:[
          'The room is dark and very quiet. Everyone is sitting low in the corner.',
          {sfx:'BZZ BZZ'},
          'Your phone buzzes in your bag. The class group chat is full of messages asking what’s happening.',
          {who:'you', mood:'worried', think:'Should I answer? Should I tell everyone what’s going on?'}
        ],
        choices:[
          {label:'Turn your phone to silent and put it away.', say:'I’ll put my phone on silent.', whisper:true, kind:'good', head:'Silent and safe!', result:[{who:'teacher', whisper:true, say:'Thank you. Everyone, phones on silent, please.'}], tip:'In a lockdown, silence your phone so it can’t make noise. Let the grown-ups in charge share information, and don’t post or spread rumors online.', next:'l_calm'},
          {label:'Text the group chat about what’s happening.', say:'I’ll tell everyone what’s going on.', whisper:true, kind:'bad', head:'Phones away!', result:['Your message spreads fast, and some of it isn’t even true. Parents start calling the school.', {who:'teacher', mood:'worried', whisper:true, say:'Phones away, please. Wrong information makes things harder for everyone.'}], tip:'In a lockdown, silence your phone so it can’t make noise. Let the grown-ups in charge share information, and don’t post or spread rumors online.', next:'l_calm'}
        ]
      },
      l_calm:{
        vis:{set:'room', room:'class', sky:'sunny', fx:'still dark blinds'}, time:'Wednesday · 10:10 AM', status:{k:'text', t:'LOCKDOWN', s:'Stay hidden and quiet', tone:'alarm'}, title:'A scared friend',
        text:[
          {who:'tonton', mood:'worried', whisper:true, say:'I’m scared… I want to go home…'},
          'Tonton starts to cry, and his voice is getting louder.'
        ],
        choices:[
          {label:'Hold Tonton’s hand and breathe slowly with him.', say:'Shh, we’re together. Breathe in slowly with me… and out.', whisper:true, kind:'good', head:'What a good friend!', result:[{who:'tonton', whisper:true, say:'…Okay. I feel a little better.'}, {who:'teacher', mood:'happy', whisper:true, say:'Thank you for helping him.'}], tip:'Helping a friend stay calm and quiet keeps everyone safer. Try breathing slowly together, and stay close.', next:'l_knock'},
          {label:'Tell Tonton to stop being a baby.', say:'Stop crying, Tonton. Don’t be a baby.', whisper:true, kind:'bad', head:'That made it worse', result:['Tonton cries even louder.', 'Ma’am Joy crawls over and helps Tonton calm down with slow breaths.'], tip:'Helping a friend stay calm and quiet keeps everyone safer. Try breathing slowly together, and stay close.', next:'l_knock'}
        ]
      },
      l_knock:{
        vis:{set:'room', room:'class', sky:'sunny', fx:'still dark blinds'}, time:'Wednesday · 10:20 AM', status:{k:'text', t:'LOCKDOWN', s:'Stay hidden and quiet', tone:'alarm'}, title:'Knock, knock',
        text:[
          {sfx:'KNOCK! KNOCK!'},
          {who:'door', say:'Hey! It’s me! Let me in, please!'},
          {who:'you', mood:'shock', think:'Is that Jun from the other class? It sounds like him… I think.'}
        ],
        choices:[
          {label:'Stay quiet and let Ma’am Joy decide.', say:'Ma’am Joy, someone is knocking.', whisper:true, mood:'worried', kind:'good', head:'Exactly right!', result:[{who:'teacher', whisper:true, say:'I hear it. We don’t open the door during a lockdown. The police will come with a key.'}, 'After a while, the knocking stops.'], tip:'During a lockdown, never open the door for anyone, even if they say they are a friend or a police officer. Only the grown-up in charge decides, and police open doors with a key.', next:'l_police'},
          {label:'Unlock the door to let him in.', say:'I’ll let him in!', kind:'bad', flag:'door', head:'Stop! Don’t open it!', result:['You jump up and reach for the lock.', {who:'teacher', mood:'shock', whisper:true, say:'Stop! Don’t open it!'}, 'Ma’am Joy gently pulls your hand away and keeps the door locked.'], tip:'During a lockdown, never open the door for anyone, even if they say they are a friend or a police officer. Only the grown-up in charge decides, and police open doors with a key.', next:'l_police'}
        ]
      },
      l_police:{
        vis:{set:'room', room:'class', sky:'sunny', fx:'still dark blinds'}, time:'Wednesday · 10:45 AM', status:{k:'text', t:'Police are here', s:'Follow their instructions', tone:'info'}, title:'The police arrive',
        text:[
          {sfx:'CLICK!'},
          'Someone unlocks the door with a key. Two police officers step inside.',
          {who:'police', say:'Police! Everyone stay calm. Keep your hands where we can see them.'}
        ],
        choices:[
          {label:'Stay still and keep your hands open where they can see them.', think:'Hands open. Stay still. Listen.', kind:'good', head:'Calm and clear!', result:[{who:'police', mood:'happy', say:'Thank you. You’re safe now. We’ll walk you out together.'}], tip:'When police arrive, stay calm, keep your hands empty and where they can see them, and follow their instructions. They need to know quickly that everyone is safe.', next:'l_reunite'},
          {label:'Jump up and run to the officers.', say:'We’re saved!', mood:'happy', kind:'bad', head:'Slow down!', result:[{who:'police', say:'Please stay where you are and keep your hands where we can see them!'}, 'You freeze and sit back down.', {who:'teacher', say:'It’s okay. Let’s listen to the officers.'}], tip:'When police arrive, stay calm, keep your hands empty and where they can see them, and follow their instructions. They need to know quickly that everyone is safe.', next:'l_reunite'}
        ]
      },
      l_reunite:{
        vis:{set:'school', sky:'sunny', fx:'still police students'}, time:'Wednesday · 11:30 AM', status:{k:'text', t:'All clear', s:'Lockdown is over', tone:'ok'}, title:'Meeting your family',
        text:[
          {who:'pa', say:'The lockdown is over, and everyone is safe. Students, please go to the covered court to meet your families.'},
          'Your class walks to the covered court. Many parents are waiting at the gate.',
          {who:'tonton', say:'My Kuya is outside the gate! Let’s just go out to him!'}
        ],
        choices:[
          {label:'Wait at the court until Ma’am Joy checks you out to Mama.', say:'Let’s wait for Ma’am Joy to check us out, Tonton.', kind:'good', head:'Everyone counted!', result:['Ma’am Joy checks Mama’s name on the list.', {who:'mama', mood:'happy', say:'Anak! I’m so happy to see you!'}], tip:'After a lockdown, families meet at a set place. Wait until your teacher checks you out to a grown-up on your list, so everyone is counted.', next:'l_feel'},
          {label:'Slip out the gate with Tonton.', say:'Okay, let’s go!', kind:'bad', head:'You must be checked out!', result:[{who:'teacher', mood:'shock', say:'Wait! I need to check every student out!'}, 'You go back to the court until Ma’am Joy finds Mama’s name on the list.'], tip:'After a lockdown, families meet at a set place. Wait until your teacher checks you out to a grown-up on your list, so everyone is counted.', next:'l_feel'}
        ]
      },
      l_feel:{
        vis:{set:'home', sky:'night', fx:'still'}, light:'flash', time:'Wednesday · 8:00 PM', status:{k:'text', t:'At home', s:'Everyone is safe', tone:'ok'}, title:'That night',
        text:[
          'That night at home, you can’t stop thinking about the knocking.',
          {who:'migo', say:'{sib}, are you okay? You’re so quiet.'}
        ],
        choices:[
          {label:'Tell Mama and Papa how you feel.', say:'Ma, Pa, I was really scared today. I keep thinking about it.', mood:'worried', kind:'good', head:'Sharing helps!', result:[{who:'mama', say:'Thank you for telling us. It’s okay to feel scared. You were very brave today.'}, {who:'papa', say:'The school will have counselors you can talk to, too. We’re here for you.'}], tip:'After something scary, talking with a trusted grown-up helps. Feeling scared or sad is normal, and the feelings get lighter when you share them.', next:'END'},
          {label:'Watch videos about it online all night.', think:'I’ll just look it up online…', kind:'meh', head:'Too much can make it bigger', result:[{who:'mama', mood:'worried', say:'Too many videos can make scary feelings bigger. Let’s turn it off and talk instead.'}], tip:'After something scary, talking with a trusted grown-up helps. Feeling scared or sad is normal, and the feelings get lighter when you share them.', next:'END'}
        ]
      }
    }
  };
