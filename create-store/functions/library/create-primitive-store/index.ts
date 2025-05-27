import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { StateManager } from "@/create-store/types/state-manager";
import type { StoreHandles } from "@/create-store/types/store-handles";
import type { Subscriber } from "@/create-store/types/subscriber";
import type { SetStateAction } from "react";

import { DEFAULT_PRIMITIVE_HANDLES } from "@/create-store/constants/primitive-handles";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";
import { useEffect, useState } from "react";

export function createPrimitiveStore<
  State,
  const Handles extends StoreHandles = DEFAULT_PRIMITIVE_HANDLES
>(
  initialState: State,
  handles: Handles = DEFAULT_PRIMITIVE_HANDLES as Handles
): PrimitiveStore<State, Handles> {
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

  const methods = {
    $get,
    $set,
    $act,
    $use,
  };

  return Object.fromEntries(
    Object.entries(methods).filter(([key]) => {
      return handles.includes(key as Handles[number]);
    })
  ) as PrimitiveStore<State, Handles>;
}
