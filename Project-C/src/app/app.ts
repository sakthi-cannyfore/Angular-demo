import { Component, inject } from '@angular/core';
import { COUNTER_SERVICE } from '@demo/shared-counter';

@Component({
  selector: 'app-counter-c',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  counters = inject(COUNTER_SERVICE);
  count = this.counters.countC;

  increment() {
    void this.counters.update('c', 'increment');
  }

  decrement() {
    void this.counters.update('c', 'decrement');
  }

  reset() {
    void this.counters.update('c', 'reset');
  }
}
