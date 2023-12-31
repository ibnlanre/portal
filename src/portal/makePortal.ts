import {
  Config,
  CookieConfig,
  GetValueByPath,
  Paths,
  PortalOptions,
} from "@/definition";
import { getResolvedState, getValue } from "@/utilities";

import { Portal } from "./portal";
import { useCookieImplementation } from "./useCookieImplementation";
import { useLocalImplementation } from "./useLocalImplementation";
import { usePortalImplementation } from "./usePortalImplementation";
import { useSessionImplementation } from "./useSessionImplementation";

function makePortal<Store extends Record<string, any>>(register: Store) {
  /**
   * Represents a mapping of keys (stringified) to portal entries.
   * @type {PortalMap}
   */
  const store = new Portal();

  /**
   * A map of portal entries.
   * @type {PortalMap}
   */
  const portal = {
    /**
     * A hook for managing the portal states.
     *
     * @param path The path of the portal's state
     * @param {PortalOptions<State>} [options] The options of the portal's state
     *
     * @returns {PortalState<State, Data>} A tuple containing the current state and a function to update the state.
     */
    use: function usePortalWithStore<
      Path extends Paths<Store>,
      State extends GetValueByPath<Store, Path>,
      Data = State
    >(path: Path, options?: PortalOptions<State, Data>) {
      const initialState = options?.state
        ? getResolvedState(options.state)
        : getValue(register, path);

      return usePortalImplementation<Store, Path, State, Data>({
        path,
        initialState,
        options,
        store,
      });
    },

    /**
     * A hook for managing the portal states with local storage.
     *
     * @param path The path of the portal's state
     * @param {Config<State>} [config] The config of the portal's state
     *
     * @returns {PortalState<State, Data>} A tuple containing the current state and a function to update the state.
     */
    local: function useLocalWithStore<
      Path extends Paths<Store>,
      State extends GetValueByPath<Store, Path>,
      Data = State
    >(path: Path, config?: Config<State, Data>) {
      const initialState = config?.state
        ? getResolvedState(config.state)
        : getValue(register, path);

      return useLocalImplementation<Store, Path, State, Data>({
        path,
        initialState,
        config,
        store,
      });
    },

    /**
     * A hook for managing the portal states with session storage.
     *
     * @param path The path of the portal's state
     * @param {Config<State>} [config] The config of the portal's state
     *
     * @returns {PortalState<State, Data>} A tuple containing the current state and a function to update the state.
     */
    session: function useSessionWithStore<
      Path extends Paths<Store>,
      State extends GetValueByPath<Store, Path>,
      Data = State
    >(path: Path, config?: Config<State, Data>) {
      const initialState = config?.state
        ? getResolvedState(config.state)
        : getValue(register, path);

      return useSessionImplementation<Store, Path, State, Data>({
        path,
        initialState,
        config,
        store,
      });
    },

    /**
     * A hook for managing the portal states with cookie storage.
     *
     * @param path The path of the portal's state
     * @param {CookieConfig<State>} [config] The config of the portal's state
     *
     * @returns {PortalState<State, Data>} A tuple containing the current state and a function to update the state.
     */
    cookie: function useCookieWithStore<
      Path extends Paths<Store>,
      State extends GetValueByPath<Store, Path>,
      Data = State
    >(path: Path, config?: CookieConfig<State, Data>) {
      const initialState = config?.state
        ? getResolvedState(config.state)
        : getValue(register, path);

      return useCookieImplementation<Store, Path, State, Data>({
        path,
        initialState,
        config,
        store,
      });
    },

    make: makePortal,
    entries: store.entries,
    removeItem: store.removeItem,
    hasItem: store.hasItem,
    getItem: store.getItem,
    setItem: store.setItem,
    clear: store.clear,
  };

  return portal;
}

export const portal = makePortal({} as Record<string, any>);

const store = portal.make({
  user: {
    name: "John",
    age: 20,
  },
  cart: {
    items: ["item-1", "item-2"],
  },
})

store.use("cart.items", {
  state: ["item-3"],
})
