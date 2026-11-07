import test from 'node:test';
import assert from 'node:assert/strict';
import { VIDEO_FILES } from '../core.js';
import { createPreviewServer, byteRange } from '../tools/serve.mjs';

test('HTTP byte ranges support full, open, and suffix reads and reject invalid ranges', () => {
  assert.equal(byteRange(undefined, 100), null);
  assert.deepEqual(byteRange('bytes=0-9', 100), { start: 0, end: 9 });
  assert.deepEqual(byteRange('bytes=90-', 100), { start: 90, end: 99 });
  assert.deepEqual(byteRange('bytes=-10', 100), { start: 90, end: 99 });
  assert.deepEqual(byteRange('bytes=0-999', 100), { start: 0, end: 99 });
  for (const range of ['bytes=100-', 'bytes=3-2', 'bytes=-0', 'bytes=-', 'bytes=0-1,4-5', 'other=0-1']) assert.equal(byteRange(range, 100), false);
  assert.equal(byteRange('bytes=0-', 0), false);
});

test('preview serves only this PWA, nested paths, and whitelisted media', async t => {
  const server = createPreviewServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const prefix of ['/speech-play/', '/dino/speech-play/']) {
    const response = await fetch(base + prefix);
    assert.equal(response.status, 200); assert.ok((await response.text()).includes('Little Echo'));
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  for (const path of ['/AGENTS.md', '/speech-play/AGENTS.md', '/speech-play/.git/config', '/speech-play/local-media/cow-moo.receipt.json', '/speech-play/tools/generate-samples.py', '/speech-play/artifacts/screenshot.png', '/bot-adventure/', '/speech-play/%2e%2e%2fAGENTS.md']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal((await fetch(base + '/speech-play/', { method: 'POST' })).status, 405);
  const head = await fetch(base + '/speech-play/app.js?v=world1', { method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
  assert.ok(head.headers.get('content-type').startsWith('text/javascript'));
  const slice = await fetch(base + '/speech-play/assets/icon.svg', { headers: { Range: 'bytes=0-3' } });
  assert.equal(slice.status, 206); assert.equal(await slice.text(), '<svg');
  const bad = await fetch(base + '/speech-play/assets/icon.svg', { headers: { Range: 'bytes=999999-' } });
  assert.equal(bad.status, 416);
  for (const name of Object.keys(VIDEO_FILES)) {
    const video = await fetch(base + `/speech-play/assets/video/${name}.mp4`, {headers:{Range:'bytes=0-31'}});
    assert.equal(video.status,206); assert.equal(video.headers.get('content-type'),'video/mp4');
    assert.equal(Buffer.from(await video.arrayBuffer()).toString('ascii',4,8),'ftyp');
  }
  assert.equal((await fetch(base + '/speech-play/assets/video/other.mp4')).status,404);
});
