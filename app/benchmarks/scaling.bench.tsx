import { bench, describe } from "vitest";

import { composite } from "../create-store/functions/library/composite";
import { primitive } from "../create-store/functions/library/primitive";

// Write + read cost over width (leaves per composite) and depth (levels). The
// expected shape is cost ~ depth x width per write, with no growth from the
// number of paths or from historical activity.
const options = {
  iterations: 20,
  time: 100,
  warmupIterations: 5,
  warmupTime: 30,
};

type Level = ReturnType<typeof composite>;

/** One composite per level: `width` leaves, plus the next level as `child`. */
function build(width: number, depth: number) {
  const leaves: Array<ReturnType<typeof primitive<number>>> = [];
  let deepest: ReturnType<typeof primitive<number>> | undefined;
  let child: Level | undefined;
  for (let level = depth; level >= 1; level--) {
    const shape: Record<string, unknown> = {};
    for (let key = 0; key < width; key++) {
      const leaf = primitive(0);
      shape[`k${key}`] = leaf;
      if (level === depth && key === 0) deepest = leaf;
      if (level === 1) leaves.push(leaf);
    }
    if (child) shape.child = child;
    child = composite(shape);
  }
  return { deepest: deepest!, leaves, root: child! };
}

/** A partial state naming every leaf at every level. */
function everything(width: number, depth: number, value: number) {
  let partial: Record<string, unknown> | undefined;
  for (let level = depth; level >= 1; level--) {
    const next: Record<string, unknown> = {};
    for (let key = 0; key < width; key++) next[`k${key}`] = value;
    if (partial) next.child = partial;
    partial = next;
  }
  return partial!;
}

for (const width of [10, 100, 1000]) {
  for (const depth of [1, 5, 10, 20]) {
    describe(`width ${width} / depth ${depth}`, () => {
      const { deepest, root } = build(width, depth);
      const partials = [
        everything(width, depth, 1),
        everything(width, depth, 2),
      ];
      let value = 0;

      bench(
        "deepest leaf write + root $get",
        () => {
          deepest.$set(++value);
          root.$get();
        },
        options
      );
      bench(
        "root partial $set of every branch + root $get",
        () => {
          (root as any).$set(partials[++value % 2]);
          root.$get();
        },
        options
      );
    });
  }
}
