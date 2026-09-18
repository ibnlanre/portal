# Local performance baseline

Recorded 2026-09-17 on Apple M1 Pro, macOS arm64, Node 22.19.0.

117 cases completed across 10/100/1,000 keys, depths 3/6/10, and
1/100/1,000 listeners. These are short exploratory runs, not release thresholds.
Each sample below is mean microseconds per operation with relative margin of error.
Creation and React timings are particularly noisy; do not rank libraries or
claim a speedup from these measurements. The React rows include mount and unmount.

Representative depth-6 results:

| Operation | 10 keys | 100 keys | 1,000 keys |
|---|---:|---:|---:|
| creation | 1.87 ±33.5% | 1.24 ±33.3% | 2.60 ±47.8% |
| root $get (defensive clone) | 2.38 ±3.2% | 14.74 ±7.4% | 559.54 ±12.5% |
| leaf $get | 1.87 ±0.4% | 1.87 ±0.7% | 2.02 ±6.3% |
| leaf $set | 2.52 ±1.3% | 2.65 ±6.1% | 2.75 ±8.2% |
| parent $set | 2.70 ±2.0% | 2.76 ±5.7% | 2.96 ±10.6% |
| leaf write / 1 listeners | 3.43 ±2.2% | 3.53 ±5.4% | 3.67 ±8.6% |
| root write / 1 distributed listeners | 3.99 ±3.7% | 29.81 ±8.6% | 1,278.23 ±14.9% |
| leaf write / 100 listeners | 4.36 ±1.3% | 4.42 ±3.3% | 4.64 ±8.4% |
| root write / 100 distributed listeners | 8.06 ±2.7% | 74.24 ±5.4% | 1,396.55 ±17.6% |
| leaf write / 1000 listeners | 13.14 ±0.4% | 13.31 ±3.5% | 13.60 ±6.1% |
| root write / 1000 distributed listeners | 17.43 ±1.9% | 87.05 ±6.6% | 1,823.39 ±13.3% |
| React mount + unrelated write + unmount | 118.25 ±20.0% | 145.47 ±24.1% | 844.95 ±19.9% |
| React mount + selected write + rerender + unmount | 111.02 ±14.1% | 177.70 ±23.4% | 2,201.69 ±16.6% |

Root reads clone the entire fixture. Leaf writes copy ancestors along a narrow
path; in this fixture the large entries dictionary is a sibling of that path.
Root fan-out writes also clone/merge state, so their cost is not solely subscriber
delivery. Leaf fan-out measures many listeners on one path; distributed fan-out
spreads listeners across entry keys. See [methodology](README.md) for commands
and fixture details.

The generated raw JSON is available locally at `results/latest.json` and is
ignored by Git. Repeat longer runs on an idle machine before performance claims.

## Built package footprint

Measured after the concurrent schema API removals, with `npm pack --dry-run`
and the current rebuilt distribution. Sizes are bytes.

| Artifact | Bytes |
|---|---:|
| npm tarball | 86,683 |
| Unpacked package | 360,274 |
| Built distribution | 357,349 |
| Full ESM entry | 20,517 |
| Full ESM gzip | 7,225 |
| Full ESM Brotli | 6,484 |

The full ESM entry is not a tree-shaken consumer bundle; no dependency-relative
size claim is implied.
