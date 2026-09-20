/**
 * Measures retained memory for the handle cache and subscription registry.
 * Transient dynamic-path lookups must not accumulate while the root store is
 * alive; handles that callers still hold must keep their identity.
 *
 * Run with: node --expose-gc benchmarks/memory.mjs
 */
import { createStore } from "../dist/index.js";

if (typeof globalThis.gc !== "function") {
  console.error("Run with `node --expose-gc benchmarks/memory.mjs`");
  process.exit(1);
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

/** Collect until the heap stops shrinking, giving finalizers turns to run. */
async function heap() {
  let previous = Number.POSITIVE_INFINITY;
  for (let round = 0; round < 30; round++) {
    globalThis.gc();
    await settle();
    const current = process.memoryUsage().heapUsed;
    if (previous - current < 256 * 1024) return current;
    previous = current;
  }
  return process.memoryUsage().heapUsed;
}

const store = createStore({
  entries: /** @type {Record<string, number>} */ ({}),
  leaf: { value: 0 },
});

const baseline = await heap();

for (let index = 0; index < 200_000; index++) {
  store.$at(`transient.key${index}`).$get();
}
store.$get();
const afterTransientLookups = await heap();

const held = [];
for (let index = 0; index < 1_000; index++) {
  held.push(store.$at(`held.key${index}`));
}
const afterHeldHandles = await heap();
const identityPreserved = held.every(
  (handle, index) => store.$at(`held.key${index}`) === handle
);

for (let index = 0; index < 50_000; index++) {
  const unsubscribe = store
    .$at(`entries.key${index}`)
    .$subscribe(() => {}, false);
  unsubscribe();
}
const afterSubscriptionChurn = await heap();

const report = {
  afterHeldHandlesBytes: afterHeldHandles - baseline,
  afterSubscriptionChurnBytes: afterSubscriptionChurn - baseline,
  afterTransientLookupsBytes: afterTransientLookups - baseline,
  baselineBytes: baseline,
  heldHandleCount: held.length,
  identityPreserved,
  node: process.version,
  transientPathCount: 200_000,
};

console.log(JSON.stringify(report, null, 2));

const transientRetention = report.afterTransientLookupsBytes;
if (!identityPreserved) {
  console.error("Held handle identity was not preserved");
  process.exitCode = 1;
} else if (transientRetention > 32 * 1024 * 1024) {
  console.error(
    `Transient lookups retained ${(transientRetention / 1024 / 1024).toFixed(1)} MB after collection`
  );
  process.exitCode = 1;
}
