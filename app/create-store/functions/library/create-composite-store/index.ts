import type { DependencyList } from "react";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { PartialSetStateAction } from "@/create-store/types/partial-set-state-action";
import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PartialStateSetter } from "@/create-store/types/partial-state-setter";
import type { Paths } from "@/create-store/types/paths";
import type { Property } from "@/create-store/types/property";
import type { Selector } from "@/create-store/types/selector";
import type { StatePath } from "@/create-store/types/state-path";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useCallback } from "react";

import { isAccessor } from "@/create-store/functions/assertions/is-accessor";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isFunction } from "@/create-store/functions/assertions/is-function";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { clone } from "@/create-store/functions/helpers/clone";
import { replace } from "@/create-store/functions/helpers/replace";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { useStoreSnapshot } from "@/create-store/functions/hooks/use-store-snapshot";
import { resolvePath } from "@/create-store/functions/utilities/resolve-path";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

/**
 * Creates a composite store from an initial state that is a plain object.
 * Every property becomes a nested store node, accessible via dot notation and
 * the `$at` path accessor. Function properties are exposed directly as methods.
 */
export function createCompositeStore<State extends GenericObject>(
  initialState: State
): CompositeStore<State> {
  const cache = new Map<string, CompositeStore<State>>();
  let state = initialState;

  function hasProperty(path: Paths<State> | undefined, property: string) {
    const parent = resolvePath(initialState, path);
    const current = resolvePath(state, path);
    return (
      (isDictionary(parent) &&
        Object.prototype.hasOwnProperty.call(parent, property)) ||
      (isDictionary(current) &&
        Object.prototype.hasOwnProperty.call(current, property))
    );
  }

  const subscribers = new Map<Paths<State>, Set<Subscriber<unknown>>>();

  function getSubscribersByPath<Path extends Paths<State>>(
    path: Path = "" as Path
  ) {
    if (!subscribers.has(path)) subscribers.set(path, new Set());
    return subscribers.get(path)!;
  }

  function notifySubscribers(state: State, path?: Paths<State>) {
    // A write invalidates its subtree and ancestors, including removed paths.
    // Segment boundaries prevent `user` from invalidating `username`.
    const written = path ?? "";
    subscribers.forEach((set, pathKey) => {
      if (
        !written ||
        !pathKey ||
        pathKey === written ||
        pathKey.startsWith(`${written}.`) ||
        written.startsWith(`${pathKey}.`)
      ) {
        const value = resolvePath(state, pathKey);
        set.forEach((subscriber) => subscriber(value));
      }
    });
  }

  function setState<Path extends Paths<State>>(value: State, path?: Path) {
    state = value;
    notifySubscribers(value, path);
  }

  function setProperty<Path extends Paths<State>>(value: unknown, path: Path) {
    const keys = splitPath(path);
    const pivot = keys.pop()!;
    const spread: any = { ...state };

    let current = spread;
    for (const key of keys) {
      current[key] = { ...current[key] };
      current = current[key];
    }
    current[pivot] = value;

    setState(spread, path);
  }

  function read<Path extends Paths<State> = never>(
    path?: Path
  ): StatePath<State, Path> {
    // The runtime resolver returns the root for an absent path. Public path
    // types express that distinction through StatePath.
    return resolvePath(state, path) as StatePath<State, Path>;
  }

  function get<
    Path extends Paths<State> = never,
    Result = StatePath<State, Path>,
  >(path?: Path, selector?: Selector<StatePath<State, Path>, Result>): Result {
    return resolveSelectorValue(read(path), selector);
  }

  function set<Path extends Paths<State> = never>(
    path?: Path
  ): PartialStateSetter<StatePath<State, Path>> {
    return (action) => {
      const current = read(path);
      const next = isSetStateActionFunction(action)
        ? action(clone(current))
        : action;
      if (path) setProperty(replace(current, next), path);
      else setState(replace(state, next));
    };
  }

  function sub<Path extends Paths<State> = never>(
    subscriber: Subscriber<StatePath<State, Path>>,
    path?: Path,
    immediate?: boolean
  ) {
    // The registry is heterogeneous; each set belongs to exactly one path.
    const listeners = getSubscribersByPath(path) as Set<
      Subscriber<StatePath<State, Path>>
    >;
    listeners.add(subscriber);
    if (immediate) subscriber(read(path));
    return () => {
      listeners.delete(subscriber);
    };
  }

  function createSubscribe<Path extends Paths<State>>(path?: Path) {
    return (callback: () => void) => sub(callback, path);
  }

  function use<
    Path extends Paths<State> = never,
    Result = StatePath<State, Path>,
  >(
    path?: Path,
    selector?: Selector<StatePath<State, Path>, Result>,
    dependencies?: DependencyList
  ): PartialStateManager<StatePath<State, Path>, Result> {
    const getSnapshot = useCallback(() => read(path), [path, read]);
    const subscribe = useCallback(createSubscribe(path), [
      path,
      createSubscribe,
    ]);
    const setter = useCallback(set(path), [path, set]);
    const resolvedValue = useStoreSnapshot(
      subscribe,
      getSnapshot,
      selector,
      dependencies
    );
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

  function resolveProperty<Path extends Paths<State>>(fullPath: Path): unknown {
    const value = resolvePath(state, fullPath);

    if (isFunction(value)) return value;

    return createProxy(fullPath);
  }

  function buildStore<Path extends Paths<State>>(chain?: Path) {
    return {
      $at(path: Path) {
        const fullPath = joinPaths(chain, path);
        return resolveProperty(fullPath) as Property<State, Path>;
      },
      $get(selector?: Selector<StatePath<State, Path>>) {
        return get(chain, selector);
      },
      $set(value: PartialSetStateAction<StatePath<State, Path>>) {
        return set(chain)(value);
      },
      $subscribe(
        subscriber: Subscriber<StatePath<State, Path>>,
        immediate = true
      ) {
        return sub(subscriber, chain, immediate);
      },
      $use<Result = StatePath<State, Path>>(
        selector?: Selector<StatePath<State, Path>, Result>,
        dependencies?: DependencyList
      ) {
        return use(chain, selector, dependencies);
      },
    };
  }

  function createProxy<Path extends Paths<State>>(path?: Path) {
    const key = path ?? "";
    if (cache.has(key)) return cache.get(key)!;

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
          const propertyExists = hasProperty(path, prop);

          if (propertyExists) {
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
          const propertyExists = hasProperty(path, prop);

          if (propertyExists) {
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

          return hasProperty(path, prop);
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

    cache.set(key, proxy);

    return proxy;
  }

  return createProxy() as never;
}
