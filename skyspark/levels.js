export const BUILD = 'world110';
export const WORLD = { width: 28800, height: 1000, ground: 850 };
export const SITE_COUNT = 54;
export const SITE_SPACING=520;
export const BOSS_X = WORLD.width-380;
export const DISTRICT_COUNT=SITE_COUNT/3;
export const LEVELS = [
  { id:'city', name:'Sunbeam City', short:'City', icon:'☀', color:'#ffd28c', biome:'city', boss:'Iron Colossus', bossType:'titan', bossHp:24, waves:2, squad:8,
    districts:['Fountain Quarter','Market Street','Beacon Rooftops','Sunset Gardens','Clocktower Mile','Skybridge'],
    tasks:['Restart the fountain','Light the market lanterns','Wake the rooftop beacon','Bring the gardens to life','Power the clocktower','Open the skybridge'] },
  { id:'plains', name:'Emerald Plains', short:'Plains', icon:'❧', color:'#a6f5cc', biome:'plains', boss:'The Earthmover', bossType:'excavator', bossHp:36, waves:2, squad:10,
    districts:['Buttercup Meadow','Willow Lake','Windmill Fields','Lakeside Trail','Sunflower Rise','Quarry Edge'],
    tasks:['Wake the meadow wind chimes','Clear the lake spring','Start the windmill','Light the lakeside lantern','Restore the flower meadow','Free the quarry spring'] },
  { id:'mountains', name:'Stormpeak Range', short:'Mountains', icon:'▲', color:'#d6b8ff', biome:'mountains', boss:'Stormwing', bossType:'wyvern', bossHp:48, waves:3, squad:10,
    districts:['Pine Valley','Crystal Cliffs','Cloud Bridge','Snowcap Pass','Aurora Ridge','Stormwing Summit'],
    tasks:['Light the valley watchfire','Wake the crystal beacon','Power the cloud bridge','Light the snowcap lantern','Restore the aurora beacon','Open the summit signal'] },
  {id:'caldera',name:'Ember Caldera',short:'Volcano',icon:'◆',color:'#ffb176',biome:'volcano',boss:'Magma Bastion',bossType:'crab',bossHp:64,waves:3,squad:10,
    districts:['Ember Shore','Obsidian Steps','Lava Falls','Ash Gardens','Molten Bridge','Crater Forge'],
    tasks:['Wake the shore beacon','Light the obsidian signal','Restart the cooling spring','Restore the ash garden','Power the molten bridge','Open the crater signal']},
  {id:'spaceport',name:'Moonlit Spaceport',short:'Spaceport',icon:'✧',color:'#b4c4ff',biome:'space',boss:'Orbit Dreadnought',bossType:'dreadnought',bossHp:84,waves:3,squad:12,
    districts:['Moonrise Landing','Starship Docks','Crystal Radar','Orbital Gardens','Neon Runway','Launch Citadel'],
    tasks:['Light the landing lamps','Power the ship docks','Wake the crystal radar','Restore the orbital garden','Open the neon runway','Start the launch signal']},
  {id:'dunes',name:'Sandglass Dunes',short:'Dunes',icon:'◈',color:'#ffd08c',biome:'desert',boss:'Scarab Siege Walker',bossType:'scarab',bossHp:90,waves:3,squad:12,
    districts:['Amber Oasis','Glass Spires','Sunken Gates','Copper Canyon','Dune Observatory','Scarab Palace'],
    tasks:['Light the oasis lamps','Wake the glass spires','Open the sunken gates','Light the canyon signal','Wake the observatory','Free the palace beacon']},
  {id:'reef',name:'Neon Reef',short:'Reef',icon:'≈',color:'#86f5dc',biome:'ocean',boss:'Abyss Leviathan',bossType:'leviathan',bossHp:100,waves:3,squad:12,
    districts:['Coral Landing','Pearl Bridges','Jellyfish Bay','Tidal Towers','Beacon Lagoon','Leviathan Trench'],
    tasks:['Light the coral lamps','Power the pearl bridge','Wake the bay beacon','Start the tidal towers','Restore the lagoon lights','Open the trench signal']},
  {id:'citadel',name:'Prism Citadel',short:'Citadel',icon:'⬡',color:'#ffacf0',biome:'citadel',boss:'Chrome Echo',bossType:'rival',bossHp:200,bossEncounters:[{x:5600,hp:40},{x:15000,hp:40},{x:BOSS_X,hp:120}],waves:3,squad:12,
    districts:['Prism Gate','Mirror Gardens','Ruby Skyway','Radiant Spires','Echo Foundry','Chrome Throne'],
    tasks:['Open the prism gate','Light the mirror garden','Power the ruby skyway','Wake the radiant spires','Restore the foundry lights','Free the chrome throne']}
];
export const CITY_ROOFS = Array.from({length:9},(_,n)=>[
  {x:60+n*3200,y:530,w:230},{x:800+n*3200,y:590,w:200},
  {x:1160+n*3200,y:460,w:220},{x:1440+n*3200,y:550,w:225},
  {x:1760+n*3200,y:390,w:220},{x:2100+n*3200,y:575,w:180}
]).flat();
export function roofsFor(level){
  if(level===0)return CITY_ROOFS;
  return Array.from({length:SITE_COUNT},(_,i)=>({x:160+i*SITE_SPACING,y:level===1?660+(i%3)*45:level===3?490+(i%4)*65:level===4?390+(i%4)*85:390+(i%4)*90,w:160+(i%2)*50}));
}
export function sitesFor(level){
  const l=LEVELS[level];
  return Array.from({length:SITE_COUNT},(_,i)=>{
    const district=Math.floor(i/3),kind=i%3;
    const x=430+i*SITE_SPACING;
    const y=level===0?[750,420,620][kind]:level===1?[745,510,660][kind]:[630,310,470][kind];
    return { id:`${l.id}-${i}`,index:i,x,y,district,restore:kind===2,name:l.districts[district%6],
      task:l.tasks[district%6],pattern:(i+level)%4,restoreX:x,restoreY:level===0?590-(district%3)*100:level===1?650-(district%2)*80:380+(district%3)*90 };
  });
}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const integer=(n,a,b,fallback=0)=>Number.isInteger(n)?clamp(n,a,b):fallback;
export const freshRun=()=>({checkpoint:0,frontier:290,cleared:[],restored:[],kills:0,bossHits:0,complete:false,position:{x:290,y:690},playSeconds:0});
export const freshSave=()=>({schema:5,level:0,completed:[],total:0,best:0,sound:true,runs:LEVELS.map(()=>freshRun())});
export function unlockedLevel(save){let n=0;while(n<LEVELS.length-1&&save.completed.includes(n))n++;return n;}
export function readSave(raw){
  const s=freshSave();if(!raw||![1,2,3,4,5].includes(raw.schema))return s;
  s.total=integer(raw.total,0,1e7);s.best=integer(raw.best,0,1e7);s.sound=raw.sound!==false;
  if(raw.schema===1){
    const stage=integer(raw.stage,0,3);
    if(stage===3){s.completed=[0];s.runs[0]={...freshRun(),checkpoint:18,complete:true,bossHits:4};}
    else {
      s.runs[0].checkpoint=[0,6,12][stage];
      s.runs[0].cleared=Array.isArray(raw.cleared)?raw.cleared.filter(id=>new RegExp(`^s${stage}-[0-7]$`).test(id)).map(id=>`city-${s.runs[0].checkpoint}-0-${id.split('-')[1]}`):[];
      if(stage===2)s.runs[0].bossHits=integer(raw.bossHits,0,4);
      if(raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y))s.runs[0].position={x:clamp(raw.position.x*3,40,WORLD.width-40),y:clamp(raw.position.y,105,WORLD.ground-48)};
    }
    // Reuse the schema-2 migration below so older completed sections stay cleared.
    return readSave({...s,schema:2});
  }
  s.completed=Array.isArray(raw.completed)?[...new Set(raw.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<LEVELS.length))]:[];
  for(let i=0;i<LEVELS.length;i++){
    const r=raw.runs?.[i];if(!r||typeof r!=='object')continue;
    const old=raw.schema<5,sections=old?18:SITE_COUNT;
    const run=s.runs[i];run.checkpoint=integer(r.checkpoint,0,sections);
    run.bossHits=raw.schema<4?integer(r.bossHits,0,[4,6,8][i])*6:(Number.isFinite(r.bossHits)?Math.round(clamp(r.bossHits*(old?2:1),0,LEVELS[i].bossHp)*10)/10:0);
    run.complete=r.complete===true;
    if(run.complete){run.checkpoint=sections;run.bossHits=LEVELS[i].bossHp;if(!s.completed.includes(i))s.completed.push(i);}
    run.playSeconds=Number.isFinite(r.playSeconds)?clamp(r.playSeconds,0,1e8):0;
    const validId=new RegExp(`^${LEVELS[i].id}-(\\d+)-(\\d+)-(\\d+)$`);
    const cleared=new Set(Array.isArray(r.cleared)?r.cleared.filter(id=>{
      if(typeof id!=='string')return false;const m=id.match(validId);if(!m)return false;
      const section=Number(m[1]),wave=Number(m[2]),unit=Number(m[3]);
      return section<=sections&&wave<(section===sections?1:LEVELS[i].waves)&&unit<(section===sections?8:LEVELS[i].squad);
    }):[]);
    if(raw.schema===2)for(let section=0;section<=run.checkpoint;section++){
      const waves=section<run.checkpoint?LEVELS[i].waves:integer(r.wave,0,LEVELS[i].waves-1);
      if(section===sections)break;
      for(let wave=0;wave<waves;wave++)for(let unit=0;unit<LEVELS[i].squad;unit++)cleared.add(`${LEVELS[i].id}-${section}-${wave}-${unit}`);
    }
    run.cleared=old?[...cleared].flatMap(id=>{const m=id.match(validId),section=Number(m[1]);return section===18?[`${LEVELS[i].id}-${SITE_COUNT}-${m[2]}-${m[3]}`]:[0,1,2].map(n=>`${LEVELS[i].id}-${section*3+n}-${m[2]}-${m[3]}`);}):[...cleared];
    const restored=raw.schema>=3&&Array.isArray(r.restored)?[...new Set(r.restored.filter(n=>Number.isInteger(n)&&n>=0&&n<(old?6:DISTRICT_COUNT)))]:Array.from({length:Math.floor(run.checkpoint/3)},(_,n)=>n);
    run.restored=old?restored.flatMap(n=>[n*3,n*3+1,n*3+2]):restored;
    run.kills=raw.schema>=3?integer(r.kills,0,1e7,run.cleared.length+(run.complete?1:0)):Math.min(s.total,run.cleared.length+(run.complete?1:0));
    if(r.position&&Number.isFinite(r.position.x)&&Number.isFinite(r.position.y))run.position={x:clamp(r.position.x*(old?3:1),40,WORLD.width-40),y:clamp(r.position.y,105,WORLD.ground-48)};
    if(old)run.checkpoint=run.complete?SITE_COUNT:run.checkpoint*3;
    run.frontier=Number.isFinite(r.frontier)?clamp(Math.max(r.frontier*(old?3:1),run.position.x),40,WORLD.width-40):Math.max(run.position.x,run.checkpoint*SITE_SPACING);
    if(old&&!run.complete&&!run.kills&&!run.bossHits&&!run.cleared.length&&!run.playSeconds&&r.position?.x===290&&(r.frontier??290)===290){run.position.x=290;run.frontier=290;}
  }
  s.level=integer(raw.level,0,unlockedLevel(s));
  return s;
}
