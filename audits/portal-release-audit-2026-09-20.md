# Portal release audit — 2026-09-20

**Verdict: Ready after specific fixes. Do not publish the current artifact.**

Reviewed commit `97d3167`, package `@ibnlanre/portal@6.0.0-alpha.0`. This was a fresh inspection of source, declarations, public exports, documentation, tests, and the packed artifact. No implementation changes were made. Prior audit conclusions were not treated as evidence.

## Release blockers

### R1. A signing-configured cookie adapter accepts unsigned data

[create-cookie-storage-adapter, line 43](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/functions/adapters/create-cookie-storage-adapter/index.ts:43) verifies a signature, then falls through to parsing the original cookie when verification fails.

Packed-package reproduction, using only the public API:

```ts
const [get, set] = createCookieStorageAdapter("signed-audit", {
  secret: "audit-secret",
});
set({ role: "reader" });
document.cookie = 'signed-audit={"role":"admin"}; path=/';
get({ role: "fallback" }); // { role: "admin" }
```

The configured integrity check is bypassed. Reject invalid/unsigned values when verification is requested; do not fall back to trusting them. Separately, a secret shipped to the browser cannot establish trust against that browser's user. The cookie guide's role/tampering example needs to respect that boundary. This finding concerns the adapter: the low-level `unsign` function correctly returns `null` for invalid input.

### R2. Public branch types do not consistently describe runtime branches

[StoreValueResolver, line 16](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/types/store-value-resolver/index.ts:16) treats arrays and other object-shaped built-ins as composite stores. The runtime does not expose their corresponding members. These expressions compile against the packed declarations:

```ts
const s = createStore({ items: [{ name: "A" }], created: new Date(0) });
s.items.map(item => item.name.$get()); // TypeError: s.items.map is not a function
s.created.getTime();                  // runtime member is undefined
```

The opposite mismatch occurs with a normal interface, because the composite creation overload requires `Dictionary`:

```ts
interface State { profile: { name: string } }
const s = createStore<State>({ profile: { name: "A" } });
s.profile.name.$get(); // compile error: profile absent on PrimitiveStore<State>
s.$at("profile.name"); // compile error; the runtime actually has $at
```

See [createStore, line 33](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/index.ts:33). A dictionary lookup also promises a present value even with `noUncheckedIndexedAccess` enabled:

```ts
const s = createStore({ users: {} as Record<string, { name: string }> });
const name: string = s.users.$at("missing").$get().name; // compiles, then throws
```

Align classification and absence typing before release. These are everyday consumer types, not exotic type-level edge cases. Invalid literal paths, invalid setter values, and ordinary read-only snapshot mutations were correctly rejected in the external consumer.

### R3. Notification delivery is unsafe under reentrancy and exceptions

[notifySubscribers, line 60](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/functions/library/create-composite-store/index.ts:60) continues delivering the outer write's captured state after a subscriber performs another write:

```ts
const s = createStore({ a: 0, b: 0 });
const seen: unknown[] = [];
s.a.$subscribe(() => s.b.$set(1), false);
s.$subscribe(value => seen.push(value), false);
s.a.$set(1);
// seen: [{ a: 1, b: 1 }, { a: 1, b: 0 }]
// s.$get(): { a: 1, b: 1 }
```

A persistence subscriber can consequently finish with older state than the store. Separately, when an earlier listener throws, later listeners are skipped even though the new state is already committed. A primitive-store probe ended with state `1` and a later observer still at `0`. This can arise from ordinary storage errors, not just intentionally hostile callbacks.

Establish ordered delivery under nested writes and an error policy that does not strand remaining observers. This is distinct from the deliberate same-value/broad-root notification contract.

### R4. Literal dotted keys silently address another branch

[Path joining, line 170](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/functions/library/create-composite-store/index.ts:170) uses the same dotted string for literal property access and structural paths:

```ts
const s = createStore({ "a.b": 1, a: { b: 2 } });
s["a.b"].$get();  // 2, not 1
s["a.b"].$set(3);
s.$get();        // { "a.b": 1, a: { b: 3 } }
```

The two locations even return the same handle. Dotted IDs are plausible dictionary keys, so this violates the central location-identity promise. Either support unambiguous literal keys or explicitly reject unsupported keys; silently routing a write elsewhere is not an acceptable limitation. Empty and accessor-name keys also need a defined supported-key policy.

### R5. Public dependency helpers can silently retain stale results

[compare](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/functions/helpers/compare/index.ts:10) compares serialized dependencies. [stringify](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/functions/helpers/stringify/index.ts:89) sorts arrays and represents functions by source text, losing dependency order and closure identity.

Packed React probes:

- `useSync(() => a + "-" + b, [a, b])` remained `"1-2"` after props changed from `(1, 2)` to `(2, 1)`.
- Replacing `make(1)` with `make(2)`, where `make = x => () => x`, in a function dependency left the selected result at `1`.

`useVersion` supplies this comparison to `useSync`, `useAsync`, and the selector dependency mechanism. The probes directly demonstrate `useSync` failures; fresh inline `$use` selectors can mask the comparison defect by changing selector identity. Do not generalize the result to every `$use` update. Correct the comparator contract or withhold these convenience APIs from the release surface.

### R6. The packed entry requires a global absent from the declared Node range

[package.json, line 34](/Users/ibnlanre/Desktop/workspace/portal/app/package.json:34) declares Node `>=14`. Both ESM and CJS imports throw `ReferenceError: File is not defined` when `globalThis.File` is absent. The bundled `@ibnlanre/clone` module initializes a default registry referencing `File` at module evaluation, even when a consumer only wants `createStore`.

Reproduction against the installed tarball:

```js
delete globalThis.File;
await import("@ibnlanre/portal"); // ReferenceError before any store is created
```

This was an absent-global probe on Node 22, not an actual Node 14/18 run. Node documents the global `File` as [added in Node 20](https://nodejs.org/download/release/v22.17.0/docs/api/globals.html#class-file), establishing the incompatible precondition. Remove the eager dependency on unavailable globals or narrow and validate the runtime support declaration. Passing export-resolution checks does not test this runtime requirement.

## Should fix before release

- **Make the first context example durable.** The guide's `(props) => createStore(props.start)` factory creates a new store on every provider render. The public example reset a counter from `11` to `10` on a parent rerender with the same input. A `useState`-initialized factory passed. Lifetime is explained later, but the first runnable example should teach the safe default. [Example](/Users/ibnlanre/Desktop/workspace/portal/docs/content/docs/advanced/context-store.mdx:33).
- **Correct contradictory examples.** The README promises an old subscriber value that is never delivered; the required two-argument example does not match the callback type. The cookie guide checks `false` where `unsign` returns `null`. The custom async adapter example omits required `removeItem`. Classic unpkg/jsDelivr script tags are not a valid standalone browser build for the published ESM/CJS artifact. [README subscription section](/Users/ibnlanre/Desktop/workspace/portal/README.md:710), [cookie guide](/Users/ibnlanre/Desktop/workspace/portal/docs/content/docs/guides/cookie-storage.mdx:71), [persistence guide](/Users/ibnlanre/Desktop/workspace/portal/docs/content/docs/guides/persistence.mdx), [getting started](/Users/ibnlanre/Desktop/workspace/portal/docs/content/docs/getting-started/index.mdx).
- **Tighten the supported ownership boundary.** A typed view backed by `SharedArrayBuffer` retains the external buffer: writing `input[0] = 9` changed the stored view to `9` without `$set`. Either copy or explicitly exclude shared-memory views. A non-enumerable own sibling present in an initial snapshot disappeared after an unrelated leaf write because ancestor copying uses spread. Preserve such fields or clearly constrain supported records. [Ingestion](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/functions/helpers/clone-state/index.ts:25), [ancestor copy](/Users/ibnlanre/Desktop/workspace/portal/app/create-store/functions/library/create-composite-store/index.ts:94).
- **Document persistence feedback, not just merge restoration.** With the documented `store.$subscribe(save, false)` plus `syncStorage` wiring, an external removal restored the baseline and wrote the removed key back to storage. The observed local value became `{"a":1}` again. Clarify whether that write-back is intended; the existing isolated reset contract misses this interaction.
- **Complete package contents.** The tarball contains eight distribution files and package metadata, but no README or LICENSE. Include the appropriate package documentation and license notices. The metadata says BSD-3-Clause; the repository license currently stays outside the packed `app` directory.

## Acceptable v1 limitations

These do not independently justify delaying release when taught explicitly:

- Plain-object `$set` merges rather than replaces; omitted keys survive. There is no true dictionary-key deletion operation. Deleting a draft property does not make a merge delete it from state.
- Arrays are whole values rather than element stores, once their public types match that fact.
- Raw notifications are synchronous and write-based. Same-value writes notify; root writes notify all registered paths. Equality-gated React renders are a separate contract.
- Snapshots are read-only by contract, not frozen. Direct mutation is unsupported, including callable built-in mutators that TypeScript does not remove. Opaque functions/classes and other excluded values remain references. Date/Map/Set inputs are atomic replacements rather than content-equality comparisons.
- `$at` can materialize a declared absent path; dot access requires a property present initially or currently. Types do not create runtime properties.
- React 19 is required. SSR needs appropriately scoped stores and consistent server/client initial state; a module-global store is not request isolation.
- Storage reads do not validate arbitrary persisted data merely because a generic state type was supplied.

## Post-release opportunities and scaling

The existing benchmark methodology correctly distinguishes creation, reads, writes, fan-out, and React mount/update/unmount. It does not establish a competitive advantage or a universal "lightweight" runtime claim. Its wide dictionary is a sibling of the narrow leaf-write path; those leaf results are not evidence of width-independent updates.

Structural sharing avoids recursively copying untouched subtrees, but copying a changed wide ancestor still scales with width. Root notifications still scan registered paths. Creation now pays ingestion-copy cost. These are coherent tradeoffs, not correctness defects.

One additional packed-package probe measured leaf writes after subscribing and immediately unsubscribing from distinct dictionary paths:

| Historical, now-unsubscribed paths | Approximate µs per leaf write |
|---:|---:|
| 0 | 0.36 |
| 1,000 | 21 |
| 10,000 | 205 |
| 20,000 | 404 |

This was a short, single-process directional measurement, not a release threshold. Empty subscriber sets remain in the map, so update cost follows historical registrations as well as active subscriptions. The path-handle map also strongly retains every accessed handle while the root lives. Reclaim empty subscription entries first; investigate handle-cache lifetime and subscriber indexing for long-running dynamic applications. Existing fixed-population benchmarks do not cover churn.

Other opportunities: executable documentation examples, representative browser hydration/concurrency tests, and measuring a tree-shaken consumer bundle. The package has no `sideEffects` declaration, and its bundled helpers perform module-level initialization; do not advertise minimal import cost without measuring a real consumer build.

## API review and fresh-user exercise

The strongest part of Portal is passing a focused branch to a child and using the same `$get`/`$set`/`$use` vocabulary there. The fresh child-component exercise rendered the updated theme correctly; its retained handle remained identical to `$at` access. The opening docs now explain that distinctive model early.

| Exercise/API | Assessment |
|---|---|
| Primitive store | Direct value, functional setter, and React tuple were straightforward. |
| Structured state / branch passed to child | Coherent and useful. Retained handles and partial-root sharing passed. |
| `$use(selector)` | Render gating worked in the tested cases. An important exception: its setter still writes the addressed **store**, not the selected result. Prefer `store.count.$use()` for a writable count; `[count, setRoot] = store.$use(s => s.count)` is not a numeric `useState` pair. |
| Optional path | `$at("profile.name")` read absence and materialized parents on write. Using `$at` instead of optional dot chaining needs to be learned explicitly. |
| Dynamic dictionary | `$at` writes work, but absent-result typing and dotted keys currently undermine trust. |
| Context/provider | Memoized ownership works, including SSR. The first example loses state on rerender; persistence should not be an "advanced" discovery. |
| Persistence | Get/create/subscribe is understandable. The caller must own both cleanups, errors, validation, and external-event write-back policy. |
| Object updates | Deep merge is coherent, but `$set` means something different for records and arrays. Mutable drafts can look like recipes despite being returned merge inputs. |
| Async creation | `await createStore(Promise.resolve({name:"A"}))` returns a whole-value store with no `name` branch; `createStore({name:"A"})` returns branches. Documented, but it makes construction history affect the model. Await data before creating the store when branch access is wanted. |

I would keep the core surface small. `createContextStore` and basic persistence support real ownership boundaries. `combine` has an understandable composition role; direct primitive/composite constructors are useful only if their deliberate whole-value/branch distinction is explained. `useSync`, `useAsync`, `useVersion`, and the extensive cookie utilities broaden the product significantly, and now contribute real release risk. They need not be removed merely for being peripheral, but they should not define the introductory story. No new mutation API is needed to resolve the blockers above.

## Contract summary

For supported plain state, a branch handle identifies a location and follows later values there. Reads expose stable shared snapshots; writes copy supported inputs and preserve unchanged branches. Functional updaters receive defensive copies and must return an update. Objects merge, arrays and other values replace. Raw subscriptions observe writes, while React selectors gate store-driven rendering using `Object.is`. Hook subscriptions and setters follow store switching. `$at` reaches absent declared paths and materializes missing object parents on writes.

That explanation is coherent. It is not yet an unconditional guarantee: key collisions, branch-type mismatches, notification dispatch, and the ownership edge cases above are observed exceptions that still need resolution or explicit scope restrictions.

## Verification and limits

- Current source: **1,128 tests in 103 files passed**. TypeScript **6.0.3** and ESLint passed. The previous TypeScript 7 lint gap is not present in this checkout.
- Package build and `attw --pack` passed. Docs production build/prerender passed. A successful docs build does not typecheck fenced examples.
- Packed artifact: **94,631 bytes compressed; 388,499 bytes unpacked**, nine files. Named public APIs, ESM/CJS entries, declarations and sourcemaps are present; no separate tests or internal module subpaths are exported. Sourcemaps embed source content, including bundled dependency code.
- An isolated external consumer typechecked supported workflows against the packed declarations with strict checking and without `skipLibCheck`. A separate adversarial type exercise exposed the mismatches described above.
- Offline npm installation of the tarball passed with peer resolution disabled and locally supplied React/React DOM **19.2.7**. Installed ESM, CJS, and DOM-free server rendering passed on Node **22.19.0**. This did not test a registry download or automatic peer installation; the initial offline peer-resolution attempt lacked cached React registry metadata.
- Packed-package React probes used happy-dom, including Strict Mode/store switching, selected snapshots, provider rerenders, and branch-to-child composition. This is not a full browser/hydration or React-19-version matrix.
- Temporary consumers and adversarial probe files were removed after recording these results. No implementation or permanent test changes were made.

The passing gates support the working subset. They do not negate the reproduced failures. Close R1–R6 with public behavioral regressions, then repeat the packed-consumer checks before publishing.
