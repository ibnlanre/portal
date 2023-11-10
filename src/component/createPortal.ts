import { Builder, GetValueByPath, Paths } from "@/definition";
import { getValue } from "@/utilities";
import {
  usePortalImplementation,
  usePortalWithLocalStorage,
  usePortalWithSessionStorage,
} from "@/addons";

/**
 * Creates a portal that provides a hook for accessing a store value at a given path.
 *
 * @param {Builder<Store, any>} builder The builder object that defines the store.
 * @returns A function that takes a path and returns a hook for accessing the store value at that path.
 */
export function createPortal<Store extends Record<string, any>>(
  builder: Builder<Store>
) {
  /**
   * Custom hook to access and manage state in the portal system.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param  builder The builder object for the store.
   * @param {Path} path The path to the store value.
   *
   * @returns {[State, Dispatch<SetStateAction<State>>]} A tuple containing the state and a function for updating the state.
   */
  function usePortal<
    Path extends Paths<Builder<Store, any>>,
    State extends GetValueByPath<Store, Path>
  >(path: Path) {
    const initialState = getValue(builder.use(), path);
    return usePortalImplementation<Path, State>(path, initialState);
  }

  /**
   * Custom hook to access and manage state in the portal system with localStorage support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   *
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  usePortal.local = function useLocal<
    Path extends Paths<Builder<Store, any>>,
    State extends GetValueByPath<Store, Path>
  >(path: Path) {
    const initialState = getValue(builder.use(), path);
    return usePortalWithLocalStorage<Path, State>(path, initialState);
  };

  /**
   * Custom hook to access and manage state in the portal system with sessionStorage support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   *
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  usePortal.session = function useSession<
    Path extends Paths<Builder<Store, any>>,
    State extends GetValueByPath<Store, Path>
  >(path: Path) {
    const initialState = getValue(builder.use(), path);
    return usePortalWithSessionStorage<Path, State>(path, initialState);
  };

  return usePortal;
}
