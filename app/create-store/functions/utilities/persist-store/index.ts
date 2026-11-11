import type { PersistAdapter } from "@/create-store/types/persist-adapter";
import type { PersistOptions } from "@/create-store/types/persist-options";
import type { Persistor } from "@/create-store/types/persistor";
import type { Store } from "@/create-store/types/store";

import { isPromise } from "@/create-store/functions/assertions/is-promise";
import { compare } from "@/create-store/functions/helpers/compare";
import { watcherOf } from "@/create-store/functions/helpers/watchers";
import { primitive } from "@/create-store/functions/library/primitive";

/**
 * Keeps one store and an adapter in step; see `persist`.
 *
 * @template State The store's state, which the adapter must hold too.
 * @param store The store to persist.
 * @param adapter The adapter returned by a storage factory.
 * @param options Hydration and following options.
 * @returns The handle that hydrates and disposes the persistence.
 */
export function persistStore<State>(
  store: Store<State, State>,
  adapter: PersistAdapter<State>,
  { onHydrated, skipHydration = false, sync }: PersistOptions<State> = {}
): Persistor {
  const [get, set] = adapter;

  const watch = sync === false ? undefined : watcherOf(adapter);
  const hydrated = primitive(false);

  let disposed = false;
  let detach = () => {};
  let pending: Promise<void> | undefined;
  let stopWatching = () => {};

  // Echo suppression. `applying` covers the updates persist makes itself while
  // they notify synchronously. A notification queued behind another
  // subscriber's write arrives later, so a write is also skipped when the
  // store already equals what storage was last read as or written to.
  let applying = false;
  let last: State | undefined;

  // What the store held when persistence began. If storage turns out to hold
  // nothing but the store changed while it was being read, that change is
  // saved: it was made before hydration finished, so it was not written then.
  const created = store.$get();

  function update(change: () => void) {
    applying = true;
    try {
      change();
    } finally {
      applying = false;
    }
    last = store.$get();
  }

  function apply(stored: State | undefined) {
    if (disposed) return;
    if (stored !== undefined) {
      update(() => store.$set(stored));
    }

    hydrated.$set(true);
    if (stored === undefined) {
      const current = store.$get();
      if (!Object.is(current, created)) {
        last = current;
        save(current);
      }
    }
    onHydrated?.(store.$get());
  }

  function hydrate(): Promise<void> {
    if (disposed || hydrated.$get()) return Promise.resolve();
    if (pending) return pending;

    // A read that fails counts as nothing stored: it is logged, the store
    // becomes hydrated, and a value set meanwhile is saved like any other.
    const failed = (error: unknown) => {
      console.error("Error occurred while reading persisted state:", error);
      apply(undefined);
    };

    let stored: ReturnType<typeof get>;
    try {
      stored = get();
    } catch (error) {
      failed(error);
      return Promise.resolve();
    }

    if (!isPromise<State | undefined>(stored)) {
      apply(stored);
      return Promise.resolve();
    }

    pending = stored.then(apply, failed).finally(() => {
      pending = undefined;
    });
    return pending;
  }

  function onChange(removed: boolean) {
    if (disposed || !hydrated.$get()) return;
    if (removed) {
      update(() => store.$reset());
      return;
    }

    const receive = (value: State | undefined) => {
      if (disposed) return;
      update(() => (value === undefined ? store.$reset() : store.$set(value)));
    };
    const stored = get();

    if (isPromise<State | undefined>(stored)) void stored.then(receive);
    else receive(stored);
  }

  // A failing adapter must not fail the write that triggered it.
  function save(value: State) {
    const report = (error: unknown) => {
      console.error("Error occurred while persisting state:", error);
    };

    try {
      const saved = set(value);
      if (isPromise(saved)) saved.catch(report);
    } catch (error) {
      report(error);
    }
  }

  const unsubscribe = store.$subscribe(
    (value) => {
      if (disposed || applying || !hydrated.$get()) return;
      if (compare(value, last)) return;

      last = value;
      save(value);
    },
    { immediate: false }
  );

  if (watch) stopWatching = watch(({ removed }) => onChange(removed));

  function dispose() {
    if (disposed) return;
    disposed = true;

    unsubscribe();
    stopWatching();
    detach();
  }

  detach = store.$onDispose(dispose);

  if (!skipHydration) {
    hydrate().catch((error: unknown) => {
      console.error("Error occurred while hydrating persisted state:", error);
    });
  }

  return { dispose, hydrate, hydrated };
}
