import { Paths, GetValueByPath, UseCookieImplementation } from "@/definition";

import { cookieStorage } from "@/cookies";
import { usePortalImplementation } from "./usePortalImplementation";

/**
 * A hook for managing the portal states with cookie storage.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param {UseCookieImplementation<Store, Path, State, Data>} properties
 *
 * @property {Path} path The path of the portal's state
 * @property {Portal} [portal] The portal to be used
 * @property {CookieConfig<State>} [config] The config of the portal's state
 * @property {State} initialState The initial state of the portal
 *
 * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
 */
export function useCookieImplementation<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
>(properties: UseCookieImplementation<Store, Path, State, Data>) {
  const { path, portal, config, initialState } = properties;
  const {
    key = path,
    set = (value: State) => JSON.stringify(value),
    get = (value: string) => JSON.parse(value),
    cookieOptions,
  } = { ...config };

  const options = {
    set: (value: State) => {
      cookieStorage.setItem(key, set(value), cookieOptions);
    },
    get: () => {
      try {
        const value = cookieStorage.getItem(key);
        if (value) return get(value) as State;
      } catch (e) {
        console.warn(e);
      }
      return undefined as State;
    },
  };

  return usePortalImplementation<Store, Path, State, Data>({
    path,
    initialState,
    options,
    portal,
  });
}
