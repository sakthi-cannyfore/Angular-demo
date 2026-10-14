import type { Signal } from '@angular/core';

export interface CounterState {
  countB: Signal<number>;
  countC: Signal<number>;
  connected: Signal<boolean>;
  pending: Signal<boolean>;
  error: Signal<string>;
  update(project: 'b' | 'c', action: 'increment' | 'decrement' | 'reset'): void;
}
