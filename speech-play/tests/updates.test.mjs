import test from 'node:test';
import assert from 'node:assert/strict';
import { observeUpdates, createUpdateCheck, activateUpdate } from '../updates.js';

function fixture() {
  const registration = new EventTarget();
  let notified = 0, controlling = true;
  const install = state => {
    const worker = new EventTarget(); worker.state = state;
    worker.move = next => { worker.state = next; worker.dispatchEvent(new Event('statechange')); };
    return worker;
  };
  return { registration, install, get notified() { return notified; },
    control(value) { controlling = value; },
    observe() { observeUpdates(registration, { hasController: () => controlling, onWaiting: () => { notified++; } }); } };
}

test('an already-waiting update is offered immediately', () => {
  const f = fixture(); f.registration.waiting = f.install('installed'); f.observe();
  assert.equal(f.notified, 1);
});
test('an update already installing when registration resolves is not missed', () => {
  const f = fixture(); f.registration.installing = f.install('installing'); f.observe();
  assert.equal(f.notified, 0); f.registration.installing.move('installed'); assert.equal(f.notified, 1);
});
test('an installed worker that races registration resolution is also detected', () => {
  const f = fixture(); f.registration.installing = f.install('installed'); f.observe();
  assert.equal(f.notified, 1);
});
test('future updatefound observes the new worker only once', () => {
  const f = fixture(); f.observe(); f.registration.installing = f.install('installing');
  f.registration.dispatchEvent(new Event('updatefound')); f.registration.dispatchEvent(new Event('updatefound'));
  f.registration.installing.move('installed'); assert.equal(f.notified, 1);
});
test('the first installation and failed installs do not prompt for an update', () => {
  const f = fixture(); f.control(false); f.registration.installing = f.install('installing'); f.observe();
  f.registration.installing.move('installed'); assert.equal(f.notified, 0);
  f.control(true); f.registration.installing.move('redundant'); assert.equal(f.notified, 0);
});

test('simultaneous foreground checks share one pending request, including forced checks', async () => {
  let calls = 0, release;
  const check = createUpdateCheck(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  const first = check();
  assert.strictEqual(check(), first);
  assert.strictEqual(check({ force: true }), first);
  await Promise.resolve();
  assert.equal(calls, 1);
  release();
  assert.equal(await first, true);
});

test('routine resume checks are throttled while an online check can bypass the interval', async () => {
  let now = 1000, calls = 0;
  const check = createUpdateCheck(() => { calls++; }, { now: () => now, intervalMs: 60000 });
  assert.equal(await check(), true);
  now = 2000;
  assert.equal(await check(), false);
  assert.equal(await check({ force: true }), true);
  now = 61999;
  assert.equal(await check(), false);
  now = 62000;
  assert.equal(await check(), true);
  assert.equal(calls, 3);
});

test('a failed poll releases its pending request and a backwards clock cannot suppress updates indefinitely', async () => {
  let now = 1000, calls = 0;
  const check = createUpdateCheck(() => { if (++calls === 1) throw new Error('offline'); }, { now: () => now });
  await assert.rejects(check(), /offline/);
  assert.equal(await check({ force: true }), true);
  now = 500;
  assert.equal(await check(), true);
  assert.equal(calls, 3);
});

function activationFixture() {
  const registration = new EventTarget(), timers = new Map();
  let timerId = 0, updateCalls = 0;
  registration.update = async () => { updateCalls++; };
  const worker = state => {
    const result = new EventTarget();
    result.state = state; result.messages = [];
    result.postMessage = message => result.messages.push(message);
    result.move = next => { result.state = next; result.dispatchEvent(new Event('statechange')); };
    return result;
  };
  const options = {
    timeoutMs: 4000,
    set(callback, ms) { const id = ++timerId; timers.set(id, { callback, ms }); return id; },
    clear(id) { timers.delete(id); }
  };
  return { registration, worker, timers, options, get updateCalls() { return updateCalls; },
    expire() { for (const { callback } of [...timers.values()]) callback(); },
    activate() { return activateUpdate(registration, options); }
  };
}

test('a waiting update activates immediately without an unnecessary network request', async () => {
  const f = activationFixture();
  const worker = f.registration.waiting = f.worker('installed');
  assert.equal(await f.activate(), true);
  assert.deepEqual(worker.messages, [{ type: 'ACTIVATE' }]);
  assert.equal(f.updateCalls, 0);
  assert.equal(f.timers.size, 0);
});

test('an already-installed worker and a worker installed while attaching a listener cannot be missed', async () => {
  for (const duringAttach of [false, true]) {
    const f = activationFixture();
    const worker = f.registration.installing = f.worker(duringAttach ? 'installing' : 'installed');
    if (duringAttach) {
      const add = worker.addEventListener.bind(worker);
      worker.addEventListener = (name, handler) => { add(name, handler); worker.state = 'installed'; };
    }
    assert.equal(await f.activate(), true);
    assert.deepEqual(worker.messages, [{ type: 'ACTIVATE' }]);
    assert.equal(f.timers.size, 0);
  }
});

test('an installing update activates even if registration fields change before its installed event', async () => {
  const f = activationFixture();
  const worker = f.registration.installing = f.worker('installing');
  const pending = f.activate();
  assert.deepEqual(worker.messages, []);
  f.registration.installing = null;
  worker.move('installed');
  assert.equal(await pending, true);
  worker.move('installed');
  assert.equal(worker.messages.length, 1, 'Completed activation must detach its worker listener');
});

test('updatefound is observed before update resolves and activation is sent only once', async () => {
  const f = activationFixture();
  let releaseUpdate;
  f.registration.update = () => new Promise(resolve => { releaseUpdate = resolve; });
  const pending = f.activate();
  await Promise.resolve();
  const worker = f.registration.installing = f.worker('installing');
  f.registration.dispatchEvent(new Event('updatefound'));
  worker.move('installed');
  assert.equal(await pending, true);
  releaseUpdate();
  await Promise.resolve();
  assert.equal(worker.messages.length, 1);
});

test('redundant workers, absent updates and failed network checks resolve false', async () => {
  const redundant = activationFixture();
  const worker = redundant.registration.installing = redundant.worker('installing');
  const pending = redundant.activate();
  worker.move('redundant');
  assert.equal(await pending, false);
  worker.move('installed');
  assert.deepEqual(worker.messages, []);
  assert.equal(redundant.timers.size, 0);

  const absent = activationFixture();
  assert.equal(await absent.activate(), false);
  assert.equal(absent.updateCalls, 1);
  assert.equal(absent.timers.size, 0);
  const failed = activationFixture();
  failed.registration.update = async () => { throw new Error('offline'); };
  assert.equal(await failed.activate(), false);
  assert.equal(await activateUpdate(null), false);
});

test('a stalled install or network request times out and cannot activate a late worker', async () => {
  for (const installing of [false, true]) {
    const f = activationFixture();
    const worker = f.worker('installing');
    if (installing) f.registration.installing = worker;
    else f.registration.update = () => new Promise(() => {});
    const pending = f.activate();
    assert.equal([...f.timers.values()][0].ms, 4000);
    f.expire();
    assert.equal(await pending, false);
    f.registration.waiting = worker;
    worker.move('installed');
    f.registration.dispatchEvent(new Event('updatefound'));
    assert.deepEqual(worker.messages, []);
    assert.equal(f.timers.size, 0);
  }
});
