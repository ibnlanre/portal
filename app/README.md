# @ibnlanre/portal

[![npm version](https://badge.fury.io/js/%40ibnlanre%2Fportal.svg)](https://badge.fury.io/js/%40ibnlanre%2Fportal)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ibnlanre/portal/pages/pages-build-deployment?branch=master)](https://github.com/ibnlanre/portal/actions)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

Stores you declare, composed into trees, typed exactly as you wrote them.

- **`primitive`**: one whole value.
- **`composite`**: named branches, each a store.
- **`collection`**: branches made by key, on first use.

A kind is declared, never guessed. A branch is a store, so a part of your state
has the same API as the whole. Reads return the type you gave, so brands, dates,
class instances and interfaces come back as written. Portal does not copy or
rewrite your values.

## Install

```sh
pnpm add @ibnlanre/portal
```

React 19 is a peer dependency (for `$use` and the hooks). Types ship with the
package.

## Quick start

```ts
import { collection, composite, primitive } from "@ibnlanre/portal";

const app = composite({
  theme: primitive<"dark" | "light">("light"),
  picked: primitive<null | string>(null),
  user: composite({ name: "Taylor" }),
  toggle() {
    app.theme.$set((theme) => (theme === "light" ? "dark" : "light"));
  },
});

app.user.name.$set("Jordan");
app.$get(); // { theme: "light", picked: null, user: { name: "Jordan" } }

const drafts = collection((id: string) =>
  composite({ lines: primitive<string[]>([]) })
);
drafts("acme").lines.$set(["a"]);
```

In a component:

```tsx
function Name() {
  const [name, setName] = app.user.name.$use();
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

## The model

| Constructor                        | Meaning                                                                                                                                                         |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primitive<V>(initial \| () => V)` | One whole value. A write swaps it; reads return your reference.                                                                                                 |
| `composite(shape)`                 | A tree. A store member is a branch, a function is a method, anything else (including a plain object) is a leaf. Write `composite({ ... })` to branch an object. |
| `collection(make)`                 | `drafts(key)` makes an entry on first use. `$has`, `$keys`, `$delete`, `$clear`.                                                                                |

Every store has `$get`, `$use`, `$set`, `$subscribe`, `$reset`, `$dispose` and
`$onDispose`. A store may be a branch of any number of composites, never copied. A write to a
composite writes each listed branch by that branch's own rule; replace everything
with `$reset()` then `$set(value)`.
Notification is synchronous, once per outermost write, to the written store, its
descendants and every composite connected to it.

## Batching

`batch(fn)` is a top-level function: writes made inside it, to any stores, are one
outermost write, so each subscriber is called at most once, after `fn` returns.
Nested calls join the outer one. Replace everything with
`batch(() => { cart.$reset(); cart.$set(next); })`.

## Persistence

```ts
import { localAdapter, persist } from "@ibnlanre/portal";

const adapter = localAdapter<{ lines: string[] }>("draft", {
  version: 1,
});
const persistor = persist(draft, adapter);
```

`persist` hydrates a store, writes later changes (never before hydration) and
follows other tabs and windows by default (local storage; `sync: false` opts out). `asyncAdapter` follows other tabs with `watch: true`. For a collection, give a function from key to
adapter. Adapters: local, session, cookie, browser (sync) and async, each with
`version`, `migrate` and `validate`. See the
[persistence guide](docs/content/docs/guides/persistence.mdx).

## Also included

- `contextStore` for stores scoped to a React provider.
- `useAsync`, `useSync`, `useVersion`.
- `cookieStorage`: direct, optionally signed, cookie access.

## Documentation

The guides live in [`docs/content/docs`](docs/content/docs): the store API,
reading and setting state, subscriptions, React integration, persistence and
cookie storage.

## Contribute

Issues and pull requests are welcome at
[github.com/ibnlanre/portal](https://github.com/ibnlanre/portal).

## License

BSD-3-Clause.
