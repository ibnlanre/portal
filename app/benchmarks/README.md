# Performance measurements

Run from the repository root:

```sh
pnpm --dir app bench
pnpm --dir app build
pnpm --dir app bench:size
pnpm --dir app bench:bundle
pnpm --dir app bench:memory
```

The runtime suite is separate from correctness tests. It covers 10/100/1,000
sibling keys, depths 3/6/10, and 1/100/1,000 listeners. Each fixture has a wide
`entries` dictionary and a single nested `tree` chain; it is not a fully branching
1,000-way tree. Leaf fan-out listeners share one path. The root-write fan-out case distributes
listeners across the fixture’s entry keys (up to the smaller of key count and
listener count), exercising notification across distinct paths.

Churn groups measure a leaf write after 0, 1,000, and 10,000 historical
subscribe/unsubscribe cycles on unrelated dynamic paths. Registry entries are
reclaimed when the last subscriber for a path leaves, so this cost should stay
flat as the historical path count grows. A separate group measures transient
dynamic-path lookups.

`bench:memory` requires a completed build and `--expose-gc`. It reports retained
heap after 200,000 transient handle lookups, 1,000 held handles, and 50,000
subscribe/unsubscribe cycles. Handles are cached weakly: a handle stays
identical while anything still references it, and collected handles release the
cache entry. The script also asserts that held-handle identity survives and that
transient retention stays small; it is directional evidence, not a portable
memory benchmark.

Measurements include creation, root/leaf reads, leaf/parent writes, notification
fan-out, and React lifecycle work with selected and unrelated updates. The React
cases include mounting, one update, and unmounting in happy-dom using development
React. They distinguish rerender behavior but are not production-browser frame
measurements. Correctness tests separately assert render counts.

The quick baseline uses 100 ms measurements and 30 ms warmups, with minimum
iteration counts. JSON results go to `results/latest.json` (ignored). Use longer
runs, repeat on an idle machine, and inspect relative margin of error before
making comparisons. There are no hard speed assertions in the test suite.

`bench:size` reports npm tarball and unpacked package sizes (using a dry run),
the built distribution's unpacked bytes plus raw, gzip, and
Brotli sizes for the full ESM entry. This includes more exports than an individual
consumer may use and is not a tree-shaken application bundle.
Source maps, CJS, and declarations contribute to distribution size. These are
separate from runtime costs.

`bench:bundle` bundles the built package through esbuild the way a consumer
would: it lays out `dist` and `package.json` under `node_modules`, keeps React
external, and reports minified, gzip, and Brotli bytes for a `createStore`-only
entry and for the full export surface. The difference is the honest tree-shaking
range — use these numbers instead of the full-entry sizes when describing
consumer cost, and re-run after changing module structure because the numbers
depend on the bundle layout.

No claim of being faster or smaller than another library follows from this suite.
The original baseline predates input ownership and stable snapshots. Creation
now includes copying incoming data; root reads return an existing snapshot. Keep
that semantic change in mind when comparing runs.
