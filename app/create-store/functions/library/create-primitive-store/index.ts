import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { StateManager } from "@/create-store/types/state-manager";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { SetStateAction } from "react";

import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
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

  function setStateAction(value: SetStateAction<State>) {
    if (isSetStateActionFunction<State>(value)) setState(value(state));
    else setState(value);
  }

  function notifySubscribers(value: State) {
    subscribers.forEach((subscriber) => subscriber(value));
  }

  function $get() {
    return state;
  }

  function $set() {
    return setStateAction;
  }

  function $use(): StateManager<State> {
    const [value, setValue] = useState(state);
    useEffect(() => $sub(setValue), []);
    return [value, $set()];
  }

  function $sub(subscriber: Subscriber<State>) {
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
    };
  }

  return {
    $get,
    $set,
    $sub,
    $use,
  };
}
