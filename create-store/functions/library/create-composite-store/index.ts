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

import { useMemo, useSyncExternalStore } from "react";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isFunction } from "@/create-store/functions/assertions/is-function";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { isUndefined } from "@/create-store/functions/assertions/is-undefined";
import { createPathComponents } from "@/create-store/functions/helpers/create-path-components";
import { createPaths } from "@/create-store/functions/helpers/create-paths";
import { createSnapshot } from "@/create-store/functions/helpers/create-snapshot";
import { merge } from "@/create-store/functions/helpers/merge";
import { replace } from "@/create-store/functions/helpers/replace";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { resolvePath } from "@/create-store/functions/utilities/resolve-path";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

export function createCompositeStore<State extends Dictionary>(
  initialState: State
): CompositeStore<State> {
  let state = initialState;

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
    const snapshot = createSnapshot(state) as any;
    const pivot = keys.pop()!;

    const current = keys.reduce((accumulator, key) => {
      return accumulator[key];
    }, snapshot);

    current[pivot] = value;
    setState(snapshot, path);
  }

  function createSetStatePathAction<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>,
  >(path: Path) {
    return (value: SetPartialStateAction<Value>) => {
      const current = resolvePath(state, path);

      if (isSetStateActionFunction(value)) {
        const resolvedValue = value(createSnapshot(current));
        setProperty(replace(current, resolvedValue), path);
      } else setProperty(replace(current, value), path);
    };
  }

  function setStateAction(value: SetPartialStateAction<State>) {
    if (isSetStateActionFunction<State>(value)) {
      const resolvedValue = value(createSnapshot(state));
      setState(replace(state, resolvedValue));
    } else setState(replace(state, value));
  }

  function get<
    Path extends Paths<State>,
    Value extends StatePath<State, Path>,
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
    if (isUndefined(path)) return setStateAction;
    return createSetStatePathAction(path);
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

  function key<Path extends Paths<State>>(path: Path, parent?: Path) {
    const chain = [parent, path].filter(Boolean).join(".") as Path;
    const value = resolvePath(state, path);

    if (isFunction(value)) {
      return value as CompositeStore<State>;
    }

    if (isDictionary(value)) {
      const valueSnapshot = createSnapshot(value);
      return traverse(valueSnapshot, chain);
    }

    return buildStore(chain);
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
    const subscribe = useMemo(() => {
      return (callback: () => void) => {
        return act(callback, path, false);
      };
    }, [path]);

    const getSnapshot = useMemo(() => {
      return () => resolvePath(state, path);
    }, [path]);

    const value = useSyncExternalStore(subscribe, getSnapshot);

    const resolvedValue = useMemo(
      () => resolveSelectorValue(value, selector),
      [value, ...dependencies]
    );

    return [resolvedValue, set(path)];
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
        return key(path, chain);
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

  function connect<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>,
  >(state: Value, path?: Path) {
    const store = buildStore(path);
    return merge(state, store) as CompositeStore<State>;
  }

  function traverse<Path extends Paths<State> = never>(
    state: State,
    chain?: Path,
    visited?: WeakMap<object, any>,
    seen?: WeakSet<object>
  ): CompositeStore<State>;

  function traverse<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>,
  >(
    state: Value,
    chain?: Path,
    visited?: WeakMap<object, any>,
    seen?: WeakSet<object>
  ): CompositeStore<State>;

  function traverse<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>,
  >(
    state: Value,
    chain?: Path,
    visited = new WeakMap(),
    seen = new WeakSet()
  ): CompositeStore<State> {
    if (visited.has(state)) return visited.get(state);

    const result = connect(state, chain);
    visited.set(state, result);

    for (const key in state) {
      const property = state[key] as Value;
      const path = [chain, key].filter(Boolean).join(".") as Path;

      if (seen.has(property)) {
        if (visited.has(property)) {
          result[key] = visited.get(property);
        } else {
          result[key] = buildStore(path) as any;
        }

        continue;
      }

      if (isFunction(property)) {
        result[key] = property as any;
      } else if (isDictionary(property)) {
        seen.add(property);

        const value = traverse(property, path, visited, seen) as any;
        result[key] = value;
      } else {
        result[key] = buildStore(path) as any;
      }
    }

    return result;
  }

  const structureSnapshot = createSnapshot(initialState);
  return traverse(structureSnapshot);
}
