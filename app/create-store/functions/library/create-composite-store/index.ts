import type { DependencyList } from "react";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { PartialSetStateAction } from "@/create-store/types/partial-set-state-action";
import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PartialStateSetter } from "@/create-store/types/partial-state-setter";
import type { Paths } from "@/create-store/types/paths";
import type { Property } from "@/create-store/types/property";
import type { Selector } from "@/create-store/types/selector";
import type { Snapshot } from "@/create-store/types/snapshot";
import type { StatePath } from "@/create-store/types/state-path";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useCallback } from "react";

import { isAccessor } from "@/create-store/functions/assertions/is-accessor";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isFunction } from "@/create-store/functions/assertions/is-function";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { cloneState } from "@/create-store/functions/helpers/clone-state";
import { createNotificationQueue } from "@/create-store/functions/helpers/create-notification-queue";
import { createSubscriptionRegistry } from "@/create-store/functions/helpers/create-subscription-registry";
import { replace } from "@/create-store/functions/helpers/replace";
import {
  escapeKey,
  overlappingPaths,
  readStorePath as resolvePath,
  splitStorePath as splitPath,
} from "@/create-store/functions/helpers/store-path";
import { useStoreSnapshot } from "@/create-store/functions/hooks/use-store-snapshot";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

/**
 * Creates a composite store from an initial state that is a plain object.
 * Every property becomes a nested store node, accessible via dot notation and
 * the `$at` path accessor. Function properties are exposed directly as methods.
 */
export function createCompositeStore<State extends GenericObject>(
  initialState: State
): CompositeStore<State> {
  // Handles stay identical for a location while anything still references them.
  // Weak entries let transient lookups (event handlers, lists) be collected so
  // dynamic dictionaries do not grow the handle cache without bound.
  type Handle = CompositeStore<State>;
  type CacheEntry = { handle: Handle } | { weak: WeakRef<Handle> };

  const cache = new Map<string | undefined, CacheEntry>();
  const finalizer =
    typeof FinalizationRegistry === "function"
      ? new FinalizationRegistry<{
          key: string | undefined;
          weak: WeakRef<Handle>;
        }>((record) => {
          const entry = cache.get(record.key);
          if (entry && "weak" in entry && entry.weak === record.weak)
            cache.delete(record.key);
        })
      : undefined;
  const baseline = cloneState(initialState);
  let state = baseline;

  function hasProperty(path: Paths<State> | undefined, property: string) {
    const parent = resolvePath(baseline, path);
    const current = resolvePath(state, path);
    return (
      (isDictionary(parent) &&
        Object.prototype.hasOwnProperty.call(parent, property)) ||
      (isDictionary(current) &&
        Object.prototype.hasOwnProperty.call(current, property))
    );
  }

  const subscriptions = createSubscriptionRegistry<Paths<State> | undefined>();

  const enqueue = createNotificationQueue();

  function notifySubscribers(state: State, path?: Paths<State>) {
    const delivery: Array<() => void> = [];
    subscriptions.forEach((set, pathKey) => {
      if (overlappingPaths(path, pathKey)) {
        const value = resolvePath(state, pathKey);
        set.forEach((subscriber) =>
          delivery.push(() => {
            if (set.has(subscriber)) subscriber(value);
          })
        );
      }
    });
    enqueue(delivery);
  }

  function setState<Path extends Paths<State>>(value: State, path?: Path) {
    state = value;
    notifySubscribers(value, path);
  }

  function setProperty<Path extends Paths<State>>(value: unknown, path: Path) {
    const keys = splitPath(path);
    function update(current: any, index: number): any {
      const key = keys[index];
      const exists =
        isDictionary(current) &&
        Object.prototype.hasOwnProperty.call(current, key);
      const previous = exists ? current[key] : undefined;
      const next =
        index === keys.length - 1 ? value : update(previous, index + 1);
      if (exists && Object.is(previous, next)) return current;
      const record = isDictionary(current)
        ? Object.create(
            Object.getPrototypeOf(current),
            Object.getOwnPropertyDescriptors(current)
          )
        : {};
      Object.defineProperty(record, key, {
        configurable: true,
        enumerable: exists
          ? Object.prototype.propertyIsEnumerable.call(current, key)
          : true,
        value: next,
        writable: true,
      });
      return record;
    }
    setState(update(state, 0), path);
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
    Result = Snapshot<StatePath<State, Path>>,
  >(path?: Path, selector?: Selector<StatePath<State, Path>, Result>): Result {
    return resolveSelectorValue(read(path), selector);
  }

  function set<Path extends Paths<State> = never>(
    path?: Path
  ): PartialStateSetter<StatePath<State, Path>> {
    return (action) => {
      const current = read(path);
      const next = isSetStateActionFunction(action)
        ? action(cloneState(current))
        : action;
      if (path !== undefined)
        setProperty(replace(current, cloneState(next)), path);
      else setState(replace(state, cloneState(next)));
    };
  }

  function sub<Path extends Paths<State> = never>(
    subscriber: Subscriber<StatePath<State, Path>>,
    path?: Path,
    immediate?: boolean
  ) {
    const listeners = subscriber as Subscriber<unknown>;
    subscriptions.add(path, listeners);
    const unsubscribe = () => subscriptions.remove(path, listeners);
    try {
      if (immediate) subscriber(read(path) as Snapshot<StatePath<State, Path>>);
    } catch (error) {
      unsubscribe();
      throw error;
    }
    return unsubscribe;
  }

  function createSubscribe<Path extends Paths<State>>(path?: Path) {
    return (callback: () => void) => sub(callback, path);
  }

  function use<
    Path extends Paths<State> = never,
    Result = Snapshot<StatePath<State, Path>>,
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
    if (basePath === undefined) return property as Path;
    if (property === undefined) return basePath;
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
        splitPath(path);
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
      $use<Result = Snapshot<StatePath<State, Path>>>(
        selector?: Selector<StatePath<State, Path>, Result>,
        dependencies?: DependencyList
      ) {
        return use(chain, selector, dependencies);
      },
    };
  }

  function readCachedHandle(key: string | undefined) {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if ("handle" in entry) return entry.handle;
    const handle = entry.weak.deref();
    if (handle === undefined) cache.delete(key);
    return handle;
  }

  function cacheHandle(key: string | undefined, handle: Handle) {
    if (typeof WeakRef !== "function") {
      cache.set(key, { handle });
      return;
    }
    const weak = new WeakRef(handle);
    cache.set(key, { weak });
    finalizer?.register(handle, { key, weak });
  }

  function createProxy<Path extends Paths<State>>(path?: Path) {
    const key = path;
    const cached = readCachedHandle(key);
    if (cached) return cached;

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

          const fullPath = joinPaths(path, escapeKey(prop));
          const propertyExists = hasProperty(path, prop);

          if (propertyExists) {
            return resolveProperty(fullPath);
          }
        }
        return undefined;
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

          const fullPath = joinPaths(path, escapeKey(prop));
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

    cacheHandle(key, proxy);

    return proxy;
  }

  return createProxy() as never;
}
