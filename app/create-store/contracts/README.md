# Core semantics contracts

**A branch is a store identified by its location in the state tree.**
Retained handles follow subsequent values at their location.

These tests describe public behavior, independent of the implementation's file layout.
Run `pnpm --dir app test:contracts` from the repository root. Run
`pnpm --dir app exec tsc --noEmit` as well: runtime tests do not validate
`expectTypeOf` assertions.

## Defined behavior

- **Notifications:** `$subscribe` immediately delivers the current value unless
  its second argument is `false`. A write invalidates its path, ancestors, and
  descendants once each. A root write invalidates all registered paths. Raw
  notifications are write-based, including same-value writes, empty object merges,
  and semantically unchanged object merges; they are not an
  equality-filtered change stream. Siblings outside the written subtree do not
  fire. Clearing an ancestor still notifies descendants with `undefined`.
- **Identity:** a store handle belongs to its path, not the object occupying it.
  Dot and `$at` access share a stable handle. Replacing/merging values does not
  change that handle. Shared and circular input values do not merge distinct
  path identities. Functions remain directly callable.
- **Selectors:** React subscribes to the selected snapshot. `Object.is` determines
  whether a selected result changed. Allocating selectors are cached between
  source changes; fresh object results on a new source snapshot count as changes.
  Unchanged plain-object/array subtrees retain their snapshot identity across
  leaf and partial root writes. Hooks read the same snapshots as `$get`, without
  cloning. Treat all read snapshots as read-only. Selector gating is not deep equality. Captured
  props/dependencies refresh selection.
  The hook still returns `[selectedValue, branchSetter]`.
- **Ownership and snapshots:** supported input data is copied at creation and on
  writes. `$get`, `$use`, selector input, and subscriber values share read-only
  snapshots. Repeated reads retain identity. Earlier snapshots stay unchanged.
  Functional updaters get defensive mutable copies; returned drafts are copied
  again, so retaining a draft cannot mutate committed state. A thrown updater
  publishes nothing. Plain objects/arrays share unchanged branches, including
  unchanged merges and complete array replacements with equal contents. Missing
  properties differ from explicit `undefined`; primitive equality is `Object.is`.
  Cyclic full drafts are supported. Snapshots are not runtime-frozen. Supported
  built-ins (Date, Map, Set, RegExp, ArrayBuffer and views) are copied but treated
  as atomic replacements when supplied; they are not compared by contents.
  Functions, custom classes, promises, weak collections and other opaque values
  remain references and are outside the data-isolation guarantee.
- **Updates:** plain objects deep-merge; omitted keys survive. Primitives, arrays,
  `null`, and `undefined` replace the addressed value. Assigning `undefined`
  keeps the key. Direct assignment/deletion on store proxies is ignored.
  There is no key-deletion or object-replacement API in this pass.
- **Dynamic shapes:** dot access exposes properties present initially or currently.
  A type-only optional property is not materialized by a read. `$at` can address
  an absent declared path, read `undefined`, and materialize missing parents on
  write. Retained handles survive clearing and restoration. Arrays remain whole
  values rather than traversable index stores.
- **Lifetime:** independent instances isolate writes. Unsubscribe is idempotent.
  Unmounted hooks detach, remounted hooks read current state, and switching store
  instances changes both the subscription and setter. `createContextStore` calls
  its supplied hook on each render; use `useState`/`useMemo` inside that hook when
  the store should persist for a provider's lifetime.
- **Storage:** `syncStorage` returns cleanup, ignores unrelated keys and explicit
  non-local storage areas, and handles `clear()`. An absent external value restores the baseline through normal `$set` semantics.
  The baseline is captured at registration. For objects this deep-merges
  and does not delete subsequently added keys. Exact object removal remains an
  API-design question, not an implicit change to `$set`. The store argument now
  needs `$get` as well as `$set`. On the server, cleanup is a harmless no-op.
- **Compatibility:** the peer range is React/React DOM 19, matching the context
  API. Tests exercise the installed React 19 version; this is not an exhaustive
  cross-version compatibility matrix.

## Development sequence

1. The initial notification, identity, and selector suite was run unchanged
   against the previous implementation: **11 failed, 5 passed**.
2. Notification prefix handling was fixed: **6 notification contracts passed**.
3. Path caching was fixed: **5 identity contracts passed**. Two older circular
   tests asserted object-based proxy identity and were changed to assert value
   readability through distinct paths instead.
4. Selected snapshots were introduced: all three core files passed, and the
   surrounding library suite passed **195 tests**.
5. Update and lifetime characterization tests passed; a dynamic dictionary test
   failed before current-property access was implemented. Typechecking also
   exposed nullable-parent path resolution, now covered by compile-time assertions.
6. Storage removal/cleanup tests failed before implementation. The package peer
   contract failed against the previous range before declarations were corrected.
7. A store-switching lifetime regression failed before hook dependencies were
   corrected; it now passes.
8. Benchmarks live outside this suite and have no correctness thresholds.

The contracts do not promise a transaction API, key deletion, deep selector
comparison, or performance targets. Changes to those promises need an explicit
contract decision, not just an implementation tweak.

## Snapshot ownership pass

1. Six snapshot/ingestion/draft contracts failed before changing the read and
   write boundaries; all six passed afterward.
2. Eleven of twelve structural-sharing contracts failed before replacing the
   cloning merge. Root/parent/leaf writes, arrays, no-op notification separation,
   `Object.is` edge cases and cyclic updater drafts now pass.
3. Read-only type checks failed against mutable read surfaces. Reads now use
   `Snapshot<State>`; setters accept those snapshots and retain updater typing.
4. Frozen input and mutable built-in ownership probes failed before introducing
   the store-specific ingestion copy. General-purpose `combine()` is unchanged.
5. React contracts verify shared imperative/hook snapshots and render gating for
   unchanged selections across partial root merges. Raw notification propagation
   remains write-based; this pass does not narrow root notifications.
