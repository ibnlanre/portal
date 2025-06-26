import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useSyncExternalStore } from "react";

import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { replace } from "@/create-store/functions/helpers/replace";
import { createSnapshot } from "@/create-store/functions/helpers/create-snapshot";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

export function createPrimitiveStore<State>(
  initialState: State
): PrimitiveStore<State> {
  let state = initialState;
  const subscribers = new Set<Subscriber<State>>();

  function setState(value: State) {
    state = value;
    notifySubscribers(value);
  }

  function notifySubscribers(value: State) {
    subscribers.forEach((subscriber) => subscriber(value));
  }

  function $get<Value = State>(selector?: Selector<State, Value>) {
    return resolveSelectorValue(state, selector);
  }

  function $set(value: SetPartialStateAction<State>) {
    if (isSetStateActionFunction<State>(value)) {
      const resolvedValue = value(createSnapshot(state));
      setState(replace(state, resolvedValue));
    } else setState(replace(state, value));
  }

  const subscribe = (callback: () => void) => {
    return $act(callback, false);
  };

  const getSnapshot = () => state;

  function $use<Value = State>(
    selector?: Selector<State, Value>
  ): PartialStateManager<State, Value> {
    const value = useSyncExternalStore(subscribe, getSnapshot);
    return [resolveSelectorValue(value, selector), $set];
  }

  function $act(subscriber: Subscriber<State>, immediate = true) {
    subscribers.add(subscriber);
    if (immediate) subscriber(state);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  return {
    $act,
    $get,
    $set,
    $use,
  };
}
