import {freshSave,readSave} from './levels.js?v=world96';
export function loadProgress(getStorage,key){
  let raw,storage;
  try{storage=getStorage();raw=JSON.parse(storage.getItem(key));}catch{return freshSave();}
  // A full disk must not turn a readable adventure into a new one.
  if(raw?.schema===1)try{if(!storage.getItem('skyspark-legacy-demo-v1'))storage.setItem('skyspark-legacy-demo-v1',JSON.stringify(raw));}catch{}
  return readSave(raw);
}
