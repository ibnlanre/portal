import type { AnyStore } from "@/create-store/types/any-store";
import type { CollectionHooks } from "@/create-store/types/collection-hooks";
import type { PersistAdapter } from "@/create-store/types/persist-adapter";
import type { PersistOptions } from "@/create-store/types/persist-options";
import type { Persistor } from "@/create-store/types/persistor";

import { isPromise } from "@/create-store/functions/assertions/is-promise";
import { primitive } from "@/create-store/functions/library/primitive";
import { persistStore } from "@/create-store/functions/utilities/persist-store";

/**
 * Persists every entry of a collection under its own key; see `persist`.
 *
 * @param store The collection.
 * @param hooks Its entries and a way to hear of new ones.
 * @param adapterFor Finds the adapter for an entry's key.
 * @param options Hydration and following options, applied to each entry.
 * @returns The handle that hydrates and disposes every entry's persistence.
 */
export function persistCollection(
  store: AnyStore,
  hooks: CollectionHooks,
  adapterFor: (key: string) => PersistAdapter<unknown>,
  options: PersistOptions<unknown>
): Persistor {
  const hydrated = primitive(false);
  const persistors = new Map<AnyStore, Persistor>();
  const adapters = new Map<AnyStore, PersistAdapter<unknown>>();
  const selfStarted = new WeakSet<AnyStore>();

  let started = !options.skipHydration;
  let disposed = false;
  let detach = () => {};

  function track(key: string, entry: AnyStore) {
    if (disposed || persistors.has(entry)) return;
    if (started) selfStarted.add(entry);

    const adapter = adapterFor(key);
    adapters.set(entry, adapter);

    const persistor = persistStore(entry, adapter, {
      ...options,
      skipHydration: !started,
    });

    persistors.set(entry, persistor);
    entry.$onDispose(() => {
      persistors.delete(entry);
      adapters.delete(entry);
    });
  }

  // Removing an entry through the collection removes its stored key too. The
  // entry stops persisting first, so the reset that precedes its disposal is
  // not written back.
  function forget(_key: string, entry: AnyStore) {
    const adapter = adapters.get(entry);
    if (!adapter) return;

    persistors.get(entry)?.dispose();
    const report = (error: unknown) => {
      console.error("Error occurred while removing persisted state:", error);
    };

    try {
      const [, store] = adapter;
      const removed = store(undefined);
      if (isPromise(removed)) removed.catch(report);
    } catch (error) {
      report(error);
    }
  }

  for (const [key, entry] of hooks.entries()) track(key, entry);
  const stopTracking = hooks.onEntry(track);
  const stopForgetting = hooks.onRemove(forget);
  const stopListening = () => {
    stopTracking();
    stopForgetting();
  };

  // `hydrated` flips once the entries that existed have hydrated: before this
  // returns when every read is synchronous, otherwise after the last one
  // settles. A read that rejects does not hold it back; the error is logged.
  function hydrate(): Promise<void> {
    if (disposed) return Promise.resolve();
    started = true;

    const waiting: Array<[entry: AnyStore, done: Promise<void>]> = [];
    for (const [entry, persistor] of persistors) {
      let done: Promise<void>;
      try {
        done = persistor.hydrate();
      } catch (error) {
        done = Promise.reject(error);
      }
      if (!persistor.hydrated.$get()) waiting.push([entry, done]);
    }

    if (waiting.length === 0) {
      hydrated.$set(true);
      return Promise.resolve();
    }

    return Promise.allSettled(waiting.map(([, done]) => done)).then(
      (results) => {
        results.forEach((result, index) => {
          const [key] = waiting[index];

          // An entry hydrating itself has already logged its own failure.
          if (result.status === "rejected" && !selfStarted.has(key)) {
            console.error(
              "Error occurred while hydrating persisted state:",
              result.reason
            );
          }
        });

        if (!disposed) hydrated.$set(true);
      }
    );
  }

  function dispose() {
    if (disposed) return;

    disposed = true;
    stopListening();

    for (const persistor of Array.from(persistors.values())) {
      persistor.dispose();
    }

    persistors.clear();
    detach();
  }

  detach = store.$onDispose(dispose);

  if (started) {
    hydrate().catch((error: unknown) => {
      console.error("Error occurred while hydrating persisted state:", error);
    });
  }

  return { dispose, hydrate, hydrated };
}
