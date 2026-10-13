# Project A: todo host and frontend counter state

Project A runs at http://localhost:4200. It displays a todo list and the current B/C counts. It owns the counter implementation exposed through Native Federation and the browser storage bridge.

Read the [workspace README](../README.md) for the full architecture, setup, update sequence, and troubleshooting.

## Run

From this project directory:

```powershell
npm ci
npm start
```

Build with `npm run build`. Start B on port 4201 and C on port 4202 to use their independent screens or A's remote counter routes.

## Startup flow

1. `src/main.ts` initializes federation using `public/federation.manifest.json`.
2. Main dynamically imports `bootstrap.ts`, which starts App with `app.config.ts`.
3. App calls `getCounterState()` and keeps the returned object for the live summary.
4. That function caches one state object on the current window.
5. The constructor creates an A-origin hidden iframe and requests the saved pair of counts.
6. The reply updates Angular signals, and the summary template displays the values.
7. The router displays Todo at the home URL.

## Todo functionality

`todo.ts` stores the input and task list in component memory. Each item has an ID, text, and completed flag.

- `addTask()` trims input, ignores blanks, adds an incomplete item with a new ID, and clears the input.
- `toggleTask(task)` reverses the completed flag.
- `removeTask(id)` filters out the selected item.

`todo.html` uses FormsModule for two-way input binding. Form submission adds an item, checkbox changes toggle completion, and Delete removes an item. A tracked loop renders tasks, an empty branch shows the empty-list message, and a CSS class styles completed tasks.

The list clears on reload or when the todo component is recreated. Counter updates do not modify it.

## Counter functionality

A's `counter-state.ts` exports `getCounterState()` and CounterState. Its signals contain B/C values, connection status, pending status, and an error message.

`update()` validates connection readiness and sends an action. `send()` posts to the bridge. `receive()` validates replies and updates signals. `waitForReply()` handles a 10-second timeout. The root shows a dash until connected, followed by the saved count values.

The window cache lets embedded B/C components use the same state and iframe as A's root. Independent tabs load the implementation from A but create their own state objects.

## Browser bridge flow

`counter-bridge.html` loads `counter-bridge.js`. All bridge instances execute on A's origin, so they access the same localStorage entry, `project-a-counters`.

The bridge validates messages, locks the update with Web Locks, reads the latest pair, changes the selected value, and saves both counts. It replies directly to its parent. Other bridge frames receive storage events and forward the latest pair to their own parents. Angular signals then refresh their displays.

Counts persist in browser storage across reloads. Use the same browser profile and localhost hostname with storage enabled. The bridge is frontend code and does not call a counter API.

## Routes and federation

| URL | Content |
| --- | --- |
| `/` | Todo list |
| `/counter-b` | B's exposed Counter component |
| `/counter-c` | C's exposed Counter component |
| Unknown route | Redirect home |

No navigation menu is rendered. The summary remains visible on the direct remote routes.

A exposes `./CounterState`. Its manifest discovers B/C, and the route file loads their `./Counter` modules when needed. Federation loads code; the bridge synchronizes cross-tab data.

## Main files to read

| File | Purpose |
| --- | --- |
| `src/main.ts`, `src/bootstrap.ts` | Federation initialization and Angular startup |
| `src/app/app.config.ts`, `app.routes.ts` | Providers and routes |
| `src/app/app.ts`, `app.html` | Summary and router outlet |
| `src/app/todo.ts`, `todo.html` | Todo interactions |
| `src/app/counter-state.ts` | Federated counter state |
| `public/counter-bridge.html`, `counter-bridge.js` | Browser storage and messaging |
| `federation.config.js` | Exposed state and dependency sharing |
| `public/federation.manifest.json` | B/C remote entry URLs |

Deployment to different origins requires coordinated changes to the remote URLs, bridge origin, and allowed origins described in the workspace README.
