import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCounterServer } from './server.js';

test('publishes real counter changes to multiple subscribers and keeps B and C independent', async t => {
  const server = createCounterServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  const abort = new AbortController();
  t.after(async () => {
    abort.abort();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  });

  const streams = await Promise.all([1, 2].map(() =>
    fetch(url + '/events', { signal: abort.signal }),
  ));
  const readers = streams.map(stream => stream.body.getReader());
  const nextCounts = async reader => {
    const { value } = await reader.read();
    const event = new TextDecoder().decode(value);
    return JSON.parse(event.split('data: ')[1].split('\n')[0]);
  };
  for (const reader of readers) assert.deepEqual(await nextCounts(reader), { b: 0, c: 0 });

  const update = (project, action) => fetch(url + '/counters/' + project, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:4201' },
    body: JSON.stringify({ action }),
  });
  assert.equal((await update('b', 'increment')).status, 200);
  for (const reader of readers) assert.deepEqual(await nextCounts(reader), { b: 1, c: 0 });
  await update('c', 'decrement');
  for (const reader of readers) assert.deepEqual(await nextCounts(reader), { b: 1, c: -1 });

  await Promise.all(Array.from({ length: 10 }, () => update('b', 'increment')));
  assert.deepEqual(await (await fetch(url + '/counters')).json(), { b: 11, c: -1 });
  await update('b', 'reset');
  assert.deepEqual(await (await fetch(url + '/counters')).json(), { b: 0, c: -1 });

  assert.equal((await update('b', 'invalid')).status, 400);
  assert.equal((await fetch(url + '/counters', {
    headers: { Origin: 'http://unrelated.example' },
  })).status, 403);
  assert.deepEqual(await (await fetch(url + '/counters')).json(), { b: 0, c: -1 });
});
