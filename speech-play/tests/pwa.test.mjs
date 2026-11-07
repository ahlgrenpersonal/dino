import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, access, readdir } from 'node:fs/promises';
import { BUILD } from '../core.js';
import { SOUND_FILES } from '../audio.js';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('sw.js', root), 'utf8');
function worker({ scope = '/dino/speech-play/', fetcher = async () => new Response('online'), names = [] } = {}) {
  const handlers = {}, removed = [], cached = [], stores = new Map();
  let claimed = 0, skipped = 0;
  const cache = {
    async addAll(urls) { for (const url of urls) { cached.push(url); stores.set(url, new Response('cached:' + url)); } },
    async match(key) { return stores.get(typeof key === 'string' ? key : key.url)?.clone(); }
  };
  const context = { URL, Response, AbortController, setTimeout, clearTimeout,
    fetch: fetcher,
    caches: { open: async () => cache, keys: async () => names, delete: async name => { removed.push(name); return true; } },
    self: { location: { href: 'https://example.test' + scope + 'sw.js' }, addEventListener: (name, handler) => { handlers[name] = handler; }, clients: { claim: async () => { claimed++; } }, skipWaiting: () => { skipped++; } }
  };
  vm.runInNewContext(source, context);
  return {
    removed, cached, stores, get claimed() { return claimed; }, get skipped() { return skipped; },
    async lifecycle(name) { let pending; handlers[name]({ waitUntil(value) { pending = value; } }); await pending; },
    message(data) { handlers.message({ data }); },
    async request(url, mode = 'cors', method = 'GET', headers = {}) { let response; handlers.fetch({ request: { url, mode, method, headers: new Headers(headers) }, respondWith(value) { response = value; } }); return response === undefined ? null : await response; }
  };
}

test('all PWA entry points agree on the independent build', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  const app = await readFile(new URL('app.js', root), 'utf8');
  const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));
  const version = JSON.parse(await readFile(new URL('version.json', root), 'utf8'));
  assert.equal(version.build, BUILD);
  assert.ok(manifest.start_url.endsWith('?v=' + BUILD));
  assert.equal(manifest.scope, './'); assert.equal(manifest.id, './');
  for (const file of ['styles.css', 'app.js']) assert.ok(html.includes(`${file}?v=${BUILD}`));
  assert.ok(app.includes(`const buildVersion = '${BUILD}'`));
  for (const file of ['core.js', 'audio.js', 'art.js', 'updates.js']) assert.ok(app.includes(`${file}?v=${BUILD}`));
  assert.ok(source.includes(`const BUILD = '${BUILD}'`));
  assert.ok(app.includes("scope: './', updateViaCache: 'none'"));
});

test('offline audio responds to bounded and suffix range requests, including Safari probes', async () => {
  const sw = worker({ fetcher: async () => { throw new Error('offline'); } }); await sw.lifecycle('install');
  const url = 'https://example.test/dino/speech-play/assets/audio/pop.wav';
  sw.stores.set(url, new Response('abcdefghij'));
  const first = await sw.request(url, 'cors', 'GET', { range: 'bytes=0-1' });
  assert.equal(first.status, 206); assert.equal(await first.text(), 'ab');
  assert.equal(first.headers.get('content-range'), 'bytes 0-1/10');
  const suffix = await sw.request(url, 'cors', 'GET', { range: 'bytes=-3' });
  assert.equal(suffix.status, 206); assert.equal(await suffix.text(), 'hij');
  for (const range of ['bytes=99-', 'bytes=0-1,5-6', 'bytes=-0', 'bytes=-', 'bytes=5-3']) {
    assert.equal((await sw.request(url, 'cors', 'GET', { range })).status, 416);
  }
});

test('shell precaches complete files under either a root folder or nested Pages folder', async () => {
  for (const scope of ['/speech-play/', '/dino/speech-play/']) {
    const sw = worker({ scope }); await sw.lifecycle('install');
    assert.equal(sw.cached.length, 29);
    for (const url of sw.cached) {
      assert.ok(url.startsWith('https://example.test' + scope));
      const relative = new URL(url).pathname.slice(scope.length) || 'index.html';
      await access(new URL(relative, root));
    }
  }
});

test('activation deletes only this app and this scope’s obsolete caches', async () => {
  const names = ['fightbots-world60', 'speech-play:/other/:world1', 'speech-play:/dino/speech-play/:world0', `speech-play:/dino/speech-play/:${BUILD}`];
  const sw = worker({ names }); await sw.lifecycle('activate');
  assert.deepEqual(sw.removed, ['speech-play:/dino/speech-play/:world0']);
  assert.equal(sw.claimed, 1); assert.equal(sw.skipped, 0);
  sw.message({ type: 'something-else' }); assert.equal(sw.skipped, 0);
  sw.message({ type: 'ACTIVATE' }); assert.equal(sw.skipped, 1);
});

test('bundled words are finite mono PCM WAV files with audible samples and no embedded metadata', async () => {
  for (const name of Object.values(SOUND_FILES)) {
    const data = await readFile(new URL(`assets/audio/${name}.wav`, root));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF'); assert.equal(data.toString('ascii', 8, 12), 'WAVE');
    let offset = 12, fmt, samples;
    while (offset + 8 <= data.length) {
      const kind = data.toString('ascii', offset, offset + 4), size = data.readUInt32LE(offset + 4);
      assert.ok(['fmt ', 'data'].includes(kind), `${name}: unexpected metadata chunk ${kind}`);
      if (kind === 'fmt ') fmt = data.subarray(offset + 8, offset + 8 + size);
      if (kind === 'data') samples = data.subarray(offset + 8, offset + 8 + size);
      offset += 8 + size + size % 2;
    }
    assert.equal(fmt.readUInt16LE(0), 1); assert.equal(fmt.readUInt16LE(2), 1);
    assert.equal(fmt.readUInt32LE(4), 24000); assert.equal(fmt.readUInt16LE(14), 16);
    assert.ok(samples.length > 7200 && samples.length < 144000, name);
    let peak = 0;
    for (let i = 0; i < samples.length; i += 2) peak = Math.max(peak, Math.abs(samples.readInt16LE(i)));
    assert.ok(peak > 500 && peak < 32768, name);
  }
});

test('offline navigation, including launch queries, falls back to the precached document', async () => {
  const sw = worker({ fetcher: async () => { throw new Error('offline'); } });
  await sw.lifecycle('install');
  for (const route of ['', 'index.html?v=' + BUILD, 'index.html?fresh=123']) {
    const response = await sw.request('https://example.test/dino/speech-play/' + route, 'navigate');
    assert.equal(response.status, 200); assert.ok((await response.text()).endsWith('/index.html'));
  }
  const response = await sw.request(`https://example.test/dino/speech-play/app.js?v=${BUILD}`);
  assert.equal(response.status, 200);
});

test('navigation stays network first without overwriting the installed build snapshot', async () => {
  const sw = worker({ fetcher: async () => new Response('new network document') }); await sw.lifecycle('install');
  const response = await sw.request('https://example.test/dino/speech-play/', 'navigate');
  assert.equal(await response.text(), 'new network document');
  assert.ok((await sw.stores.get('https://example.test/dino/speech-play/index.html').clone().text()).startsWith('cached:'));
});

test('HTTP failures also fall back to the offline document', async () => {
  const sw = worker({ fetcher: async () => new Response('unavailable', { status: 503 }) }); await sw.lifecycle('install');
  assert.equal((await sw.request('https://example.test/dino/speech-play/', 'navigate')).status, 200);
});

test('worker ignores sibling apps, private media/receipts, version polls, and non-GET requests', async () => {
  const sw = worker();
  for (const route of ['/dino/', '/dino/bot-adventure/', '/dino/speech-play/local-media/catalog.json', '/dino/speech-play/local-media/cow-moo.mp4', '/dino/speech-play/local-media/cow-moo.receipt.json', '/dino/speech-play/version.json?check=1', '/dino/speech-play/tests/core.test.mjs']) {
    assert.equal(await sw.request('https://example.test' + route), null);
  }
  assert.equal(await sw.request('https://other.test/dino/speech-play/', 'navigate'), null);
  assert.equal(await sw.request('https://example.test/dino/speech-play/', 'navigate', 'POST'), null);
});

test('runtime files contain no third-party asset loads, telemetry, mic access, or dangerous HTML evaluation', async () => {
  for (const name of ['index.html', 'app.js', 'core.js', 'audio.js', 'art.js', 'updates.js', 'styles.css', 'sw.js']) {
    const data = await readFile(new URL(name, root), 'utf8');
    assert.doesNotMatch(data, /getUserMedia|SpeechRecognition|sendBeacon|eval\(|new Function\(|https?:\/\/(?!www\.asha\.org|www\.w3\.org\/2000\/svg)/);
    assert.doesNotMatch(data, /localStorage\.clear/);
  }
  const gitignore = await readFile(new URL('.gitignore', root), 'utf8');
  assert.ok(gitignore.includes('local-media/')); assert.ok(gitignore.includes('artifacts/'));
  const files = await readdir(root);
  assert.equal(files.includes('.env'), false);
});
