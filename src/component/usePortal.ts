import {
  Config,
  CookieConfig,
  GetValueByPath,
  Paths,
  PortalOptions,
  UsePortal,
} from "@/definition";
import { usePortalImplementation } from "@/addons";
import { getValue } from "@/utilities";
import { cookieStorage } from "./cookieStorage";

/**
 * A hook for managing the portal states.
 *
 * @template State The state of the portal
 * @template Path The path to the portal's state
 *
 * @param path The path of the portal's state
 * @param {PortalOptions<State>} [options] The options of the portal's state
 *
 * @returns {PortalState<State>}
 */
export function usePortal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, options?: PortalOptions<Store, State, Data>) {
  const initialState = options?.store
    ? getValue(options.store, path)
    : options?.state;

  return usePortalImplementation<Store, Path, State, Data>({
    path,
    initialState,
    options,
  });
}

function useLocal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, config?: Config<Store, State>) {
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
      const value = localStorage.getItem(key);
      if (value) return get(value) as State;
      return undefined as State;
    },
  };

  const initialState = config?.store
    ? getValue(config.store, path)
    : config?.state;

  return usePortalImplementation<Store, Path, State, Data>({
    path,
    initialState,
    options,
  });
}

function useSession<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, config?: Config<Store, State>) {
  const {
    key = path,
    set = (value: State) => JSON.stringify(value),
    get = (value: string) => JSON.parse(value),
  } = { ...config };

  const options = {
    set: (value: State) => {
      sessionStorage.setItem(key, set(value));
    },
    get: () => {
      const value = sessionStorage.getItem(key);
      if (value) return get(value) as State;
      return undefined as State;
    },
  };

  const initialState = config?.store
    ? getValue(config.store, path)
    : config?.state;

  return usePortalImplementation<Store, Path, State, Data>({
    path,
    initialState,
    options,
  });
}

function useCookie<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(path: Path, config?: CookieConfig<Store, State>) {
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
      const value = cookieStorage.getItem(key);
      if (value) return get(value) as State;
      return undefined as State;
    },
  };

  const initialState = config?.store
    ? getValue(config.store, path)
    : config?.state;

  return usePortalImplementation<Store, Path, State, Data>({
    path,
    initialState,
    options,
  });
}

/**
 * Creates a portal that serves as a hook for accessing a store value at a given path.
 *
 * @param {Store} store The object that represents the store.
 * @returns A function that takes a path and returns a hook for accessing the store value at that path.
 */
function makePortal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
>(store: Store): UsePortal<Store, Path, State, Data> {
  function usePortalWithStore(
    path: Path,
    options?: PortalOptions<Store, State>
  ) {
    const updatedOptions = {
      ...options,
      store,
    };

    return usePortal(path, updatedOptions);
  }

  usePortalWithStore.local = function useLocalWithStore(
    path: Path,
    config?: Config<Store, State>
  ) {
    const updatedConfig = {
      ...config,
      store,
    };

    return useLocal(path, updatedConfig);
  };

  usePortalWithStore.session = function useSessionWithStore(
    path: Path,
    config?: Config<Store, State>
  ) {
    const updatedConfig = {
      ...config,
      store,
    };

    return useSession(path, updatedConfig);
  };

  usePortalWithStore.cookie = function useCookieWithStore(
    path: Path,
    config?: CookieConfig<Store, State>
  ) {
    const updatedConfig = {
      ...config,
      store,
    };

    return useCookie(path, updatedConfig);
  };

  return usePortalWithStore;
}

usePortal.local = useLocal;
usePortal.session = useSession;
usePortal.cookie = useCookie;
usePortal.make = makePortal;
