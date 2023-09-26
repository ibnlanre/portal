/**
 * Type guard to check if a value is a SetStateAction function.
 *
 * @template S The type of the state.
 * @param {SetStateAction<S>} value The value to be checked.
 * @returns {boolean} `true` if the value is a SetStateAction function, otherwise `false`.
 */
export function isSetStateFunction<State, Context>(
  value: State | ((context: Context) => State)
): value is (context: Context) => State {
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

interface Values<State> {
  then: State;
  now: State;
}

type Actions<State, Run, Residue, Data, Context> = {
  get?: (values: Values<State>, context: Context) => Data;
  set?: (values: Values<State>, context: Context) => State;
  run?: <Value = Data>(
    props: Fields<State, Value, Context>,
    ...args: Run[]
  ) => Residue;
};

type AtomConfig<State, Run, Residue, Data, Context> = {
  state: State | ((context: Context) => State);
  actions?: Actions<State, Run, Residue, Data, Context>;
  context?: Context;
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template S The type of the state.
 */
export type Fields<State, Data, Context> = {
  value: State;
  set: (value: State) => State;
  get: (value: State) => Data;
  previous: () => State | undefined;
  next: (value: State) => void;
  subscribe: (observer: (value: State) => any) => {
    unsubscribe: () => void;
  };
  redo: () => void;
  undo: () => void;
  ctx: Context;
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
  Residue,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {}
>(config: AtomConfig<State, Run, Residue, Data, Context>) {
  const { state, actions, context = {} as Context } = config;
  const { set, get, run } = { ...actions };

  const observable = new BehaviorSubject(
    isSetStateFunction<State, Context>(state) ? state(context) : state
  );
  const { subscribe, previous, redo, undo, next } = observable;

  const fields = {
    /**
     * Sets the value of the Atom instance in the portal map.
     * @param {S} value The new value to set.
     */
    next,
    previous,
    set: (value: State) => {
      return set
        ? set({ then: observable.value, now: value }, context)
        : (value as unknown as State);
    },
    /**
     * Retrieves the current value of the observable stored in the subject.
     *
     * @template Type The type of the value stored in the observable.
     * @returns {Type} The current value of the observable.
     */
    get value() {
      return observable.value;
    },
    get: (value: State) => {
      return get
        ? get({ then: observable.value, now: value }, context)
        : (value as unknown as Data);
    },
    get ctx() {
      return context;
    },
    subscribe,
    redo,
    undo,
  };

  const props = {
    ...fields,
    residue: run?.(fields),
    rerun: (...args: Run[]) => {
      props.residue = run?.(fields, ...args);
    },
  };

  return props;
}
