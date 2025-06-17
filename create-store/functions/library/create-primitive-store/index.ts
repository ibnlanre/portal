import type { SetStateAction } from "react";

import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { StateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useEffect, useState } from "react";

import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
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

  function $set(value: SetStateAction<State>) {
    if (isSetStateActionFunction<State>(value)) {
      const resolvedValue = value(state);
      setState(resolvedValue);
    } else setState(value);
  }

  function $use<Value = State>(
    selector?: Selector<State, Value>
  ): StateManager<State, Value> {
    const [value, setValue] = useState(state);
    useEffect(() => $act(setValue), []);
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
