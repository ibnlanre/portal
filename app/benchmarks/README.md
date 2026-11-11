# Performance measurements

Run from the repository root:

```sh
pnpm --dir app bench
pnpm --dir app build
pnpm --dir app bench:size
pnpm --dir app bench:bundle
```

The runtime suite is separate from correctness tests. It builds trees of
`composite` stores with 10, 100 and 1,000 sibling leaves and depths 3, 6 and 10,
and measures creation, reads, leaf and branch writes, notification fan-out to
1, 100 and 1,000 listeners, a `collection` filled by key, and React mount,
update and unmount with selected and unrelated writes (happy-dom, development
React). They are not production-browser frame measurements. Correctness tests
separately assert render counts.

The quick baseline uses 100 ms measurements and 30 ms warmups, with minimum
iteration counts. JSON results go to `results/latest.json` (ignored). Use longer
runs, repeat on an idle machine, and inspect relative margin of error before
making comparisons. There are no hard speed assertions in the test suite, and
no baseline is recorded yet for the store model: record one before comparing.

`bench:size` reports npm tarball and unpacked package sizes (using a dry run),
the built distribution's unpacked bytes plus raw, gzip, and Brotli sizes for the
full ESM entry. `bench:bundle` bundles the built package through esbuild the way
a consumer would, keeping React external, and reports minified, gzip, and Brotli
bytes for a `primitive`-only entry and for the full export surface. The
difference is the honest tree-shaking range.

No claim of being faster or smaller than another library follows from this
suite.
