# Portal stores: `primitive`, `composite`, `collection`

Status: spec, uncommitted. Clean slate: nothing that exists is protected by
being there. Anything this spec does not keep is deleted.

## 1. Principles

1. **A kind is declared, never detected.** `primitive` means "one whole value".
   `composite` means "these named branches". `collection` means "branches made
   by key". No function inspects a user's value to decide what it is, at the
   type level or at runtime.
2. **A branch is a store.** A composite is a tree of stores. A store held by a
   composite is the same object you get when you read it from the composite.
3. **Reads are typed as given.** No readonly rewriting, no mapped-type
   expansion of the user's types. A value comes back with the type it went in
   with: brands, dates, class instances, unions, interfaces.
4. **Inference is free; declaration is deliberate.** A type is written in one
   place, the constructor's type argument (`primitive<string | null>(null)`),
   and nowhere else. No `as` casts on values.
5. **Do no harm.** `primitive` never looks inside its value. `composite` treats
   only what the user wrapped as a branch.
6. **Names the user sees stay named.** Hover and error messages show
   `PrimitiveStore<V>`, `CompositeStore<S>`, `CollectionStore<C>`, never an
   expanded mapped type of the user's own types.

## 2. Vocabulary and constructors

```ts
primitive<V>(initial: V): PrimitiveStore<V>
primitive<V>(initializer: () => V): PrimitiveStore<V>
composite<S extends GenericObject>(shape: S): CompositeStore<S>
collection<C extends Store>(make: (key: string) => C): CollectionStore<C>
```

`GenericObject` stays `Record<PropertyKey, any>` so interfaces work as shapes.

### 2.1 What a member of a `composite` shape is

Decided by what the user wrote, with no guessing:

| The member is                                                                                          | It becomes                                |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| a store made by `primitive`, `composite` or `collection`                                               | that store, as a branch (the same object) |
| a function                                                                                             | a method, exposed as written; not state   |
| anything else (scalar, array, `null`, `undefined`, `Date`, `Map`, `Set`, class instance, plain object) | a leaf: `primitive(value)` made for you   |

A plain object is a leaf. To branch it, write `composite({ ... })`. **Decision
D1:** strictness first, because loosening later is not breaking and tightening
later is. Literal widening applies to leaves (`theme: "light"` is `string`);
write `primitive<"light" | "dark">("light")` to state the type.

```ts
const app = composite({
  cart: composite({ items: primitive<Line[]>([]) }),
  user: composite({ name: "" }), // name is a leaf: string
  theme: primitive<"light" | "dark">("light"),
  picked: primitive<Row | null>(null),
  addToCart(line: Line) {
    app.cart.items.$set((items) => [...items, line]);
  },
});
```

### 2.2 The store interface (every store)

```ts
$get(): State;                       $get<R>(select: (s: State) => R): R;
$use(): [State, Setter<State>];      $use<R>(select, deps?): [R, Setter<State>];
$set(value | (prev) => value): void;   // one argument; see 2.2a
$subscribe(fn: (value: State) => void, options?: { immediate?: boolean }): () => void;
                                     // immediate defaults to true; there is no boolean overload
$reset(): void;                      // back to the initial value
$dispose(): void;                    // idempotent
$onDispose(cleanup: () => void): () => void;  // after dispose: runs at once
```

`State` of a composite is `StateOf<S>`: each branch's own state, each leaf's
value, methods omitted. Reserved member names that a shape key may not use:
`$get $use $set $subscribe $reset $dispose $onDispose`.

### 2.2a `$set` has one meaning per kind and no options

There is no `replace` option and no merge flag. The declared kind decides:

- **primitive:** the whole value is swapped. To change a field inside it, spread:
  `row.$set((r) => ({ ...r, qty: 2 }))`. To update inside without spreading,
  declare it as a `composite`.
- **composite:** `$set(partial)` writes each listed branch by that branch's own
  rule (a composite branch recurses, a primitive branch swaps) and leaves the
  others alone. The argument type is built per key from the declaration
  (`SetOf<S>`: composite branch -> its `SetOf`, primitive branch -> its value,
  method keys excluded); there is no `DeepPartial` over user types. Replacing
  everything is `$reset()` then `$set(value)`, run as one outermost write.
- **collection:** `$set(record)` writes the listed entries and creates missing
  ones. Removing is `$delete` or `$clear`; replacing everything is `$clear()`
  then `$set(record)`.
- The updater form `$set((prev) => next)` receives the current state and returns
  a value of the same argument type.

### 2.3 Connection: a composite subscribes to its branches

A store is an individual. It knows nothing about who holds it: no parent
pointer, no registry. A composite _connects_ to each store in its shape by
subscribing to it. The same store can be a branch of any number of composites,
and each composite sees it only through its own stem:

```ts
const a = composite(b);
const c = composite({ a });
const d = composite({ a, e: primitive(f) }); // fine: a is shared, not copied
```

- **D2 (revised): sharing is allowed; a branch is the same store everywhere.**
  `c.a === a === d.a`. A write to `a`, from any of them, is seen by `c` and `d`
  because both subscribe to it. There are no copies.
- **Shapes are fixed at construction,** so connections can only point at stores
  that already exist. A cycle cannot be built.
- **Creator disposes.** A composite owns only the leaves it made itself from
  bare values. A store handed to it is not owned: a collection, a store passed
  by name, and an inline `composite(...)` or `primitive(...)` expression all
  count as handed. `composite.$dispose()` disposes its own leaves, unsubscribes
  from every connected store, and leaves connected stores alive, a collection
  and its entries included. A store created inline in a shape is reachable as
  `app.cart`, so `app.cart.$dispose()` is how you dispose it.
- **Lifetime.** A composite connects to its branches until it is disposed. A
  composite that is never disposed stays reachable from every branch it holds,
  so one built per render and never disposed leaks into any long-lived branch it
  shares. After `composite.$dispose()` a write to a shared branch no longer
  reaches that composite.
- **Frozen.** Every store, of all three kinds, is frozen: adding, deleting or
  defining a property throws. The enumerable own keys of a composite are its
  branches and methods; the `$` members are non-enumerable.
- **Disposing a connected store** (`a.$dispose()`): every composite holding it
  keeps its last value readable, `$set` on it is a no-op, and they stop hearing
  from it.
- **Writes pass through.** A `$set` on a composite writes the listed branches
  (see 2.2a); `$reset()` on a composite resets every branch. Because a shared branch is the same store,
  these also change the other composites that hold it. That is what sharing
  means; to get independence, build a second store.
- A composite's `$get()` is stable by identity between changes, and a change
  keeps the identity of every untouched subtree.
- Declared keys are structural and are never dropped.

### 2.4 Notification

Delivery is synchronous, drained in one pass per outermost write. A subscriber
is called **at most once per outermost write**, even when the write touched
several branches or reached it along several paths (a diamond: `d` holding `a`
and `b`, where `b` also holds `a`). A composite's subscribers hear any change of
any connected store below it; a branch's subscribers hear only that branch and
below. A subscriber never observes a half-applied write.

`batch(fn: () => void): void` is a top-level function. Writes made inside `fn`,
to any stores, are one outermost write: subscribers are called at most once,
after `fn` returns. Nested calls join the outer one. If `fn` throws, the writes
already applied stay applied and delivery still happens once. If both `fn` and
delivery throw, an `AggregateError` is thrown whose `errors` are `[fn's error,
delivery's error]`, so neither is masked.

### 2.5 `collection`

```ts
const drafts = collection((org: string) =>
  composite({ lines: primitive<Line[]>([]) })
);
drafts("acme").lines.$use(); // made on first use
drafts.$has("acme");
drafts.$keys();
drafts.$delete("acme"); // resets that entry, then disposes it
drafts.$clear(); // resets and disposes all
```

A collection is a branch like any other: its state is `Record<string, StateOf<C>>`
over the entries that exist, it can sit in a composite, it notifies on entry
added, removed or changed, and disposing it disposes its entries. Keys are
plain strings (`String(id)` for a numeric id).

`$delete(key)` and `$clear()` (and `$reset()`, which is `$clear()`) reset each
removed entry to its initial value inside the same outermost write, so holders,
subscribers and mounted components see the empty state, notified once, and then
dispose it after delivery. Direct `entry.$dispose()` is unchanged: it notifies
the collection, stops writes and keeps the last value.

Creating an entry by **reading** (`drafts("acme")`) does not notify, because a
read can run during a render and must never cause an update. `$set(record)`,
`$delete`, `$clear`, an entry's own change and `entry.$dispose()` notify, as one
outermost write (inside `batch` they join it).

## 3. Persistence

`persist(store, adapter, options)` takes any store and infers the state type from
the store. Adapters keep `createXAdapter(key, options?)` with the key first and
return the tuple `[get, set]` exactly as in 6.0.1, so no destructure changes.
The work already done stays unless the core forces a change:

- adapter format options (`version`, `migrate`, `validate`, envelope,
  absent-from-`parse`). `validate?: (state: unknown) => State | null | undefined`
  runs in the shared read path after the envelope is unwrapped and after
  `migrate` (on the parsed value for an unversioned adapter); `null` or
  `undefined` is absent without logging, and a throw is absent plus
  `console.error`;
  `Persistor`, `hydrate`, `hydrated`, `skipHydration`, `onHydrated`, and the
  echo guard;
- `persist` on a collection takes `(key) => adapter` and persists every entry
  under its own key, stopping an entry's writes when it is disposed. Collection
  `$delete`/`$clear` also remove the entry's stored key (`set(undefined)`), with
  the preceding reset not written back; `entry.$dispose()` leaves the key. The
  collection `Persistor`'s `hydrated` is consistent with a single store: it is
  `true` before `persist(...)`/`hydrate()` returns when every read is
  synchronous, and otherwise flips once, after the entries that existed have
  settled (a rejecting read does not hold it back and is logged). Entries made
  later hydrate as they are made (or wait for `hydrate()` under
  `skipHydration`) and never move the flag back.

A read that fails (rejects or throws) counts as nothing stored: it is logged,
the store is marked hydrated, a later edit is saved, and a value set before the
failure is saved like the absent case below. A failed entry does not hold a
collection's `hydrated` back. `PersistAdapter<Written, Read = Written>` types
`persist(store, adapter)` as `Store<State, Input>` with `Written = State` and
`Read = Input`, both fixed by the store (`NoInfer`), so an adapter typed from the
user's own interface (optional fields) fits without casts and an unrelated one
does not.

Hydration with nothing stored: if the store was changed before hydration finished
(an entry created and set in one tick, a store set before an async read
resolved) and the read resolves to absent, `persist` saves the current value once
(`last` is updated, so it is not repeated). When storage holds a value, that
value wins and nothing is written. An unchanged store writes nothing.

### 3.1 Following storage is the default

A persisted store follows its storage by default. Browser storage is shared
across tabs and windows of the same site (localStorage), so a persisted store
just follows it: a change made elsewhere is read and written to the store, and
nothing is written back.

- Adapters return the plain `[get, set]` tuple with the exact 6.0.1 type; nothing
  is added to it. Whether one can be followed is wired in by its factory and
  remembered in a module-private `WeakMap` keyed by the returned tuple, in the
  style of `nodeOf`; an internal lookup (not exported from
  `app/index.ts`) finds it from the tuple `persist` receives. A hand-built tuple,
  or a copy of one (`[...adapter]`), has no entry and follows nothing, without a
  throw. Pass the adapter itself to `persist`.
- `localAdapter` wires its own watcher (from `storage` events).
- `watch` is typed per adapter. `localAdapter` has none (built-in `storage`
  events), `sessionAdapter` none (per tab), `cookieAdapter` none (cookies cannot
  announce changes). `customAdapter` takes `watch?: StorageWatcher`, your own
  source, registered as given; it announces nothing. `asyncAdapter` takes
  `watch?: true | StorageWatcher`: `true` follows other tabs of the origin
  through a `BroadcastChannel` named after the key and posts `{ removed }` after
  a successful write or removal (nothing happens without `BroadcastChannel`); a
  function is your own watcher and posts nothing. There is no string form.
  Session storage is per tab by design and cookies cannot announce changes, so
  neither has one. `customAdapter` and
  `asyncAdapter` take `watch?: StorageWatcher` in their
  options, the one place users supply one: a function that takes a listener,
  calls it with `{ removed }` when the stored value changes elsewhere, and
  returns a function that stops listening. Without one they follow nothing, with
  no throw and no warning.
- **Removal.** When the stored value is removed elsewhere (`removeItem`,
  `clear()`, an event with key `null` or `newValue` `null`), the store is reset to
  its initial value and nothing is written back. There is no other mode.
- **Option.** `sync?: false` opts out of following. There are no other values and
  no other options for it.
- On a collection, every entry follows its own key the same way and stops when it
  is disposed.
- The public surface is the `watch` option of the two custom adapter factories and
  the exported types `StorageWatcher` and `StorageChange`. `createStorageWatcher` stays internal and
  there is no public `subscribe` alias.
- **Tradeoff.** Another tab's write replaces this tab's in-memory value: last
  write wins. Use `sync: false` to opt out.

## 4. What is destroyed

Delete with their tests, docs, README and CHANGELOG mentions; no aliases:

- `createStore` and its overloads, `CreatedStore`, `BuiltIn`, `Primitives`,
  `Reference` and every type that existed only to guess a kind;
- `createPrimitiveStore` and `createCompositeStore` as names (their engines are
  rebuilt as `primitive` and `composite`);
- promise and async initial values: construct after you `await`;
- `createStoreFamily` and `StoreFamily` (replaced by `collection`);
- `combine` and `Combine` (a shape is spread: `composite({ ...state, ...actions })`);
- `$at` and the path machinery it needs (`Paths`, `ResolvePath`, `StatePath`,
  `store-path` helpers and similar), unless a consumer search shows a use
  that `collection` or a branch cannot serve; report the search either way;
- the runtime use of `isDictionary` to decide a kind.

Keep, if independent of the above: `contextStore`, `useAsync`, `useSync`,
`useVersion`, `cookieStorage`, the five adapters and their format options,
`persist`, `Persistor`, `$onDispose`, `createDisposer`, `createStorageWatcher`.
Anything that only existed for a deleted piece goes with it.

## 5. Acceptance

1. `type-stability.test-d.ts` is rewritten for this API and passes: round-trip
   of branded ids, `Date`, class instances, interfaces, unions, tuples,
   `Map`/`Set`, optional and nullable fields through `primitive`; branches
   print as the child's named store type; a generic helper
   `function wrap<S extends { a: number }>(s: S) { return composite(s).$get() }`
   keeps its methods; `primitive<string | null>(null)` needs no cast.
2. Behaviour tests per section: 2.1 table (every row), 2.2 (every method),
   2.3 (a store shared by two composites is the same object and a write shows in
   both, no copies, diamond delivers once, creator-disposes, disposing a shared
   store leaves holders readable, parent dispose leaves connected stores alive,
   partial set, reset-then-set, identity stability), 2.4 (one delivery per outermost write, no half
   states), 2.5 (lazy make, delete, clear, notifications, dispose), persistence
   on primitive, composite and collection.
3. Existing adapter and `persist` tests keep passing wherever the API they
   test still exists; delete tests of deleted API.
4. Consumers (Africa Exchange, Gauntree) are searched read-only and the
   migration for each use of `createStore`, `createPrimitiveStore`, `combine`,
   `$at` and `createStoreFamily` is written down; the consumers are not edited.

## 6. Order of work

1. **Core:** `primitive`, `composite`, tree rules, notification, dispose,
   reads typed as given. Type-stability file passing for these.
2. **Collection**, then `persist` on a collection.
3. **Destruction:** delete everything in section 4, update docs, README and
   CHANGELOG (breaking changes listed, version untouched).

Rules throughout: uncommitted; no commit, amend, reset, push or publish; the
version in `app/package.json` is untouched; one test file at a time; single
capped `tsc` only; never the whole suite. Stop and ask on any ambiguity in this
spec rather than deciding it silently.
