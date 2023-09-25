import { useEffect, useState } from "react";

import { SetStateAction } from "react";

/**
 * Type guard to check if a value is a SetStateAction function.
 *
 * @template S The type of the state.
 * @param {SetStateAction<S>} value The value to be checked.
 * @returns {boolean} `true` if the value is a SetStateAction function, otherwise `false`.
 */
export function isSetStateFunction<State, Variables>(
  value: State | ((variables: Variables) => State)
): value is (variables: Variables) => State {
  return typeof value === "function";
}

/**
 * Represents a subject that maintains a current value and emits it to subscribers.
 * @template S The type of the initial and emitted values.
 */
export class BehaviorSubject<S> {
  private state: S;
  private history: S[] = [];
  private subscribers: Set<Function>;
  private currentIndex: number;

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
    this.currentIndex = 0;
    this.history.push(initialValue);
  }

  /**
   * Returns the current value of the subject.
   * @returns {S} The current value.
   */
  get value(): S {
    return this.state;
  }

  get canUndo(): boolean {
    return this.currentIndex > 0;
  }

  get canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Emits a new value to the subject and notifies subscribers.
   * @param {S} value The new value to emit.
   */
  next = (value: S) => {
    if (!Object.is(this.state, value)) {
      this.state = value;
      // history is kept to allow time-travel until an update
      this.history.splice(this.currentIndex + 1);
      this.history.push(value);
      this.currentIndex = this.history.length - 1;
      this.notifySubscribers();
    }
    return value;
  };

  previous = () => {
    const currentIndex = this.currentIndex - 1;
    if (!currentIndex) return this.state;
    if (currentIndex > 0) {
      return this.history[currentIndex];
    }
    return undefined;
  };

  undo = () => {
    if (this.canUndo) {
      this.currentIndex--;
      this.state = this.history[this.currentIndex] as S;
      this.notifySubscribers();
    }
  };

  redo = () => {
    if (this.canRedo) {
      this.currentIndex++;
      this.state = this.history[this.currentIndex] as S;
      this.notifySubscribers();
    }
  };

  /**
   * Subscribes to the subject and receives emitted values.
   * @param {Function} observer The callback function to be called with emitted values.
   * @param {boolean} [initiate=true] Whether to initiate the callback immediately with the current state. Defaults to `true`.
   * @returns {{ unsubscribe: Function }} An object with a function to unsubscribe the callback.
   */
  subscribe = (observer: (value: S) => any, initiate: boolean = true) => {
    if (!this.subscribers.has(observer)) {
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
}

type Actions<State, Run, Data, Variables> = {
  get?: (
    { prev, next }: { prev: State; next: State },
    variables: Variables
  ) => Data;
  set?: (
    { prev, next }: { prev: State; next: State },
    variables: Variables
  ) => State;
  run?: <Value = Data>(
    props: Atom<State, Value, Variables>,
    ...args: Run[]
  ) => void;
};

type AtomConfig<State, Run, Data, Variables> = {
  state: State | ((variables: Variables) => State);
  actions?: Actions<State, Run, Data, Variables>;
  variables?: Variables;
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template S The type of the state.
 */
export type Atom<State, Data, Variables> = {
  value: State;
  previous: () => State | undefined;
  update: (value: State) => void;
  set: (value: State) => State;
  get: (value: State) => Data;
  subscribe: (
    observer: (value: State) => any,
    initiate?: boolean
  ) => {
    unsubscribe: () => void;
  };
  unsubscribe: () => void;
  redo: () => void;
  undo: () => void;
  variables: Variables;
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
  Run,
  Data = State,
  Variables extends {
    [key: string]: any;
  } = {}
>(config: AtomConfig<State, Run, Data, Variables>) {
  const { state, actions, variables = {} as Variables } = config;
  const { set, get, run } = { ...actions };

  const observable = new BehaviorSubject(
    isSetStateFunction<State, Variables>(state) ? state(variables) : state
  );
  const { subscribe, unsubscribe, previous, redo, undo } = observable;

  const props = {
    /**
     * Sets the value of the Atom instance in the portal map.
     * @param {S} value The new value to set.
     */
    update: observable.next,
    set: (value: State) => {
      return set
        ? set({ prev: observable.value, next: value }, variables)
        : (value as unknown as State);
    },
    /**
     * Retrieves the current value of the observable stored in the subject.
     *
     * @template Type The type of the value stored in the observable.
     * @returns {Type} The current value of the observable.
     */
    value: observable.value,
    get: (value: State) => {
      return get
        ? get({ prev: observable.value, next: value }, variables)
        : (value as unknown as Data);
    },
    subscribe,
    unsubscribe,
    variables,
    previous,
    redo,
    undo,
  };

  run?.(props);
  const atomic = {
    ...props,
    rerun: (...values: Run[]) => {
      run?.(props, ...values);
    },
  };

  return atomic;
}
