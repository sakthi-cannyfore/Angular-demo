# Project A: Todo list and live counter summary

Project A is the host application, also called the shell. It displays local todos
and the live values of counter B and counter C. It can also load B and C's
components through native federation.

Read the [complete application guide](../README.md) for the architecture,
shared service, API, configuration, and troubleshooting.

## Run Project A

From this folder:

```powershell
npm install
npm start
```

Open [localhost:4200](http://localhost:4200/).
For the full demo, also start the counter server and Projects B and C.
All four startup commands are in the [root guide](../README.md#2-installation-and-startup).

## Home-page features

| Feature | Behavior |
| --- | --- |
| Add task | Enter text and click Add or press Enter |
| Ignore blank tasks | Spaces are trimmed; empty text is not added |
| Complete/uncomplete task | Toggle its checkbox; completed text is crossed out |
| Delete task | Delete removes only the selected task ID |
| Empty state | A message appears when the task list is empty |
| B/C summary | Shows values received from the counter server |
| Loading/offline state | Shows a dash until connected and a message for connection errors |

The navigation links have been removed.

## Todo component, step by step

The component keeps `newTask`, a `tasks` array, and a `nextId` counter.
Each task has `id`, `text`, and `completed` properties.

| Method | Steps |
| --- | --- |
| `addTask()` | Trim the input; return if blank; push a new incomplete task; increment its ID; clear input |
| `toggleTask(task)` | Reverse the task's boolean completion value |
| `removeTask(id)` | Filter out the matching task ID |

The template uses `[(ngModel)]` to connect input text, `(ngSubmit)` to add tasks,
and `@for (...; track task.id)` to render the list.
Checkbox changes call `toggleTask()`. Delete calls `removeTask()`.
The completed CSS class strikes through completed text.

Todo data stays in this component's memory. Reloading the browser or leaving this
component clears the tasks. Todo actions do not call the API and do not affect counters.

## Live counter summary

The root component injects `COUNTER_SERVICE` from `@demo/shared-counter`.
It reads the `countB`, `countC`, `connected`, and `error` signals.

Signals are reactive values: when the service changes them, Angular updates
the HTML. The summary belongs to the root component outside the router outlet,
so it stays visible across page changes.

Project A does not change counts from its summary. B and C send actions to the
common counter API; A receives the resulting live snapshots.

## Routes and federation

| URL | Component |
| --- | --- |
| `/` | Local todo component |
| `/counter-b` | B's exposed counter |
| `/counter-c` | C's exposed counter |
| Any unknown path | Redirect to `/` |

Although there are no navigation links, the remote routes still work by URL.

`main.ts` first initializes federation with `federation.manifest.json`,
then imports `bootstrap.ts` to start Angular.
The manifest maps `project-b` and `project-c` to ports 4201 and 4202.

On a remote route, `loadRemoteModule(remoteName, './Counter')` loads the
remote's exported `App` component. The router puts it in `<router-outlet />`.

A's federation configuration shares `@demo/shared-counter` as a singleton.
An embedded counter obtains the same root service used by A's summary.
A counter open in a separate tab has a different instance and receives
the same values through the API.

## Important files

| File | Responsibility |
| --- | --- |
| [src/app/app.ts](src/app/app.ts) | Root shared-service injection |
| [src/app/app.html](src/app/app.html) | Heading, live summary, and router outlet |
| [src/app/todo.ts](src/app/todo.ts) | Todo data and methods |
| [src/app/todo.html](src/app/todo.html) | Form and task list |
| [src/app/app.routes.ts](src/app/app.routes.ts) | Local and remote routes |
| [src/app/app.config.ts](src/app/app.config.ts) | Router and error-listener providers |
| [src/main.ts](src/main.ts) | Initialize federation |
| [src/bootstrap.ts](src/bootstrap.ts) | Start the Angular root component |
| [public/federation.manifest.json](public/federation.manifest.json) | Remote URLs |
| [federation.config.js](federation.config.js) | Shared-package configuration |

## Data lifetime

The server keeps counters in process memory. Reloading A receives the existing
values again; changing routes preserves them. Restarting the server resets both
counters. Todos are separate local component data.

## Build and test

From this folder:

```powershell
npm run build
npm test -- --watch=false
```

A's tests cover live summary changes, offline display, todo operations,
and the shared service's event and request behavior.
