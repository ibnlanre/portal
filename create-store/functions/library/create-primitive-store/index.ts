import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { SetPartialStateAction } from "@/create-store/types/set-partial-state-action";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { isAccessor } from "../../assertions/is-accessor";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { clone } from "@/create-store/functions/helpers/clone";
import { replace } from "@/create-store/functions/helpers/replace";
import { useVersion } from "@/create-store/functions/hooks/use-version";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

export function createPrimitiveStore<State>(
  initialState: State
): PrimitiveStore<State> {
  let state = initialState;
  const subscribers = new Set<Subscriber<State>>();

  function setState(value: State) {
    state = value;
    notifySubscribers(value);
    return true;
  }

  function notifySubscribers(value: State) {
    subscribers.forEach((subscriber) => subscriber(value));
  }

  function buildStore() {
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
      dependencies?: unknown
    ): PartialStateManager<State, Value> {
      const getSnapshot = useCallback($get, []);
      const subscribe = useCallback($act, []);

      const value = useSyncExternalStore(subscribe, getSnapshot);
      const comparison = useVersion([value, dependencies]);
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

  const node = buildStore() as PrimitiveStore<State>;

  return new Proxy(node, {
    defineProperty(target, prop, descriptor) {
      return true;
    },

    deleteProperty(target, prop) {
      return true;
    },

    get(target, prop) {
      if (isAccessor(target, prop)) return target[prop];
      return undefined;
    },

    getOwnPropertyDescriptor(target, prop) {
      if (isAccessor(target, prop)) {
        return {
          configurable: true,
          enumerable: false,
          value: target[prop],
          writable: false,
        };
      }
      return undefined;
    },

    has(target, prop) {
      return isAccessor(target, prop);
    },

    ownKeys(target) {
      return [];
    },

    set(target, prop, value) {
      return true;
    },
  }) as PrimitiveStore<State>;
}
