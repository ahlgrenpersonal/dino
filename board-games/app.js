import { result, winningMoves, chooseMove } from './engine.js?v=world3';
import { avatarSVG, pieceSVG } from './art.js?v=world3';
const buildVersion = 'world3';
const $ = id => document.getElementById(id);
const SAVE_KEY = 'board-games-save-v1';
const defaults = { hintChance:100, gentle:false, avoidChance:50, sound:false, calm:false };
let settings = {...defaults}, board = Array(9).fill(null), mode = 'buddy', turn = 'X', timer, hint = null, lastPlaced = -1;
let finishFace = null, face = 'hello', audio;
const lines = {
  hello:["Hi! I’m Noodle. Let’s noodle!", "My superpower? Wobbly guesses."],
  curious:["Ooh, a very interesting square!", "My turn? Where are my thinking socks?"],
  think:["Hmm… consulting my imaginary hat.", "I’m thinking. Mostly about toast."],
  squint:["Putting on my serious eyebrows!", "Three in a row… or three snacks?"],
  wobble:["My brain is doing a little wiggle.", "More pieces! More noodle thoughts!"],
  gasp:["Oh my noodles! Look at this board!", "It’s getting wonderfully wobbly!"],
  focus:["Maximum noodle concentration!", "My thinking hat just fell off."],
  'silly-tongue':["You won! My tongue turned to jelly!", "Three cheers! And one silly blep."],
  'silly-squish':["You won! I’ve gone all squooshy!", "Amazing! Initiating noodle wobble."],
  'silly-cross':["You won! My eyes did a somersault!", "You found three! I found my nose."],
  support:["Thanks for playing with me. Your turn to start!", "That was lovely. Shall we play again?"],
  draw:["A tie! We filled the whole board!", "A full board of wonderful noodles."]
};
const randomItem = items => items[Math.floor(Math.random()*items.length)];
function readSave() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return;
    for (const key of ['gentle','sound','calm']) if (typeof saved.settings?.[key] === 'boolean') settings[key] = saved.settings[key];
    for (const key of ['hintChance','avoidChance']) if (Number.isFinite(saved.settings?.[key])) settings[key] = Math.max(0,Math.min(100,saved.settings[key]));
    if (['buddy','friend'].includes(saved.mode) && validBoard(saved.board)) {
      mode = saved.mode; board = saved.board;
      turn = board.filter(x=>x==='X').length === board.filter(x=>x==='O').length ? 'X' : 'O';
      if (['silly-tongue','silly-squish','silly-cross'].includes(saved.finishFace)) finishFace = saved.finishFace;
    }
  } catch { /* Private browsing and unavailable storage still allow play. */ }
}
function validBoard(value) {
  if (!Array.isArray(value) || value.length!==9 || !value.every(x=>x===null || x==='X' || x==='O')) return false;
  // Only accept positions reachable by legal play, stopping at the first win.
  function reachable(state, piece) {
    if (state.every((x,i)=>x===value[i])) return true;
    if (result(state)) return false;
    return state.some((x,i)=>{if(x || value[i]!==piece) return false; const next=[...state];next[i]=piece;return reachable(next,piece==='X'?'O':'X');});
  }
  return reachable(Array(9).fill(null),'X');
}
function save() { try {localStorage.setItem(SAVE_KEY,JSON.stringify({board,mode,settings,finishFace}));}catch {} }
function showFace(next, message) {
  if(face!==next || !$('avatar').firstChild){$('avatar').innerHTML=avatarSVG(next);face=next;}
  $('speech').textContent=message || randomItem(lines[next]);
}
function decideHint() {
  const wins=winningMoves(board,turn);
  hint = !result(board) && (mode==='friend' || turn==='X') && wins.length && Math.random()*100<settings.hintChance ? wins[0] : null;
}
function render() {
  const restoreBoardFocus=$('board').contains(document.activeElement)||document.activeElement===$('turnText');
  const end=result(board), thinking=mode==='buddy' && turn==='O' && !end;
  document.body.classList.toggle('calm',settings.calm);
  $('buddyMode').setAttribute('aria-pressed',mode==='buddy');$('friendMode').setAttribute('aria-pressed',mode==='friend');
  $('xName').textContent=mode==='buddy'?'You':'Player X';$('oName').textContent=mode==='buddy'?'Noodle':'Player O';
  $('xChip').classList.toggle('active',!end&&turn==='X');$('oChip').classList.toggle('active',!end&&turn==='O');
  $('turnText').textContent=end ? end.winner==='draw'?"It’s a tie!":mode==='buddy'?(end.winner==='X'?'You found three!':'A round for Noodle'):`${end.winner} found three!` : thinking?'Noodle is thinking…':mode==='buddy'?'Your turn!':`${turn}’s turn!`;
  $('board').replaceChildren(...board.map((piece,i)=>{
    const cell=document.createElement('button');cell.className='cell';cell.dataset.cell=i;
    cell.setAttribute('aria-label',`Row ${Math.floor(i/3)+1}, column ${i%3+1}: ${piece || 'empty'}${hint===i?', winning move hint':''}`);
    cell.disabled=!!piece || !!end || thinking;
    if(piece)cell.innerHTML=pieceSVG(piece);
    if(i===lastPlaced)cell.classList.add('placed');
    if(end?.line.includes(i))cell.classList.add('winner');
    if(hint===i)cell.classList.add('hint');
    if(hint!==null && piece===turn && winningMoves(board,turn).includes(hint)){
      const next=[...board];next[hint]=turn;if(result(next)?.line.includes(i))cell.classList.add('related');
    }
    cell.addEventListener('click',()=>move(i));return cell;
  }));
  $('winLine').innerHTML=end?.line.length ? (()=>{const a=end.line[0],b=end.line[2];return `<line x1="${a%3*100+50}" y1="${Math.floor(a/3)*100+50}" x2="${b%3*100+50}" y2="${Math.floor(b/3)*100+50}"/>`;})() : '';
  $('newGame').innerHTML=`<span aria-hidden="true">↻</span> ${end?'Play again':'Start again'}`;
  $('gameNote').textContent=mode==='buddy'?'You’re X. Noodle is O. Tap an empty tile!':'One phone, two friends. Take turns tapping a tile!';
  $('hintCaption').textContent=end?'Another little adventure is one tap away.':hint!==null?'✦ See the sparkle? You can make three in a row!':settings.hintChance?'✧ A little sparkle can help you spot a win.':'No rush. Find your favorite empty tile.';
  $('buddyLabel').textContent=mode==='buddy'?(settings.gentle?'YOUR EXTRA GENTLE BUDDY':'YOUR EASYGOING BUDDY'):'YOUR CHEER SQUAD';
  $('buddyFootnote').textContent=mode==='buddy'?'A little wobbly. A lot of fun.':'Two friends. Twice the fun.';
  if(end){
    if(end.winner==='draw')showFace('draw');
    else if(mode==='friend')showFace('draw',`${end.winner} found three! A high-five for both of you!`);
    else if(end.winner==='X'){finishFace ||= randomItem(['silly-tongue','silly-squish','silly-cross']);showFace(finishFace);}
    else showFace('support');
  } else {
    const count=board.filter(Boolean).length;
    showFace(thinking?'think':count===0?'hello':count<3?'curious':count<5?'squint':count<7?'wobble':count<8?'gasp':'focus');
  }
  if(restoreBoardFocus){
    if(end)$('newGame').focus({preventScroll:true});
    else if(thinking){$('turnText').tabIndex=-1;$('turnText').focus({preventScroll:true});}
    else $('board').querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  }
  save();
}
function plop() {
  if(!settings.sound)return;
  try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(turn==='X'?480:350,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(180,audio.currentTime+.12);gain.gain.setValueAtTime(.055,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.16);}catch{}
}
function celebrate() {
  if(settings.calm || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  $('confetti').innerHTML=Array.from({length:24},(_,i)=>`<i style="--left:${Math.random()*100}%;--delay:${Math.random()*.3}s;--color:${['#ef9477','#85c7aa','#f0c35b','#aaa0cc'][i%4]}"></i>`).join('');
}
function move(i, computer=false) {
  if(board[i] || result(board) || (mode==='buddy' && turn==='O' && !computer) || $('settings').open)return;
  plop();board[i]=turn;lastPlaced=i;turn=turn==='X'?'O':'X';decideHint();render();
  const end=result(board);
  if(end && (end.winner==='X' || (mode==='friend' && end.winner!=='draw')))celebrate();
  scheduleBuddy();
}
function scheduleBuddy() {
  clearTimeout(timer);
  if(mode!=='buddy'||turn!=='O'||result(board)||$('settings').open)return;
  timer=setTimeout(()=>{const i=chooseMove(board,settings.gentle?settings.avoidChance:0);if(i!==null)move(i,true);},850);
}
function newGame(nextMode=mode) {
  clearTimeout(timer);mode=nextMode;board=Array(9).fill(null);turn='X';lastPlaced=-1;finishFace=null;hint=null;$('confetti').replaceChildren();render();
}
function syncSettings() {
  for(const key of ['gentle','sound','calm'])$(key).checked=settings[key];
  $('hintChance').value=settings.hintChance;$('hintValue').value=`${settings.hintChance}%`;
  $('avoidChance').value=settings.avoidChance;$('avoidValue').value=`${settings.avoidChance}%`;
  $('hints').value=settings.hintChance===0?'0':settings.hintChance===100?'100':'50';
  $('avoidChance').disabled=!settings.gentle;
}
$('newGame').addEventListener('click',()=>newGame());
$('buddyMode').addEventListener('click',()=>{if(mode!=='buddy')newGame('buddy');});
$('friendMode').addEventListener('click',()=>{if(mode!=='friend')newGame('friend');});
$('settingsButton').addEventListener('click',()=>{clearTimeout(timer);syncSettings();$('settings').showModal();});
$('settings').addEventListener('close',()=>{lastPlaced=-1;decideHint();render();scheduleBuddy();});
for(const key of ['gentle','sound','calm'])$(key).addEventListener('change',()=>{settings[key]=$(key).checked;syncSettings();document.body.classList.toggle('calm',settings.calm);save();});
for(const key of ['hintChance','avoidChance'])$(key).addEventListener('input',()=>{settings[key]=Number($(key).value);syncSettings();save();});
$('hints').addEventListener('change',()=>{settings.hintChance=Number($('hints').value);syncSettings();save();});
readSave();syncSettings();decideHint();render();scheduleBuddy();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});}
async function checkVersion(){
  try{const response=await fetch(`./version.json?check=${Date.now()}`,{cache:'no-store'});if(!response.ok)return;const live=await response.json();if(typeof live.build==='string'&&live.build!==buildVersion){
    // Only our registration/caches: neighboring games share this origin.
    const scope=new URL('./',location.href).href;
    const regs=await navigator.serviceWorker?.getRegistrations()||[];
    await Promise.all(regs.filter(r=>r.scope===scope).map(r=>r.unregister()));
    if('caches' in window)await Promise.all((await caches.keys()).filter(k=>k.startsWith('board-games-')).map(k=>caches.delete(k)));
    location.replace(`./index.html?fresh=${Date.now()}`);
  }}catch{}
}
checkVersion();document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkVersion();});
