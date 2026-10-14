import { signal } from '@angular/core';

export type CounterProject = 'b' | 'c';
export type CounterAction = 'increment' | 'decrement' | 'reset';

const projectAOrigin = 'http://localhost:4200';
const channel = 'project-a-counters';

export class CounterState {
  countB = signal(0);
  countC = signal(0);
  connected = signal(false);
  pending = signal(false);
  error = signal('');

  private storageFrame: HTMLIFrameElement;
  private replyTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.storageFrame = document.createElement('iframe');
    this.storageFrame.hidden = true;
    this.storageFrame.title = 'Project A counter synchronization';
    this.storageFrame.src = `${projectAOrigin}/counter-bridge.html`;
    this.storageFrame.onload = () => this.send({ type: 'read' });

    window.addEventListener('message', this.receive);
    document.body.appendChild(this.storageFrame);
    this.waitForReply();
  }

  update(project: CounterProject, action: CounterAction) {
    if (!this.connected() || this.pending()) {
      return;
    }

    this.pending.set(true);
    this.waitForReply();
    this.send({ type: 'update', project, action });
  }

  private send(message: object) {
    this.storageFrame.contentWindow?.postMessage({ channel, ...message }, projectAOrigin);
  }

  private receive = (event: MessageEvent) => {
    if (event.origin !== projectAOrigin || event.source !== this.storageFrame.contentWindow) {
      return;
    }

    const message = event.data;
    if (message?.channel !== channel) {
      return;
    }

    if (message.type === 'state') {
      if (!Number.isSafeInteger(message.b) || !Number.isSafeInteger(message.c)) {
        return;
      }

      this.countB.set(message.b);
      this.countC.set(message.c);
      this.connected.set(true);
      this.error.set('');
      this.pending.set(false);
      clearTimeout(this.replyTimeout);
    } else if (message.type === 'error') {
      this.connected.set(false);
      this.pending.set(false);
      this.error.set('Browser counter synchronization is unavailable. Allow browser storage and use Chrome or Edge.');
      clearTimeout(this.replyTimeout);
    }
  };

  private waitForReply() {
    clearTimeout(this.replyTimeout);
    this.replyTimeout = setTimeout(() => {
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


export function getCounterState() {
  if (!window.projectACounterState) {
    window.projectACounterState = new CounterState();
  }

  return window.projectACounterState;
}
