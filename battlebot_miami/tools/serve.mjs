import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg'};
export function createPreviewServer(){return http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Method not allowed');return;}
 const url=new URL(req.url,'http://127.0.0.1'),rel=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),file=path.resolve(root,'.'+rel),relative=path.relative(root,file);
 if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);res.end('Forbidden');return;}
 const bytes=await readFile(file),headers={'Content-Type':mime[path.extname(file)]||'text/plain; charset=utf-8','Cache-Control':relative==='local-landmarks.json'?'private, no-store':'no-store'};
 if(file.endsWith('.mp3')&&req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(!match[1]&&!match[2])){res.writeHead(416);res.end();return;}const start=match[1]?Number(match[1]):Math.max(0,bytes.length-Number(match[2])),end=match[1]&&match[2]?Math.min(bytes.length-1,Number(match[2])):bytes.length-1;if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=bytes.length){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});res.end();return;}res.writeHead(206,{...headers,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':String(end-start+1)});res.end(req.method==='HEAD'?undefined:bytes.subarray(start,end+1));return;}
 res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404);res.end('Not found');}});}
if(typeof process!=='undefined'&&process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createPreviewServer();server.listen(Number(process.env.MIAMI_PORT||4217),'127.0.0.1',()=>console.log(`Battle Bot Miami: http://127.0.0.1:${server.address().port}/`));
}
