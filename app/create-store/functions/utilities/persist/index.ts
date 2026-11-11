import type { AnyStore } from "@/create-store/types/any-store";
import type { CollectionStore } from "@/create-store/types/collection-store";
import type { PersistAdapter } from "@/create-store/types/persist-adapter";
import type { PersistOptions } from "@/create-store/types/persist-options";
import type { Persistor } from "@/create-store/types/persistor";
import type { Store } from "@/create-store/types/store";
import type { StoreInput } from "@/create-store/types/store-input";
import type { StoreState } from "@/create-store/types/store-state";

import { collectionHooks } from "@/create-store/functions/helpers/collection-hooks";
import { persistCollection } from "@/create-store/functions/utilities/persist-collection";
import { persistStore } from "@/create-store/functions/utilities/persist-store";

/**
 * @description
 * Keeps a store and an adapter in step. Writes reach storage only after
 * hydration, so a store that has not read storage yet cannot overwrite it.
 * Updates `persist` makes itself (hydration, changes followed from storage) are not
 * written back. The stored format (`version`, `migrate`) is the adapter's
 * concern, and the state type comes from the store.
 *
 * For a collection, pass a function from key to adapter: every entry is
 * persisted under its own key, as it is made, and stops when it is disposed.
 *
 * @example
 * ```ts
 * const adapter = localAdapter<Draft>("draft", { version: 2, migrate });
 * const draft = composite({ lines: primitive<Line[]>([]) });
 * const persistor = persist(draft, adapter, { skipHydration: true });
 * ```
 */
export function persist<Entry extends AnyStore>(
  store: CollectionStore<Entry>,
  adapterFor: (
    key: string
  ) => PersistAdapter<StoreState<Entry>, StoreInput<Entry>>,
  options?: PersistOptions<StoreState<Entry>>
): Persistor;
export function persist<State, Input>(
  store: Store<State, Input>,
  adapter: PersistAdapter<NoInfer<State>, NoInfer<Input>>,
  options?: PersistOptions<NoInfer<State>>
): Persistor;
export function persist(
  store: any,
  adapter: any,
  options: PersistOptions<any> = {}
): Persistor {
  const hooks = collectionHooks(store);
  if (hooks) return persistCollection(store, hooks, adapter, options);
  return persistStore(store, adapter, options);
}
