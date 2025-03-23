import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { StateManager } from "@/create-store/types/state-manager";
import type { StatePath } from "@/create-store/types/state-path";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { Dispatch } from "react";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isFunction } from "@/create-store/functions/assertions/is-function";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { combine } from "@/create-store/functions/helpers/combine";
import { createPathComponents } from "@/create-store/functions/helpers/create-path-components";
import { createPaths } from "@/create-store/functions/helpers/create-paths";
import { createSnapshot } from "@/create-store/functions/helpers/create-snapshot";
import { shallowMerge } from "@/create-store/functions/helpers/shallow-merge";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { resolvePath } from "@/create-store/functions/utilities/resolve-path";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";
import { useEffect, useMemo, useState } from "react";

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
        set.forEach((subscriber) => subscriber(<any>state));
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
    Value extends ResolvePath<State, Path>
  >(value: Value, path: Path) {
    const keys = splitPath(path);
    const snapshot = <any>createSnapshot(state);
    const pivot = keys.pop()!;

    const current = keys.reduce((accumulator, key) => {
      return accumulator[key];
    }, snapshot);

    current[pivot] = value;
    setState(snapshot, path);
  }

  function createSetStatePathAction<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(path: Path) {
    return (value: SetPartialStateAction<Value>) => {
      const current = resolvePath(state, path);

      if (isSetStateActionFunction(value)) {
        const resolvedValue = value(current);
        setProperty(combine(current, resolvedValue), path);
      } else setProperty(combine(current, value), path);
    };
  }

  function setStateAction(value: SetPartialStateAction<State>) {
    if (isSetStateActionFunction<State>(value)) {
      const resolvedValue = value(state);
      setState(combine(state, resolvedValue));
    } else setState(combine(state, value));
  }

  function get<
    Path extends Paths<State>,
    Value extends StatePath<State, Path>,
    Result = Value
  >(path?: Path, select?: Selector<Value, Result>) {
    const value = resolvePath(state, path);
    return resolveSelectorValue(value, select);
  }

  function set<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(path: Path): Dispatch<SetPartialStateAction<Value>>;

  function set<Path extends Paths<State> = never>(
    path?: Path
  ): Dispatch<SetPartialStateAction<State>>;

  function set<Path extends Paths<State>>(path?: Path) {
    if (!path) return setStateAction;
    return createSetStatePathAction(path);
  }

  function sub<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(subscriber: (value: Value) => void, path?: Path, immediate?: boolean) {
    const subscribers = getSubscribersByPath(path);
    const value = resolvePath(state, path);

    subscribers.add(subscriber);
    if (immediate) subscriber(value);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  function tap<Path extends Paths<State>>(key: Path, chain?: Path) {
    const path = <Path>[chain, key].filter(Boolean).join(".");
    const value = resolvePath(state, path);

    if (isDictionary(value)) return traverse(value, path);
    if (isFunction(value)) return <any>value;
    return buildStore(path);
  }

  function use<
    Value extends StatePath<State, Path>,
    Path extends Paths<State>,
    Result = Value
  >(
    path?: Path,
    select?: Selector<Value, Result>,
    dependencies: unknown[] = []
  ): StateManager<State, Result> {
    const [value, setValue] = useState(() => {
      return resolvePath(state, path);
    });

    const resolvedValue = useMemo(
      () => resolveSelectorValue(value, select),
      [value, ...dependencies]
    );

    useEffect(() => sub(setValue, path), [path]);
    return [resolvedValue, set(path)];
  }

  function buildStore<
    Path extends Paths<State>,
    Value extends StatePath<State, Path>,
    Result = Value
  >(chain?: Path) {
    return {
      $get(select?: Selector<Value, Result>) {
        return get(chain, select);
      },
      $set(value: StatePath<State, Path>) {
        return set(chain)(value);
      },
      $sub(subscriber: Subscriber<State>, immediate = true) {
        return sub(subscriber, chain, immediate);
      },
      $tap(key: Path) {
        return tap(key, chain);
      },
      $use(
        select?: Selector<State, ResolvePath<State, Path>>,
        dependencies?: unknown[]
      ) {
        return use(chain, select, dependencies);
      },
    };
  }

  function traverse<Path extends Paths<State> = never>(
    state: State,
    chain?: Path
  ): CompositeStore<State>;

  function traverse<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(state: Value, chain?: Path): CompositeStore<State> {
    const clone = createSnapshot(state);

    for (const key in clone) {
      const property = <Value>clone[key];
      const path = <Path>[chain, key].filter(Boolean).join(".");

      if (isFunction(property)) {
        clone[key] = <any>property;
      } else if (isDictionary(property)) {
        clone[key] = <any>traverse(property, path);
      } else {
        clone[key] = <any>buildStore(path);
      }
    }

    const store = buildStore(chain);
    return <any>shallowMerge(clone, store);
  }

  return traverse(initialState);
}
