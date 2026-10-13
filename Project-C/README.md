# Project C: counter frontend

Project C runs at http://localhost:4202. It displays its own counter with Decrease, Reset, and Increase buttons. There is no navigation menu.

The implementation belongs to Project A. This project loads A's state through Native Federation. Read the [workspace README](../README.md) for complete setup, architecture, and synchronization details.

## Run

From this project directory:

```powershell
npm ci
npm start
```

Build with `npm run build`. Start Project A on port 4200 before opening this page.

## Independent startup flow

1. `src/main.ts` initializes federation and dynamically imports bootstrap.
2. `bootstrap.ts` starts App using `app.config.ts`.
3. `App.ngOnInit()` checks for A's state on the current window.
4. In a standalone tab it loads `./CounterState` from A's remoteEntry.json.
5. It calls the remote module's `getCounterState()` and saves the returned object in its counters signal.
6. The state creates an A-origin iframe and requests the stored B/C values.
7. The template reads `state.countC()` once connected.

The local counter-state.ts contains only a TypeScript interface. Its imports are type-only. It does not implement storage or calculate the count.

## Button flow

| Button | Method | Forwarded call |
| --- | --- | --- |
| Increase | increment() | update('c', 'increment') |
| Decrease | decrement() | update('c', 'decrement') |
| Reset | reset() | update('c', 'reset') |

The component forwards each action to A's loaded state object. The state sends a message to the hidden bridge. The bridge validates it, obtains a Web Lock, reads the latest pair from A's localStorage, changes C's count, and writes the pair.

It replies to its parent immediately. Other A-origin bridges receive browser storage events and forward the current values to their parents. Signals refresh the visible counts, including A's live summary.

Reset changes only C. Negative values are allowed. Reloading restores the browser's saved value.

## Running inside A

This project exposes `./Counter` from src/app/app.ts. A loads that component on its direct `/counter-c` route.

The component then executes in A's window. Initialization finds window.projectACounterState and reuses it immediately. No second state object or iframe is created in that window. The embedded counter and A's summary therefore read the same signals.

## Loading and errors

Before remote state arrives, the template shows a loading message. A failed load displays an instruction to start A and reload.

Once loaded, the count shows a dash until connected. Buttons are disabled while disconnected or pending. Connection, timeout, and storage errors come from A's state. Count updates use an aria-live region and errors use alert semantics.

## Main files

| File | Responsibility |
| --- | --- |
| src/main.ts | Federation initialization |
| src/bootstrap.ts, src/app/app.config.ts | Angular startup and providers |
| src/app/app.ts | Load/reuse A's state and forward actions |
| src/app/app.html | Count, buttons, loading, and errors |
| src/app/app.css | Presentation |
| src/app/counter-state.ts | Type-only public-state interface |
| federation.config.js | Expose Counter and share dependencies |
| angular.json | Development port and build configuration |

Use localhost consistently in the same browser profile, with browser storage enabled. Different profiles or computers do not share counts. For deployment changes, follow the coordinated origin and remote URL changes in the workspace README.

