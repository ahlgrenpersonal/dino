export const BUILD = 'world92';
export const WORLD = { width: 9600, height: 1000, ground: 850 };
export const SITE_COUNT = 18;
export const LEVELS = [
  { id:'city', name:'Sunbeam City', short:'City', icon:'☀', color:'#ffd28c', biome:'city', boss:'Iron Colossus', bossType:'titan', bossHp:4, waves:2, squad:8,
    districts:['Fountain Quarter','Market Street','Beacon Rooftops','Sunset Gardens','Clocktower Mile','Skybridge'],
    tasks:['Restart the fountain','Light the market lanterns','Wake the rooftop beacon','Bring the gardens to life','Power the clocktower','Open the skybridge'] },
  { id:'plains', name:'Emerald Plains', short:'Plains', icon:'❧', color:'#a6f5cc', biome:'plains', boss:'The Earthmover', bossType:'excavator', bossHp:6, waves:2, squad:10,
    districts:['Buttercup Meadow','Willow Lake','Windmill Fields','Lakeside Trail','Sunflower Rise','Quarry Edge'],
    tasks:['Wake the meadow wind chimes','Clear the lake spring','Start the windmill','Light the lakeside lantern','Restore the flower meadow','Free the quarry spring'] },
  { id:'mountains', name:'Stormpeak Range', short:'Mountains', icon:'▲', color:'#d6b8ff', biome:'mountains', boss:'Stormwing', bossType:'wyvern', bossHp:8, waves:3, squad:10,
    districts:['Pine Valley','Crystal Cliffs','Cloud Bridge','Snowcap Pass','Aurora Ridge','Stormwing Summit'],
    tasks:['Light the valley watchfire','Wake the crystal beacon','Power the cloud bridge','Light the snowcap lantern','Restore the aurora beacon','Open the summit signal'] }
];
export const CITY_ROOFS = Array.from({length:3},(_,n)=>[
  {x:60+n*3200,y:530,w:230},{x:800+n*3200,y:590,w:200},
  {x:1160+n*3200,y:460,w:220},{x:1440+n*3200,y:550,w:225},
  {x:1760+n*3200,y:390,w:220},{x:2100+n*3200,y:575,w:180}
]).flat();
export function roofsFor(level){
  if(level===0)return CITY_ROOFS;
  return Array.from({length:18},(_,i)=>({x:160+i*500,y:level===1?660+(i%3)*45:390+(i%4)*90,w:160+(i%2)*50}));
}
export function sitesFor(level){
  const l=LEVELS[level];
  return Array.from({length:SITE_COUNT},(_,i)=>{
    const district=Math.floor(i/3),kind=i%3;
    const x=430+i*500;
    const y=level===0?[750,420,620][kind]:level===1?[745,510,660][kind]:[630,310,470][kind];
    return { id:`${l.id}-${i}`,index:i,x,y,district,restore:kind===2,name:l.districts[district],
      task:l.tasks[district],pattern:(i+level)%4,restoreX:x,restoreY:level===0?590-(district%3)*100:level===1?650-(district%2)*80:380+(district%3)*90 };
  });
}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const integer=(n,a,b,fallback=0)=>Number.isInteger(n)?clamp(n,a,b):fallback;
export const freshRun=()=>({checkpoint:0,wave:0,cleared:[],bossHits:0,complete:false,position:{x:290,y:690},playSeconds:0});
export const freshSave=()=>({schema:2,level:0,completed:[],total:0,best:0,sound:true,runs:LEVELS.map(()=>freshRun())});
export function unlockedLevel(save){let n=0;while(n<2&&save.completed.includes(n))n++;return n;}
export function readSave(raw){
  const s=freshSave();if(!raw||![1,2].includes(raw.schema))return s;
  s.total=integer(raw.total,0,1e7);s.best=integer(raw.best,0,1e7);s.sound=raw.sound!==false;
  if(raw.schema===1){
    const stage=integer(raw.stage,0,3);
    if(stage===3){s.completed=[0];s.runs[0]={...freshRun(),checkpoint:SITE_COUNT,complete:true,bossHits:4};}
    else {
      s.runs[0].checkpoint=[0,6,12][stage];
      s.runs[0].cleared=Array.isArray(raw.cleared)?raw.cleared.filter(id=>new RegExp(`^s${stage}-[0-7]$`).test(id)).map(id=>`city-${s.runs[0].checkpoint}-0-${id.split('-')[1]}`):[];
      if(stage===2)s.runs[0].bossHits=integer(raw.bossHits,0,4);
      if(raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y))s.runs[0].position={x:clamp(raw.position.x*3,40,WORLD.width-40),y:clamp(raw.position.y,105,WORLD.ground-48)};
    }
    return s;
  }
  s.completed=Array.isArray(raw.completed)?[...new Set(raw.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
  for(let i=0;i<3;i++){
    const r=raw.runs?.[i];if(!r||typeof r!=='object')continue;
    const run=s.runs[i];run.checkpoint=integer(r.checkpoint,0,SITE_COUNT);
    run.wave=integer(r.wave,0,LEVELS[i].waves-1);run.bossHits=integer(r.bossHits,0,LEVELS[i].bossHp);
    run.complete=r.complete===true;
    if(run.complete){run.checkpoint=SITE_COUNT;run.bossHits=LEVELS[i].bossHp;if(!s.completed.includes(i))s.completed.push(i);}
    run.playSeconds=Number.isFinite(r.playSeconds)?clamp(r.playSeconds,0,1e8):0;
    const prefix=`${LEVELS[i].id}-${run.checkpoint}-${run.wave}-`;
    run.cleared=Array.isArray(r.cleared)?[...new Set(r.cleared.filter(id=>typeof id==='string'&&id.startsWith(prefix)&&/^[-a-z0-9]+$/.test(id)))].slice(0,40):[];
    if(r.position&&Number.isFinite(r.position.x)&&Number.isFinite(r.position.y))run.position={x:clamp(r.position.x,40,WORLD.width-40),y:clamp(r.position.y,105,WORLD.ground-48)};
  }
  s.level=integer(raw.level,0,unlockedLevel(s));
  return s;
}
