import type {
  GetValueByPath,
  PortalOptions,
  Paths,
  UsePortal,
  Config,
  CookieConfig,
} from "@/definition";
import { getValue } from "@/utilities";
import { usePortalImplementation } from "@/addons";
import { cookieStorage } from "./cookieStorage";

/**
 * Creates a portal that serves as a hook for accessing a registry value at a given path.
 *
 * @param {Registry} registry The object that represents the registry.
 * @returns A function that takes a path and returns a hook for accessing the registry value at that path.
 */
export function makeUsePortal<Registry extends Record<string, any>>(
  registry: Registry
): UsePortal<Registry> {
  function usePortal<
    Path extends Paths<Registry>,
    State extends GetValueByPath<Registry, Path>,
    Data = State
  >(path: Path, options?: PortalOptions<Path, State>) {
    const initialState = getValue(registry, path);
    return usePortalImplementation<Path, State, Data>({
      path,
      initialState,
      options,
    });
  }

  usePortal.local = function useLocal<
    Path extends Paths<Registry>,
    State extends GetValueByPath<Registry, Path>,
    Data = State
  >(path: Path, config?: Config<Path, State>) {
    const {
      key = path,
      set = (value: State) => JSON.stringify(value),
      get = (value: string) => JSON.parse(value),
    } = { ...config };

    const options = {
      set: (value: State, path: Path) => {
        localStorage.setItem(key, set(value, path));
      },
      get: (path: Path) => {
        const value = localStorage.getItem(key);
        if (value) return get(value, path) as State;
        return undefined as State;
      },
    };

    const initialState = getValue(registry, path);
    return usePortalImplementation<Path, State, Data>({
      path,
      initialState,
      options,
    });
  };

  usePortal.session = function useSession<
    Path extends Paths<Registry>,
    State extends GetValueByPath<Registry, Path>,
    Data = State
  >(path: Path, config?: Config<Path, State>) {
    const {
      key = path,
      set = (value: State) => JSON.stringify(value),
      get = (value: string) => JSON.parse(value),
    } = { ...config };

    const options = {
      set: (value: State, path: Path) => {
        sessionStorage.setItem(key, set(value, path));
      },
      get: (path: Path) => {
        const value = sessionStorage.getItem(key);
        if (value) return get(value, path) as State;
        return undefined as State;
      },
    };

    const initialState = getValue(registry, path);
    return usePortalImplementation<Path, State, Data>({
      path,
      initialState,
      options,
    });
  };

  usePortal.cookie = function useCookie<
    Path extends Paths<Registry>,
    State extends GetValueByPath<Registry, Path>,
    Data = State
  >(path: Path, config?: CookieConfig<Path, State>) {
    const {
      key = path,
      set = (value: State) => JSON.stringify(value),
      get = (value: string) => JSON.parse(value),
      cookieOptions,
    } = { ...config };

    const options = {
      set: (value: State, path: Path) => {
        cookieStorage.setItem(key, set(value, path), cookieOptions);
      },
      get: (path: Path) => {
        const value = cookieStorage.getItem(key);
        if (value) return get(value, path) as State;
        return undefined as State;
      },
    };

    const initialState = getValue(registry, path);
    return usePortalImplementation<Path, State, Data>({
      path,
      initialState,
      options,
    });
  };

  return usePortal;
}
