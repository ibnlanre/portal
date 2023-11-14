import type {
  CookieOptions,
  GetValueByPath,
  PortalOptions,
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
    State extends GetValueByPath<Ledger, Path>
  >(path: Path, options?: PortalOptions<Path, State>) {
    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State>({
      path,
      initialState,
      options,
    });
  }

  usePortal.local = function useLocal<
    Path extends Paths<Ledger>,
    State extends GetValueByPath<Ledger, Path>
  >(path: Path) {
    const options = {
      set: (value: State, path: Path) => {
        localStorage.setItem(path, JSON.stringify(value));
      },
      get: (path: Path) => {
        const value = localStorage.getItem(path);
        if (value) return JSON.parse(value);
      },
    };

    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State>({
      path,
      initialState,
      options,
    });
  };

  usePortal.session = function useSession<
    Path extends Paths<Ledger>,
    State extends GetValueByPath<Ledger, Path>
  >(path: Path) {
    const options = {
      set: (value: State, path: Path) => {
        sessionStorage.setItem(path, JSON.stringify(value));
      },
      get: (path: Path) => {
        const value = sessionStorage.getItem(path);
        if (value) return JSON.parse(value);
      },
    };

    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State>({
      path,
      initialState,
      options,
    });
  };

  usePortal.cookie = function useCookie<
    Path extends Paths<Ledger>,
    State extends GetValueByPath<Ledger, Path>
  >(path: Path, cookieOptions?: CookieOptions) {
    const options = {
      set: (value: State, path: Path) => {
        cookieStorage.setItem(path, JSON.stringify(value), cookieOptions);
      },
      get: (path: Path) => {
        const value = cookieStorage.getItem(path);
        if (value) return JSON.parse(value);
      },
    };

    const initialState = getValue(ledger, path);
    return usePortalImplementation<Path, State>({
      path,
      initialState,
      options,
    });
  };

  return usePortal;
}
