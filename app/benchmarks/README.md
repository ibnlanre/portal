# Performance measurements

Run from the repository root:

```sh
pnpm --dir app bench
pnpm --dir app build
pnpm --dir app bench:size
```

The runtime suite is separate from correctness tests. It covers 10/100/1,000
sibling keys, depths 3/6/10, and 1/100/1,000 listeners. Each fixture has a wide
`entries` dictionary and a single nested `tree` chain; it is not a fully branching
1,000-way tree. Leaf fan-out listeners share one path. The root-write fan-out case distributes
listeners across the fixture’s entry keys (up to the smaller of key count and
listener count), exercising notification across distinct paths.

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

No claim of being faster or smaller than another library follows from this suite.
The original baseline predates input ownership and stable snapshots. Creation
now includes copying incoming data; root reads return an existing snapshot. Keep
that semantic change in mind when comparing runs.
