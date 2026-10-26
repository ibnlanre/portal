# Local performance baseline

Recorded 2026-09-20 on Apple M1 Pro, macOS arm64 (26.0.1), Node 22.19.0.

This run includes subscription-registry reclamation, the weak handle cache,
input ownership, and stable snapshots. It replaces the 2026-09-17 baseline,
which predated steady-state snapshots and churn handling. These are short
exploratory runs, not release thresholds. Each sample below is mean microseconds
per operation with relative margin of error. Creation and React timings are
particularly noisy; do not rank libraries or claim a speedup from these
measurements. The React rows include mount and unmount.

Representative depth-6 results:

| Operation                                         |       10 keys |      100 keys |     1,000 keys |
| ------------------------------------------------- | ------------: | ------------: | -------------: |
| creation                                          |   7.72 ±12.4% |   54.10 ±7.0% |   690.33 ±8.6% |
| root $get (stable snapshot)                       |    0.12 ±0.3% |    0.13 ±0.3% |     0.13 ±0.3% |
| leaf $get                                         |    2.56 ±1.8% |    2.67 ±3.5% |     2.86 ±8.5% |
| leaf $set                                         |   10.16 ±3.2% |   10.62 ±5.1% |    10.98 ±8.0% |
| parent $set                                       |   10.36 ±2.9% |   11.01 ±6.5% |    11.53 ±9.6% |
| leaf write / 1 listeners                          |   12.39 ±2.7% |   13.06 ±5.9% |    13.81 ±9.4% |
| leaf write / 100 listeners                        |   15.27 ±3.1% |   16.14 ±6.1% |    17.32 ±9.4% |
| leaf write / 1000 listeners                       |   47.35 ±3.9% |   52.09 ±7.7% |   55.46 ±10.6% |
| root write / 1 distributed listeners              |    5.61 ±2.9% |   52.84 ±5.1% |   711.26 ±9.8% |
| root write / 100 distributed listeners            |   14.19 ±3.2% |  132.89 ±6.1% |   790.61 ±9.4% |
| root write / 1000 distributed listeners           |   47.83 ±4.1% |  169.32 ±6.2% | 1,738.03 ±9.5% |
| React mount + unrelated write + unmount           | 129.20 ±16.6% | 127.80 ±20.9% |  143.55 ±26.1% |
| React mount + selected write + rerender + unmount | 129.31 ±17.2% | 196.31 ±22.9% |  880.89 ±12.5% |

Root reads return the existing snapshot, so width barely affects them. Root
writes still copy/merge the whole state, so their cost follows width. Leaf
writes copy ancestors along a narrow path; in this fixture the large `entries`
dictionary is a sibling of that path. Leaf fan-out measures many listeners on
one path; distributed fan-out spreads listeners across entry keys. See
[methodology](README.md) for commands and fixture details.

The generated raw JSON is available locally at `results/latest.json` and is
ignored by Git. Repeat longer runs on an idle machine before performance claims.

## Churn: historical paths do not tax later writes

The subscription registry reclaims a path's entry when its last subscriber
unsubscribes, and handle proxies are cached weakly. A leaf write that shares no
path with retired subscriptions therefore stays flat as the historical path
count grows:

| Historical subscribe/unsubscribe paths | Leaf write (µs) |
| -------------------------------------: | --------------: |
|                                      0 |     4.85 ±12.7% |
|                                  1,000 |     4.78 ±11.6% |
|                                 10,000 |     4.79 ±12.4% |

Transient dynamic-path lookups (1,000 per sample) measure allocation plus
`WeakRef` overhead at 1,575 µs per 1,000 lookups in this run.

`bench:memory` (`node --expose-gc benchmarks/memory.mjs`) records retained heap
after the heap settles: 200,000 transient handle lookups retain ~0.1 MB, 1,000
held handles retain ~1.3 MB while preserving identity, and 50,000
subscribe/unsubscribe cycles retain ~0.1 MB beyond the held handles. The script
fails if held-handle identity breaks or transient retention exceeds 32 MB.
Numbers are directional evidence from one process, not a portable benchmark.

## Built package footprint

Measured with `npm pack --dry-run` and the current rebuilt distribution. Sizes
are bytes.

| Artifact           |   Bytes |
| ------------------ | ------: |
| npm tarball        |  87,224 |
| Unpacked package   | 355,745 |
| Built distribution | 348,779 |
| Full ESM entry     |  18,892 |
| Full ESM gzip      |   6,549 |
| Full ESM Brotli    |   5,923 |

Tree-shaken consumer bundles via `bench:bundle` (esbuild, React external):

| Entry               | Minified |  Gzip | Brotli |
| ------------------- | -------: | ----: | -----: |
| `createStore` only  |    8,477 | 3,280 |  3,007 |
| Full export surface |   18,544 | 6,826 |  6,150 |

The full-entry numbers still include exports an individual consumer may not
use; use the consumer bundle range for size discussions, and rerun both scripts
after structural changes.
