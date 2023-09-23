// type Reducers = Record<string, (...args: ReadonlyArray<any>) => void>;

import type { Subscription } from "definition";

abstract class Subject<S> {
  abstract next(value: S): void;
  abstract subscribe(observer: (value: S) => void): Subscription;
  abstract unsubscribe(): void;
}

/**
 * Represents a subject that maintains a current value and emits it to subscribers.
 * @template S The type of the initial and emitted values.
 */
export class BehaviorSubject<S> implements Subject<S> {
  private state: S;
  private subscribers: Set<Function>;

  /**
   * Creates a new instance of BehaviorSubject.
   * @param {S} initialValue The initial value of the subject.
   */
  constructor(initialValue: S) {
    /**
     * The current value of the subject.
     * @type {S}
     */
    this.state = initialValue;

    /**
     * The set of subscribers to the subject.
     * @type {Set<Function>}
     */
    this.subscribers = new Set();
  }

  /**
   * Notifies all subscribers with the current value.
   * @protected
   */
  protected notifySubscribers = () => {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.state);
      } catch (err) {
        console.error("Error occurred in subscriber callback:", err);
      }
    });
  };

  /**
   * Returns the current value of the subject.
   * @returns {S} The current value.
   */
  get value(): S {
    return this.state;
  }

  /**
   * Emits a new value to the subject and notifies subscribers.
   * @param {S} value The new value to emit.
   */
  next = (value: S) => {
    if (!Object.is(this.state, value)) {
      this.state = value;
      this.notifySubscribers();
    }
  };

  /**
   * Subscribes to the subject and receives emitted values.
   * @param {Function} observer The callback function to be called with emitted values.
   * @param {boolean} [initiate=true] Whether to initiate the callback immediately with the current state. Defaults to `true`.
   * @returns {{ unsubscribe: Function }} An object with a function to unsubscribe the callback.
   */
  subscribe = (observer: Function, initiate: boolean = true): Subscription => {
    // Confirm the callback isn't in the subscribers list.
    if (!this.subscribers.has(observer)) {
      // Add the callback as a member in the subscribers list.
      this.subscribers.add(observer);
      if (initiate) observer(this.state);
    }
    return {
      unsubscribe: () => {
        this.subscribers.delete(observer);
      },
    };
  };

  /**
   * Unsubscribes all subscribers from the subject.
   */
  unsubscribe = (): void => {
    this.subscribers.clear();
  };
}

type PossibleReturnType<Value extends ((...args: any[]) => any) | undefined> =
  Value extends (...args: any[]) => infer R ? R : undefined;

type Events<State> = {
  set: (value: State) => void;
  get: () => State;
};

type AtomConfig<
  State,
  Variables extends OptionType<string, any> | undefined,
  Operators extends OptionType<string> | undefined,
  Actions,
  Selectors
> = {
  state: () => State;
  actions?: Actions;
  selectors?: Selectors;
  variables?: Variables;
  operators?: Operators;
  events?: Events<State>;
};

type OptionType<Option extends string, Return = any> = {
  [Key in Option]: (...args: Array<any>) => Return;
};

const x = atom({
  state: () => 6,
  operators: {
    getStoredValue: () => {
      console.log(x);
      const storedValue = localStorage.getItem("trade");
      return JSON.parse(storedValue ?? "''");
    },
    saveValueToStorage: (value: number) => {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem("trade", stringifiedValue);
    },
  },
});

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template S The type of the state.
 */
export type Atom<State, Variables, Operators> = {
  state: {
    set: (value: State) => void;
    get: () => State;
  };
  variables?: Variables;
  operators?: Operators;
};

/**
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {S} initialState The initial state value.
 *
 * @returns {Atom<S, A>} An instance of the Atom class.
 */
export function atom<
  State,
  Variables extends OptionType<string, any> | undefined,
  Operators extends OptionType<string, any> | undefined,
  Actions = undefined,
  Selectors = undefined
>({
  variables,
  operators,
  ...options
}: AtomConfig<State, Variables, Operators, Actions, Selectors>): Atom<
  State,
  Variables,
  Operators
> {
  const { state, actions, selectors, events } = options;
  const observable = new BehaviorSubject(state());

  const props = {
    get state() {
      return {
        /**
         * Sets the value of the Atom instance in the portal map.
         * @param {S} value The new value to set.
         */
        set: (value: State) => {
          observable.next(value);
          events?.set(value);
        },

        /**
         * Retrieves the current value of the observable stored in the subject.
         *
         * @template T The type of the value stored in the observable.
         * @returns {T} The current value of the observable.
         */
        get: () => {
          events?.get();
          return observable.value;
        },
      };
    },

    get variables() {
      return variables;
    },

    get operators() {
      return operators;
    },
  };

  const value = {
    state: props.state,
    selectors,
    actions,
  };

  /**
   * Retrieves the subject associated with the Atom instance.
   * @returns {Object} An object containing the subject.
   */
  Object.defineProperty(atom, "value", {
    writable: false,
    configurable: false,
    enumerable: false,
    value,
  });

  return props;
}

type AtomValue<State, Selectors, Actions> = {
  state: {
    set: (value: State) => void;
    get: () => State;
  };
  selectors: Selectors | undefined;
  actions: Actions | undefined;
};

// import { useEffect, useMemo, useState } from "react";
// import type { Atom, PortalEntry, PortalState } from "definition";

/**
 * Custom hook to access and manage an isolated state within an Atom storage.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Atom<S, A>} store The Atom storage from which to access the state.
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
export function useAtom<S, A = undefined>(
  store: Atom<S> & { value: PortalEntry<S, A> }
): PortalState<S, A> {
  const subject = store.value;
  const [state, setState] = useState(subject.observable.value);

  useEffect(() => {
    const subscriber = subject.observable.subscribe(setState);
    return subscriber.unsubscribe;
  }, []);

  const setter = useMemo(() => {
    return subject.observable.watch(subject.reducer);
  }, [subject]);
  return [state, setter];
}
