/**
 * Verifies that the built package can be imported in a runtime without
 * browser-only globals. The package declares Node support in `engines`; this
 * check deletes globals that are newer than that declaration before importing.
 */
const missingGlobals = ["Blob", "File", "FormData", "window", "document"];

const deletions = missingGlobals.map((key) => {
  const existed = key in globalThis;
  delete globalThis[key];
  return [key, existed];
});

const failures = [];

function smoke(name, createStore) {
  try {
    const store = createStore({ nested: { value: 1 }, other: 0 });
    store.nested.value.$set(2);
    if (store.nested.value.$get() !== 2) {
      throw new Error("nested write did not round-trip");
    }
    if (store.$get().other !== 0) throw new Error("untouched value changed");

    const primitive = createStore(0);
    primitive.$set((current) => current + 1);
    if (primitive.$get() !== 1) throw new Error("primitive write failed");
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

const esm = await import("../dist/index.js");
smoke("esm", esm.createStore);

const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
const cjs = require("../dist/index.cjs");
smoke("cjs", cjs.createStore);

const overview = deletions
  .map(([key, existed]) => `${key}:${existed ? "removed" : "absent"}`)
  .join(" ");

if (failures.length) {
  console.error(`Runtime compatibility check failed (${overview})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Runtime compatibility check passed (${overview})`);
}
