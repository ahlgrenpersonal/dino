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
