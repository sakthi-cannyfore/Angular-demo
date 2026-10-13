import { DestroyRef, InjectionToken, inject, signal } from '@angular/core';

const apiUrl = 'http://127.0.0.1:4300';

// All three apps use this service through native federation.
export class CounterService {
  countB = signal(0);
  countC = signal(0);
  connected = signal(false);
  error = signal('');
  pending = signal(false);
  stream;

  connect() {
    if (this.stream) return;

    this.stream = new EventSource(apiUrl + '/events');
    this.stream.onmessage = event => {
      this.applyCounts(JSON.parse(event.data));
      this.connected.set(true);
      this.error.set('');
    };
    this.stream.onerror = () => {
      this.connected.set(false);
      this.error.set('Counter service is offline. Start the counter server on port 4300.');
    };
  }

  applyCounts(counts) {
    this.countB.set(counts.b);
    this.countC.set(counts.c);
  }

  async update(project, action) {
    if (!this.connected() || this.pending()) return;

    this.pending.set(true);
    try {
      const response = await fetch(apiUrl + '/counters/' + project, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Counter update failed');
      // Counts arrive in order through the live stream, including our own updates.
      this.error.set('');
    } catch {
      this.error.set('Could not update the counter. Check the counter server and try again.');
    } finally {
      this.pending.set(false);
    }
  }

  close() {
    this.stream?.close();
    this.stream = undefined;
    this.connected.set(false);
  }
}

export const COUNTER_SERVICE = new InjectionToken('Shared counter service', {
  providedIn: 'root',
  factory: () => {
    const service = new CounterService();
    service.connect();
    inject(DestroyRef).onDestroy(() => service.close());
    return service;
  },
});
