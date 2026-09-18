import type { Snapshot } from "@/create-store/types/snapshot";
import type { DependencyList } from "react";

import type { PartialSetStateAction } from "@/create-store/types/partial-set-state-action";
import type { PartialStateManager } from "@/create-store/types/partial-state-manager";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Selector } from "@/create-store/types/selector";
import type { Subscriber } from "@/create-store/types/subscriber";

import { isAccessor } from "@/create-store/functions/assertions/is-accessor";
import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isSetStateActionFunction } from "@/create-store/functions/assertions/is-set-state-action-function";
import { cloneState } from "@/create-store/functions/helpers/clone-state";
import { replace } from "@/create-store/functions/helpers/replace";
import { useStoreSnapshot } from "@/create-store/functions/hooks/use-store-snapshot";
import { resolveSelectorValue } from "@/create-store/functions/utilities/resolve-selector-value";

/**
 * Creates a primitive store from an initial value that is not a plain object.
 * The store holds a single value accessible and updatable via `$get`, `$set`,
 * `$use`, and `$subscribe`.
 */
export function createPrimitiveStore<State>(
  initialState: State
): PrimitiveStore<State> {
  let state = cloneState(initialState);

  const subscribers = new Set<Subscriber<State>>();

  function setState(value: State) {
    state = value;
    notifySubscribers(value);
  }

  function notifySubscribers(value: State) {
    subscribers.forEach((subscriber) => subscriber(value as Snapshot<State>));
  }

  function buildStore() {
    const getSnapshot = () => state;
    const subscribe = (listener: () => void) => $subscribe(listener, false);
    function $get<Value = Snapshot<State>>(selector?: Selector<State, Value>) {
      return resolveSelectorValue(state, selector);
    }

    function $set(action: PartialSetStateAction<State>) {
      const next = isSetStateActionFunction(action)
        ? action(cloneState(state))
        : action;
      setState(replace(state, cloneState(next)));
    }

    function $use<Value = Snapshot<State>>(
      selector?: Selector<State, Value>,
      dependencies?: DependencyList
    ): PartialStateManager<State, Value> {
      const resolvedValue = useStoreSnapshot(
        subscribe,
        getSnapshot,
        selector,
        dependencies
      );

      return [resolvedValue, $set];
    }

    function $subscribe(subscriber: Subscriber<State>, immediate = true) {
      subscribers.add(subscriber);
      if (immediate) subscriber(state as Snapshot<State>);

      return () => {
        subscribers.delete(subscriber);
      };
    }

    return {
      $get,
      $set,
      $subscribe,
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
