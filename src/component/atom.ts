import { Atom, AtomConfig, Fields, Params } from "definition";
import { AtomSubject } from "subject";
import { isAtomStateFunction } from "utilities";

/**
 * Creates an Atom instance with specified configuration.
 *
 * @template State - The state type.
 * @template Dump - The type of the "dump" value returned by the `use` function.
 * @template Use - An array type containing the argument types of the `use` function.
 * @template Data - The type of data returned by the `get` function.
 * @template Context - The type of the context object.
 * @template Dependencies - A record type containing dependencies on other atoms.
 *
 * @param {Object} config - Configuration object for the Atom.
 * @param {State | (() => State)} config.state - Initial state or a function to generate the initial state.
 * @param {Object} [config.events] - events object containing functions to interact with the Atom.
 * @param {(params: ActionParams<State, Data, Context>) => State} [config.events.set] - Function to set the Atom's state.
 * @param {(params: ActionParams<State, Data, Context>) => Data} [config.events.get] - Function to get data from the Atom's state.
 * @param {(fields: Fields<State, Data, Context, Dependencies>, ...args: Use) => Dump | undefined} [config.events.use] - Function to perform asynchronous events.
 * @param {boolean} [config.enabled=true] - Whether to activate the `use` function immediately.
 * @param {Context} [config.context] - Context object to be passed to events.
 * @param {Dependencies} [config.dependencies] - Record of dependencies on other atoms.
 *
 * @returns {Props<State, Data, Context, Dependencies, Dump>} An object containing Atom properties and functions.
 */
export function atom<
  State,
  Dump extends (() => void) | void,
  Use extends ReadonlyArray<any>,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {},
  Status extends {
    [key: string]: any;
  } = {}
>(config: AtomConfig<State, Dump, Use, Data, Context, Status>) {
  const {
    state,
    events,
    context = {} as Context,
    status = {} as Status,
  } = config;
  const { set, get, use } = { ...events };

  const observable = new AtomSubject(
    isAtomStateFunction<State, Context>(state) ? state(context) : state
  );
  const { subscribe, previous, redo, undo, next } = observable;

  const stats = new AtomSubject(status);
  const emit = (
    status: Partial<Status> | ((currentStatus: Status) => Status)
  ) => {
    const currentStatus = stats.value;
    if (typeof status === "function") {
      stats.next({ ...status(currentStatus) });
    } else stats.next({ ...currentStatus, ...status });
  };

  /**
   * Represents the result from the last execution of the `use` function.
   * @property {Dump | undefined} dump - A value resulting from the last execution of the `use` function.
   */
  const garbage = {
    bin: undefined as Dump | undefined,

    /**
     * A value resulting from the last execution of the `use` function, if provided.
     * Undefined if `use` was not provided or returned undefined.
     * @type {Dump | undefined}
     */
    get dump(): Dump | undefined {
      return this.bin;
    },

    /**
     * Sets the value of the `dump` property.
     *
     * @param {Dump | undefined} value The new value of the `dump` property.
     */
    set dump(value: Dump | undefined) {
      this.bin = value;
    },
  };

  /**
   * Represents the core fields and properties of an Atom instance.
   *
   * @typedef {Object} Fields
   * @property {State} value - The current value of the Atom instance.
   * @property {Context} ctx - The context associated with the Atom instance.
   * @property {Function} set - A function to set the value of the Atom instance with optional transformations.
   * @property {Function} get - A function to get the value of the Atom instance with optional transformations.
   * @property {Function} next - A function to update the value of the Atom instance.
   * @property {Function} previous - A function to access the previous value of the Atom.
   * @property {Function} subscribe - A function to subscribe to changes in the Atom's value.
   * @property {Function} redo - A function to redo a previous state change.
   * @property {Function} undo - A function to undo a previous state change.
   * @property {Array<any>} deps - An array of dependencies.
   * @property {Array<State>} history - An array containing the history of state changes.
   */
  const fields: Fields<State, Data, Context, Status> = {
    /**
     * Gets the current value of the Atom instance.
     *
     * @function
     * @returns {State} The current value.
     */
    value: () => {
      return observable.value;
    },
    /**
     * Gets the context associated with the Atom instance.
     *
     * @function
     * @returns {Context} The context.
     */
    get ctx() {
      return context;
    },

    /**
     * Sets the state with a new value, optionally transforming it using the provided function.
     * If a transformation function is provided, it receives the previous state and the new value.
     *
     * @function
     * @param {State} value The new state value or a transformation function.
     * @returns {State} The updated state value after the change.
     */
    set: (value: State) => {
      const params: Params<State, Context, Status> = {
        emit,
        previous: observable.value,
        ctx: context,
        value,
      };

      // The set function allows optional transformations and returns the new state.
      if (set) return set(params);
      else return value as unknown as State;
    },

    /**
     * Retrieves the current state or optionally transforms it using the provided function.
     * If a transformation function is provided, it receives the current state and the new value.
     *
     * @function
     * @param {State} value The current state value or a transformation function.
     * @returns {Data} The transformed value, which could be of a different data type.
     */
    get: (value: State = observable.value) => {
      const params: Params<State, Context, Status> = {
        emit,
        previous: observable.value,
        ctx: context,
        value,
      };

      // The get function allows optional transformations and returns the transformed value.
      if (get) return get(params);
      else return value as unknown as Data;
    },

    /**
     * Updates the state with a new value and notifies subscribers.
     *
     * @function
     * @param {State} value The new state value.
     * @returns {State} The updated state value after the change.
     */
    next,

    /**
     * Retrieves the previous state in the history, if available.
     *
     * @function
     * @returns {State | undefined} The previous state in the history, or undefined if not available.
     */
    previous,

    /**
     * Subscribes to changes in the Atom's value.
     *
     * @function
     * @param {Function} observer - The callback function to be called with the new value.
     * @returns {Object} An object with an `unsubscribe` function to stop the subscription.
     */
    subscribe,

    /**
     * Redoes a previous state change.
     *
     * @function
     */
    redo,

    /**
     * Undoes a previous state change.
     *
     * @function
     */
    undo,

    /**
     * Gets the history of state changes.
     *
     * @function
     * @returns {Array<State>} An array containing the history of state changes.
     */
    get history() {
      return observable.history;
    },

    /**
     * Sets the status of the Atom instance.
     *
     * @param {Partial<Status> | ((currentStatus: Status) => Status)} status The new status or a function to update the current status.
     */
    emit,
  };

  /**
   * Represents the properties and functions associated with an Atom instance.
   *
   * @typedef {Object} Props
   * @property {Function} value - A function to get the current value of the Atom instance.
   * @property {Function} ctx - A function to get the context associated with the Atom instance.
   * @property {Function} set - A function to set the state with a new value.
   * @property {Function} get - A function to retrieve the current state or transform it.
   * @property {Function} next - A function to update the state with a new value and notify subscribers.
   * @property {Function} previous - A function to retrieve the previous state in the history, if available.
   * @property {Function} subscribe - A function to subscribe to changes in the Atom's value.
   * @property {Function} redo - A function to redo a previous state change.
   * @property {Function} undo - A function to undo a previous state change.
   * @property {Array<any>} deps - An array of dependencies.
   * @property {Array<State>} history - An array containing the history of state changes.
   * @property {Dump | undefined} dump - The value resulting from the last execution of the `use` function.
   * @property {Function} use - A function to execute the `use` function with optional arguments and update `dump`.
   * @property {Status} status - The current status of the Atom instance.
   */
  const props: Atom<State, Dump, Use, Data, Context, Status> = {
    ...fields,

    /**
     * The value resulting from the last execution of the `use` function
     */
    dump: garbage.dump,

    /**
     * Execute the `use` function with optional arguments and update `dump`.
     *
     * @param {...Use} args Optional arguments to pass to the `use` function.
     * @returns {Props}
     */
    use: makeUse,

    /**
     * @function
     * The current status of the Atom instance.
     */
    get status() {
      return stats.value;
    },
  };

  /**
   * Execute the `use` function with optional arguments and update `dump`.
   *
   * @function
   * @param {...Use} args Optional arguments to pass to the `use` function.
   * @returns {Dump | undefined} The value resulting from the last execution of the `use` function.
   */
  function makeUse(...args: Use): Dump | undefined {
    garbage.dump?.();
    const result = use?.(fields, ...args);
    return (garbage.dump = result);
  }

  return props;
}
