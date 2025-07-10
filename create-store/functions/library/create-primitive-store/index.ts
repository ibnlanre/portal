import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useEffect, useMemo, useState } from "react";

import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { replace } from "@/create-store/functions/helpers/replace";
import { useCompare } from "@/create-store/functions/hooks/use-compare";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

import clone from "@ibnlanre/clone";

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

  function $set(action: SetPartialStateAction<State>) {
    const next = isSetStateActionFunction<State>(action)
      ? action(clone(state))
      : action;
    setState(replace(state, next));
  }

  function $use<Value = State>(
    selector?: Selector<State, Value>,
    dependencies?: unknown[]
  ): PartialStateManager<State, Value> {
    const [value, setValue] = useState(state);
    useEffect(() => $act(setValue), []);

    const comparison = useCompare([value, dependencies]);
    const resolvedValue = useMemo(() => {
      return resolveSelectorValue(value, selector);
    }, comparison);

    return [resolvedValue, $set];
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
