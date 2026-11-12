import type { RefStore } from "@/create-store/types/ref-store";

import { createDisposer } from "@/create-store/functions/helpers/create-disposer";
import { registerRef } from "@/create-store/functions/helpers/refs";

/**
 * One value held by reference, outside the reactive tree. It never notifies
 * and has nothing to subscribe to; inside a composite it is a member you can
 * read and write, but it is not part of the composite's state, its snapshot,
 * its writes or its `$reset`. The value is exactly what you gave, so a class
 * instance or a promise keeps its type. A function is a value, not an
 * initializer or an updater.
 *
 * Like every store handed to a composite, a ref is not disposed by it: the
 * creator disposes.
 */
export function ref<Value>(initial: Value): RefStore<Value> {
  let value = initial;
  const disposer = createDisposer();

  return Object.freeze(
    registerRef({
      $dispose: () => disposer.run(),
      $get: () => value,
      $onDispose: disposer.add,
      $set(next: Value) {
        if (!disposer.isDisposed()) value = next;
      },
    })
  );
}
