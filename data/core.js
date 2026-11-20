/* Rules that are the same for every playbook. */
window.CORE = {
  HERITAGES: ["Akoros","The Dagger Isles","Iruvia","Severos","Skovlan","Tycheros"],
  BACKGROUNDS: ["Academic","Labor","Law","Trade","Military","Noble","Underworld"],
  VICES: ["Faith","Gambling","Luxury","Obligation","Pleasure","Stupor","Weird"],
  TRAUMAS: ["Cold","Haunted","Obsessed","Paranoid","Reckless","Soft","Unstable","Vicious"],

  ATTRS: [
    {name:"Insight", actions:["Hunt","Study","Survey","Tinker"]},
    {name:"Prowess", actions:["Finesse","Prowl","Skirmish","Wreck"]},
    {name:"Resolve", actions:["Attune","Command","Consort","Sway"]},
  ],

  /* Standard items every playbook can carry. */
  ITEMS: [
    {id:"blade",name:"A Blade or Two",load:1},
    {id:"throwing",name:"Throwing Knives",load:1},
    {id:"pistol",name:"A Pistol",load:1},
    {id:"pistol2",name:"A 2nd Pistol",load:1},
    {id:"largeweap",name:"A Large Weapon",load:2},
    {id:"unusualweap",name:"An Unusual Weapon",load:1},
    {id:"armor",name:"Armor",load:2},
    {id:"heavyarmor",name:"+Heavy Armor",load:1},
    {id:"burglary",name:"Burglary Gear",load:1},
    {id:"climbing",name:"Climbing Gear",load:2},
    {id:"arcane",name:"Arcane Implements",load:1},
    {id:"documents",name:"Documents",load:1},
    {id:"subterfuge",name:"Subterfuge Supplies",load:1},
    {id:"demolition",name:"Demolition Tools",load:2},
    {id:"tinkering",name:"Tinkering Tools",load:1},
    {id:"lantern",name:"Lantern",load:1},
  ],

  LOADS: {light:3, normal:5, heavy:6},

  /* Base track sizes. Crew upgrades and other modifiers add to these
     (see limit() in app.js), so never hardcode these numbers elsewhere. */
  LIMITS: {stress:9, trauma:4, coin:4, playbookXp:8, attrXp:6, stash:40},
};
