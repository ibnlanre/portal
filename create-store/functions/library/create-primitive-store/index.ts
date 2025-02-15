import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { StateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { SetStateAction } from "react";

import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";
import { useEffect, useState } from "react";

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

  function $get<Value = State>(select?: Selector<State, Value>) {
    return resolveSelectorValue(state, select);
  }

  function $set(value: SetStateAction<State>) {
    if (isSetStateActionFunction<State>(value)) setState(value(state));
    else setState(value);
  }

  function $use<Value = State>(
    select?: Selector<State, Value>
  ): StateManager<State, Value> {
    const [value, setValue] = useState(state);
    useEffect(() => $sub(setValue), []);
    return [resolveSelectorValue(value, select), $set];
  }

  function $sub(subscriber: Subscriber<State>, immediate = true) {
    subscribers.add(subscriber);
    if (immediate) subscriber(state);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  const context = {
    $get,
    $set,
    $sub,
    $use,
  };

  const propertyDescriptor = {
    enumerable: false,
    configurable: false,
    writable: false,
  } satisfies PropertyDescriptor;

  return Object.defineProperties(context, {
    $get: propertyDescriptor,
    $set: propertyDescriptor,
    $sub: propertyDescriptor,
    $use: propertyDescriptor,
  });
}
