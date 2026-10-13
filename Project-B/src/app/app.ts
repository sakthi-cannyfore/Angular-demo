import { Component, inject } from '@angular/core';
import { COUNTER_SERVICE } from '@demo/shared-counter';

@Component({
  selector: 'app-counter-b',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  counters = inject(COUNTER_SERVICE);
  count = this.counters.countB;

  increment() {
    void this.counters.update('b', 'increment');
  }

  decrement() {
    void this.counters.update('b', 'decrement');
  }

  reset() {
    void this.counters.update('b', 'reset');
  }
}
