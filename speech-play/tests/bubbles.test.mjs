import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBubbles } from '../bubbles.js';
import { initialTurn, transition } from '../core.js';

function stageFixture() {
  let field, buttons, status, writes = 0;
  const makeButton = index => {
    const classes = new Set(['bubble']);
    return { dataset: { pop: String(index) }, textContent: '', disabled: false, classes,
      classList: { toggle(name, on) { on ? classes.add(name) : classes.delete(name); }, add(name) { classes.add(name); }, remove(name) { classes.delete(name); } } };
  };
  return {
    set innerHTML(value) { writes++; field = {}; buttons = [0, 1, 2].map(makeButton); status = { textContent: '' }; },
    querySelector(selector) { return selector === '.bubble-field' ? field : selector === '.bubble-status' ? status : null; },
    querySelectorAll() { return buttons; },
    get buttons() { return buttons; }, get status() { return status; }, get writes() { return writes; }
  };
}

test('popping preserves peer targets and bursts until an explicit refill', () => {
  const stage = stageFixture();
  let state = initialTurn('bubbles');
  renderBubbles(stage, state.popped);
  const targets = [...stage.buttons]; // Other contacts may already hold these targets.
  for (const index of [1, 0, 2]) {
    state = transition(state, { type: 'pop', index });
    renderBubbles(stage, state.popped, index);
    assert.equal(stage.writes, 1);
    targets.forEach((target, i) => assert.strictEqual(stage.buttons[i], target));
    for (const popped of state.popped) assert.ok(targets[popped].classes.has('burst'));
    assert.equal(stage.buttons.filter(button => button.disabled).length, state.popped.length);
  }
  assert.equal(stage.status.textContent, 'All popped! More bubbles?');
  for (let extra = 0; extra < 8; extra++) {
    state = transition(state, { type: 'pop', index: undefined });
    renderBubbles(stage, state.popped);
    assert.equal(stage.buttons.filter(button => !button.disabled).length, 0);
  }
  state = transition(state, { type: 'reset' });
  renderBubbles(stage, state.popped);
  assert.equal(stage.writes, 1);
  assert.equal(stage.status.textContent, '3 bubbles left');
  for (const target of targets) {
    assert.equal(target.disabled, false);
    assert.equal(target.textContent, '');
    assert.equal(target.classes.has('burst'), false);
    assert.equal(target.classes.has('popped'), false);
  }
});

test('duplicate target presses cannot clear another bubble or alter the remaining count', () => {
  const stage = stageFixture();
  let state = initialTurn('bubbles');
  renderBubbles(stage, state.popped);
  for (let press = 0; press < 5; press++) {
    state = transition(state, { type: 'pop', index: 2 });
    renderBubbles(stage, state.popped, 2);
  }
  assert.deepEqual(state.popped, [2]);
  assert.equal(stage.status.textContent, '2 bubbles left');
  assert.equal(stage.buttons.filter(button => !button.disabled).length, 2);
  assert.equal(stage.writes, 1);
});
