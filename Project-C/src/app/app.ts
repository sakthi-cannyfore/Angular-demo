import { Component, OnInit, signal } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import type { CounterState } from './counter-state';

@Component({
  selector: 'app-counter-c',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  counters = signal<CounterState | null>(null);
  error = signal('');

  async ngOnInit() {
    const hostState = (window as Window & { projectACounterState?: CounterState }).projectACounterState;
    if (hostState) {
      this.counters.set(hostState);
      return;
    }
    try {
      const module = await loadRemoteModule({
        remoteEntry: 'http://localhost:4200/remoteEntry.json',
        exposedModule: './CounterState',
      });
      this.counters.set(module.getCounterState());
    } catch {
      this.error.set('Could not load counter state. Start Project A on port 4200 and reload.');
    }
  }

  increment() {
    this.counters()?.update('c', 'increment');
  }

  decrement() {
    this.counters()?.update('c', 'decrement');
  }

  reset() {
    this.counters()?.update('c', 'reset');
  }
}
