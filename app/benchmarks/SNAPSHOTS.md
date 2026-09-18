# Stable snapshot measurements

Recorded 2026-09-18 on Apple M1 Pro, macOS arm64, Node 22.19.0.

All 117 cases completed using the existing fixture and short-run settings.
Mean microseconds per operation, with relative margin of error; depth 6:

| Operation | 10 keys | 100 keys | 1,000 keys |
|---|---:|---:|---:|
| creation | 6.96 ±10.1% | 52.57 ±5.8% | 715.53 ±9.9% |
| root $get (stable snapshot) | 0.12 ±0.8% | 0.12 ±2.1% | 0.12 ±0.2% |
| leaf $get | 1.80 ±0.9% | 1.80 ±2.0% | 2.66 ±5.8% |
| leaf $set | 3.19 ±1.3% | 3.24 ±3.2% | 5.02 ±37.1% |
| parent $set | 4.20 ±2.0% | 4.30 ±4.3% | 4.45 ±6.5% |
| leaf write / 1 listeners | 4.05 ±1.4% | 4.12 ±3.0% | 4.23 ±5.4% |
| root write / 1 distributed listeners | 5.64 ±2.1% | 50.83 ±3.6% | 687.22 ±8.1% |
| leaf write / 100 listeners | 5.02 ±1.4% | 5.11 ±3.3% | 5.24 ±5.2% |
| root write / 100 distributed listeners | 9.98 ±1.7% | 97.42 ±3.0% | 768.95 ±9.4% |
| leaf write / 1000 listeners | 13.74 ±0.9% | 13.75 ±2.3% | 15.02 ±3.1% |
| root write / 1000 distributed listeners | 19.62 ±1.4% | 108.61 ±3.7% | 1,351.80 ±11.0% |
| React mount + unrelated write + unmount | 122.30 ±21.7% | 121.57 ±28.6% | 123.76 ±26.1% |
| React mount + selected write + rerender + unmount | 130.21 ±24.3% | 174.61 ±18.2% | 842.50 ±10.9% |

## Interpretation

The [original baseline](BASELINE.md) remains historical. Reads now return an
existing snapshot; creation now pays to copy incoming data. Those operations
have changed semantics, so this is not an equivalent-work speed comparison.
At 1,000 keys the current root read measured about 0.12 µs, while creation
measured about 716 µs. The input-ownership cost is real and should remain visible.

A partial root write no longer recursively clones unrelated subtrees. It still
copies wide changed ancestors and delivers the existing broad raw notifications.
At 1,000 keys, the root-write case measured about 687 µs with one listener and
1,352 µs with 1,000 distributed listeners. Narrow-path write timings do not
establish width-independent writes: the wide entries dictionary is a sibling
of the narrow tree path in this fixture.

Small writes are not uniformly faster than the original baseline. Copying
inputs and tracking structural equality also cost work. React numbers include
mount/update/unmount in development React and happy-dom; they are not browser
frame timings. See the [methodology](README.md) and repeat longer controlled
runs before making performance claims. No timing thresholds were added to tests.

Raw output is generated at `results/latest.json` (ignored by Git).
