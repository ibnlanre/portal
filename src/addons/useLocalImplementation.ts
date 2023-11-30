import { Config, GetValueByPath, Paths } from "@/definition";
import { Portal } from "@/subject";

import { usePortalImplementation } from "./usePortalImplementation";

interface UseLocalImplementation<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
> {
  path: Path;
  portal: Portal;
  config?: Config<State, Data>;
  initialState: State;
}

/**
 * A hook for managing the portal states with local storage.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param {UseLocalImplementation<Store, Path, State, Data>} properties
 *
 * @property {Path} path The path of the portal's state
 * @property {Portal} [portal] The portal to be used
 * @property {Config<State>} [config] The config of the portal's state
 * @property {State} initialState The initial state of the portal
 *
 * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
 */
export function useLocalImplementation<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
>({
  path,
  portal,
  config,
  initialState,
}: UseLocalImplementation<Store, Path, State, Data>) {
  const {
    key = path,
    set = (value: State) => JSON.stringify(value),
    get = (value: string) => JSON.parse(value),
  } = { ...config };

  const options = {
    set: (value: State) => {
      localStorage.setItem(key, set(value));
    },
    get: () => {
      try {
        const value = localStorage.getItem(key);
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