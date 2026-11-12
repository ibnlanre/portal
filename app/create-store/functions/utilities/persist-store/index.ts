import type { PersistAdapter } from "@/create-store/types/persist-adapter";
import type { PersistOptions } from "@/create-store/types/persist-options";
import type { Persistor } from "@/create-store/types/persistor";
import type { Store } from "@/create-store/types/store";

import { isPromise } from "@/create-store/functions/assertions/is-promise";
import { compare } from "@/create-store/functions/helpers/compare";
import { fail } from "@/create-store/functions/helpers/fail";
import { watcherOf } from "@/create-store/functions/helpers/watchers";
import { primitive } from "@/create-store/functions/library/primitive";

/**
 * Keeps one store and an adapter in step; see `persist`.
 *
 * @template State The store's state, which the adapter must hold too.
 * @param store The store to persist.
 * @param adapter The adapter returned by a storage factory.
 * @param options Hydration, following, pacing and error options.
 * @param key The entry's key, when the store is an entry of a collection.
 * @returns The handle that hydrates and disposes the persistence.
 */
export function persistStore<State>(
  store: Store<State, State>,
  adapter: PersistAdapter<State>,
  {
    onError,
    onHydrated,
    skipHydration = false,
    sync,
    wait = 0,
  }: PersistOptions<State> = {},
  key?: string
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

  function context(action: "read" | "remove" | "write") {
    return key === undefined ? { action } : { action, key };
  }

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
        void save(current);
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
      fail(onError, error, context("read"));
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

    if (isPromise<State | undefined>(stored)) {
      stored.then(receive, (error: unknown) => {
        fail(onError, error, context("read"));
      });
    } else receive(stored);
  }

  // A failing adapter must not fail the write that triggered it.
  function save(value: State): Promise<void> {
    const report = (error: unknown) => {
      fail(onError, error, context("write"));
    };

    try {
      const saved = set(value);
      if (isPromise(saved)) return saved.then(undefined, report);
    } catch (error) {
      report(error);
    }

    return Promise.resolve();
  }

  // With `wait`, a change marks the store dirty and restarts the window; when
  // it ends, the store's current value is written unless storage already holds
  // it, which is how a change followed from another tab wins over a pending one.
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dirty = false;

  function flush(): Promise<void> {
    clearTimeout(timer);
    timer = undefined;
    if (!dirty) return Promise.resolve();

    dirty = false;
    const value = store.$get();
    if (compare(value, last)) return Promise.resolve();

    last = value;
    return save(value);
  }

  const unsubscribe = store.$subscribe(
    (value) => {
      if (disposed || applying || !hydrated.$get()) return;
      if (wait > 0) {
        dirty = true;
        clearTimeout(timer);
        timer = setTimeout(() => void flush(), wait);
        return;
      }

      if (compare(value, last)) return;

      last = value;
      void save(value);
    },
    { immediate: false }
  );

  if (watch) stopWatching = watch(({ removed }) => onChange(removed));

  function dispose() {
    if (disposed) return;
    void flush();
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

  return { dispose, flush, hydrate, hydrated };
}
