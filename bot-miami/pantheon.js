// The royal finale stays separate from the fifteen mission regions.
export const PANTHEON = Object.freeze({r:15,name:'South Pointe Royal Court',subtitle:'Four sentinels. One royal showdown.',x:514,y:178,width:36,height:44,ground:'#91a9a6',dark:'#526d76',viewpoint:{x:532.5,y:213.5},stairTop:{x:532.5,y:205.5},entry:{x:519.5,y:178.5}});
export const TERRACE=Object.freeze({left:522,right:543,top:183,bottom:205});
export const STAIRWAY=Object.freeze({left:530,right:535,top:205,bottom:212.5});
export const inRoyalChamber=(x,y)=>x>=TERRACE.left&&x<TERRACE.right&&y>=TERRACE.top&&y<TERRACE.bottom;
export const inPantheon=(x,y)=>x>=514&&x<550&&y>=178&&y<222;
export const COURT=Object.freeze([
  {id:'crown-king',role:'king',x:529.2,y:195,size:4.2},
  {id:'crown-queen',role:'queen',x:535.8,y:195,size:3.8},
  {id:'crown-guard-nw',role:'guard',x:526.5,y:190.5,size:1.7},
  {id:'crown-guard-ne',role:'guard',x:538.5,y:190.5,size:1.7},
  {id:'crown-guard-sw',role:'guard',x:526.5,y:199,size:1.7},
  {id:'crown-guard-se',role:'guard',x:538.5,y:199,size:1.7}
].map(Object.freeze));
export const COLUMNS=[523.9,541.1].flatMap(x=>[188.5,194.5,200.5].map(y=>({x,y})));
export function buildPantheon(world){
  const courtWalls=new Set(),courtSeal=new Set(),courtPlinths=new Map();
  for(let y=178;y<222;y++)for(let x=514;x<550;x++){
    const key=`${x},${y}`;world.water.delete(key);world.blocks.delete(key);
    // The northern processional walk is the only entrance; other sides are cliffs.
    const structural=x<517||x>546||y>216||y<183&&(x<518||x>521)||y<187&&x>=523&&x<=542;
    if(structural)world.blocks.add(key);
    // No side or rear entry. Future missions may open only the central stair seal.
    if(inRoyalChamber(x,y)){
      const wall=x===TERRACE.left||x===TERRACE.right-1||y===TERRACE.top||y===TERRACE.bottom-1&&(x<STAIRWAY.left||x>=STAIRWAY.right);
      if(wall)courtWalls.add(key);else if(!structural)courtSeal.add(key);
      world.blocks.add(key);
    }
    if(y>=STAIRWAY.top&&y<Math.ceil(STAIRWAY.bottom)&&(x===STAIRWAY.left-1||x===STAIRWAY.right)){world.blocks.add(key);courtWalls.add(key);}
  }
  for(const p of [...COLUMNS,...COURT]){
    const radius=p.role?(p.role==='guard'?.55:1.05):.55;
    const cells=[];
    for(let y=Math.floor(p.y-radius);y<=Math.floor(p.y+radius);y++)for(let x=Math.floor(p.x-radius);x<=Math.floor(p.x+radius);x++){const key=`${x},${y}`;world.blocks.add(key);courtSeal.delete(key);cells.push(key);}
    if(p.role)courtPlinths.set(p.id,cells);
  }
  return {...world,court:COURT,courtWalls,courtSeal,courtPlinths};
}
export const ROYAL_SPECS=Object.freeze({
  king:{name:'The Robot King',weapon:'rocket',pattern:'salvo',hp:24000,damage:64,range:10,speed:1.05,interval:4.5,heal:18},
  queen:{name:'The Crystal Queen',weapon:'rail',pattern:'beam',hp:20000,damage:58,range:11,speed:1.15,interval:4.8,heal:15},
  guard:{name:'Royal Sentinel',weapon:'hammer',pattern:'slam',hp:5200,damage:30,range:1.5,speed:1.45,interval:3.7,heal:0}
});
