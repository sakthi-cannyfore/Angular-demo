import { InjectionToken, WritableSignal } from '@angular/core';

export type CounterProject = 'b' | 'c';
export type CounterAction = 'increment' | 'decrement' | 'reset';

export declare class CounterService {
  countB: WritableSignal<number>;
  countC: WritableSignal<number>;
  connected: WritableSignal<boolean>;
  error: WritableSignal<string>;
  pending: WritableSignal<boolean>;
  connect(): void;
  applyCounts(counts: { b: number; c: number }): void;
  update(project: CounterProject, action: CounterAction): Promise<void>;
  close(): void;
}

export declare const COUNTER_SERVICE: InjectionToken<CounterService>;
