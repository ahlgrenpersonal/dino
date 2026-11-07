// Registration can resolve before or after updatefound. Observe both paths.
export function observeUpdates(registration, { hasController, onWaiting }) {
  const watched = new WeakSet();
  function watch(worker) {
    if (!worker || watched.has(worker)) return;
    watched.add(worker);
    const check = () => { if (worker.state === 'installed' && hasController()) onWaiting(); };
    worker.addEventListener('statechange', check);
    check();
  }
  if (registration.waiting) onWaiting();
  registration.addEventListener('updatefound', () => watch(registration.installing));
  watch(registration.installing);
}

// Focus and visibility can fire together. Share one request and limit routine polls.
export function createUpdateCheck(check, { now = Date.now, intervalMs = 60000 } = {}) {
  let lastStarted = -Infinity, pending = null;
  return function ({ force = false } = {}) {
    if (pending) return pending;
    const started = now(), elapsed = started - lastStarted;
    if (!force && elapsed >= 0 && elapsed < intervalMs) return Promise.resolve(false);
    lastStarted = started;
    pending = Promise.resolve().then(check).then(() => true).finally(() => { pending = null; });
    return pending;
  };
}

// Bound both response headers and body reads so a stalled poll cannot block later checks.
export async function readBuild(url, { fetcher = fetch, Controller = AbortController, set = setTimeout, clear = clearTimeout, timeoutMs = 6000 } = {}) {
  let timeout;
  try {
    const controller = new Controller();
    const expired = new Promise(resolve => {
      timeout = set(() => { controller.abort(); resolve(null); }, timeoutMs);
    });
    const requested = Promise.resolve().then(async () => {
      const response = await fetcher(url, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) return null;
      const data = await response.json();
      return typeof data?.build === 'string' && /^world\d+$/.test(data.build) ? data.build : null;
    });
    return await Promise.race([requested, expired]);
  } catch { return null; }
  finally { if (timeout !== undefined) clear(timeout); }
}

// A worker may finish installing before update() resolves or its listener is attached.
export function activateUpdate(registration, { timeoutMs = 10000, set = setTimeout, clear = clearTimeout } = {}) {
  if (!registration) return Promise.resolve(false);
  return new Promise(resolve => {
    let done = false;
    const watched = new Map();
    const finish = activated => {
      if (done) return;
      done = true;
      clear(timeout);
      registration.removeEventListener('updatefound', onUpdate);
      for (const [worker, handler] of watched) worker.removeEventListener('statechange', handler);
      resolve(activated);
    };
    const inspect = fallback => {
      if (done) return true;
      const worker = registration.waiting || registration.installing || fallback;
      if (!worker) return false;
      if (!watched.has(worker)) {
        const handler = () => inspect(worker);
        watched.set(worker, handler);
        worker.addEventListener('statechange', handler);
      }
      if (worker.state === 'installed') {
        try { worker.postMessage({ type: 'ACTIVATE' }); finish(true); }
        catch { finish(false); }
      } else if (worker.state === 'redundant') finish(false);
      return true;
    };
    const onUpdate = () => inspect();
    const timeout = set(() => finish(false), timeoutMs);
    registration.addEventListener('updatefound', onUpdate);
    if (inspect()) return;
    Promise.resolve().then(() => registration.update()).then(() => {
      if (!inspect()) finish(false);
    }, () => finish(false));
  });
}
