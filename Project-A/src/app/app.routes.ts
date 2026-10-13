import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { Todo } from './todo';

export const routes: Routes = [
  { path: '', component: Todo },
  {
    path: 'counter-b',
    loadComponent: () =>
      loadRemoteModule('project-b', './Counter').then(module => module.App),
  },
  {
    path: 'counter-c',
    loadComponent: () =>
      loadRemoteModule('project-c', './Counter').then(module => module.App),
  },
  { path: '**', redirectTo: '' },
];
