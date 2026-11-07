import test from 'node:test';
import assert from 'node:assert/strict';
import { observeUpdates } from '../updates.js';

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
