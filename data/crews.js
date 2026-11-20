/* Crew rules from the Blades in the Dark SRD (CC BY 3.0, One Seven Design).
   Crew-type-specific content from the printed book (a crew's own special
   abilities, contacts, upgrades, operation list and XP trigger) is NOT in the
   SRD, so it is not shipped here: players type it into the Crew tab. */
window.CREW = {
  TYPES: {
    hawkers: { id:"hawkers", name:"Hawkers" },
  },

  TIERS: ["0","I","II","III","IV"],

  REPUTATIONS: ["Ambitious","Brutal","Daring","Honorable","Professional","Savvy","Subtle","Strange"],

  HUNTING_DEALS: [
    {id:"pay1", label:"Paid 1 coin"},
    {id:"pay2", label:"Paid 2 coin (+1 status)"},
    {id:"none", label:"Paid nothing (−1 status)"},
  ],

  /* effects add to the limits in data/core.js: stress, trauma, action (max action rating),
     crewCoin (crew coin capacity), train_<track> (extra xp when training that track). */
  UPGRADE_GROUPS: [
    {id:"crew",   title:"Crew-wide (change the character sheet)"},
    {id:"lair",   title:"Lair & vehicles"},
    {id:"train",  title:"Training"},
    {id:"quality",title:"Quality"},
  ],
  UPGRADES: [
    {id:"mastery",  group:"crew", name:"Mastery", boxes:4, effects:{action:1}, badge:"action rating max 4",
      text:"Your crew has access to master level training. You may advance your PCs’ action ratings to 4 (until you unlock this upgrade, PC action ratings are capped at 3). Costs four upgrade boxes."},
    {id:"hardened", group:"crew", name:"Hardened", boxes:3, effects:{trauma:1}, badge:"+1 trauma box",
      text:"Each PC gets +1 trauma box. Costs three upgrades to unlock. This may bring a PC with 4 trauma back into play if you wish. (SRD example — only available if your crew’s upgrade list has it.)"},
    {id:"composed", group:"crew", name:"Composed", boxes:3, effects:{stress:1}, badge:"+1 stress box",
      text:"Each PC gets +1 stress box. Costs three upgrades to unlock. (SRD example — only available if your crew’s upgrade list has it.)"},

    {id:"boathouse",  group:"lair", name:"Boat House", boxes:1, text:"You have a boat, a dock on a waterway, and a small shack to store boating supplies."},
    {id:"boathouse2", group:"lair", name:"Boat House II", boxes:1, text:"Improves the boat with armor and more cargo capacity."},
    {id:"carriage",   group:"lair", name:"Carriage House", boxes:1, text:"You have a carriage, and draft animals to pull it, and a stable."},
    {id:"carriage2",  group:"lair", name:"Carriage House II", boxes:1, text:"Improves the carriage with armor and larger, swifter steeds."},
    {id:"hidden_lair",group:"lair", name:"Hidden Lair", boxes:1, text:"Your lair has a secret location and is disguised to hide it from view. If your lair is discovered, use two downtime activities and pay coin equal to your Tier to relocate it and hide it once again."},
    {id:"quarters",   group:"lair", name:"Quarters", boxes:1, text:"Your lair includes living quarters for the crew. Without this upgrade, each PC sleeps elsewhere, and is vulnerable when they do so."},
    {id:"secure_lair",group:"lair", name:"Secure Lair", boxes:1, text:"Your lair has locks, alarms, and traps to thwart intruders. You might roll your crew’s Tier if these measures are ever put to the test."},
    {id:"secure_lair2",group:"lair",name:"Secure Lair II", boxes:1, text:"The defenses include arcane measures that work against spirits."},
    {id:"vault",      group:"lair", name:"Vault", boxes:1, effects:{crewCoin:4}, badge:"crew coin capacity 8",
      text:"Your lair has a secure vault, increasing your storage capacity for coin to 8. A separate part of your vault can be used as a holding cell."},
    {id:"vault2",     group:"lair", name:"Vault II", boxes:1, effects:{crewCoin:8}, badge:"crew coin capacity 16",
      text:"Increases your coin storage capacity to 16."},
    {id:"workshop",   group:"lair", name:"Workshop", boxes:1, text:"Your lair has a workshop appointed with tools for tinkering and alchemy, as well as a small library of books, documents, and maps. You may accomplish long-term projects with these assets without leaving your lair."},

    {id:"train_insight", group:"train", name:"Insight Training", boxes:1, effects:{train_insight:1}, badge:"train Insight = 2 xp",
      text:"When you train Insight during downtime, you mark 2 xp instead of 1."},
    {id:"train_prowess", group:"train", name:"Prowess Training", boxes:1, effects:{train_prowess:1}, badge:"train Prowess = 2 xp",
      text:"When you train Prowess during downtime, you mark 2 xp instead of 1."},
    {id:"train_resolve", group:"train", name:"Resolve Training", boxes:1, effects:{train_resolve:1}, badge:"train Resolve = 2 xp",
      text:"When you train Resolve during downtime, you mark 2 xp instead of 1."},
    {id:"train_playbook",group:"train", name:"Playbook Training", boxes:1, effects:{train_playbook:1}, badge:"train Playbook = 2 xp",
      text:"When you train your playbook during downtime, you mark 2 xp on your playbook xp track instead of 1."},

    {id:"q_documents",  group:"quality", name:"Quality: Documents", boxes:1, text:"Improves the quality rating of all the PCs’ Documents, beyond the quality established by the crew’s Tier and fine items."},
    {id:"q_gear",       group:"quality", name:"Quality: Gear", boxes:1, text:"Improves the quality of Burglary Gear and Climbing Gear."},
    {id:"q_arcane",     group:"quality", name:"Quality: Arcane Implements", boxes:1, text:"Improves the quality of Arcane Implements."},
    {id:"q_subterfuge", group:"quality", name:"Quality: Subterfuge Supplies", boxes:1, text:"Improves the quality of Subterfuge Supplies."},
    {id:"q_tools",      group:"quality", name:"Quality: Tools", boxes:1, text:"Improves the quality of Demolition Tools and Tinkering Tools."},
    {id:"q_weapons",    group:"quality", name:"Quality: Weapons", boxes:1, text:"Improves the quality of Weapons."},
  ],

  CLAIMS: [
    {name:"Turf", text:"You require one less Rep to advance in tier (max 6)."},
    {name:"City Records", text:"You get +1d to the engagement roll for stealth plans. You can use blueprints and other documents to determine a good approach for infiltrations."},
    {name:"Cover Identities", text:"You get +1d to the engagement roll for deception and social plans. False identities help confuse the opposition."},
    {name:"Cover Operation", text:"You get -2 heat per score. The cover of a legitimate operation helps deflect some of the heat from law enforcement."},
    {name:"Envoy", text:"You get +2 coin in payoff for scores that involve high-class clients. This well-connected liaison will help arrange for a better payoff from rich clients."},
    {name:"Fixer", text:"You get +2 coin in payoff for scores that involve lower-class clients. This well-respected agent will help arrange for a better payoff from poorer clients."},
    {name:"Infirmary", text:"You get +1d to healing treatment rolls. The infirmary also has beds for long-term convalescence."},
    {name:"Informants", text:"You get +1d to gather information for a score. Your eyes and ears on the streets are always on the lookout for new targets."},
    {name:"Protection Racket", text:"Any time during downtime, roll dice equal to your Tier. You earn coin equal to the highest result, minus your heat. Some of the locals are terrified of you and will gladly pay for “protection.”"},
    {name:"Training Rooms", text:"Your cohorts of a specific type get +1 scale. Extra training enables them to fight like a larger gang."},
    {name:"Vice Den", text:"Any time during downtime, roll dice equal to your Tier. You earn coin equal to the highest result, minus your heat."},
    {name:"Victim Trophies", text:"You get +1 rep per score. Word of your grisly “collection” gets around, and your boldness boosts your rep in the underworld."},
    {name:"Fighting Pits", text:"During downtime, roll dice equal to your Tier. You earn coin equal to the highest result, minus your heat. The locals love to gamble away their hard-won coin on the blood-sports you host."},
    {name:"Street Fence", text:"You get +2 coin in your payoff for scores that involve lower-class targets. An expert can find the treasure amid the trash you loot from your poorer victims."},
    {name:"Terrorized Citizens", text:"You get +2 coin in your payoff for scores that involve battle or extortion. The frightened locals offer you tribute whenever you lash out. They don’t want to be next."},
    {name:"Warehouses", text:"You get +1d to acquire asset rolls. You have space to hold all the various spoils you end up with after your battles. It can be useful on its own or for barter when you need it."},
    {name:"Ancient Altar", text:"You get +1d to the engagement roll for occult plans. Its blessing is with you."},
    {name:"Ancient Tower", text:"You get +1d to Consort with arcane entities on-site."},
    {name:"Offertory", text:"You get +2 coin in your payoff for scores that involve occult operations. The frightened locals offer you tribute when you perform your dark practices. They don’t want to be next."},
    {name:"Local Graft", text:"You get +2 coin in payoff for scores that involve a show of force or socializing. A few city officials share bribe money with those who show that they’re players on the scene."},
    {name:"Lookouts", text:"You get +1d to Hunt or Survey on your turf."},
    {name:"Luxury Venue", text:"+1d to Consort and Sway rolls on-site. Silks, paintings, and crystal impress the clientele."},
    {name:"Surplus Cache", text:"You get +2 coin in payoff for scores that involve product sale or supply. You have an abundance of product, which pads your pockets every now and then."},
    {name:"Covert Drop", text:"You get +2 coin in payoff for scores that involve espionage or sabotage. The perfect hidden exchange point is worth the extra coin to discerning clientele."},
    {name:"Interrogation Chamber", text:"You get +1d to Command and Sway on-site. Grisly business, but effective."},
    {name:"Loyal Fence", text:"You get +2 coin in payoff for scores that involve burglary or robbery. It requires a skilled eye and good contacts to move stolen goods."},
    {name:"Secret Pathways", text:"You get +1d to the engagement roll for stealth plans. You might have access to long-forgotten underground canals, rooftop walkways, or some other route of your choosing."},
    {name:"Tavern", text:"You get +1d to Consort and Sway rolls on-site. Some booze and friendly conversation can go a long way."},
    {name:"Side Business", text:"Any time during downtime, roll dice equal to your Tier. You earn coin equal to the highest result, minus your heat. What kind of legitimate business is this? How do you get paid in secret?"},
    {name:"Allied claim (prison)", text:"One of your allies on the inside arranges for their faction to grant you a boon. Take a claim for your crew from a different crew type. You can’t take turf with this claim."},
    {name:"Cell block control", text:"Your crew has a cell block under their total control—guards and all. You never take trauma from incarceration."},
    {name:"Guard payoff", text:"You claim several prison guards on your payroll. Take +1d to your Tier roll when a member of your crew is incarcerated."},
    {name:"Hardcase", text:"Your reputation as a tough inmate bolsters your crew’s image. When your crew advances Tier, it costs 2 fewer coins than it normally would."},
    {name:"Parole influence", text:"You’re always able to arrange for a shorter prison stay—as if your wanted level was 1 lower."},
    {name:"Smuggling (prison)", text:"You arrange smuggling channels inside. You have +2 load while incarcerated (starting from zero as a prisoner). If you take this claim twice, you’ll have 4 load while you’re serving time. You may choose to carry coin in place of load for bribes or acquiring assets in prison."},
  ],

  GANG_TYPES: [
    {name:"Adepts", text:"Scholars, tinkerers, occultists, and chemists."},
    {name:"Rooks", text:"Con artists, spies, and socialites."},
    {name:"Rovers", text:"Sailors, carriage drivers, and deathlands scavengers."},
    {name:"Skulks", text:"Scouts, infiltrators, and thieves."},
    {name:"Thugs", text:"Killers, brawlers, and roustabouts."},
  ],
  EDGES: ["Fearsome","Independent","Loyal","Tenacious"],
  FLAWS: ["Principled","Savage","Unreliable","Wild"],
  COHORT_HARM: ["Healthy","Weakened","Impaired","Broken","Dead"],

  XP_TRIGGERS: [
    "Contend with challenges above your current station. If you tangled with higher Tiers or more dangerous opposition, mark xp for this.",
    "Bolster your crew’s reputation or develop a new one.",
    "Express the goals, drives, inner conflict, or essential nature of the crew.",
  ],

  ATTRIBUTION: 'This work is based on <a href="http://www.bladesinthedark.com/" target="_blank" rel="noopener">Blades in the Dark</a>, product of One Seven Design, developed and authored by John Harper, and licensed for our use under the <a href="https://creativecommons.org/licenses/by/3.0" target="_blank" rel="noopener">Creative Commons Attribution 3.0 Unported license</a>. Crew rules text is from the SRD. Blades in the Dark™ is a trademark of One Seven Design.',
};
