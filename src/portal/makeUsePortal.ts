import {
  UsePortal,
  Paths,
  GetValueByPath,
  PortalOptions,
  CookieConfig,
  Config,
} from "@/definition";
import { getValue } from "@/utilities";

import { useCookieImplementation } from "./useCookieImplementation";
import { useLocalImplementation } from "./useLocalImplementation";
import { usePortalImplementation } from "./usePortalImplementation";
import { useSessionImplementation } from "./useSessionImplementation";
import { Portal } from "./portal";

/**
 * Creates a portal that serves as a hook for accessing a store value at a given path.
 *
 * @template Store The type of the store.
 *
 * @param {Store} store The object that represents the store.
 * @returns A function that takes a path and returns a hook for accessing the store value at that path.
 */
export function makeUsePortal<Store extends Record<string, any>>(
  store: Store
): UsePortal<Store> {
  const portal = new Portal();

  function usePortalWithStore<
    Path extends Paths<Store>,
    State extends GetValueByPath<Store, Path>,
    Data = State
  >(path: Path, options?: PortalOptions<State, Data>) {
    const initialState = getValue(store, path);

    return usePortalImplementation<Store, Path, State, Data>({
      path,
      initialState,
      options,
      portal,
    });
  }

  usePortalWithStore.local = function useLocalWithStore<
    Path extends Paths<Store>,
    State extends GetValueByPath<Store, Path>,
    Data = State
  >(path: Path, config?: Config<State, Data>) {
    const initialState = getValue(store, path);

    return useLocalImplementation<Store, Path, State, Data>({
      path,
      initialState,
      config,
      portal,
    });
  };

  usePortalWithStore.session = function useSessionWithStore<
    Path extends Paths<Store>,
    State extends GetValueByPath<Store, Path>,
    Data = State
  >(path: Path, config?: Config<State, Data>) {
    const initialState = getValue(store, path);

    return useSessionImplementation<Store, Path, State, Data>({
      path,
      initialState,
      config,
      portal,
    });
  };

  usePortalWithStore.cookie = function useCookieWithStore<
    Path extends Paths<Store>,
    State extends GetValueByPath<Store, Path>,
    Data = State
  >(path: Path, config?: CookieConfig<State, Data>) {
    const initialState = getValue(store, path);

    return useCookieImplementation<Store, Path, State, Data>({
      path,
      initialState,
      config,
      portal,
    });
  };

  return usePortalWithStore;
}
