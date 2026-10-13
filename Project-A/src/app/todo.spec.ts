import { TestBed } from '@angular/core/testing';
import { Todo } from './todo';

describe('Todo list', () => {
  it('adds a trimmed task, marks it complete, and deletes it', async () => {
    await TestBed.configureTestingModule({ imports: [Todo] }).compileComponents();
    const fixture = TestBed.createComponent(Todo);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const input = page.querySelector<HTMLInputElement>('#new-task')!;
    input.value = '  Learn Angular  ';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    page.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(page.querySelector('.task span')?.textContent).toBe('Learn Angular');
    expect(input.value).toBe('');

    page.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    await fixture.whenStable();
    expect(page.querySelector('.task span')?.classList.contains('completed')).toBe(true);

    page.querySelector<HTMLButtonElement>('li button')!.click();
    await fixture.whenStable();
    expect(page.textContent).toContain('No tasks yet');
  });

  it('ignores a blank task', async () => {
    await TestBed.configureTestingModule({ imports: [Todo] }).compileComponents();
    const fixture = TestBed.createComponent(Todo);
    fixture.componentInstance.newTask = '   ';
    fixture.componentInstance.addTask();
    expect(fixture.componentInstance.tasks).toEqual([]);
  });
});
