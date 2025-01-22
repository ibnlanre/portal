import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { StateManager } from "@/create-store/types/state-manager";
import type { StatePath } from "@/create-store/types/state-path";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { Dispatch, SetStateAction } from "react";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { createSnapshot } from "@/create-store/functions/helpers/create-snapshot";
import { shallowMerge } from "@/create-store/functions/helpers/shallow-merge";
import { splitPath } from "@/create-store/functions/helpers/split-path";
import { resolvePath } from "@/create-store/functions/utilities/resolve-path";
import { useEffect, useState } from "react";

export function createCompositeStore<State extends Dictionary>(
  initialState: State
) {
  let state = initialState;
  const subscribers = new Map<string, Set<(value: any) => void>>();

  function getSubscribersByPath(path: string = "") {
    if (!subscribers.has(path)) subscribers.set(path, new Set());
    return subscribers.get(path)!;
  }

  function notifySubscribers<Value, Path extends string>(
    value: Value,
    path?: Path
  ) {
    const subscribers = getSubscribersByPath(path);
    subscribers.forEach((subscriber) => subscriber(value));
  }

  function setState<Path extends Paths<State>>(value: State, path?: Path) {
    state = value;

    if (!path) notifySubscribers(value);
    else {
      const value = resolvePath(state, path);
      notifySubscribers(value, path);
    }
  }

  function setProperty<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(value: Value, path?: Path) {
    if (!path) return setState(value);

    const keys = splitPath(path);
    const snapshot = <any>createSnapshot(state);
    const pivot = keys.pop()!;
    const current = keys.reduce((acc, key) => acc[key], snapshot);

    current[pivot] = value;
    setState(snapshot, path);
  }

  function createSetStatePathAction<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(path: Path) {
    return (value: SetStateAction<Value>) => {
      if (isSetStateActionFunction(value)) {
        const current = resolvePath(state, path);
        return setProperty(value(current), path);
      }

      setProperty(<ResolvePath<State, Path>>value, path);
    };
  }

  function setStateAction(value: SetStateAction<State>) {
    if (isSetStateActionFunction<State>(value)) setState(value(state));
    else setState(value);
  }

  function set<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(path: Path): Dispatch<SetStateAction<Value>>;

  function set<Path extends Paths<State> = never>(
    path?: Path
  ): Dispatch<SetStateAction<State>>;

  function set<Path extends Paths<State>>(path?: Path) {
    if (!path) return setStateAction;
    return createSetStatePathAction(path);
  }

  function get(): State;

  function get<Path extends Paths<State> = never>(
    path?: Path
  ): ResolvePath<State, Path>;

  function get<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(path: Path): Value;

  function get<Path extends Paths<State>>(path?: Path) {
    if (path) return resolvePath(state, path);
    return state;
  }

  function use<Path extends Paths<State> = never>(
    path?: Path | undefined
  ): StateManager<State>;

  function use<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(path: Path): StateManager<Value>;

  function use<Path extends Paths<State>>(path?: Path) {
    const [value, setValue] = useState<StatePath<State, Path>>(() => {
      if (!path) return state;
      return resolvePath(state, path);
    });

    useEffect(() => sub(setValue, path), [path]);
    return [value, set(path)];
  }

  function sub<Path extends Paths<State> = never>(
    subscriber: Subscriber<State>,
    path?: Path
  ): () => void;

  function sub<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(subscriber: (value: Value) => void, path: Path): () => void;

  function sub<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(subscriber: (value: Value) => void, path?: Path) {
    const subscribers = getSubscribersByPath(path);

    subscribers.add(subscriber);
    subscriber(get(path));

    return () => {
      subscribers.delete(subscriber);
    };
  }

  function buildStore<Path extends Paths<State>>(path?: Path) {
    return {
      $get() {
        return get();
      },
      $set(value: SetStateAction<State>) {
        return set(path)(value);
      },
      $sub(subscriber: Subscriber<State>) {
        return sub(subscriber, path);
      },
      $use() {
        return use(path);
      },
    };
  }

  function traverse<Path extends Paths<State> = never>(
    initialState: State
  ): CompositeStore<State>;

  function traverse<
    Path extends Paths<State>,
    Value extends ResolvePath<State, Path>
  >(initialState: Value, chain?: Path): CompositeStore<State> {
    const clone = createSnapshot(initialState);

    for (const key in clone) {
      const property = <Value>clone[key];
      const path = <Path>[chain, key].filter(Boolean).join(".");

      if (isDictionary(property)) {
        clone[key] = <any>traverse(property);
      } else {
        clone[key] = <any>buildStore(path);
      }
    }

    const store = buildStore(chain);
    return <any>shallowMerge(clone, store);
  }

  return traverse(state);
}
