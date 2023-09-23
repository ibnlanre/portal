import { Dispatch, SetStateAction, useEffect, useState } from "react";

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
  };

  previous = () => {
    const currentIndex = this.currentIndex - 1;
    if (!currentIndex) return this.state;
    if (currentIndex > 0) {
      return this.history[currentIndex];
    }
    return undefined
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
   * @returns {{ unsubscribe: Function }} An object with a function to unsubscribe the callback.
   */
  subscribe = (observer: (value: S) => any) => {
    if (!this.subscribers.has(observer)) {
      this.subscribers.add(observer);
      observer(this.state);
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

type AtomConfig<State, Variables> = {
  value: () => State;
  events?: {
    set?: (value: State) => State;
    get?: (value?: State) => State;
  };
  variables?: Variables;
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template S The type of the state.
 */
export type Atom<State, Variables> = {
  set: (value: State) => void;
  get: () => State;
  subscribe: (observer: (value: State) => any) => {
    unsubscribe: () => void;
  };
  unsubscribe: () => void;
  previous: () => State | undefined;
  redo: () => void;
  undo: () => void;
  state: Variables;
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
  Variables extends {
    [key: string]: any;
  }
>(config: AtomConfig<State, Variables>): Atom<State, Variables> {
  const {
    value,
    events = {
      set: (value: State) => value,
      get: (value: State) => value,
    },
    variables,
  } = config;
  const observable = new BehaviorSubject(value());

  /**
   * Sets the value of the Atom instance in the portal map.
   * @param {S} value The new value to set.
   */
  const set = (value: State) => {
    if (events && events?.set) {
      observable.next(events.set(value));
    } else observable.next(value);
  };

  /**
   * Retrieves the current value of the observable stored in the subject.
   *
   * @template T The type of the value stored in the observable.
   * @returns {T} The current value of the observable.
   */
  const get = () => {
    if (events && events?.get) {
      return events.get(observable.value);
    } else return observable.value;
  };

  const subscribe = observable.subscribe;
  const unsubscribe = observable.unsubscribe;
  const previous = observable.previous;
  const redo = observable.redo;
  const undo = observable.undo;

  const props = {
    set,
    get,
    subscribe,
    unsubscribe,
    previous,
    redo,
    undo,
    get state() {
      return variables as Variables;
    },
  };

  return props;
}

/**
 * Custom hook to access and manage an isolated state within an Atom storage.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Atom<S, A>} store The Atom storage from which to access the state.
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
export function useAtom<State, Variables>(
  store: Atom<State, Variables>
): [State, Dispatch<SetStateAction<State>>] {
  const { get, subscribe } = store;
  const [state, setState] = useState(get());

  useEffect(() => {
    const subscriber = subscribe(setState);
    return subscriber.unsubscribe;
  }, []);

  return [state, setState];
}
