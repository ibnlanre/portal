import { act, renderHook } from "@testing-library/react";
import { bench, describe } from "vitest";
import { createStore } from "../create-store";

// Short local baseline; increase duration for publication-quality measurements.
const options = {
  time: 100,
  iterations: 20,
  warmupTime: 30,
  warmupIterations: 5,
};

function fixture(keys: number, depth: number): Record<string, unknown> {
  let tree: Record<string, unknown> = { value: 0 };
  for (let i = 1; i < depth; i++) tree = { child: tree };
  return {
    entries: Object.fromEntries(
      Array.from({ length: keys }, (_, i) => [`key${i}`, i])
    ),
    tree,
  };
}

for (const keys of [10, 100, 1000]) {
  for (const depth of [3, 6, 10]) {
    describe(`${keys} keys / depth ${depth}`, () => {
      const initial = fixture(keys, depth);
      const path = [
        "tree",
        ...Array.from({ length: depth - 1 }, () => "child"),
        "value",
      ].join(".");
      const parentPath = path.slice(0, path.lastIndexOf("."));
      const store = createStore(initial);
      let value = 0;
      bench(
        "creation",
        () => {
          createStore(initial);
        },
        options
      );
      bench(
        "root $get (defensive clone)",
        () => {
          store.$get();
        },
        options
      );
      bench(
        "leaf $get",
        () => {
          store.$at(path).$get();
        },
        options
      );
      bench(
        "leaf $set",
        () => {
          store.$at(path).$set(++value);
        },
        options
      );
      bench(
        "parent $set",
        () => {
          store.$at(parentPath).$set({ value: ++value });
        },
        options
      );

      for (const count of [1, 100, 1000]) {
        const fanout = createStore(initial);
        for (let i = 0; i < count; i++)
          fanout.$at(path).$subscribe(() => {}, false);
        bench(
          `leaf write / ${count} listeners`,
          () => {
            fanout.$at(path).$set(++value);
          },
          options
        );
        const distributed = createStore(initial);
        for (let i = 0; i < count; i++)
          distributed.$at(`entries.key${i % keys}`).$subscribe(() => {}, false);
        bench(
          `root write / ${count} distributed listeners`,
          () => {
            distributed.$set({ entries: { key0: ++value } });
          },
          options
        );
      }

      const select = (state: Record<string, unknown>) =>
        (state.entries as Record<string, number>).key0;
      bench(
        "React mount + unrelated write + unmount",
        () => {
          const hook = renderHook(() => store.$use(select));
          act(() => store.$at(path).$set(++value));
          hook.unmount();
        },
        options
      );
      bench(
        "React mount + selected write + rerender + unmount",
        () => {
          const hook = renderHook(() => store.$use(select));
          act(() => store.$at("entries").$set({ key0: ++value }));
          hook.unmount();
        },
        options
      );
    });
  }
}
