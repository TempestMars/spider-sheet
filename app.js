"use strict";
const KEY="bitd-sheet-v3";        // current storage: all characters + crews
const KEY_V2="bitd-spider-v2";     // old single-sheet storage (read for migration, never deleted)
const {HERITAGES,BACKGROUNDS,VICES,TRAUMAS,ATTRS,ITEMS,LOADS,LIMITS}=window.CORE;
const PLAYBOOKS=window.PLAYBOOKS;

/* ---------------- state ---------------- */
function defaultState(pbId){
  const pb=PLAYBOOKS[pbId];
  const s={
    playbook:pbId,
    name:"",alias:"",crew:"",look:"",purveyor:"",
    heritage:null,background:null,vice:null,
    stress:0, trauma:[], traumaCount:0,
    harm3:"",harm2a:"",harm2b:"",harm1a:"",harm1b:"",
    armor:false, armorHeavy:false, armorSpecial:false,
    healing:0, clocks:[],
    notes:"",
    stash:0, coin:0, playbookXp:0,
    actions:{}, attrXp:{Insight:0,Prowess:0,Resolve:0},
    abilities:{}, veteranName:"",
    items:{}, pbItems:{}, load:"normal",
    friends:{},
  };
  ATTRS.forEach(a=>a.actions.forEach(ac=>s.actions[ac]=0));
  pb.abilities.forEach(a=>s.abilities[a.id]=false);
  ITEMS.forEach(i=>s.items[i.id]=false);
  pb.items.forEach(i=>s.pbItems[i.id]=false);
  pb.friends.forEach(f=>s.friends[f.id]=0);
  return s;
}
/* Fill in anything missing from a saved character, one level deep so
   newly added abilities/items/etc. appear on old saves. */
function mergeDefaults(def,saved){
  const out=Object.assign({},def);
  const plain=v=>v&&typeof v==="object"&&!Array.isArray(v);
  for(const k in saved){
    out[k]=(plain(def[k])&&plain(saved[k]))?Object.assign({},def[k],saved[k]):saved[k];
  }
  return out;
}
/* Accept a character from any source (old v2 save, backup file, default). */
function normalize(raw){
  raw=JSON.parse(JSON.stringify(raw||{}));        // never share objects with the source
  const pb=PLAYBOOKS[raw.playbook]?raw.playbook:"spider";
  raw.playbook=pb;
  return mergeDefaults(defaultState(pb),raw);
}
function uid(){ return "ch"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

function loadStore(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const s=JSON.parse(raw);
      if(s&&s.version===3&&s.characters&&s.characters[s.activeId]){
        for(const id in s.characters) s.characters[id]=normalize(s.characters[id]);
        s.crews=s.crews||{};
        return s;
      }
    }
  }catch(e){}
  let ch=null;
  try{ const old=localStorage.getItem(KEY_V2); if(old) ch=normalize(JSON.parse(old)); }catch(e){}
  if(!ch) ch=normalize(window.DEFAULT_CHARACTER);
  const id=uid();
  return {version:3,activeId:id,characters:{[id]:ch},crews:{}};
}
const store=loadStore();
let state=store.characters[store.activeId];
const PB=PLAYBOOKS[state.playbook];

let saveTimer=null;
function saveNow(){ try{ localStorage.setItem(KEY, JSON.stringify(store)); return true; }catch(e){ return false; } }
function save(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{ if(saveNow()) flashSaved(); },180);
}
function flashSaved(){ const el=document.getElementById("saved"); if(!el)return; el.classList.add("show"); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("show"),900); }

/* ---------------- derived limits ---------------- */
/* Anything that changes a track size (crew upgrades, later) registers a
   source here: (state, store) => ({stress:+1, trauma:+1, ...}). */
const MOD_SOURCES=[];
function limit(key){
  let n=LIMITS[key];
  MOD_SOURCES.forEach(src=>{ n+=(src(state,store)||{})[key]||0; });
  return n;
}

/* ---------------- helpers ---------------- */
function el(tag,cls,html){const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e;}

/* pip track bound to a numeric key; count may be a number or a function */
function pipTrack(count,getVal,setVal,opts={}){
  const cnt=typeof count==="function"?count:()=>count;
  const t=el("div","track");
  function build(){
    t.innerHTML="";
    for(let i=1;i<=cnt();i++){
      const p=el("button","pip"+(opts.variant?" "+opts.variant:"")+(opts.sm?" sm":"")+(opts.round?" round":""));
      p.type="button"; p.setAttribute("aria-label",opts.label?opts.label+" "+i:"pip "+i);
      p.dataset.i=i;
      p.onclick=()=>{ const cur=getVal(); setVal(cur===i? i-1 : i); t._refresh(); rerenderLight(); };
      t.appendChild(p);
    }
  }
  t._refresh=()=>{
    if(t.children.length!==cnt()) build();
    const v=getVal(); [...t.children].forEach((c,idx)=>c.classList.toggle("on", idx<v));
  };
  build(); t._refresh();
  return t;
}
function labeledTrack(label,valFn,count,getVal,setVal,opts){
  const w=el("div","block");
  const head=el("div","tracklabel");
  head.appendChild(el("span",null,label));
  const v=el("span","val"); head.appendChild(v);
  const tr=pipTrack(count,getVal,setVal,opts);
  w.appendChild(head); w.appendChild(tr);
  w._refresh=()=>{ tr._refresh(); v.textContent=valFn(); };
  w._refresh();
  return w;
}

/* SVG clock */
function clockSVG(segments,getVal,setVal){
  const cx=45,cy=45,r=40, ns="http://www.w3.org/2000/svg";
  const svg=document.createElementNS(ns,"svg"); svg.setAttribute("viewBox","0 0 90 90");
  function pt(a){ const rad=(a-90)*Math.PI/180; return [cx+r*Math.cos(rad), cy+r*Math.sin(rad)]; }
  const segs=[];
  for(let i=0;i<segments;i++){
    const a0=(360/segments)*i, a1=(360/segments)*(i+1);
    const [x0,y0]=pt(a0), [x1,y1]=pt(a1);
    const large=(a1-a0)>180?1:0;
    const path=document.createElementNS(ns,"path");
    path.setAttribute("d",`M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`);
    path.setAttribute("class","seg");
    path.dataset.i=i+1;
    path.onclick=()=>{ const cur=getVal(); setVal(cur===i+1? i : i+1); refresh(); save(); };
    svg.appendChild(path); segs.push(path);
  }
  function refresh(){ const v=getVal(); segs.forEach((s,idx)=>s.classList.toggle("on",idx<v)); }
  refresh(); svg._refresh=refresh;
  return svg;
}

/* ---------------- header ---------------- */
document.title=PB.name+" — Blades in the Dark";
document.getElementById("pb-name").textContent=PB.name;
document.getElementById("pb-tagline").textContent=PB.tagline;

/* ---------------- sections ---------------- */
const app=document.getElementById("app");
const refreshers=[]; // light refreshers for glance + tracks

function sec(title,open){
  const d=el("details","sec"); if(open)d.open=true;
  const s=el("summary",null,'<span class="dot"></span>'+title+'<span class="tw">▸</span>');
  const b=el("div","sec-body");
  d.appendChild(s); d.appendChild(b);
  app.appendChild(d);
  return b;
}
function textField(label,key,opts={}){
  const f=el("div","field");
  f.appendChild(el("label",null,label));
  const inp=opts.area?el("textarea"):el("input");
  if(!opts.area)inp.type="text";
  inp.value=state[key]||"";
  if(opts.ph)inp.placeholder=opts.ph;
  inp.oninput=()=>{ state[key]=inp.value; save(); if(opts.glance)updateGlance(); };
  f.appendChild(inp);
  return f;
}
function chipSelect(label,options,key){
  const f=el("div","field");
  f.appendChild(el("label",null,label));
  const c=el("div","chips");
  options.forEach(o=>{
    const btn=el("button",null,o); btn.type="button";
    if(state[key]===o)btn.classList.add("on");
    btn.onclick=()=>{ state[key]=(state[key]===o?null:o); [...c.children].forEach(x=>x.classList.toggle("on",x.textContent===state[key])); save(); };
    c.appendChild(btn);
  });
  f.appendChild(c);
  return f;
}

/* ---- IDENTITY ---- */
(function(){
  const b=sec("Identity",true);
  const r=el("div","row2");
  r.appendChild(textField("Name","name",{glance:true,ph:"Your name"}));
  r.appendChild(textField("Alias","alias",{ph:"Your alias"}));
  b.appendChild(r);
  b.appendChild(textField("Crew","crew"));
  b.appendChild(textField("Look","look",{ph:"How you appear"}));
  b.appendChild(chipSelect("Heritage",HERITAGES,"heritage"));
  b.appendChild(chipSelect("Background",BACKGROUNDS,"background"));
  b.appendChild(chipSelect("Vice",VICES,"vice"));
  b.appendChild(textField("Purveyor","purveyor",{ph:"Where you indulge your vice"}));
})();

/* ---- STRESS / TRAUMA / HARM ---- */
(function(){
  const b=sec("Stress, trauma &amp; harm",true);

  const stress=labeledTrack("Stress",()=>state.stress+" / "+limit("stress"),()=>limit("stress"),
    ()=>state.stress,v=>{state.stress=v;save();updateGlance();},{variant:"danger",label:"Stress"});
  b.appendChild(stress); refreshers.push(stress._refresh);

  const trauma=labeledTrack("Trauma",()=>state.traumaCount+" / "+limit("trauma"),()=>limit("trauma"),
    ()=>state.traumaCount,v=>{state.traumaCount=v;save();},{variant:"danger",label:"Trauma"});
  b.appendChild(trauma); refreshers.push(trauma._refresh);

  // trauma conditions
  const tw=el("div","field");
  tw.appendChild(el("label",null,"Trauma conditions"));
  const tc=el("div","chips");
  TRAUMAS.forEach(t=>{
    const btn=el("button",null,t); btn.type="button";
    if(state.trauma.includes(t))btn.classList.add("on");
    btn.onclick=()=>{ const i=state.trauma.indexOf(t); if(i<0)state.trauma.push(t); else state.trauma.splice(i,1); btn.classList.toggle("on"); save(); };
    tc.appendChild(btn);
  });
  tw.appendChild(tc); b.appendChild(tw);

  // harm
  const hh=el("div","field"); hh.appendChild(el("label",null,"Harm"));
  b.appendChild(hh);
  function harmRow(level,sub,keys){
    const row=el("div","harm-row");
    row.appendChild(el("div","lvl",sub+'<b>'+level+'</b>'));
    keys.forEach(k=>{
      const inp=el("input"); inp.type="text"; inp.value=state[k]||"";
      inp.oninput=()=>{state[k]=inp.value;save();};
      row.appendChild(inp);
    });
    b.appendChild(row);
  }
  harmRow("3","Need help",["harm3"]);
  harmRow("2","-1d",["harm2a","harm2b"]);
  harmRow("1","Less effect",["harm1a","harm1b"]);

  // armor uses
  const aw=el("div","field"); aw.appendChild(el("label",null,"Armor used"));
  const ac=el("div","chips");
  [["armor","Armor"],["armorHeavy","Heavy"],["armorSpecial","Special"]].forEach(([k,nm])=>{
    const btn=el("button",null,nm); btn.type="button";
    if(state[k])btn.classList.add("on");
    btn.onclick=()=>{state[k]=!state[k]; btn.classList.toggle("on"); save();};
    ac.appendChild(btn);
  });
  aw.appendChild(ac); b.appendChild(aw);
})();

/* ---- CLOCKS ---- */
(function(){
  const b=sec("Clocks");
  b.appendChild(el("p","note","Healing clock fills as you recover. Add project or long-term clocks for your schemes."));
  const wrap=el("div","clocks-wrap");
  b.appendChild(wrap);
  const addbar=el("div","addclock");
  b.appendChild(addbar);

  function render(){
    wrap.innerHTML="";
    // healing
    wrap.appendChild(makeClock({name:"Healing",segments:4, fixed:true,
      get:()=>state.healing, set:v=>state.healing=v}));
    // custom
    state.clocks.forEach(c=>{
      wrap.appendChild(makeClock({clock:c}));
    });
  }
  function makeClock(o){
    const box=el("div","clock");
    let getV,setV;
    if(o.fixed){ getV=o.get; setV=o.set; }
    else { const c=o.clock; getV=()=>c.filled; setV=v=>c.filled=v; }
    box.appendChild(clockSVG(o.fixed?o.segments:o.clock.segments, getV, v=>{setV(v);save();}));
    const nm=el("div","cl-name");
    if(o.fixed){ nm.textContent=o.name+" (4)"; }
    else {
      const inp=el("input"); inp.type="text"; inp.value=o.clock.name; inp.placeholder="Project";
      inp.oninput=()=>{o.clock.name=inp.value;save();};
      nm.appendChild(inp);
    }
    box.appendChild(nm);
    if(!o.fixed){
      const rm=el("button","rm","Remove"); rm.type="button";
      rm.onclick=()=>{ state.clocks=state.clocks.filter(x=>x!==o.clock); save(); render(); };
      box.appendChild(rm);
    }
    return box;
  }
  [4,6,8].forEach(n=>{
    const btn=el("button","mini","+ "+n+"-clock"); btn.type="button";
    btn.onclick=()=>{ state.clocks.push({id:"c"+Date.now(),name:"",segments:n,filled:0}); save(); render(); };
    addbar.appendChild(btn);
  });
  render();
})();

/* ---- ATTRIBUTES ---- */
(function(){
  const b=sec("Actions &amp; attributes",true);
  b.appendChild(el("p","note","Tap dots to set an action rating (0–4). Push yourself (take 2 stress) or accept a Devil's Bargain for +1d. Mark XP when you roll a desperate action."));
  ATTRS.forEach(group=>{
    const wrap=el("div","attr");
    const head=el("div","attr-head");
    head.appendChild(el("h3",null,group.name));
    const rating=el("span","rating","0 ●");
    head.appendChild(rating);
    const xpWrap=el("div","xp");
    const xp=pipTrack(()=>limit("attrXp"),()=>state.attrXp[group.name],v=>{state.attrXp[group.name]=v;save();},{sm:true,label:group.name+" xp"});
    xpWrap.appendChild(xp); head.appendChild(xpWrap);
    wrap.appendChild(head);

    function updRating(){ const n=group.actions.filter(a=>state.actions[a]>0).length; rating.textContent=n+" ●"; }
    group.actions.forEach(ac=>{
      const row=el("div","action");
      row.appendChild(el("div","name",ac));
      const dots=el("div","dots");
      const ds=[];
      for(let i=1;i<=4;i++){
        const d=el("button","dot"); d.type="button"; d.setAttribute("aria-label",ac+" "+i);
        d.onclick=()=>{ const cur=state.actions[ac]; state.actions[ac]=(cur===i?i-1:i); ds.forEach((x,idx)=>x.classList.toggle("on",idx<state.actions[ac])); updRating(); save(); };
        dots.appendChild(d); ds.push(d);
      }
      ds.forEach((x,idx)=>x.classList.toggle("on",idx<state.actions[ac]));
      row.appendChild(dots);
      wrap.appendChild(row);
    });
    updRating();
    b.appendChild(wrap);
  });
})();

/* ---- ABILITIES ---- */
(function(){
  const b=sec("Special abilities");
  PB.abilities.forEach(a=>{
    const row=el("div","abil"+(state.abilities[a.id]?"":" off"));
    const tg=el("button","toggle"+(state.abilities[a.id]?" on":"")); tg.type="button"; tg.setAttribute("aria-label","Toggle "+a.name);
    const body=el("div","body");
    body.appendChild(el("h4",null,a.name));
    body.appendChild(el("p",null,a.html));
    if(a.veteran){
      const vi=el("input","vet-input"); vi.type="text"; vi.placeholder="Chosen ability"; vi.value=state.veteranName||"";
      vi.oninput=()=>{state.veteranName=vi.value;save();};
      body.appendChild(vi);
    }
    tg.onclick=()=>{ state.abilities[a.id]=!state.abilities[a.id]; tg.classList.toggle("on"); row.classList.toggle("off",!state.abilities[a.id]); save(); };
    row.appendChild(tg); row.appendChild(body);
    b.appendChild(row);
  });
})();

/* ---- GEAR & LOAD ---- */
(function(){
  const b=sec("Gear &amp; load");
  const sel=el("div","loadsel");
  Object.entries(LOADS).forEach(([k,v])=>{
    const btn=el("button",state.load===k?"on":null,k.replace(/^\w/,c=>c.toUpperCase())+"<b>"+v+"</b>"); btn.type="button";
    btn.onclick=()=>{ state.load=k; [...sel.children].forEach((c,i)=>c.classList.toggle("on",Object.keys(LOADS)[i]===k)); save(); updLoad(); updateGlance(); };
    sel.appendChild(btn);
  });
  b.appendChild(sel);

  const bar=el("div","loadbar");
  bar.innerHTML='Load used <span class="big">0</span> <span>of '+LOADS[state.load]+'</span>';
  b.appendChild(bar);

  function itemRow(it,isPb){
    const onMap=isPb?state.pbItems:state.items;
    const row=el("div","item "+(onMap[it.id]?"on":"off")+(isPb?" it-sub":""));
    row.appendChild(el("div","box"));
    row.appendChild(el("div","nm",it.name));
    row.appendChild(el("div","ld",it.load+" load"));
    row.onclick=()=>{ onMap[it.id]=!onMap[it.id]; row.classList.toggle("on"); row.classList.toggle("off"); save(); updLoad(); updateGlance(); };
    return row;
  }
  ITEMS.forEach(it=>b.appendChild(itemRow(it,false)));
  b.appendChild(el("div","itemsub",PB.itemsTitle));
  PB.items.forEach(it=>b.appendChild(itemRow(it,true)));

  function computeLoad(){
    let n=0;
    ITEMS.forEach(it=>{ if(state.items[it.id])n+=it.load; });
    PB.items.forEach(it=>{ if(state.pbItems[it.id])n+=it.load; });
    return n;
  }
  function updLoad(){
    const used=computeLoad(), lim=LOADS[state.load];
    bar.querySelector(".big").textContent=used;
    bar.querySelector("span:last-child").textContent="of "+lim;
    bar.classList.toggle("over",used>lim);
  }
  window._updLoad=updLoad; window._computeLoad=computeLoad;
  updLoad();
})();

/* ---- FRIENDS ---- */
(function(){
  const b=sec(PB.friendsTitle);
  b.appendChild(el("p","note","Tap to cycle: neutral → + close friend → − rival."));
  PB.friends.forEach(f=>{
    const row=el("div","friend");
    const st=el("button","st"); st.type="button";
    const who=el("div","who"); who.innerHTML="<b>"+f.name+"</b> <span>— "+f.desc+"</span>";
    const tag=el("div","tag","");
    function paint(){
      const v=state.friends[f.id];
      st.classList.toggle("fr",v===1); st.classList.toggle("rv",v===-1);
      st.textContent=v===1?"+":v===-1?"−":"○";
      tag.textContent=v===1?"Close friend":v===-1?"Rival":"";
      tag.style.color=v===1?"var(--teal)":v===-1?"var(--oxblood)":"var(--muted-2)";
    }
    st.onclick=()=>{ const v=state.friends[f.id]; state.friends[f.id]=v===0?1:v===1?-1:0; paint(); save(); };
    paint();
    row.appendChild(st); row.appendChild(who); row.appendChild(tag);
    b.appendChild(row);
  });
})();

/* ---- COIN / STASH / XP ---- */
(function(){
  const b=sec("Coin, stash &amp; XP");
  const coin=labeledTrack("Coin (on hand)",()=>state.coin+" / "+limit("coin"),()=>limit("coin"),
    ()=>state.coin,v=>{state.coin=v;save();updateGlance();},{variant:"teal",label:"Coin"});
  b.appendChild(coin); refreshers.push(coin._refresh);

  const pbxp=labeledTrack("Playbook XP",()=>state.playbookXp+" / "+limit("playbookXp"),()=>limit("playbookXp"),
    ()=>state.playbookXp,v=>{state.playbookXp=v;save();},{sm:true,label:"Playbook XP"});
  b.appendChild(pbxp); refreshers.push(pbxp._refresh);

  const stashMax=limit("stash");
  const stHead=el("div","tracklabel");
  stHead.appendChild(el("span",null,"Stash"));
  const stVal=el("span","val",state.stash+" / "+stashMax); stHead.appendChild(stVal);
  b.appendChild(el("div","block")).appendChild(stHead);
  const grid=el("div","stash");
  const cells=[];
  for(let i=1;i<=stashMax;i++){
    const p=el("button","pip"); p.type="button"; p.setAttribute("aria-label","stash "+i);
    p.onclick=()=>{ state.stash=(state.stash===i?i-1:i); paint(); save(); };
    grid.appendChild(p); cells.push(p);
  }
  function paint(){ cells.forEach((c,idx)=>c.classList.toggle("on",idx<state.stash)); stVal.textContent=state.stash+" / "+stashMax; }
  paint();
  b.appendChild(grid);

  const xpw=el("div","ref"); xpw.style.marginTop="16px";
  xpw.innerHTML='<h4>Mark XP at end of session (1, or 2 if it happened more than once)</h4>'+
    '<ul><li>'+PB.xpTrigger+'</li>'+
    '<li>You expressed your <i>beliefs, drives, heritage, or background</i>.</li>'+
    '<li>You struggled with issues from your <i>vice or traumas</i> during the session.</li></ul>';
  b.appendChild(xpw);
})();

/* ---- NOTES ---- */
(function(){
  const b=sec("Notes");
  b.appendChild(textField("Notes","notes",{area:true,ph:"Contacts, leads, plans, debts owed…"}));
})();

/* ---- REFERENCE ---- */
(function(){
  const b=sec("Reference");
  const ref=el("div","ref");
  ref.innerHTML=
    '<h4>Teamwork</h4><ul>'+
    '<li>Assist a teammate</li><li>Lead a group action</li><li>Protect a teammate</li><li>Set up a teammate</li></ul>'+
    '<h4>Planning &amp; load</h4><p class="note" style="margin:0 0 6px">Choose a plan, provide the detail, then set your load limit.</p><div class="pg">'+
    '<div>Assault: <i>Point of attack</i></div><div>Occult: <i>Arcane power</i></div>'+
    '<div>Deception: <i>Method</i></div><div>Social: <i>Connection</i></div>'+
    '<div>Stealth: <i>Entry point</i></div><div>Transport: <i>Route</i></div></div>'+
    '<h4>Gather information</h4><ul>'+
    '<li>What do they want most?</li><li>What should I look out for?</li>'+
    '<li>Where\'s the leverage here?</li><li>How can I discover [X]?</li>'+
    '<li>What do they intend to do?</li><li>How can I get them to [X]?</li>'+
    '<li>What\'s really going on here?</li></ul>';
  b.appendChild(ref);
})();

/* ---------------- glance + light refresh ---------------- */
function updateGlance(){
  const g=document.getElementById("glance");
  const nm=state.name||("Unnamed "+PB.name);
  const used=window._computeLoad?window._computeLoad():0, lim=LOADS[state.load];
  const maxStress=limit("stress");
  g.innerHTML="";
  const chips=[
    {t:"Name",v:nm,warn:false},
    {t:"Stress",v:state.stress+"/"+maxStress,warn:state.stress>=maxStress-1},
    {t:"Coin",v:state.coin,warn:false},
    {t:"Load",v:used+"/"+lim,warn:used>lim},
  ];
  chips.forEach(c=>{
    const e=el("span","chip"+(c.warn?" warn":""),c.t+" <b>"+c.v+"</b>");
    g.appendChild(e);
  });
}
function rerenderLight(){ refreshers.forEach(f=>f()); updateGlance(); }
updateGlance();

/* ---------------- backup ---------------- */
document.getElementById("btn-export").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  const nm=(state.name||PB.id).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||PB.id;
  a.href=URL.createObjectURL(blob); a.download="bitd-"+nm+".json"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
document.getElementById("btn-import").onclick=()=>document.getElementById("file-import").click();
document.getElementById("file-import").onchange=(e)=>{
  const f=e.target.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      store.characters[store.activeId]=normalize(JSON.parse(r.result));  // old backups have no playbook field: treated as Spider
      saveNow(); location.reload();
    }catch(err){ alert("That file couldn't be read as a backup."); }
  };
  r.readAsText(f);
};
document.getElementById("btn-reset").onclick=()=>{
  if(confirm("Reset this sheet back to the default character? This replaces the current character on this device. Export a backup first if you want to keep it.")){
    store.characters[store.activeId]=normalize(window.DEFAULT_CHARACTER);
    saveNow(); location.reload();
  }
};
