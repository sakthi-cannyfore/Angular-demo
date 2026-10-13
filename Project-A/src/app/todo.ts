import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo',
  imports: [FormsModule],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo {
  newTask = '';
  tasks: TodoItem[] = [];
  private nextId = 1;

  addTask() {
    const text = this.newTask.trim();
    if (!text) return;

    this.tasks.push({ id: this.nextId++, text, completed: false });
    this.newTask = '';
  }

  toggleTask(task: TodoItem) {
    task.completed = !task.completed;
  }

  removeTask(id: number) {
    this.tasks = this.tasks.filter(task => task.id !== id);
  }
}
