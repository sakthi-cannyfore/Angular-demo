import { signal } from '@angular/core';

export type CounterProject = 'b' | 'c';
export type CounterAction = 'increment' | 'decrement' | 'reset';

const projectAOrigin = 'http://localhost:4200';
const channel = 'project-a-counters';

// Project A owns this frontend state. B and C load it through federation.
export class CounterState {
  countB = signal(0);
  countC = signal(0);
  connected = signal(false);
  pending = signal(false);
  error = signal('');

  private frame: HTMLIFrameElement;
  private timeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.frame = document.createElement('iframe');
    this.frame.hidden = true;
    this.frame.title = 'Project A counter synchronization';
    this.frame.src = projectAOrigin + '/counter-bridge.html';
    this.frame.onload = () => this.send({ type: 'read' });
    window.addEventListener('message', this.receive);
    document.body.appendChild(this.frame);
    this.waitForReply();
  }

  update(project: CounterProject, action: CounterAction) {
    if (!this.connected() || this.pending()) return;
    this.pending.set(true);
    this.waitForReply();
    this.send({ type: 'update', project, action });
  }

  private send(message: object) {
    this.frame.contentWindow?.postMessage({ channel, ...message }, projectAOrigin);
  }

  private receive = (event: MessageEvent) => {
    if (event.origin !== projectAOrigin || event.source !== this.frame.contentWindow) return;
    const message = event.data;
    if (message?.channel !== channel) return;

    if (message.type === 'state' &&
        Number.isSafeInteger(message.b) && Number.isSafeInteger(message.c)) {
      this.countB.set(message.b);
      this.countC.set(message.c);
      this.connected.set(true);
      this.error.set('');
      this.pending.set(false);
      clearTimeout(this.timeout);
    } else if (message.type === 'error') {
      this.connected.set(false);
      this.pending.set(false);
      this.error.set('Browser counter synchronization is unavailable. Allow browser storage and use Chrome or Edge.');
      clearTimeout(this.timeout);
    }
  };

  private waitForReply() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.connected.set(false);
      this.pending.set(false);
      this.error.set('Project A is unavailable. Start it on port 4200 and reload the page.');
    }, 10000);
  }
}

declare global {
  interface Window {
    projectACounterState?: CounterState;
  }
}

// The host and the exposed module reuse one state object in this browser window.
export function getCounterState() {
  return window.projectACounterState ??= new CounterState();
}
