import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getCounterState } from './counter-state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  counters = getCounterState();
}
