import { GetValueByPath, Paths, UsePortal } from "@/definition";
import { getValue } from "@/utilities";
import {
  usePortalImplementation,
  usePortalWithLocalStorage,
  usePortalWithSessionStorage,
} from "@/addons";

/**
 * Creates a portal that serves as a hook for accessing a store value at a given path.
 *
 * @param {Store} store The object that represents the store.
 * @returns A function that takes a path and returns a hook for accessing the store value at that path.
 */
export function makeUsePortal<Store extends Record<string, any>>(
  store: Store
): UsePortal<Store> {
  function usePortal<
    Path extends Paths<Store>,
    State extends GetValueByPath<Store, Path>
  >(path: Path) {
    const initialState = getValue(store, path);
    return usePortalImplementation<Path, State>(path, initialState);
  }

  usePortal.local = function useLocal<
    Path extends Paths<Store>,
    State extends GetValueByPath<Store, Path>
  >(path: Path) {
    const initialState = getValue(store, path);
    return usePortalWithLocalStorage<Path, State>(path, initialState);
  };

  usePortal.session = function useSession<
    Path extends Paths<Store>,
    State extends GetValueByPath<Store, Path>
  >(path: Path) {
    const initialState = getValue(store, path);
    return usePortalWithSessionStorage<Path, State>(path, initialState);
  };

  return usePortal;
}
