import type { Dispatch } from "react";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PartialStatePath } from "@/create-store/types/partial-state-path";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { StatePath } from "@/create-store/types/state-path";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useEffect, useMemo, useState } from "react";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isFunction } from "@/create-store/functions/assertions/is-function";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { createPathComponents } from "@/create-store/functions/helpers/create-path-components";
import { createPaths } from "@/create-store/functions/helpers/create-paths";
import { replace } from "@/create-store/functions/helpers/replace";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { useVersion } from "@/create-store/functions/hooks/use-version";
import { resolvePath } from "@/create-store/functions/utilities/resolve-path";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

import clone from "@ibnlanre/clone";

export function createCompositeStore<State extends Dictionary>(
  initialState: State
): CompositeStore<State> {
  let state = initialState;

  // Global cache for created proxies to handle circular references
  const proxyCache = new WeakMap<any, CompositeStore<State>>();

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
  >(path: Path): Dispatch<SetPartialStateAction<Value>>;

  function set<Path extends Paths<State> = never>(
    path?: Path
  ): Dispatch<SetPartialStateAction<State>>;

  function set<Path extends Paths<State>>(path?: Path) {
    if (!path) {
      return (action: SetPartialStateAction<State>) => {
        const next = isSetStateActionFunction<State>(action)
          ? action(clone(state))
          : action;
        setState(replace(state, next));
      };
    }

    return <Value extends ResolvePath<State, Path>>(
      action: SetPartialStateAction<Value>
    ) => {
      const current = resolvePath(state, path);
      const next = isSetStateActionFunction(action)
        ? action(clone(current))
        : action;
      setProperty(replace(current, next), path);
    };
  }

  function act<
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

  function use<
    Value extends StatePath<State, Path>,
    Path extends Paths<State>,
    Result = Value,
  >(
    path?: Path,
    selector?: Selector<Value, Result>,
    dependencies: unknown[] = []
  ): PartialStateManager<State, Result> {
    const [value, setValue] = useState(() => resolvePath(state, path));

    const setter = useMemo(() => set(path), [path]);
    useEffect(() => act(setValue, path), [path]);

    const comparison = useVersion([value, dependencies]);
    const resolvedValue = useMemo(() => {
      return resolveSelectorValue(value, selector);
    }, comparison);

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

    if (isDictionary(value)) {
      if (proxyCache.has(value)) return proxyCache.get(value);
      return createProxy(fullPath);
    }

    return createProxy(fullPath);
  }

  function buildStore<Path extends Paths<State>>(chain?: Path) {
    return {
      $act(subscriber: Subscriber<State>, immediate = true) {
        return act(subscriber, chain, immediate);
      },
      $get(selector?: Selector<StatePath<State, Path>>) {
        return get(chain, selector);
      },
      $key(path: Path) {
        const fullPath = joinPaths(chain, path);
        return resolveProperty(fullPath);
      },
      $set(value: PartialStatePath<State, Path>) {
        return set(chain)(value);
      },
      $use(
        selector?: Selector<State, ResolvePath<State, Path>>,
        dependencies?: unknown[]
      ) {
        return use(chain, selector, dependencies);
      },
    };
  }

  function createProxy<Path extends Paths<State>>(
    path?: Path
  ): CompositeStore<State> {
    const value = resolvePath(state, path);

    if (isDictionary(value) && proxyCache.has(value)) {
      return proxyCache.get(value)!;
    }

    const node: any = buildStore(path);

    const proxy = new Proxy(node, {
      get(target, prop: string | symbol) {
        if (typeof prop === "string") {
          if (prop in target) return target[prop];
          const fullPath = joinPaths(path, prop);
          return resolveProperty(fullPath);
        }
        return target[prop];
      },

      getOwnPropertyDescriptor(target, prop: string | symbol) {
        if (typeof prop === "string") {
          if (prop in target)
            return Object.getOwnPropertyDescriptor(target, prop);

          const fullPath = joinPaths(path, prop);
          const value = resolvePath(state, fullPath);

          if (value !== undefined) {
            return {
              configurable: true,
              enumerable: true,
              get: () => resolveProperty(fullPath),
              set: (newValue) => setProperty(newValue, fullPath),
            };
          }
        }
        return undefined;
      },

      has(target, prop: string | symbol) {
        if (typeof prop === "string") {
          if (prop in target) return true;
          const fullPath = joinPaths(path, prop);
          return resolvePath(state, fullPath) !== undefined;
        }
        return false;
      },

      ownKeys(target) {
        const value = resolvePath(state, path);
        const storeKeys = Object.getOwnPropertyNames(target);
        return isDictionary(value)
          ? [...storeKeys, ...Object.keys(value)]
          : storeKeys;
      },

      set(target, prop: string | symbol, value) {
        if (typeof prop === "string" && !(prop in target)) {
          const fullPath = joinPaths(path, prop);
          setProperty(value, fullPath);
          return true;
        }
        return false;
      },
    }) as CompositeStore<State>;

    if (isDictionary(value)) proxyCache.set(value, proxy);
    return proxy;
  }

  return createProxy();
}
