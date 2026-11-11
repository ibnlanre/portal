import { act, renderHook } from "@testing-library/react";
import { bench, describe } from "vitest";

import { collection } from "../create-store/functions/library/collection";
import { composite } from "../create-store/functions/library/composite";
import { primitive } from "../create-store/functions/library/primitive";

// Short local baseline; increase duration for publication-quality measurements.
const options = {
  iterations: 20,
  time: 100,
  warmupIterations: 5,
  warmupTime: 30,
};

function deepest(root: ReturnType<typeof tree>["nested"], depth: number) {
  let node: any = root;
  for (let level = 1; level < depth; level++) node = node.child;
  return node as { value: ReturnType<typeof primitive<number>> };
}

function tree(keys: number, depth: number) {
  let nested = composite({ value: 0 });
  for (let level = 1; level < depth; level++) {
    nested = composite({ child: nested }) as unknown as typeof nested;
  }
  const entries = composite(
    Object.fromEntries(Array.from({ length: keys }, (_, i) => [`key${i}`, i]))
  );
  return { entries, nested };
}

for (const keys of [10, 100, 1000]) {
  for (const depth of [3, 6, 10]) {
    describe(`${keys} leaves / depth ${depth}`, () => {
      const root = composite(tree(keys, depth));
      const leaf = deepest(root.nested as never, depth).value;
      let value = 0;

      bench("creation", () => void composite(tree(keys, depth)), options);
      bench("root $get (stable)", () => void root.$get(), options);
      bench("leaf $get", () => void leaf.$get(), options);
      bench("leaf $set", () => leaf.$set(++value), options);

      for (const count of [1, 100, 1000]) {
        const fanout = composite(tree(keys, depth));
        const target = deepest(fanout.nested as never, depth).value;
        for (let i = 0; i < count; i++)
          target.$subscribe(() => {}, { immediate: false });
        bench(
          `leaf write / ${count} listeners`,
          () => target.$set(++value),
          options
        );
      }

      const select = (state: { entries: Record<string, number> }) =>
        state.entries.key0;
      bench(
        "React mount + unrelated write + unmount",
        () => {
          const hook = renderHook(() => root.$use(select));
          act(() => leaf.$set(++value));
          hook.unmount();
        },
        options
      );
    });
  }
}

describe("collection", () => {
  const drafts = collection((_key: string) => primitive(0));
  let value = 0;
  bench(
    "1,000 entries made by key, then cleared",
    () => {
      for (let index = 0; index < 1_000; index++)
        drafts(String(index)).$set(++value);
      drafts.$clear();
    },
    options
  );
});
