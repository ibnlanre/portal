## 7.0.0-rc.1 (unreleased)

### Breaking and behaviour changes

- **`watch: true` shares one channel per origin.** Every `watch: true` adapter
  of a page now uses a single `BroadcastChannel`, and a message names its key,
  instead of one channel per adapter named after its key. A persisted collection
  of thousands of entries opens one channel. The channel closes when the last
  watcher stops. Adapters of the same key in one tab still hear each other.
- **`ref` is a new declared kind.** A `ref(value)` member of a composite is
  outside the state: not in `$get()`, not in subscription deliveries, not
  written by a partial `$set`, and not reset by `$reset()`. A function in a
  shape is still a method, and a bare value still becomes a reactive leaf, so
  existing shapes do not change.

### Features

- `ref(value)` holds a value by reference, outside the reactive tree (a promise
  queue, a database handle): `$get`, `$set`, `$dispose`, `$onDispose`, typed
  exactly as given. `RefStore` is exported. Because a composite's `$reset()`
  leaves refs alone, no separate "exclude from reset" option is needed.
- `persist(store, adapter, { wait })` debounces writes (trailing, last value
  only). `persistor.flush()` writes the pending value at once, and disposing the
  persistor or the store flushes. A change followed from another tab while a
  write is pending wins and drops the pending value.
- `persist(store, adapter, { onError })` receives read, write and remove
  failures with `{ action, key? }`; without it `console.error` is unchanged. A
  throwing handler is logged and ignored.
- A collection's persistor has `hydratedOf(key)`, a per-entry boolean store,
  and `keys()`, which resolves the new `keys` option of
  `persist(collection, adapterFor, { keys })` (`undefined` without one).
  `CollectionPersistor`, `CollectionPersistOptions` and `PersistContext` are
  exported.

## 7.0.0-rc.0

### Breaking changes in this release

This is a new major version, published first as a release candidate under the
`rc` dist-tag. Install it pinned with `npm i @ibnlanre/portal@7.0.0-rc.0`;
`latest` stays 6.0.1 until 7.0.0. Read these changes before upgrading from
6.0.1. The store model is rebuilt around three
constructors, and the old API is removed with no aliases.

- **The factories are renamed, with no aliases.** `createLocalStorageAdapter` is
  `localAdapter`, `createSessionStorageAdapter` is `sessionAdapter`,
  `createCookieStorageAdapter` is `cookieAdapter`,
  `createBrowserStorageAdapter` is `customAdapter`,
  `createAsyncBrowserStorageAdapter` is `asyncAdapter`, and `createContextStore`
  is `contextStore`. Signatures are unchanged (key first, options second).
- **Default-written strings are JSON-quoted.** The default `stringify` is now
  `JSON.stringify` (it used to write a string as raw text) and the default
  `parse` is still `JSON.parse`, so every state round-trips: `"dark"` is stored
  as `"dark"`, and `"123"` and `"true"` come back as strings. A string stored raw
  by an earlier version is not valid JSON and reads as absent unless the adapter
  is given a raw `parse` (and `stringify`). `safeStringify` is removed.
- **`createStore` is removed.** A kind is declared, never detected. Use
  `primitive(value)` for one whole value, `composite(shape)` for named branches,
  and `collection(make)` for branches made by key. `createStore(0)` is
  `primitive(0)`; `createStore({ a: 1 })` is `composite({ a: 1 })`; state a type
  with `primitive<string | null>(null)`, with no cast.
- **`createPrimitiveStore` and `createCompositeStore` are removed**, and so are
  `CreatedStore`, `BuiltIn`, `Primitives`, `Reference` and every type that
  existed to guess a kind.
- **Members of a composite shape follow what you wrote.** A store is a branch
  (the same object), a function is a method, and anything else is a leaf, a
  `primitive(value)` made for you. A plain object is a leaf, not a branch; write
  `composite({ ... })` to branch it. A store may be a
  branch of any number of composites (`composite({ a })` and `composite({ a, b })`
  share `a`, no copies); a composite connects by subscribing, and writes and
  `$reset` pass through to shared branches. Shape keys `$get`, `$use`, `$set`, `$subscribe`, `$reset`,
  `$dispose` and `$onDispose` are reserved and throw.
- **A primitive never looks inside its value.** `$set` swaps the whole value; it
  no longer deep-merges objects. Values are not copied: the store holds your
  reference and reads return it. Updaters receive the current value and must
  return a new one; do not mutate it.
- **`$set` takes one argument and has one meaning per kind; there is no
  `replace` option.** A composite writes each listed branch by that branch's own
  rule (a composite branch recurses, a primitive branch swaps) and leaves the
  others alone; its argument is typed per key from the declaration (`SetOf`), so
  methods are not accepted and nothing is a `DeepPartial` of your types. Replace
  everything with `$reset()` then `$set(value)`. A collection writes the listed
  entries and creates missing ones; remove with `$delete` or `$clear`. Declared
  keys are never dropped.
- **Reads are typed exactly as you gave them.** The exported `Snapshot` type and
  the deep `readonly` read types are removed.
- **Async and initializer-returning-promise initial values are removed**
  (`await createStore(promise)`): `await` first, then construct the store.
- **`$subscribe` takes an options object, not a boolean:**
  `$subscribe(fn, { immediate: false })`. `immediate` still defaults to `true`;
  `$subscribe(fn, false)` is a type error, with no overload.
- **`createStoreFamily` and `StoreFamily` are removed.** Use `collection`.
- **`combine` and `Combine` are removed.** Spread instead:
  `composite({ ...state, ...actions })`.
- **`$at` and the path machinery are removed** (`Paths`, `ResolvePath`,
  `StatePath`, and the helpers behind them). Reach a branch by property, or
  address a keyed one with a `collection`.
- **Removed types:** `PartialSetStateAction`, `PartialStateManager`,
  `PartialStateSetter`, `ReplaceStateAction`, `Subscriber`, `StoreValueResolver`,
  `InferType`, `Assign`, `DeepPartial`, `Dictionary`, `Factory`, `Initializer`,
  `Replace`. Use `Store`, `Setter`, `PrimitiveStore`, `CompositeStore`,
  `CollectionStore`, `StateOf` and `SetOf`.
- **Notification** is write-based and synchronous: a subscriber is called at most
  once per outermost write, for the written store, its descendants and every
  composite connected to it, even for an equal value.
  Subscribers receive only the value.
- **The creator disposes.** Disposing a composite disposes the leaves it made and
  disconnects from the stores it was handed, which stay alive; disposing a
  collection disposes its entries. Disposing a store others hold leaves them able
  to read its last value, and writes to it are no-ops.
- **Every store has `$reset`, `$dispose` and `$onDispose`.**
- **`persist` follows its storage by default.** A persisted store follows local
  storage across tabs and windows of the same site: a change made elsewhere is
  written to the store and nothing is written back, and a removed value resets
  the store to its initial value. Another tab's write replaces this tab's
  in-memory value (last write wins). The only option is `sync: false`, to opt out;
  there is no `"restore"` mode. Adapters that cannot announce changes (session
  storage, cookies, plain `[get, set]` tuples, browser and async adapters without
  a supplied watcher) follow nothing, silently.
- **Adapters still return the plain `[get, set]` tuple, unchanged.** `persist`
  follows a tuple only if it is the very one a factory returned: a copy or a
  hand-built tuple follows nothing. Custom adapters supply a `watch`
  (`StorageWatcher`) through the options of `customAdapter` and
  `asyncAdapter`.
- **A `parse` result of `null` or `undefined` means "absent".** With a fallback
  argument the adapter returns the fallback; without one it returns `undefined`.
- **Stored data written by older versions can read as absent.** Without a
  `version` option an adapter returns the stored value as is and never unwraps an
  envelope. With `version`, a stored value that is not a `{ $version, state }`
  envelope is absent (a bare value is not treated as version 0 and does not go
  through `migrate`), and `migrate` runs only for an envelope whose `$version`
  differs. The default parser logs unparsable text through `console.error` and
  treats it as absent, so an empty stored string is absent too. All five adapters
  apply one rule: nothing stored is absent, anything else goes through `parse`,
  and a parse failure or a `null` or `undefined` result is absent.
- **`syncStorage` and `SyncStorageOptions` are removed.** `persist` follows
  storage by default (see above).

### Features

- A read that fails during hydration (rejects or throws) is treated as nothing
  stored: it is logged, the store is hydrated, a later edit is saved, and a value
  set before the failure is saved. One failed entry no longer keeps a
  collection's `hydrated` false. There is no `onError` option.
- `persist` accepts an adapter typed from your own interface. The store's state
  must be assignable to what the adapter stores, and what the adapter reads must
  be accepted as a write to the store, so an adapter for an interface with
  optional fields (`checkDate?: string`) works for a store whose state has
  `checkDate: string | undefined`, with no cast. `PersistAdapter` takes a second
  type parameter, `Read`, defaulting to the first.
- A change made before hydration finished is no longer lost when storage holds
  nothing: an entry of a persisted collection created and set in the same tick
  (`journals.$set({ id: journal })`), or a store set before an async read
  resolved, is saved once hydration finds the key absent. A stored value still
  wins and is not overwritten.
- A collection's key is a plain `string` everywhere: `collection(make)` takes
  `make: (key: string) => Entry`, `drafts(key)`, `$has` and `$delete` take a
  string, `$keys()` is `string[]`, the state is `Record<string, …>`, and
  `persist(collection, (key: string) => adapter)`. A number key is a type error;
  convert a numeric id with `String(id)` at the call site. There is no runtime
  coercion.
- Adapters accept `validate?: (state: unknown) => State | null | undefined`
  beside `migrate`. It runs after the envelope is unwrapped and after `migrate`
  (on the parsed value when unversioned); `null` or `undefined` is absent
  without a log, and a throw is absent and logged. Without it, a state with the
  right envelope but the wrong shape is applied as it is.
- Collection `$delete(key)` and `$clear()` reset each removed entry to its
  initial value inside the same outermost write, then dispose it, so holders and
  mounted components see the empty state, notified once. For a persisted
  collection they also remove the entry's stored key, and the reset is not
  written back. `entry.$dispose()` is unchanged and leaves the stored key. This
  applies to live entries only; stored keys of entries never created are left,
  and an app that must leave nothing behind sweeps them itself (documented).
- `asyncAdapter` takes `watch: true | StorageWatcher`. `true` follows other tabs
  of the origin over a `BroadcastChannel` named after the key, and the adapter
  announces each successful write or removal, so it needs no hand-written
  watcher (nothing happens where `BroadcastChannel` is missing). A function is
  your own source and announces nothing. `customAdapter` takes `watch:
  StorageWatcher` only. Local, session and cookie adapters take no `watch`.
- Disposing a collection entry directly (`entry.$dispose()`) notifies the
  collection and its holders once, as an outermost write. `persist` reports an
  adapter whose `set` throws or rejects through `console.error` instead of
  failing the write. All three store kinds are frozen, and a reserved shape key is
  a type error as well as a runtime error.

- `batch(fn)`, a top-level function (if both `fn` and delivery throw, an
  `AggregateError` carries both errors): writes made inside `fn` are one outermost
  write, so each subscriber is called at most once, after `fn` returns. Nested
  calls join the outer one; if `fn` throws, the writes already applied stay and
  delivery still happens once. A composite is replaced with
  `batch(() => { store.$reset(); store.$set(value); })`.
- `composite`, `primitive` and `collection` (see above), each store with `$get`,
  `$use`, `$set`, `$subscribe`, `$reset`, `$dispose` and `$onDispose`. A
  collection also has `$has`, `$keys`, `$delete` and `$clear`; an entry made by
  reading does not notify, because reading must never cause an update.
- `persist(store, adapter, { skipHydration, onHydrated, sync })` returns a
  `Persistor`, `{ hydrate(), hydrated, dispose() }`, with the state type inferred
  from the store. It writes nothing until storage has been read, never writes
  back its own updates, and follows the adapter's `watch` by default
  (`sync: false` opts out). For a collection, pass a function from key to adapter: every
  entry is persisted under its own key and stops when it is disposed. The collection's
  `hydrated` matches a single store: `true` before `persist(...)` returns when
  every read is synchronous, otherwise it flips once after the entries that
  existed have settled (a rejecting read does not hold it back and is logged).
- Every storage adapter accepts `version` and `migrate` beside `parse` and
  `stringify`. With `version`, writes are stored as `{ $version, state }`.
- `customAdapter` and `asyncAdapter` take a `watch` option, which reports changes made
  elsewhere; the local storage adapter wires its own from `storage` events.
  `StorageWatcher` and `StorageChange` are exported.

## 6.0.1 (2026-10-26)

### Bug Fixes

- `localAdapter` and `sessionAdapter` no longer throw
  where the browser refuses storage (blocked site data, a sandboxed frame) or a
  write (full storage). A refused read returns the fallback; a refused write or
  removal is dropped. Both log through `console.error`, as `cookieStorage`
  does. A custom `parse` or `stringify` still throws its own errors.
- `syncStorage` ignores a `storage` event it cannot attribute to
  `localStorage` where reading `window.localStorage` throws, instead of
  throwing inside the listener.

## 6.0.0-alpha.0 (2026-09-17)

### BREAKING CHANGES

- Store reads now return stable, read-only snapshots instead of defensive copies.
  In 5.2.4 every `$get()`, `$use()`, and subscriber call cloned the state. Do not
  mutate `$get()`, `$use()`, selector inputs, or subscriber values; use `$set()`
  instead. `Snapshot<State>` describes the read surface.
- the React peer requirement is now `^19.0.0`, up from `>16.7`.
- remove the `normalizeObject` export.
- remove the `Normalize`, `SetPartial`, and `SetPartialStateAction` types.
  `SetPartialStateAction` is replaced by `PartialSetStateAction`.

> Schema helpers developed during this cycle (`resolveSchema`,
> `resolveSchemaAsync`, `InferSchema`, and the schema argument to `createStore()`)
> were withdrawn before release. None of them ever appeared in a published
> version, so they are not consumer-facing changes and are not listed above.

### Owned inputs and stable snapshots

Portal copies supported values at creation and on writes, including drafts
returned by functional updaters. Earlier snapshots remain unchanged, and partial
writes preserve references for unchanged plain-object and array branches. React
selectors consume those references directly, including across root merges.
Updater inputs remain defensive copies. General-purpose `combine()` is unchanged.
Storage adapters accept the read surface on their write path, so
`$subscribe(set, false)` and `set(store.$get())` typecheck for state containing
arrays without a cast.

Raw subscribers still receive same-value writes, and root writes still notify
all registered paths. Notification precision remains a separate contract decision.
Snapshots are not runtime-frozen. Mutable built-ins are copied but treated as
atomic replacements; functions and opaque instances remain references outside
Portal's data-isolation guarantee.

### Core semantics hardening

A branch is a store identified by its location in the state tree. This pass
establishes behavioral contracts for that model and fixes missed descendant
notifications, writes routed through shared-object aliases, unnecessary
selector-driven renders, stale subscriptions and setters after store switching,
and optional-path typing.

Dynamic dictionary access, storage synchronization, provider lifetime, and
branch identity are covered by explicit contracts. Retained handles follow
subsequent values at their location. Raw subscriptions notify on writes,
including unchanged object merges; selectors separately gate store-driven React
renders using `Object.is`. Existing deep-merge semantics remain intact, and no
new mutation APIs were introduced.

Storage removal restores the baseline captured at synchronization startup
through normal `$set` semantics. This deep-merges objects and retains extra keys;
it does not promise exact object restoration.

### Compatibility and validation

- React and React DOM peers now require version 19.
- `syncStorage()` now requires `$get` alongside `$set` and returns cleanup.
- Performance benchmarks are tracked separately from correctness tests.
- Tests, typechecking, builds, and export checks pass. ESLint cannot run yet:
  `typescript-eslint` accepts TypeScript `>=4.8.4 <6.1.0` and rejects this
  project's 7.0.2, which also dropped the compiler API that the linter loads, so
  `lint` and the `posttest` hook fail.

## [5.2.4](https://github.com/ibnlanre/portal/compare/v5.2.3...v5.2.4) (2025-08-08)

### Bug Fixes

- correct DOCTYPE declaration and update browserslist in package.json ([e9b16d8](https://github.com/ibnlanre/portal/commit/e9b16d8de406594c60b1707bbaf036809c832c8f))

## [5.2.3](https://github.com/ibnlanre/portal/compare/v5.2.2...v5.2.3) (2025-07-26)

### Bug Fixes

- correct function name from createContextScope to createContextStore in documentation ([e1368b3](https://github.com/ibnlanre/portal/commit/e1368b3d250348a3bf2db410dea5eaaf97e9a930))

## [5.2.2](https://github.com/ibnlanre/portal/compare/v5.2.1...v5.2.2) (2025-07-26)

## [5.2.1](https://github.com/ibnlanre/portal/compare/v5.2.0...v5.2.1) (2025-07-26)

# [5.2.0](https://github.com/ibnlanre/portal/compare/v5.1.2...v5.2.0) (2025-07-26)

### Bug Fixes

- update variable names for consistency in counter store example ([d44a620](https://github.com/ibnlanre/portal/commit/d44a620c6370b4152c398160e65665c51417195b))

### Features

- add createContextStore for context-based state management ([033bc2e](https://github.com/ibnlanre/portal/commit/033bc2ee5787810d8387234e36d18042e3a8e90b))
- add useSync hook with comprehensive tests ([e77b190](https://github.com/ibnlanre/portal/commit/e77b190fa068519e09320f85ba21e630a63b20d4))
- implement useAsync hook for handling asynchronous effects with loading, error, and data states ([d7ca669](https://github.com/ibnlanre/portal/commit/d7ca6692988361569a787e3525d3e172baa97f35))
- introduce useVersion hook for deep dependency tracking and update related hooks and tests ([7b2469e](https://github.com/ibnlanre/portal/commit/7b2469e804a2e869c703ddace4e5e61f4c0308b9))

## [5.1.2](https://github.com/ibnlanre/portal/compare/v5.1.1...v5.1.2) (2025-07-04)

## [5.1.1](https://github.com/ibnlanre/portal/compare/v5.1.0...v5.1.1) (2025-07-04)

# [5.1.0](https://github.com/ibnlanre/portal/compare/v5.0.4...v5.1.0) (2025-07-01)

### Bug Fixes

- update AsyncBrowserStorageAdapterOptions to allow synchronous item retrieval and removal ([6609e62](https://github.com/ibnlanre/portal/commit/6609e6238d4b5a112c7c8cf710a4523c2678333c))
- update linting scripts to use eslint directly for consistency ([f8211ce](https://github.com/ibnlanre/portal/commit/f8211ce53e1eb460859d6ba173249b7c8066deac))

### Features

- add IndexedDB example with Dexie integration ([c8df46f](https://github.com/ibnlanre/portal/commit/c8df46ffdee49a10e48d8e399a1ca12ada27ff78))
- add InferType utility type and update user profile component to use createStore ([30b8c99](https://github.com/ibnlanre/portal/commit/30b8c993cb8b3662cae3b03d470a75de37db9720))
- add unit tests for isValidKey function ([cc043e0](https://github.com/ibnlanre/portal/commit/cc043e047ecb8958e7e2bd5720eae4df67df0365))
- convert example from html to react ([21c73f1](https://github.com/ibnlanre/portal/commit/21c73f1730ee39b2f048d6de6a37448bd11e8299))
- enhance createSnapshot to support deep cloning of Map, Set, ArrayBuffer, and Error objects ([01dd211](https://github.com/ibnlanre/portal/commit/01dd2119266f758228977affae27172db51dcaef))
- enhance README with new features including Actions as hooks and InferType utility ([115f830](https://github.com/ibnlanre/portal/commit/115f830a1223057867ed913ff6096f633b755e13))

## [5.0.4](https://github.com/ibnlanre/portal/compare/v5.0.3...v5.0.4) (2025-06-18)

## [5.0.3](https://github.com/ibnlanre/portal/compare/v5.0.2...v5.0.3) (2025-06-18)

## [5.0.2](https://github.com/ibnlanre/portal/compare/v5.0.1...v5.0.2) (2025-06-17)

### Bug Fixes

- **tsconfig:** add trailing comma in paths configuration ([7282bed](https://github.com/ibnlanre/portal/commit/7282bed7e37d1da3c8ff1bc6162ff61fd0aa177d))

### Features

- add vitest configuration for testing setup ([0ff6a56](https://github.com/ibnlanre/portal/commit/0ff6a567d804734e203511f99633d3cec499f4ec))

## [5.0.1](https://github.com/ibnlanre/portal/compare/v5.0.0...v5.0.1) (2025-06-17)

### Bug Fixes

- Update build status badge to reflect correct workflow and branch ([732035b](https://github.com/ibnlanre/portal/commit/732035b5c5575bff96cf393e259d3b13df772777))

# [5.0.0](https://github.com/ibnlanre/portal/compare/v4.0.1...v5.0.0) (2025-06-17)

### Bug Fixes

- update default values for cookiePrefix and cookieScope in createCookieKey function and tests ([7b1824a](https://github.com/ibnlanre/portal/commit/7b1824ab5740422bb8e4d97f888ac9827c4d9140))

### Features

- Add initial documentation for @ibnlanre/portal library including setup, store creation, and persistence methods ([2a7e858](https://github.com/ibnlanre/portal/commit/2a7e858918cd13a8f4a3cf1fb1e9cf7082e22fd8))
- Enhance createCompositeStore with deep partial updates and derived state handling ([67d8121](https://github.com/ibnlanre/portal/commit/67d81210e09b171dd957219d61e2a985a9b53bf9))
- implement deep merge function and remove callable properties ([51d4143](https://github.com/ibnlanre/portal/commit/51d4143fb7c40042ea9fa8045fc9ac572d810cf3))

## [4.0.1](https://github.com/ibnlanre/portal/compare/v0.0.7...v4.0.1) (2025-01-23)

### Bug Fixes

- added entries state back ([c078d18](https://github.com/ibnlanre/portal/commit/c078d189a4a1c02a0572a48e932fe32631496cd2))
- atom.getItem gets the value and not the subject ([8ecebed](https://github.com/ibnlanre/portal/commit/8ecebed532fb9fed215c4a0c1b6c6f772e2110fc))
- initial state changes only when value is truthy ([686754c](https://github.com/ibnlanre/portal/commit/686754c902c7067b7b921c04680f13510f5c9471))

## [0.0.7](https://github.com/ibnlanre/portal/compare/v0.0.5...v0.0.7) (2023-06-11)

## [0.0.5](https://github.com/ibnlanre/portal/compare/v0.0.3...v0.0.5) (2023-06-02)

## [0.0.3](https://github.com/ibnlanre/portal/compare/v0.0.1...v0.0.3) (2023-06-02)

## 0.0.1 (2023-06-02)
