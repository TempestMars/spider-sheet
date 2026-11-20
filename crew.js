"use strict";
/* The Crew tab. Uses the helpers and state from app.js (el, sec, textField,
   chipSelect, pipTrack, labeledTrack, save, refreshers, limit, crew, crewApp). */
(function(){
const C=crew;
const TYPE=CREW.TYPES[C.type]||CREW.TYPES.hawkers;
const csec=(title,open)=>sec(title,open,crewApp);
const repMax=()=>Math.max(6,limit("rep")-C.turf);
function newId(){ return "i"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function removeBtn(arr,item,render){
  const b=el("button","rm","Remove"); b.type="button";
  b.onclick=()=>{ const i=arr.indexOf(item); if(i>=0)arr.splice(i,1); save(); render(); };
  return b;
}
function addBtn(label,fn){ const b=el("button","mini",label); b.type="button"; b.onclick=fn; return b; }
function textInput(obj,key,ph,cls){
  const i=el("input",cls); i.type="text"; i.value=obj[key]||""; if(ph)i.placeholder=ph;
  i.oninput=()=>{ obj[key]=i.value; save(); }; return i;
}
function areaInput(obj,key,ph){
  const t=el("textarea"); t.value=obj[key]||""; if(ph)t.placeholder=ph; t.style.minHeight="64px";
  t.oninput=()=>{ obj[key]=t.value; save(); }; return t;
}
/* multi-select chips bound to an array, optionally capped */
function multiChips(label,options,arr,max){
  const f=el("div","field"); f.appendChild(el("label",null,label));
  const c=el("div","chips");
  function paint(){ [...c.children].forEach(b=>b.classList.toggle("on",arr.includes(b.textContent))); }
  options.forEach(o=>{
    const b=el("button",null,o); b.type="button";
    b.onclick=()=>{
      const i=arr.indexOf(o);
      if(i>=0)arr.splice(i,1); else { arr.push(o); if(max&&arr.length>max)arr.shift(); }
      paint(); save();
    };
    c.appendChild(b);
  });
  paint(); f.appendChild(c); return f;
}
/* single-select chips bound to obj[key] holding the option's value */
function pickChips(label,options,obj,key,onChange){
  const f=el("div","field"); if(label)f.appendChild(el("label",null,label));
  const c=el("div","chips");
  function paint(){ [...c.children].forEach((b,i)=>b.classList.toggle("on",obj[key]===options[i].value)); }
  options.forEach(o=>{
    const b=el("button",null,o.label); b.type="button";
    b.onclick=()=>{ obj[key]=o.value; paint(); save(); if(onChange)onChange(); };
    c.appendChild(b);
  });
  paint(); f.appendChild(c); return f;
}

/* ---- at-a-glance strip ---- */
const glance=el("div","glance"); glance.style.margin="14px 0 0";
crewApp.appendChild(glance);
function paintGlance(){
  glance.innerHTML="";
  [
    {t:"Tier",v:CREW.TIERS[C.tier]},
    {t:"Hold",v:C.hold==="weak"?"Weak":"Strong",warn:C.hold==="weak"},
    {t:"Rep",v:C.rep+"/"+repMax()},
    {t:"Heat",v:C.heat+"/"+limit("heat"),warn:C.heat>=limit("heat")},
    {t:"Wanted",v:C.wanted,warn:C.wanted>=3},
    {t:"Coin",v:C.coin+"/"+limit("crewCoin")},
  ].forEach(c=>glance.appendChild(el("span","chip"+(c.warn?" warn":""),c.t+" <b>"+c.v+"</b>")));
}
refreshers.push(paintGlance); paintGlance();

/* ---- CREW & STANDING ---- */
(function(){
  const b=csec("Crew &amp; standing",true);
  const r=el("div","row2");
  r.appendChild(textField("Crew name","name",{obj:C,ph:"Crew name"}));
  const tf=el("div","field"); tf.appendChild(el("label",null,"Crew type"));
  const tc=el("div","chips"); tc.appendChild(el("button","on",TYPE.name)); tf.appendChild(tc); r.appendChild(tf);
  b.appendChild(r);
  b.appendChild(chipSelect("Reputation",CREW.REPUTATIONS,"reputation",C));
  b.appendChild(textField("Lair","lair",{obj:C,ph:"Where the crew makes its lair"}));
  b.appendChild(textField("Hunting grounds","hunting",{obj:C,ph:"District, and which faction claims it"}));
  b.appendChild(pickChips("Dealing with that faction",CREW.HUNTING_DEALS.map(d=>({label:d.label,value:d.id})),C,"huntingDeal"));
  b.appendChild(textField("Preferred operation type","huntingOp",{obj:C,ph:"From your crew’s list. +1d to gather information and a free downtime activity when you operate on your hunting grounds."}));

  b.appendChild(pickChips("Tier",CREW.TIERS.map((t,i)=>({label:t,value:i})),C,"tier",rerenderLight));
  b.appendChild(pickChips("Hold",[{label:"Strong",value:"strong"},{label:"Weak",value:"weak"}],C,"hold",rerenderLight));

  const rep=labeledTrack("Rep",()=>C.rep+" / "+repMax(),repMax,()=>C.rep,v=>{C.rep=v;save();},{label:"Rep"});
  b.appendChild(rep); refreshers.push(rep._refresh);
  const turf=labeledTrack("Turf held (each lowers the rep needed to advance Tier; never below 6)",()=>C.turf+" / 6",6,()=>C.turf,v=>{C.turf=v;save();},{sm:true,label:"Turf"});
  b.appendChild(turf); refreshers.push(turf._refresh);

  const heat=labeledTrack("Heat",()=>C.heat+" / "+limit("heat"),()=>limit("heat"),()=>C.heat,v=>{C.heat=v;save();},{variant:"danger",label:"Heat"});
  b.appendChild(heat); refreshers.push(heat._refresh);
  const hw=el("p","note"); hw.style.color="var(--oxblood)"; b.appendChild(hw);
  refreshers.push(()=>{ hw.textContent=C.heat>=limit("heat")?"Heat is full: gain a wanted level and clear your heat (extra heat rolls over).":""; hw.hidden=!hw.textContent; });
  const wanted=labeledTrack("Wanted level",()=>C.wanted+" / "+limit("wanted"),()=>limit("wanted"),()=>C.wanted,v=>{C.wanted=v;save();},{variant:"danger",label:"Wanted"});
  b.appendChild(wanted); refreshers.push(wanted._refresh);
  const coin=labeledTrack("Crew coin (lair storage)",()=>C.coin+" / "+limit("crewCoin"),()=>limit("crewCoin"),()=>C.coin,v=>{C.coin=v;save();},{variant:"teal",label:"Crew coin"});
  b.appendChild(coin); refreshers.push(coin._refresh);
  rerenderLight();
})();

/* ---- SPECIAL ABILITIES (typed in from the crew's own sheet) ---- */
(function(){
  const b=csec("Crew special abilities");
  b.appendChild(el("p","note","Your crew’s own special abilities come from your crew sheet, so add them here: name and text. Tick the ones you’ve taken."));
  const box=el("div"); b.appendChild(box);
  function render(){
    box.innerHTML="";
    C.abilities.forEach(a=>{
      const row=el("div","abil"+(a.on?"":" off"));
      const tg=el("button","toggle"+(a.on?" on":"")); tg.type="button"; tg.setAttribute("aria-label","Taken");
      tg.onclick=()=>{ a.on=!a.on; tg.classList.toggle("on",a.on); row.classList.toggle("off",!a.on); save(); };
      const body=el("div","body");
      body.appendChild(textInput(a,"name","Ability name"));
      const ta=areaInput(a,"text","What it does"); ta.style.marginTop="6px"; body.appendChild(ta);
      body.appendChild(removeBtn(C.abilities,a,render));
      row.appendChild(tg); row.appendChild(body); box.appendChild(row);
    });
  }
  render();
  const bar=el("div","addclock");
  bar.appendChild(addBtn("+ Add ability",()=>{ C.abilities.push({id:newId(),name:"",text:"",on:true}); save(); render(); }));
  b.appendChild(bar);
})();

/* ---- UPGRADES ---- */
(function(){
  const b=csec("Crew upgrades");
  b.appendChild(el("p","note","Mark an upgrade’s boxes as you earn them. Ones that change the character sheet apply once every box is marked."));
  CREW.UPGRADE_GROUPS.forEach(g=>{
    b.appendChild(el("div","itemsub",g.title));
    CREW.UPGRADES.filter(u=>u.group===g.id).forEach(u=>{
      const row=el("div","upg");
      const head=el("div","upg-head");
      head.appendChild(el("span","upg-name",u.name));
      head.appendChild(pipTrack(u.boxes,()=>C.upgrades[u.id]||0,v=>{C.upgrades[u.id]=v;save();},{sm:true,label:u.name+" box"}));
      row.appendChild(head);
      if(u.badge) row.appendChild(el("div","upg-badge","Effect: "+u.badge));
      row.appendChild(el("p","upg-text",u.text));
      refreshers.push(()=>row.classList.toggle("done",upgradeDone(u)));
      row.classList.toggle("done",upgradeDone(u));
      b.appendChild(row);
    });
  });

  b.appendChild(el("div","itemsub","Your crew’s own upgrades"));
  b.appendChild(el("p","note","Upgrades from your crew sheet that aren’t listed above (including its two starting upgrades). They’re tracked here but don’t change other numbers automatically."));
  const box=el("div"); b.appendChild(box);
  function render(){
    box.innerHTML="";
    C.customUpgrades.forEach(u=>{
      const row=el("div","upg");
      const head=el("div","upg-head");
      head.appendChild(textInput(u,"name","Upgrade name","upg-in"));
      row.appendChild(head);
      const trk=el("div"); trk.style.margin="8px 0 4px";
      function paintTrack(){
        trk.innerHTML="";
        trk.appendChild(pipTrack(u.boxes,()=>u.marked,v=>{u.marked=v;save();},{sm:true,label:"box"}));
      }
      paintTrack(); row.appendChild(trk);
      row.appendChild(pickChips("Boxes to unlock",[1,2,3,4].map(n=>({label:String(n),value:n})),u,"boxes",()=>{ if(u.marked>u.boxes)u.marked=u.boxes; paintTrack(); }));
      row.appendChild(areaInput(u,"text","What it does"));
      row.appendChild(removeBtn(C.customUpgrades,u,render));
      box.appendChild(row);
    });
  }
  render();
  const bar=el("div","addclock");
  bar.appendChild(addBtn("+ Add crew upgrade",()=>{ C.customUpgrades.push({id:newId(),name:"",text:"",boxes:1,marked:0}); save(); render(); }));
  b.appendChild(bar);
})();

/* ---- COHORTS ---- */
(function(){
  const b=csec("Cohorts");
  b.appendChild(el("p","note","A cohort costs two upgrades. A gang’s quality and scale equal your Tier; an expert has quality Tier +1 and scale 0. Roll their quality when you send them on a task."));
  const box=el("div"); b.appendChild(box);
  let statFns=[];
  function render(){
    box.innerHTML=""; statFns=[];
    C.cohorts.forEach(co=>{
      const card=el("div","cohort");
      const head=el("div","co-head");
      head.appendChild(textInput(co,"name","Cohort name"));
      card.appendChild(head);
      const stats=el("div","co-stats"); card.appendChild(stats);
      const upd=()=>{
        const t=C.tier;
        stats.textContent=(co.kind==="expert"?"Expert · quality "+(t+1)+" · scale 0":"Gang · quality "+t+" · scale "+t)+(co.elite?" · Elite (+1d)":"");
      };
      upd(); statFns.push(upd);
      if(co.kind==="expert"){
        const f=el("div","field"); f.appendChild(el("label",null,"Expertise (up to two types)"));
        f.appendChild(textInput(co,"expertise","e.g. Doctor, Investigator, Occultist, Spy")); card.appendChild(f);
      } else {
        card.appendChild(multiChips("Gang type (up to two)",CREW.GANG_TYPES.map(g=>g.name),co.types,2));
      }
      card.appendChild(multiChips("Edges",CREW.EDGES,co.edges));
      card.appendChild(multiChips("Flaws",CREW.FLAWS,co.flaws));
      card.appendChild(pickChips("Harm",CREW.COHORT_HARM.map((h,i)=>({label:h,value:i})),co,"harm"));
      const ef=el("div","chips"); const eb=el("button",co.elite?"on":null,"Elite (+1d)"); eb.type="button";
      eb.onclick=()=>{ co.elite=!co.elite; eb.classList.toggle("on",co.elite); upd(); save(); };
      ef.appendChild(eb); card.appendChild(ef);
      const nt=areaInput(co,"notes","Notes"); nt.style.marginTop="10px"; card.appendChild(nt);
      card.appendChild(removeBtn(C.cohorts,co,render));
      box.appendChild(card);
    });
  }
  refreshers.push(()=>statFns.forEach(f=>f()));
  render();
  const bar=el("div","addclock");
  const mk=kind=>()=>{ C.cohorts.push({id:newId(),kind,name:"",types:[],expertise:"",edges:[],flaws:[],harm:0,elite:false,notes:""}); save(); render(); };
  bar.appendChild(addBtn("+ Gang",mk("gang"))); bar.appendChild(addBtn("+ Expert",mk("expert")));
  b.appendChild(bar);
  const ref=el("div","ref");
  ref.innerHTML='<h4>Harm &amp; healing</h4><ul><li><i>Weakened</i>: reduced effect · <i>Impaired</i>: −1d · <i>Broken</i>: can’t act until recovered · <i>Dead</i>: destroyed.</li>'+
    '<li>Each cohort heals one level of harm in downtime (two if a PC spends a downtime activity helping).</li>'+
    '<li>Replace a destroyed cohort for coin equal to Tier +2, plus two downtime activities.</li></ul>';
  b.appendChild(ref);
})();

/* ---- CLAIMS ---- */
(function(){
  const b=csec("Claims");
  b.appendChild(el("p","note","Pick claims from the SRD list, or add your own from your crew’s claim map."));
  const box=el("div"); b.appendChild(box);
  function render(){
    box.innerHTML="";
    C.claims.forEach(cl=>{
      const row=el("div","upg");
      if(cl.custom){
        row.appendChild(textInput(cl,"name","Claim name","upg-in"));
        row.appendChild(areaInput(cl,"text","What it does"));
      } else {
        row.appendChild(el("div","upg-name",cl.name));
        row.appendChild(el("p","upg-text",cl.text));
      }
      row.appendChild(removeBtn(C.claims,cl,render));
      box.appendChild(row);
    });
  }
  render();
  const bar=el("div","addclock");
  const sel=el("select","claimsel");
  sel.appendChild(new Option("Add an SRD claim…",""));
  CREW.CLAIMS.forEach((c,i)=>sel.appendChild(new Option(c.name,String(i))));
  sel.onchange=()=>{
    if(sel.value==="")return;
    const c=CREW.CLAIMS[+sel.value];
    C.claims.push({id:newId(),name:c.name,text:c.text,custom:false}); sel.value=""; save(); render();
  };
  bar.appendChild(sel);
  bar.appendChild(addBtn("+ Custom claim",()=>{ C.claims.push({id:newId(),name:"",text:"",custom:true}); save(); render(); }));
  b.appendChild(bar);
})();

/* ---- CONTACTS & FACTIONS ---- */
(function(){
  const b=csec("Contacts &amp; factions");
  b.appendChild(el("p","note","Your crew sheet lists contacts; add them here and star your favorite (a close friend or long-time ally)."));
  const cbox=el("div"); b.appendChild(cbox);
  function renderContacts(){
    cbox.innerHTML="";
    C.contacts.forEach(ct=>{
      const row=el("div","friend");
      const st=el("button","st"+(ct.fav?" fr":"")); st.type="button"; st.textContent=ct.fav?"★":"☆"; st.setAttribute("aria-label","Favorite contact");
      st.onclick=()=>{ ct.fav=!ct.fav; st.classList.toggle("fr",ct.fav); st.textContent=ct.fav?"★":"☆"; save(); };
      const who=el("div","who"); who.style.flex="1";
      who.appendChild(textInput(ct,"name","Name"));
      const d=textInput(ct,"desc","Who they are"); d.style.marginTop="5px"; who.appendChild(d);
      who.appendChild(removeBtn(C.contacts,ct,renderContacts));
      row.appendChild(st); row.appendChild(who); cbox.appendChild(row);
    });
  }
  renderContacts();
  const cbar=el("div","addclock");
  cbar.appendChild(addBtn("+ Add contact",()=>{ C.contacts.push({id:newId(),name:"",desc:"",fav:false}); save(); renderContacts(); }));
  b.appendChild(cbar);

  b.appendChild(el("div","itemsub","Faction status"));
  b.appendChild(el("p","note","Status runs from −3 (war) to +3 (allies). Add the factions you deal with."));
  const fbox=el("div"); b.appendChild(fbox);
  function renderFactions(){
    fbox.innerHTML="";
    C.factions.forEach(f=>{
      const row=el("div","faction");
      row.appendChild(textInput(f,"name","Faction"));
      const stp=el("div","stepper");
      const minus=el("button",null,"−"), val=el("span","sval"), plus=el("button",null,"+");
      minus.type="button"; plus.type="button";
      const paint=()=>{ val.textContent=(f.status>0?"+":"")+f.status; val.className="sval"+(f.status>0?" pos":f.status<0?" neg":""); };
      minus.onclick=()=>{ f.status=Math.max(-3,f.status-1); paint(); save(); };
      plus.onclick=()=>{ f.status=Math.min(3,f.status+1); paint(); save(); };
      paint(); stp.appendChild(minus); stp.appendChild(val); stp.appendChild(plus);
      row.appendChild(stp); row.appendChild(removeBtn(C.factions,f,renderFactions));
      fbox.appendChild(row);
    });
  }
  renderFactions();
  const fbar=el("div","addclock");
  fbar.appendChild(addBtn("+ Add faction",()=>{ C.factions.push({id:newId(),name:"",status:0}); save(); renderFactions(); }));
  b.appendChild(fbar);
})();

/* ---- CREW XP ---- */
(function(){
  const b=csec("Crew XP");
  const xp=labeledTrack("Crew XP",()=>C.crewXp+" / "+limit("crewXp"),()=>limit("crewXp"),()=>C.crewXp,v=>{C.crewXp=v;save();},{sm:true,label:"Crew XP"});
  b.appendChild(xp); refreshers.push(xp._refresh);
  b.appendChild(textField("Your crew’s own XP trigger","xpTrigger",{obj:C,ph:"From your crew sheet"}));
  const ref=el("div","ref");
  ref.innerHTML='<h4>Mark crew XP at end of session (1, or 2 if it happened more than once or in a major way)</h4><ul>'+
    '<li>Your crew’s own XP trigger (above).</li>'+
    CREW.XP_TRIGGERS.map(t=>'<li>'+t+'</li>').join("")+'</ul>'+
    '<h4>When the track fills</h4><ul><li>Clear it, then take a new special ability <i>or</i> mark two crew upgrade boxes.</li>'+
    '<li>Each PC gets stash equal to your crew Tier +2 (<b id="stashgain"></b>).</li></ul>';
  b.appendChild(ref);
  const sg=ref.querySelector("#stashgain");
  const paint=()=>{ sg.textContent="currently "+(C.tier+2); }; paint(); refreshers.push(paint);
})();

/* ---- NOTES ---- */
(function(){
  const b=csec("Crew notes");
  b.appendChild(textField("Notes","notes",{obj:C,area:true,ph:"Scores, debts, tithes owed, clocks you’re watching…"}));
})();

/* ---- REFERENCE ---- */
(function(){
  const b=csec("Crew reference");
  const ref=el("div","ref");
  ref.innerHTML=
    '<h4>Heat from a score</h4><ul>'+
    '<li><b>0</b> smooth &amp; quiet · <b>2</b> contained · <b>4</b> loud &amp; chaotic · <b>6</b> wild</li>'+
    '<li>+1 high-profile or well-connected target · +1 hostile turf · +1 at war · +2 if killing was involved.</li>'+
    '<li>At 9 heat: gain a wanted level and clear heat (overflow rolls over).</li></ul>'+
    '<h4>Payoff</h4><ul>'+
    '<li>Rep: 2 per score, +1 per Tier the target is above you, −1 per Tier below (min 0). A fully quiet score earns 0 rep.</li>'+
    '<li>Coin: 2 minor · 4 small · 6 standard · 8 big · 10+ major.</li>'+
    '<li>Tithe to a boss: crew Tier +1 coin.</li></ul>'+
    '<h4>Coin</h4><ul>'+
    '<li>Lair holds 4 coin; Vault raises it to 8, then 16. Spend or share the excess.</li>'+
    '<li>1 coin: extra downtime activity, or +1 result level on a downtime roll.</li></ul>'+
    '<h4>Incarceration</h4><ul>'+
    '<li>Sentence by wanted level: 0 weeks (or a beating) · 1 a month or two · 2 several months · 3 a year or two · 4 life or execution.</li>'+
    '<li>Roll your Tier: <b>crit</b> +3 rep, 1 prison claim, +1 status with a faction you helped · <b>6</b> 1 prison claim, +1 status · <b>4/5</b> no incident · <b>1–3</b> take a trauma.</li>'+
    '<li>When a crew member, friend or framed enemy is incarcerated for your crimes, reduce wanted level by 1 and clear heat.</li></ul>';
  b.appendChild(ref);
})();

document.querySelector(".foot").after(el("p","foot attrib",CREW.ATTRIBUTION));   // shown under both tabs
})();
