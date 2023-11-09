import {
  usePortalImplementation,
  usePortalWithLocalStorage,
  usePortalWithSessionStorage,
  usePortalWithCookieStorage,
} from "@/addons";

import type { Builder, GetValueByPath, Paths, PortalState } from "@/definition";
import { getValue } from "@/utilities";

/**
 * Custom hook to access and manage state in the portal system.
 *
 * @template Store The type of the store.
 * @template Path The type of the path.
 * @template State The type of the state.
 *
 * @param {Builder<Store, any>} builder The builder object for the store.
 * @param {Path} path Unique key identifier for the portal.
 *
 * @returns {[State, Dispatch<SetStateAction<State>>]} A tuple containing the state and a function for updating the state.
 */
export function usePortal<
  Store extends Record<string, any>,
  Path extends Paths<Builder<Store, any>>,
  State extends GetValueByPath<Store, Path>
>(builder: Builder<Store, any>, path: Path): PortalState<State>;

export function usePortal<
  Store extends Record<string, any>,
  Path extends Paths<Builder<Store, any>>,
  State extends GetValueByPath<Store, Path>
>(builder: Builder<Store, any>, path: Path): PortalState<State> {
  const initialState = getValue(builder.use(), path);
  return usePortalImplementation<State, Path>(path, initialState);
}

/**
 * Custom hook to access and manage state in the portal system with localStorage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system and localStorage.
 * @param {S} [initialState] The initial state value.
 *
 * @returns {PortalState<S>} A tuple containing the current state and a function to update the state.
 */
usePortal.local = usePortalWithLocalStorage;

/**
 * Custom hook to access and manage state in the portal system with sessionStorage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system and sessionStorage.
 * @param {S} [initialState] The initial state value.
 *
 * @returns {PortalState<S>} A tuple containing the current state and a function to update the state.
 */
usePortal.session = usePortalWithSessionStorage;

/**
 * A custom hookto access and manage state in the `Cookie` store through the portal system.
 * 
 * @template Store The type of the store.
 * @template Path The type of the path.
 * 
 * @param {Builder<Store, any>} builder The builder object.
 * @param {Path} path The path to the value in the store.
 * 
 * @returns {PortalState<string>} A tuple containing the current state and a function to update the state.
 */
usePortal.cookie = usePortalWithCookieStorage;
