import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { COUNTER_SERVICE } from '@demo/shared-counter';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  counters = inject(COUNTER_SERVICE);
}
