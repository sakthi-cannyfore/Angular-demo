# Project C: Live counter micro frontend

Project C displays and changes counter C. It runs as a standalone Angular app
and exposes its counter component for Project A to load through native federation.

Read the [complete application guide](../README.md) for all three projects,
the shared service, API, and live data flow.

## Run this project

From this folder:

```powershell
npm install
npm start
```

Open [localhost:4202](http://localhost:4202/).
Also start the counter server with `npm start` in `../counter-server`.

Project A is not required to use this standalone counter. To see updates reflected
in A, start A and open [localhost:4200](http://localhost:4200/) too.

## Counter functionality

| Button | Component method | Service action | Server result |
| --- | --- | --- | --- |
| + | `increment()` | `update('c', 'increment')` | Add one to C |
| − | `decrement()` | `update('c', 'decrement')` | Subtract one from C |
| Reset | `reset()` | `update('c', 'reset')` | Set C to zero |

Negative values are allowed. There is no custom step-size control.
Changing C does not change counter B.

## How the component works

The component uses Angular dependency injection:

```typescript
counters = inject(COUNTER_SERVICE);
count = this.counters.countC;
```

`count` references the shared service's signal. Reading `count()` in the
template returns the current value. It is not a separate local copy.

The button methods call the asynchronous service action:

```typescript
increment() {
  void this.counters.update('c', 'increment');
}
```

The other methods use their corresponding action names.
`void` means the component does not consume the promise result.
The service handles errors and the live event stream supplies updated values.

## Follow a button click

1. The button's `(click)` binding invokes its component method.
2. The shared service POSTs the action to `/counters/c` on port 4300.
3. The server updates counter C and broadcasts both counts.
4. This component receives the snapshot through the service's live stream.
5. Its signal changes and Angular renders the new value.
6. Project A receives the same snapshot and updates its C summary.

The browser does not calculate an optimistic local value.
Both the sender and other clients display values broadcast by the server.

## Connection states

Before the first snapshot, the component displays a dash and a connecting message.
If the stream reports an error, it displays a dash and an offline message.

Buttons are disabled while `connected()` is false or `pending()` is true.
A failed action shows an error. The live stream automatically attempts to reconnect;
a successful snapshot restores the display.

Values use `aria-live="polite"`. Error messages use `role="alert"`,
and the increment/decrement buttons have descriptive accessible labels.

## Standalone startup

`src/main.ts` initializes federation and then loads `bootstrap.ts`.
The bootstrap starts `App` using `appConfig`.
The root HTML element is `<app-counter-c>`.
This standalone counter has no router configuration.

## How Project A loads this counter

[federation.config.js](federation.config.js) names the remote `project-c`
and exposes:

```javascript
exposes: {
  './Counter': './src/app/app.ts',
}
```

A's manifest points to `http://localhost:4202/remoteEntry.json`.
A's `/counter-c` route loads the exposed `App` component.

There is no navigation link in A, but you can type
`http://localhost:4200/counter-c` to view this counter inside A.

All projects share `@demo/shared-counter` as a federation singleton.
Inside A, this component reuses A's root counter service.
In a separate tab, it has its own service instance connected to the same API.

## Important files

| File | Responsibility |
| --- | --- |
| [src/app/app.ts](src/app/app.ts) | Signal reference and three action methods |
| [src/app/app.html](src/app/app.html) | Display, buttons, connection state, and errors |
| [src/app/app.css](src/app/app.css) | Basic counter-card styling |
| [src/main.ts](src/main.ts) | Federation initialization |
| [src/bootstrap.ts](src/bootstrap.ts) | Angular startup |
| [src/app/app.config.ts](src/app/app.config.ts) | Browser error listeners |
| [src/index.html](src/index.html) | Standalone root element |
| [federation.config.js](federation.config.js) | Exposed component and shared dependencies |
| [../shared-counter/index.js](../shared-counter/index.js) | Shared signals and communication |
| [../counter-server/server.js](../counter-server/server.js) | Real values and broadcasts |

## Data lifetime

Reloading this browser or opening a new tab receives the server's existing values.
Restarting the counter server resets both counters to zero.
All clients connected to that server share the same two counters.

## Build and test

From this folder:

```powershell
npm run build
npm test -- --watch=false
```

The component test verifies action keys, incoming signal values, independence from
counter B, and disabled controls while offline.
The [server integration test](../counter-server/server.spec.js) checks actual HTTP
requests and broadcasts to multiple clients.
