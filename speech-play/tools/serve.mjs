import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp4': 'video/mp4', '.wav': 'audio/wav' };
const PUBLIC = new Set(['index.html', 'app.js', 'core.js', 'art.js', 'audio.js', 'updates.js', 'styles.css', 'sw.js', 'version.json', 'manifest.webmanifest', 'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png']);
export function byteRange(header, length) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || !length) return false;
  const start = match[1] ? Number(match[1]) : Math.max(0, length - Number(match[2]));
  const end = match[1] ? (match[2] ? Math.min(Number(match[2]), length - 1) : length - 1) : length - 1;
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start >= 0 && start <= end && start < length ? { start, end } : false;
}
export function createPreviewServer({ root = ROOT } = {}) {
  return http.createServer(async (req, res) => {
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); res.end(); return; }
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/') { res.writeHead(302, { ...headers, Location: '/speech-play/' }); res.end(); return; }
      const pathname = decodeURIComponent(url.pathname);
      const prefix = ['/speech-play/', '/dino/speech-play/'].find(value => pathname.startsWith(value));
      if (!prefix) { res.writeHead(404, headers); res.end('Not found'); return; }
      const relative = pathname.slice(prefix.length) || 'index.html';
      // This preview serves this app only, never repository files or generation receipts.
      if (!PUBLIC.has(relative) && !/^local-media\/(catalog\.json|[a-z0-9-]+\.mp4)$/.test(relative) && !/^assets\/audio\/[a-z0-9-]+\.wav$/.test(relative)) { res.writeHead(404, headers); res.end('Not found'); return; }
      const target = path.resolve(root, relative);
      if (!target.startsWith(path.resolve(root) + path.sep)) { res.writeHead(403, headers); res.end('Forbidden'); return; }
      const data = await readFile(target);
      const range = byteRange(req.headers.range, data.length);
      if (range === false) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${data.length}` }); res.end(); return; }
      const start = range ? range.start : 0, end = range ? range.end : data.length - 1;
      res.writeHead(range ? 206 : 200, { ...headers, 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream', 'Content-Length': data.length ? end - start + 1 : 0, 'Accept-Ranges': 'bytes', ...(range ? { 'Content-Range': `bytes ${start}-${end}/${data.length}` } : {}) });
      res.end(req.method === 'HEAD' ? undefined : data.subarray(start, end + 1));
    } catch { res.writeHead(404, headers); res.end('Not found'); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.SPEECH_PLAY_PORT || 4223);
  const server = createPreviewServer();
  server.listen(port, '127.0.0.1', () => process.stdout.write(`Little Echo: http://127.0.0.1:${port}/speech-play/\n`));
}
