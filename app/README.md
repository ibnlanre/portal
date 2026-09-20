# @ibnlanre/portal

Typed, branch-oriented state for structured React applications.

Portal keeps state in a single plain-data tree and hands you a small store at
every branch. A branch remembers its location, so `$get`, `$set`, `$use`, and
`$subscribe` behave the same whether you hold the root or a leaf.

- **Branch stores**: `store.user.name.$get()` reads a location; the same handle
  keeps following that location as state changes.
- **Stable snapshots**: repeated reads share read-only snapshots until a write
  replaces them, so selectors and React renders can rely on `Object.is`.
- **Owned inputs**: supported values are copied when they enter the store, so
  later mutation of your input never leaks into state.
- **Small surface**: `createStore`, `$at` for dynamic paths, `$use` for React,
  `$subscribe` for everything else, plus optional context, persistence, cookie,
  and async helpers.

## Install

```sh
npm install @ibnlanre/portal
# pnpm add @ibnlanre/portal
# yarn add @ibnlanre/portal
```

React 19 is a peer dependency. TypeScript definitions ship with the package.

## Quick start

```ts
import { createStore } from "@ibnlanre/portal";

const store = createStore({
  user: { name: "Alex" },
  settings: { theme: "dark" },
});

store.user.name.$get(); // "Alex"
store.user.name.$set("Jordan");
store.settings.theme.$subscribe((theme) => console.log(theme));
```

Use it from React with `$use`:

```tsx
function Profile() {
  const [name, setName] = store.user.name.$use();
  return (
    <input value={name} onChange={(event) => setName(event.target.value)} />
  );
}
```

Dynamic paths use `$at`, which also reaches absent declared paths and escapes
literal dots with a backslash:

```ts
store.$at("settings.theme").$get(); // "dark"
store.$at("a\\.b").$get(); // the literal "a.b" key
```

## Runtime and package

- ESM and CJS entries with declarations and source maps.
- Tested on Node 14, 16, 18, 20, and 22 for ESM, CJS, and SSR imports.
- No runtime dependencies beyond the React peer.

## Documentation

The full documentation — guides for reading and writing state, subscriptions,
React integration, context stores, persistence, cookies, and hooks — lives in
the `docs/` workspace of the repository and is published at
[ibnlanre.github.io/portal](https://ibnlanre.github.io/portal/).

## License

BSD-3-Clause. See [LICENSE](./LICENSE).
