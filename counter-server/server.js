import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

// One source of truth for all browsers and all three Angular applications.
export function createCounterServer() {
  const counts = { b: 0, c: 0 };
  const subscribers = new Set();
  const allowedOrigins = new Set(
    [4200, 4201, 4202].flatMap(port => [
      'http://localhost:' + port,
      'http://127.0.0.1:' + port,
    ]),
  );
  const snapshot = () => 'data: ' + JSON.stringify(counts) + '\n\n';
  const reply = (response, status, data) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
  };

  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      reply(response, 403, { error: 'Origin not allowed' });
      return;
    }
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
    }
    response.setHeader('Cache-Control', 'no-store');

    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === 'GET' && request.url === '/counters') {
      reply(response, 200, counts);
      return;
    }

    if (request.method === 'GET' && request.url === '/events') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
      });
      response.write(snapshot());
      subscribers.add(response);
      const heartbeat = setInterval(() => response.write(': keep-alive\n\n'), 15000);
      heartbeat.unref();
      response.on('close', () => {
        clearInterval(heartbeat);
        subscribers.delete(response);
      });
      return;
    }

    const match = request.url?.match(/^\/counters\/(b|c)$/);
    if (request.method === 'POST' && match) {
      try {
        let body = '';
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 1024) {
            reply(response, 413, { error: 'Request is too large' });
            return;
          }
        }
        const { action } = JSON.parse(body);
        if (!['increment', 'decrement', 'reset'].includes(action)) {
          reply(response, 400, { error: 'Unknown counter action' });
          return;
        }
        const project = match[1];
        if (action === 'increment') counts[project]++;
        if (action === 'decrement') counts[project]--;
        if (action === 'reset') counts[project] = 0;

        for (const subscriber of subscribers) subscriber.write(snapshot());
        reply(response, 200, counts);
      } catch {
        reply(response, 400, { error: 'Invalid request' });
      }
      return;
    }

    reply(response, 404, { error: 'Not found' });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createCounterServer().listen(4300, '127.0.0.1', () => {
    console.log('Counter server is running at http://127.0.0.1:4300');
  });
}
