import { CounterService } from '@demo/shared-counter';

describe('Shared counter service', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('receives live data, reconnects, and closes its connection', () => {
    let stream: { onmessage: (event: { data: string }) => void; onerror: () => void; close: () => void };
    const close = vi.fn();
    vi.stubGlobal('EventSource', class {
      onmessage = () => {};
      onerror = () => {};
      close = close;
      constructor() { stream = this; }
    });
    const service = new CounterService();
    service.connect();
    stream!.onmessage({ data: JSON.stringify({ b: 8, c: -3 }) });
    expect(service.countB()).toBe(8);
    expect(service.countC()).toBe(-3);
    expect(service.connected()).toBe(true);

    stream!.onerror();
    expect(service.connected()).toBe(false);
    expect(service.error()).toContain('offline');
    stream!.onmessage({ data: JSON.stringify({ b: 9, c: -3 }) });
    expect(service.connected()).toBe(true);
    expect(service.error()).toBe('');
    service.close();
    expect(close).toHaveBeenCalledOnce();
  });

  it('sends an action to the server and does not invent a local count', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetch);
    const service = new CounterService();
    service.connected.set(true);
    await service.update('b', 'increment');
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:4300/counters/b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"action":"increment"}',
    });
    expect(service.countB()).toBe(0);
    expect(service.pending()).toBe(false);

    fetch.mockRejectedValueOnce(new Error('offline'));
    await service.update('c', 'reset');
    expect(service.error()).toContain('Could not update');
    expect(service.pending()).toBe(false);
  });
});
