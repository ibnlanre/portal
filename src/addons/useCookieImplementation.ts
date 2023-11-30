import { Paths, GetValueByPath, CookieConfig } from "@/definition";
import { Portal } from "@/subject";

import { cookieStorage } from "../component";
import { usePortalImplementation } from "./usePortalImplementation";

/**
 * Represents the properties of the `useCookieImplementation` hook.
 *
 * @template Store The type of the store.
 * @template Path The type of the path.
 * @template State The type of the state.
 * @template Data The type of the data.
 */
interface UseCookieImplementation<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
> {
  path: Path;
  portal: Portal;
  initialState: State;
  config?: CookieConfig<State, Data>;
}

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
>({
  path,
  initialState,
  config,
  portal,
}: UseCookieImplementation<Store, Path, State, Data>) {
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