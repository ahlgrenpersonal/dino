import { test } from 'node:test';
import assert from 'node:assert/strict';
import { result, chooseMove, winningMoves, LINES } from '../engine.js';
test('all eight winning directions, including diagonals',()=>{
  for(const line of LINES){const b=Array(9).fill(null);line.forEach(i=>b[i]='X');assert.deepEqual(result(b),{winner:'X',line});}
  assert.equal(result(Array(9).fill(null)),null);
  assert.equal(result(['X','O','X','X','O','O','O','X','X']).winner,'draw');
});
test('easy samples every empty square, including an immediate win',()=>{
  const b=['O','O',null,'X','X',null,null,null,null];
  const empty=[2,5,6,7,8];
  empty.forEach((i,n)=>assert.equal(chooseMove(b,0,()=> (n+.5)/empty.length),i));
  assert.deepEqual(winningMoves(b,'O'),[2]);
});
test('extra gentle excludes wins only when the probability check passes',()=>{
  const b=['O','O',null,'X','X',null,null,null,null];
  let draws=[.49,0];assert.equal(chooseMove(b,50,()=>draws.shift()),5);
  draws=[.5,0];assert.equal(chooseMove(b,50,()=>draws.shift()),2);
  for(let i=0;i<100;i++)assert.notEqual(chooseMove(b,100,()=>i/100),2);
});
test('extra gentle can move when every available move wins',()=>{
  const b=['O','X','O','X','O','X','X','O',null];
  assert.equal(chooseMove(b,100,()=>0),8);
});
test('no moves after a win or draw; forced final empty square remains legal',()=>{
  assert.equal(chooseMove(['X','X','X',null,null,null,null,null,null]),null);
  assert.equal(chooseMove(['X','O','X','X','O','O','O','X','X']),null);
  assert.equal(chooseMove(['X','O','X','X','O','O','O','X',null]),8);
});
test('exhaustive reachable games always select an empty square and stop at terminal positions',()=>{
  const seen=new Set();
  function visit(b,piece){const key=b.map(x=>x||'-').join('');if(seen.has(key))return;seen.add(key);
    if(result(b)){assert.equal(chooseMove(b),null);return;}
    for(const gentle of [0,50,100]){const move=chooseMove(b,gentle,()=>.4);assert.equal(b[move],null);}
    b.forEach((value,i)=>{if(!value){const next=[...b];next[i]=piece;visit(next,piece==='X'?'O':'X');}});
  }
  visit(Array(9).fill(null),'X');assert.equal(seen.size,5478);
});
