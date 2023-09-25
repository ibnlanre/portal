import {
  Dispatch,
  Reducer,
  SetStateAction,
  useEffect,
  useReducer,
  useState,
} from "react";

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

type Actions<State, CleanUp extends () => void | void, Data, Variables> = {
  get?: (value: State, variables: Variables) => Data;
  set?: (value: State, variables: Variables) => State;
  run?: <Value = Data>(
    props: Atom<State, Value, Variables>,
    ...args: any[]
  ) => CleanUp;
  use?: <Value = Data>(props: Atomic<State, CleanUp, Value, Variables>) => void;
};

type AtomConfig<State, CleanUp extends () => void, Data, Variables> = {
  state: (variables: Variables) => State;
  actions?: Actions<State, CleanUp, Data, Variables>;
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

interface Atomic<State, CleanUp extends () => void | void, Run, Data, Variables>
  extends Atom<State, Data, Variables> {
  use: <Value = Data>(
    props: Atomic<State, CleanUp, Run, Value, Variables>
  ) => void;
  rerun: (...values: Run[]) => void;
  cleanup: CleanUp;
}

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
  CleanUp extends () => void | void,
  Data = State,
  Variables extends {
    [key: string]: any;
  } = {}
>(config: AtomConfig<State, CleanUp, Data, Variables>) {
  const { state, actions, variables = {} as Variables } = config;
  const { set, get, run, use } = { ...actions };

  const observable = new BehaviorSubject(state(variables));
  const { subscribe, unsubscribe, previous, redo, undo } = observable;

  const props = {
    /**
     * Sets the value of the Atom instance in the portal map.
     * @param {S} value The new value to set.
     */
    update: observable.next,
    set: (value: State) => {
      return set ? set(value, variables) : (value as unknown as State);
    },
    /**
     * Retrieves the current value of the observable stored in the subject.
     *
     * @template Type The type of the value stored in the observable.
     * @returns {Type} The current value of the observable.
     */
    value: observable.value,
    get: (value: State) => {
      return get ? get(value, variables) : (value as unknown as Data);
    },
    subscribe,
    unsubscribe,
    variables,
    previous,
    redo,
    undo,
  };

  const atomic = {
    ...props,
    cleanup: run?.(props),
    rerun: (...values: any[]) => {
      atomic.cleanup?.();
      if (run) {
        atomic.cleanup = run?.(props, ...values);
      }
    },
  };

  return atomic;
}

/**
 * Custom hook to access and manage an isolated state within an Atom storage.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Atom<S, A>} store The Atom storage from which to access the state.
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
export function useAtom<
  State,
  CleanUp extends () => void | void,
  Data,
  Variables
>(store: Atomic<State, CleanUp, Data, Variables>) {
  const { get, value, set, update, subscribe, use } = store;
  const [state, setState] = useState(value);

  useEffect(() => {
    const subscriber = subscribe(setState, false);

    return () => {
      subscriber.unsubscribe;
    };
  }, []);

  const atom = get(state);
  const setAtom = (value: State) => {
    update(set(value));
  };

  return [atom, setAtom] as const;
}
