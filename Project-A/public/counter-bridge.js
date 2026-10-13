// This hidden Project A page lets all three frontend origins use A's browser storage.
const storageKey = 'project-a-counters';
const channel = 'project-a-counters';
const allowedOrigins = new Set([
  'http://localhost:4200', 'http://localhost:4201', 'http://localhost:4202',
  'http://127.0.0.1:4200', 'http://127.0.0.1:4201', 'http://127.0.0.1:4202',
]);
let parentOrigin;

function readCounts() {
  const value = JSON.parse(localStorage.getItem(storageKey) || '{"b":0,"c":0}');
  if (!Number.isSafeInteger(value.b) || !Number.isSafeInteger(value.c)) {
    return { b: 0, c: 0 };
  }
  return { b: value.b, c: value.c };
}

function sendCounts() {
  if (!parentOrigin) return;
  try {
    window.parent.postMessage({ channel, type: 'state', ...readCounts() }, parentOrigin);
  } catch {
    sendError();
  }
}

function sendError() {
  window.parent.postMessage({ channel, type: 'error' }, parentOrigin);
}

window.addEventListener('message', async event => {
  if (event.source !== window.parent || !allowedOrigins.has(event.origin)) return;
  const message = event.data;
  if (message?.channel !== channel) return;
  parentOrigin = event.origin;

  if (!navigator.locks) {
    sendError();
    return;
  }

  if (message.type === 'read') {
    sendCounts();
    return;
  }
  if (message.type !== 'update' ||
      !['b', 'c'].includes(message.project) ||
      !['increment', 'decrement', 'reset'].includes(message.action)) return;

  try {
    // All bridges run on A's origin. This browser lock serializes simultaneous tab updates.
    await navigator.locks.request(storageKey, () => {
      const counts = readCounts();
      const project = message.project;
      if (message.action === 'increment') counts[project]++;
      if (message.action === 'decrement') counts[project]--;
      if (message.action === 'reset') counts[project] = 0;
      if (!Number.isSafeInteger(counts[project])) throw new Error('Invalid count');
      localStorage.setItem(storageKey, JSON.stringify(counts));
      sendCounts();
    });
  } catch {
    sendError();
  }
});

// The browser notifies the other Project A frames when storage changes.
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) sendCounts();
});
