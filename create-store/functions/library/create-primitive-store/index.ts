import type { DependencyList } from "react";

import type { PartialSetStateAction } from "@/create-store/types/partial-set-state-action";
import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { Subscriber } from "@/create-store/types/subscriber";

import { useSyncExternalStore } from "react";

import { isAccessor } from "@/create-store/functions/assertions/is-accessor";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { clone } from "@/create-store/functions/helpers/clone";
import { replace } from "@/create-store/functions/helpers/replace";
import { useSync } from "@/create-store/functions/hooks/use-sync";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

export function createPrimitiveStore<State>(initialState: State) {
  let state = initialState;
  const subscribers = new Set<Subscriber<State>>();
  const cache = new WeakMap<object, any>();

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
      return resolveSelectorValue(state, selector, cache);
    }

    function $set(action: PartialSetStateAction<State>) {
      const next = isSetStateActionFunction<State>(action)
        ? action(clone(state, cache))
        : action;
      setState(replace(state, next));
    }

    function $use<Value = State>(
      selector?: Selector<State, Value>,
      dependencies?: DependencyList
    ): PartialStateManager<State, Value> {
      const value = useSyncExternalStore($act, $get, $get);
      const resolvedValue = useSync(() => {
        return resolveSelectorValue(value, selector);
      }, [value, dependencies]);

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
    defineProperty() {
      return true;
    },

    deleteProperty() {
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

    ownKeys() {
      if (!isDictionary(state)) return [];
      return Reflect.ownKeys(state);
    },

    set() {
      return true;
    },
  });
}
