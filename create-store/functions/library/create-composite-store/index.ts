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
import { merge } from "@/create-store/functions/helpers/merge";
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
      const value = replace(current, next, { strictMode: true });
      setProperty(value, path);
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

  function key<Path extends Paths<State>>(path: Path, parent?: Path) {
    const chain = [parent, path].filter(Boolean).join(".") as Path;
    const value = resolvePath(state, path);

    if (isFunction(value)) {
      return value as CompositeStore<State>;
    }

    if (isDictionary(value)) {
      return traverse(clone(value), chain);
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
    const [value, setValue] = useState(() => resolvePath(state, path));

    const setter = useMemo(() => set(path), [path]);
    useEffect(() => act(setValue, path), [path]);

    const comparison = useVersion([value, dependencies]);
    const resolvedValue = useMemo(() => {
      return resolveSelectorValue(value, selector);
    }, comparison);

    return [resolvedValue, setter];
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
    return merge(state, buildStore(path)) as CompositeStore<State>;
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
    node: Value,
    chain?: Path,
    visited = new WeakMap(),
    seen = new WeakSet()
  ): CompositeStore<State> {
    if (visited.has(node)) return visited.get(node);

    const proxy = connect(node, chain);
    visited.set(node, proxy);

    for (const key in node) {
      const property = node[key] as Value;
      const path = [chain, key].filter(Boolean).join(".") as Path;

      if (seen.has(property)) {
        proxy[key] = visited.get(property) ?? buildStore(path);
        continue;
      }

      if (isFunction(property)) {
        proxy[key] = property;
      } else if (isDictionary(property)) {
        seen.add(property);
        proxy[key] = traverse(property, path, visited, seen) as any;
      } else {
        proxy[key] = buildStore(path) as any;
      }
    }

    return proxy;
  }

  return traverse(clone(initialState));
}
