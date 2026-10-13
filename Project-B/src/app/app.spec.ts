import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { COUNTER_SERVICE } from '@demo/shared-counter';
import { App } from './app';

describe('Project B counter', () => {
  it('sends button actions and displays incoming shared counts', async () => {
    const counters = {
      countB: signal(0), countC: signal(0),
      connected: signal(true), pending: signal(false), error: signal(''),
      update: vi.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: COUNTER_SERVICE, useValue: counters }],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const buttons = page.querySelectorAll<HTMLButtonElement>('button');
    const count = () => page.querySelector('.count')?.textContent?.trim();

    buttons[0].click();
    buttons[2].click();
    buttons[1].click();
    expect(counters.update.mock.calls).toEqual([
      ['b', 'decrement'], ['b', 'increment'], ['b', 'reset'],
    ]);
    expect(count()).toBe('0');

    counters.countB.set(12);
    counters.countC.set(99);
    await fixture.whenStable();
    expect(count()).toBe('12');

    counters.connected.set(false);
    await fixture.whenStable();
    expect(count()).toBe('—');
    expect(Array.from(buttons).every(button => button.disabled)).toBe(true);
  });
});
