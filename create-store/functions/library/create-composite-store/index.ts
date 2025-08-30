import type { DependencyList, Dispatch } from "react";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { PartialSetStateAction } from "@/create-store/types/partial-set-state-action";
import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PartialStatePath } from "@/create-store/types/partial-state-path";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { Selector } from "@/create-store/types/selector";
import type { StatePath } from "@/create-store/types/state-path";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useCallback, useSyncExternalStore } from "react";

import { isAccessor } from "@/create-store/functions/assertions/is-accessor";
import { isAtomic } from "@/create-store/functions/assertions/is-atomic";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isFunction } from "@/create-store/functions/assertions/is-function";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { clone } from "@/create-store/functions/helpers/clone";
import { createPathComponents } from "@/create-store/functions/helpers/create-path-components";
import { createPaths } from "@/create-store/functions/helpers/create-paths";
import { replace } from "@/create-store/functions/helpers/replace";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { useSync } from "@/create-store/functions/hooks/use-sync";
import { resolvePath } from "@/create-store/functions/utilities/resolve-path";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

export function createCompositeStore<State extends GenericObject>(
  initialState: State
) {
  let state = initialState;

  const cache = new WeakMap<any, CompositeStore<State>>();
  const originalPaths = new Set<string>();

  function trackOriginalPaths(
    obj: any,
    currentPath = "",
    visited = new WeakSet()
  ): void {
    if (isDictionary(obj)) {
      if (currentPath) {
        originalPaths.add(currentPath);
      }

      for (const key in obj) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        originalPaths.add(fullPath);
      }

      if (visited.has(obj)) return;

      visited.add(obj);
      for (const key in obj) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        trackOriginalPaths(obj[key], fullPath, visited);
      }
    }
  }

  trackOriginalPaths(initialState);

  const subscribers = new Map<
    Paths<State>,
    Set<(value: ResolvePath<State, Paths<State>>) => void>
  >();

  function getSubscribersByPath<Path extends Paths<State>>(
    path: Path = "" as Path
  ) {
    if (!subscribers.has(path)) subscribers.set(path, new Set());
    return subscribers.get(path)!;
  }

  function notifySubscribers(state: State, path?: Paths<State>) {
    const resolvedValue = resolvePath(state, path);
    const valuePaths = createPaths(resolvedValue);
    const pathComponents = createPathComponents(path);
    const paths = new Set([...pathComponents, ...valuePaths]);

    subscribers.forEach((set, pathKey) => {
      if (pathKey === "") {
        set.forEach((subscriber) => {
          subscriber(state as ResolvePath<State, Paths<State>>);
        });
      } else if (paths.has(pathKey)) {
        const resolvedValue = resolvePath(state, pathKey);
        set.forEach((subscriber) => subscriber(resolvedValue));
      }
    });
  }

  function setState<Path extends Paths<State>>(value: State, path?: Path) {
    state = value;
    notifySubscribers(value, path);
  }

  function setProperty<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>,
  >(value: Value, path: Path) {
    const keys = splitPath(path);
    const snapshot = clone(state);
    const pivot = keys.pop()!;

    let current: any = snapshot;
    for (const key of keys) current = current[key];
    current[pivot] = value;

    setState(snapshot, path);
  }

  function get<
    Path extends Paths<State>,
    Value = StatePath<State, Path>,
    Result = Value,
  >(path?: Path, selector?: Selector<Value, Result>): Result {
    const value = resolvePath(state, path);
    return resolveSelectorValue(value, selector);
  }

  function set<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>,
  >(path: Path): Dispatch<PartialSetStateAction<Value>>;

  function set<Path extends Paths<State> = never>(
    path?: Path
  ): Dispatch<PartialSetStateAction<State>>;

  function set<Path extends Paths<State>>(path?: Path) {
    if (!path) {
      return (action: PartialSetStateAction<State>) => {
        const next = isSetStateActionFunction<State>(action)
          ? action(clone(state))
          : action;
        setState(replace(state, next));
      };
    }

    return <Value extends ResolvePath<State, Path>>(
      action: PartialSetStateAction<Value>
    ) => {
      const current = resolvePath(state, path);
      const next = isSetStateActionFunction(action)
        ? action(clone(current))
        : action;
      setProperty(replace(current, next), path);
    };
  }

  function sub<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>,
  >(subscriber: (value: Value) => void, path?: Path, immediate?: boolean) {
    const subscribers = getSubscribersByPath(path);
    const value = resolvePath(state, path);

    subscribers.add(subscriber);
    if (immediate) subscriber(value);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  function createSubscribe<Path extends Paths<State>>(path?: Path) {
    return (callback: () => void) => sub(callback, path);
  }

  function use<
    Value extends StatePath<State, Path>,
    Path extends Paths<State>,
    Result = Value,
  >(
    path?: Path,
    selector?: Selector<Value, Result>,
    dependencies?: DependencyList
  ): PartialStateManager<State, Result> {
    const getSnapshot = useCallback(() => resolvePath(state, path), [path]);
    const subscribe = useCallback(createSubscribe(path), [path]);
    const setter = useCallback(set(path), [path]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const resolvedValue = useSync(() => {
      return resolveSelectorValue(value, selector);
    }, [value, dependencies]);

    return [resolvedValue, setter];
  }

  function joinPaths<Path extends Paths<State>>(
    basePath?: Path,
    property?: string
  ): Path {
    if (!basePath) return property as Path;
    if (!property) return basePath;
    return `${basePath}.${property}` as Path;
  }

  function resolveProperty<Path extends Paths<State>>(fullPath: Path) {
    const value = resolvePath(state, fullPath);

    if (isFunction(value)) return value;

    if (isDictionary(value) && !isAtomic(value)) {
      if (cache.has(value)) return cache.get(value);
      return createProxy(fullPath);
    }

    return createProxy(fullPath);
  }

  function buildStore<Path extends Paths<State>>(chain?: Path) {
    return {
      $act(subscriber: Subscriber<State>, immediate = true) {
        return sub(subscriber, chain, immediate);
      },
      $get(selector?: Selector<StatePath<State, Path>>) {
        return get(chain, selector);
      },
      $key(path: Path) {
        const fullPath = joinPaths(chain, path);
        return resolveProperty(fullPath) as StoreValueResolver<
          ResolvePath<State, Path>
        >;
      },
      $set(value: PartialStatePath<State, Path>) {
        return set(chain)(value);
      },
      $sub(subscriber: Subscriber<State>, immediate = true) {
        return sub(subscriber, chain, immediate);
      },
      $use(
        selector?: Selector<State, ResolvePath<State, Path>>,
        dependencies?: DependencyList
      ) {
        return use(chain, selector, dependencies);
      },
    };
  }

  function createProxy<Path extends Paths<State>>(path?: Path) {
    const value = resolvePath(state, path);

    if (isDictionary(value) && cache.has(value)) {
      return cache.get(value)!;
    }

    const node = buildStore(path) as CompositeStore<State>;

    const proxy = new Proxy(node, {
      defineProperty() {
        return true;
      },

      deleteProperty() {
        return true;
      },

      get(target, prop) {
        if (typeof prop === "string") {
          if (isAccessor(target, prop)) {
            return target[prop];
          }

          const fullPath = joinPaths(path, prop);
          const pathExistedInOriginal = originalPaths.has(fullPath);

          if (pathExistedInOriginal) {
            return resolveProperty(fullPath);
          }
        }
        return target[prop];
      },

      getOwnPropertyDescriptor(target, prop) {
        if (typeof prop === "string") {
          if (isAccessor(target, prop)) {
            return {
              configurable: true,
              enumerable: false,
              value: target[prop],
              writable: false,
            };
          }

          const fullPath = joinPaths(path, prop);
          const pathExistedInOriginal = originalPaths.has(fullPath);

          if (pathExistedInOriginal) {
            return {
              configurable: true,
              enumerable: true,
              get: () => resolveProperty(fullPath),
              set: () => true,
            };
          }
        }
        return undefined;
      },

      has(target, prop) {
        if (typeof prop === "string") {
          if (isAccessor(target, prop)) return true;

          const fullPath = joinPaths(path, prop);
          return originalPaths.has(fullPath);
        }
        return false;
      },

      ownKeys() {
        const value = resolvePath(state, path);
        if (!isDictionary(value)) return [];
        return Reflect.ownKeys(value);
      },

      set() {
        return true;
      },
    });

    if (isDictionary(value)) {
      cache.set(value, proxy);
    }

    return proxy;
  }

  return createProxy();
}
