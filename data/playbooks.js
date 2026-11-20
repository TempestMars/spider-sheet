/* One entry per playbook. Add a new playbook by adding an object here;
   the sheet renders its abilities, items, friends and XP trigger from it. */
window.PLAYBOOKS = {
  spider: {
    id: "spider",
    name: "Spider",
    tagline: "A Devious Mastermind",
    xpTrigger: "You addressed a challenge with <i>calculation or conspiracy</i>.",
    abilities: [
      {id:"foresight",name:"Foresight",html:"Two times per score you can <b>assist</b> a teammate without paying stress. Tell us how you prepared for this."},
      {id:"calculating",name:"Calculating",html:"Due to your careful planning, during <b>downtime</b>, you may give yourself or another crew member +1 downtime action."},
      {id:"connected",name:"Connected",html:"During downtime, you get <b>+1 result level</b> when you acquire an asset or reduce heat."},
      {id:"functioning_vice",name:"Functioning Vice",html:"When you indulge your vice, you may adjust the dice outcome by 1 or 2 (up or down). An ally who joins in your vice may do the same."},
      {id:"ghost_contract",name:"Ghost Contract",html:"When you shake on a deal, you and your partner — human or otherwise — both bear a mark of your oath. If either breaks the contract, they take level 3 harm, \"Cursed\"."},
      {id:"jail_bird",name:"Jail Bird",html:"When <b>incarcerated</b>, your wanted level counts as 1 less, your Tier as 1 more, and you gain +1 faction status with a faction you help on the inside (in addition to your incarceration roll)."},
      {id:"mastermind",name:"Mastermind",html:"You may expend your <b>special armor</b> to protect a teammate, or to <b>push yourself</b> when you gather information or work on a long-term project."},
      {id:"weaving_the_web",name:"Weaving the Web",html:"You gain +1d to Consort when you <b>gather information</b> on a target for a score. You get +1d to the <b>engagement roll</b> for that operation."},
      {id:"veteran",name:"Veteran",html:"Choose a special ability from another source.",veteran:true},
    ],
    itemsTitle: "Spider Items",
    items: [
      {id:"cover",name:"Fine cover identity",load:0},
      {id:"whiskey",name:"Fine bottle of whiskey",load:0},
      {id:"blueprints",name:"Blueprints",load:0},
      {id:"slumber",name:"Vial of slumber essence",load:0},
      {id:"palmpistol",name:"Concealed palm pistol",load:1},
      {id:"spiritbane",name:"Spiritbane charm",load:0},
    ],
    friendsTitle: "Shrewd friends",
    friends: [
      {id:"salia",name:"Salia",desc:"an information broker"},
      {id:"augus",name:"Augus",desc:"a master architect"},
      {id:"jennah",name:"Jennah",desc:"a servant"},
      {id:"riven",name:"Riven",desc:"a chemist"},
      {id:"jeren",name:"Jeren",desc:"a bluecoat archivist"},
    ],
  },
};
