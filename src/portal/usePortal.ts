import {
  Config,
  CookieConfig,
  GetValueByPath,
  Paths,
  PortalOptions,
} from "@/definition";
import { getResolvedState } from "@/utilities";

import { Portal } from "./portal";
import { makeUsePortal } from "./makeUsePortal";
import { useCookieImplementation } from "./useCookieImplementation";
import { useLocalImplementation } from "./useLocalImplementation";
import { usePortalImplementation } from "./usePortalImplementation";
import { useSessionImplementation } from "./useSessionImplementation";

const portal = new Portal();

/**
 * A hook for managing the portal states.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param path The path of the portal's state
 * @param {PortalOptions<State>} [options] The options of the portal's state
 *
 * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
 */
export function usePortal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, options?: PortalOptions<State, Data>) {
  const initialState = getResolvedState(options?.state);

  return usePortalImplementation<Store, Path, State, Data>({
    path,
    portal,
    initialState,
    options,
  });
}

/**
 * A hook for managing the portal states with local storage.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param path The path of the portal's state
 * @param {Config<State>} [config] The config of the portal's state
 *
 * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
 */
function useLocal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, config?: Config<State, Data>) {
  const initialState = getResolvedState(config?.state) as State;

  return useLocalImplementation<Store, Path, State, Data>({
    path,
    portal,
    initialState,
    config,
  });
}

/**
 * A hook for managing the portal states with session storage.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param path The path of the portal's state
 * @param {Config<State>} [config] The config of the portal's state
 *
 * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
 */
function useSession<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, config?: Config<State, Data>) {
  const initialState = getResolvedState(config?.state) as State;

  return useSessionImplementation<Store, Path, State, Data>({
    path,
    portal,
    initialState,
    config,
  });
}

/**
 * A hook for managing the portal states with cookie storage.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param path The path of the portal's state
 * @param {CookieConfig<State>} [config] The config of the portal's state
 *
 * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
 */
function useCookie<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, config?: CookieConfig<State, Data>) {
  const initialState = getResolvedState(config?.state) as State;

  return useCookieImplementation<Store, Path, State, Data>({
    path,
    portal,
    initialState,
    config,
  });
}

// Hook functions
usePortal.local = useLocal;
usePortal.session = useSession;
usePortal.cookie = useCookie;
usePortal.make = makeUsePortal;

// Utility functions
usePortal.clear = portal.clear;
usePortal.removeItem = portal.removeItem;
usePortal.hasItem = portal.hasItem;
usePortal.getItem = portal.getItem;
usePortal.setItem = portal.setItem;
