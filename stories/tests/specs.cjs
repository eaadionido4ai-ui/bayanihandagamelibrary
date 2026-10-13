// Test plans for the BAYANIHanda story games. Used by BAYANIHanda-Story-Games-test.js
const specs = {};
const good_flood = {'Rain, rain, rain':'Stay inside', 'Move things up':'Help carry', 'Pack the Go Bag':['papers','medicine','flashlight','water'], 'Time to go':'Help Lola', 'The way to the school':'Wait for the rescue', 'At the evacuation center':'Stay at the center', 'Going home':'Wait outside', 'The scratch':'Tell Mama'};
specs.flood = {
  heading:'Ready for Bagyong Agos?', sets:['home','school'], hasSfx:true,
  titles:['Rain, rain, rain','Move things up','Pack the Go Bag','Time to go','The way to the school','At the evacuation center','Going home','The scratch'],
  runs:[
    {mode:'chat', hero:'ate', plan:good_flood, expect:'Flood Smart Hero', stars:'7 of 7 safety stars', mustNotSee:['The scratch'], textHas:['Ate, look! The street'], fxExpect:{'Time to go':'flood2', 'At the evacuation center':'tents'}},
    {mode:'vn', hero:'kuya', plan:Object.assign({}, good_flood, {'At the evacuation center':'Sneak back'}), expect:'Back Through the Water', textHas:['Kuya']},
    {mode:'vn', hero:'ate', plan:Object.assign({}, good_flood, {'Rain, rain, rain':'Play in the water', 'Move things up':'Keep watching'}), expect:'High and Dry', stars:'6 of 8 safety stars', mustSee:['The scratch']},
    {mode:'chat', hero:'kuya', plan:{'Rain, rain, rain':'Play in the water', 'Move things up':'Keep watching', 'Pack the Go Bag':['candle','console','papers','water'], 'Time to go':'Stay home', 'The way to the school':'shortcut', 'At the evacuation center':'Stay at the center', 'Going home':'Run inside', 'The scratch':'Keep it a secret'}, expect:'Lucky Escape', stars:'1 of 8 safety stars', mustSee:['The scratch']}
  ]
};

const good_quake = {'Look around the room':'Point at', 'The ground shakes!':'Duck under', 'When the shaking stops':'Line up', 'On the school field':'Stay in the open', 'Another shake!':'Drop down', 'Where is Migo?':'Stay with your class', 'Going home':'Ask'};
specs.quake = {
  heading:'Ready for the Big Shake?', sets:['room','school'], hasSfx:true,
  titles:['Look around the room','The ground shakes!','When the shaking stops','On the school field','Another shake!','Where is Migo?','Going home'],
  runs:[
    {mode:'chat', hero:'ate', plan:good_quake, expect:'Quake Ready Hero', stars:'7 of 7 safety stars', fxExpect:{'The ground shakes!':'boxmoved', 'Another shake!':'shake'}},
    {mode:'vn', hero:'kuya', plan:Object.assign({}, good_quake, {'Another shake!':'Run back'}), expect:'Back Inside'},
    {mode:'vn', hero:'ate', plan:Object.assign({}, good_quake, {'Look around the room':'Say the room', 'The ground shakes!':'Run for the door'}), expect:'Steady and Safe', stars:'5 of 7 safety stars', fxExpect:{'The ground shakes!':'boxfallen'}},
    {mode:'chat', hero:'kuya', plan:{'Look around the room':'Say the room', 'The ground shakes!':'Run for the door', 'When the shaking stops':'Stop to grab', 'On the school field':'Wait in the shade', 'Another shake!':'Drop down', 'Where is Migo?':'Sneak', 'Going home':'Go with Tita'}, expect:'Shaky Day', stars:'1 of 7 safety stars', textHas:['The heavy box falls off the cabinet']}
  ]
};

const good_fire = {'Too many plugs':'Tell Papa', 'Beep! Beep!':'Wake Migo', 'The closed door':'Touch the door', 'Out of the house':'Go to the meeting', 'Call for help':'Call 911', 'The firefighters arrive':'Stay back', 'The next morning':'Tell Lola'};
specs.fire = {
  heading:'Ready for the Smoke Alarm?', sets:['room','home'], hasSfx:true,
  titles:['Too many plugs','Beep! Beep!','The closed door','Out of the house','Call for help','The firefighters arrive','The next morning'],
  runs:[
    {mode:'chat', hero:'ate', plan:good_fire, expect:'Fire Safe Hero', stars:'7 of 7 safety stars', fxExpect:{'Beep! Beep!':'smoke1', 'Out of the house':'fireglow'}},
    {mode:'vn', hero:'kuya', plan:Object.assign({}, good_fire, {'Out of the house':'Run back'}), expect:'Back Into the Smoke'},
    {mode:'vn', hero:'ate', plan:Object.assign({}, good_fire, {'Too many plugs':'Squeeze', 'Beep! Beep!':'Hide under'}), expect:'Out and Safe', stars:'5 of 7 safety stars'},
    {mode:'chat', hero:'kuya', plan:{'Too many plugs':'Squeeze', 'Beep! Beep!':'Hide under', 'The closed door':'Pull the door', 'Out of the house':'Go to the meeting', 'Call for help':'Take a video', 'The firefighters arrive':'Go closer', 'The next morning':'Keep the scary'}, expect:'Smoky Night', stars:'1 of 7 safety stars'}
  ]
};

const good_lockdown = {'Lockdown!':'Go quietly', 'Shh…':'Turn your phone', 'A scared friend':'Hold Tonton', 'Knock, knock':'Stay quiet', 'The police arrive':'Stay still', 'Meeting your family':'Wait at the court', 'That night':'Tell Mama'};
specs.lockdown = {
  heading:'Ready for a Lockdown?', sets:['room','school','home'], hasSfx:true, contentNote:true,
  titles:['Lockdown!','Shh…','A scared friend','Knock, knock','The police arrive','Meeting your family','That night'],
  runs:[
    {mode:'chat', hero:'ate', plan:good_lockdown, expect:'Calm and Quiet Hero', stars:'7 of 7 safety stars', fxExpect:{'Shh…':'blinds', 'Meeting your family':'police'}, textHas:['whispering']},
    {mode:'vn', hero:'kuya', plan:Object.assign({}, good_lockdown, {'Knock, knock':'Unlock'}), expect:'Never Open the Door'},
    {mode:'vn', hero:'ate', plan:Object.assign({}, good_lockdown, {'Lockdown!':'Peek', 'Shh…':'Text the group'}), expect:'Safe Behind the Door', stars:'5 of 7 safety stars'},
    {mode:'chat', hero:'kuya', plan:{'Lockdown!':'Peek', 'Shh…':'Text the group', 'A scared friend':'stop being', 'Knock, knock':'Stay quiet', 'The police arrive':'Jump up', 'Meeting your family':'Slip out', 'That night':'Watch videos'}, expect:'Close Call', stars:'1 of 7 safety stars'}
  ]
};

module.exports = specs;
