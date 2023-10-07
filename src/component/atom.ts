import { Atom, AtomConfig, Fields, Params } from "definition";
import { AtomSubject } from "subject";
import { isAtomStateFunction } from "utilities";

/**
 * Creates an Atom instance with specified configuration.
 *
 * @template State - The state type.
 * @template Use - An array type containing the argument types of the `use` function.
 * @template Data - The type of data returned by the `get` function.
 * @template Context - The type of the context object.
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
 * @returns {Props<State, Use, Data, Context>} An object containing Atom properties and functions.
 */
export function atom<
  State,
  Use extends ReadonlyArray<any>,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {},
  Status extends {
    [key: string]: any;
  } = {}
>(config: AtomConfig<State, Use, Data, Context, Status>) {
  const {
    state,
    events,
    context = {} as Context,
    status = {} as Status,
  } = config;
  const { set, get, use } = { ...events };

  const garbarge = new Set<() => void>();
  const waitlist = new Set<Atom<State, Use, Data, Context, Status>>();

  // STATE
  const observable = new AtomSubject(
    isAtomStateFunction<State, Context>(state) ? state(context) : state
  );
  const { subscribe, previous, redo, undo, next } = observable;

  // STATUS
  const stats = new AtomSubject(status);

  /**
   * Emits a status change by updating the status associated with the Atom.
   * @param {Partial<Status> | ((currentStatus: Status) => Status)} status The new status or a function to transform the existing status.
   */
  const emit = (
    status: Partial<Status> | ((currentStatus: Status) => Status)
  ) => {
    const currentStatus = stats.value;
    if (typeof status === "function") {
      stats.next({ ...status(currentStatus) });
    } else stats.next({ ...currentStatus, ...status });
  };

  /**
   * Represents the core fields and properties of an Atom instance.
   *
   * @typedef {Object} Fields
   * @property {State} value The current value of the Atom instance.
   * @property {Context} ctx The context associated with the Atom instance.
   * @property {Function} set A function to set the value of the Atom instance with optional transformations.
   * @property {Function} get A function to get the value of the Atom instance with optional transformations.
   * @property {Function} next A function to update the value of the Atom instance.
   * @property {Function} previous A function to access the previous value of the Atom.
   * @property {Function} subscribe A function to subscribe to changes in the Atom's value.
   * @property {Function} redo A function to redo a previous state change.
   * @property {Function} undo A function to undo a previous state change.
   * @property {Array<State>} history An array containing the history of state changes.
   * @property {Function} emit Sets the context of the Atom instance.
   * @property {Function} dispose Disposes of the Atom instance and associated resources.
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
     * Gets the `status` associated with the Atom instance.
     *
     * @function
     * @returns {Context} The `status`.
     */
    get stats() {
      return stats.value;
    },

    /**
     * Sets the state with a new value, optionally transforming it using the provided function.
     *
     * @function
     * @param {State} value The new state value or a transformation function.
     * @returns {State} The updated state value after the change.
     */
    set: (value: State) => {
      const params: Params<State, Context> = {
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
     *
     * @function
     * @param {State} value The current state value or a transformation function.
     * @returns {Data} The transformed value, which could be of a different data type.
     */
    get: (value: State = observable.value) => {
      const params: Params<State, Context> = {
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
     * @param {Partial<Status> | ((currentStatus: Status) => Status)} ctx The new status or a function to update the current status.
     */
    emit,

    /**
     * Disposes of the set of functions resulting from the last execution of the `use` function.
     */
    dispose: () => {
      garbarge.forEach((value) => value());
    },
  };

  /**
   * Represents the properties and functions associated with an Atom instance.
   *
   * @typedef {Object} Props
   * @property {Function} use - A function to execute the `use` function with optional arguments and update `garbarge`.
   * @property {Set<() => void>} waitlist - A set containing functions to execute when awaiting state changes.
   * @property {Function} await - A function to await state changes and execute associated functions.
   */
  const props: Atom<State, Use, Data, Context, Status> = {
    ...fields,

    /**
     * Execute the `use` function with optional arguments and update `garbarge`.
     *
     * @function
     * @param {...Use} args Optional arguments to pass to the `use` function.
     * @returns {void}
     */
    use: (...args: Use) => {
      const result = use?.(fields, ...args);
      if (typeof result === "function") garbarge.add(result);
    },

    /**
     * A set containing functions to execute when awaiting state changes.
     * @type {Set<() => void>}
     */
    waitlist,

    /**
     * A function to await state changes and execute associated functions.
     *
     * @function
     * @param {Use} args Optional arguments to pass to the awaited state change function.
     * @returns {Function} A function to cancel awaiting state changes.
     */
    await: (args: Use): (() => void) => {
      fields.dispose();

      const store = Array.from(waitlist)?.pop();
      const result = store?.use(...args);
      if (typeof result === "function") garbarge.add(result);
      if (waitlist.size) waitlist.clear();

      return fields.dispose;
    },
  };

  return props;
}
