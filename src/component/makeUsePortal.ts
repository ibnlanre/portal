import {
  CookieOptions,
  CookieStorage,
  GetValueByPath,
  Options,
  Paths,
  UsePortal,
} from "@/definition";
import { getValue } from "@/utilities";
import { usePortalImplementation } from "@/addons";
import { cookieStorage } from "./cookieStorage";

/**
 * Creates a portal that serves as a hook for accessing a ledger value at a given path.
 *
 * @param {Ledger} ledger The object that represents the ledger.
 * @returns A function that takes a path and returns a hook for accessing the ledger value at that path.
 */
export function makeUsePortal<Ledger extends Record<string, any>>(
  ledger: Ledger
): UsePortal<Ledger> {
  function usePortal<
    Path extends Paths<Ledger>,
    State extends GetValueByPath<Ledger, Path>,
    Store extends Storage
  >(path: Path, options?: Options<Path, State, Store>) {
    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State, Store>({
      path,
      initialState,
      options,
    });
  }

  usePortal.local = function useLocal<
    Path extends Paths<Ledger>,
    State extends GetValueByPath<Ledger, Path>,
    Store extends Storage
  >(path: Path) {
    const options = {
      store: localStorage as Store,
      set: (value: State, store: Store, path: Path) => {
        store.setItem(path, JSON.stringify(value));
      },
      get: (store: Store, path: Path) => {
        const value = store.getItem(path);
        if (value) return JSON.parse(value);
      },
    };

    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State, Store>({
      path,
      initialState,
      options,
    });
  };

  usePortal.session = function useSession<
    Path extends Paths<Ledger>,
    State extends GetValueByPath<Ledger, Path>,
    Store extends Storage
  >(path: Path) {
    const options = {
      store: sessionStorage as Store,
      set: (value: State, store: Store, path: Path) => {
        store.setItem(path, JSON.stringify(value));
      },
      get: (store: Store, path: Path) => {
        const value = store.getItem(path);
        if (value) return JSON.parse(value);
      },
    };

    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State, Store>({
      path,
      initialState,
      options,
    });
  };

  /**
   * Custom hook to access and manage state in the portal system with cookie support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   * @template Store The type of the store.
   *
   * @param {Path} path The path to the store value.
   * @param {CookieOptions} cookieOptions The options for the cookie.
   *
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  usePortal.cookie = function useCookie<
    Path extends Paths<Ledger>,
    State extends GetValueByPath<Ledger, Path>
  >(path: Path, cookieOptions: CookieOptions) {
    const options = {
      store: cookieStorage,
      set: (value: State, store: CookieStorage, path: Path) => {
        store.setItem(path, JSON.stringify(value), cookieOptions);
      },
      get: (store: CookieStorage, path: Path) => {
        const value = store.getItem(path);
        if (value) return JSON.parse(value);
      },
    };

    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State, CookieStorage>({
      path,
      initialState,
      options,
    });
  };

  return usePortal;
}

const store = { user: { name: "John", age: 30 } };
const usePortal = makeUsePortal(store);
usePortal.cookie("user.name", {
  
})