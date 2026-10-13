import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COUNTER_SERVICE } from '@demo/shared-counter';
import { App } from './app';

describe('Project A', () => {
  it('updates both live counter values', async () => {
    const counters = {
      countB: signal(0), countC: signal(0),
      connected: signal(true), error: signal(''),
    };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: COUNTER_SERVICE, useValue: counters },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    counters.countB.set(7);
    counters.countC.set(-2);
    await fixture.whenStable();
    const values = page.querySelectorAll('strong');
    expect(values[0].textContent).toBe('7');
    expect(values[1].textContent).toBe('-2');

    counters.connected.set(false);
    counters.error.set('Counter service is offline.');
    await fixture.whenStable();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('offline');
    expect(values[0].textContent).toBe('—');
  });
});
