# Core semantics contracts

These tests describe public behaviour, independent of the implementation's file
layout. Run `pnpm --dir app test:contracts` from the repository root. Behaviour
of the stores themselves is tested beside their code (`primitive`, `composite`,
`collection`, `persist`); the files here cover what crosses modules.

## Defined behaviour

- **Kinds:** a kind is declared (`primitive`, `composite`, `collection`), never
  detected. A composite member is a store (branch), a function (method), or a
  leaf made with `primitive`; a plain object is a leaf.
- **Reads:** typed exactly as given. Stores hold the caller's references and
  never copy; reads are stable, shared values and are not frozen. Do not mutate
  them.
- **Notifications:** synchronous, once per outermost write, to the written
  store, its descendants and every composite connected to it, even for equal
  values. A subscriber
  never sees a half-applied write. A write made by a subscriber is delivered
  after the current one, in order. Listener errors are reported together after
  every healthy listener has run.
- **Selectors:** React subscribes to the selected value and `Object.is` decides
  whether it changed. A composite's `$get()` keeps the identity of untouched
  subtrees.
- **Lifetime:** independent stores isolate writes. `$dispose` is idempotent,
  drops subscribers, makes writes no-ops and keeps the last value readable.
  The creator disposes: a composite disposes its own leaves and disconnects from
  stores it was handed, which stay alive.
- **Storage:** `persist(store, adapter)` follows the adapter's `watch` by default
  (local storage; session storage, cookies and plain tuples follow nothing, with
  no error). It ignores unrelated keys and other storage areas, handles `clear()`,
  and never writes back what it applies. A removed value resets the store to its
  initial value. `sync: false` opts out. On the server there is nothing to
  follow.
- **Collections:** `$delete`, `$clear` and `$reset` reset each removed entry to
  its initial value in the same write, then dispose it; a persisted collection
  also removes the entry's stored key. `entry.$dispose()` alone leaves it.
- **Compatibility:** the peer range is React/React DOM 19.

The contracts do not promise a transaction API, deep selector comparison, or
performance targets. Changes to those promises need an explicit contract
decision.
