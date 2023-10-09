import { AtomSubject } from "subject";
import { Atom, AtomConfig, Fields, Garbage, Params } from "definition";
import { isAtomStateFunction } from "utilities";

/**
 * Creates an Atom instance for managing and updating state.
 *
 * @template State The type of the state.
 * @template Use An array of argument types for the `use` event.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of the context associated with the Atom.
 * @template Properties The type of properties associated with the Atom.
 *
 * @param {Object} config - Configuration object for the Atom.
 * @param {State | ((context: Context) => State)} config.state - Initial state or a function to generate the initial state.
 * @param {Context} [config.context] - Context object to be passed to events.
 * @param {Properties} [config.properties] - Record of mutable properties on the atom instance.
 *
 * @param {Object} [config.events] - events object containing functions to interact with the Atom.
 * @param {(params: ActionParams<State, Data, Context>) => State} [config.events.set] - Function to set the Atom's state.
 * @param {(params: ActionParams<State, Data, Context>) => Data} [config.events.get] - Function to get data from the Atom's state.
 * @param {(fields: Fields<State, Context, Properties>, ...args: Use) => Dump | undefined} [config.events.use] - Function to perform asynchronous events.
 *
 * @returns {Atom<State, Use, Data, Context, Properties>} An object containing Atom properties and functions.
 */
export function atom<
  State,
  Use extends ReadonlyArray<any>,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {},
  Properties extends {
    [key: string]: any;
  } = {}
>(config: AtomConfig<State, Use, Data, Context, Properties>) {
  type Atomic = Atom<State, Use, Data, Context, Properties>;

  const {
    state,
    context = {} as Context,
    properties = {} as Properties,
    events,
  } = config;
  const { set, get, use } = { ...events };

  const variant = new AtomSubject(properties);
  const waitlist = new Set<Atomic>();
  const garbage = {
    update: new Set<() => void>(),
    unmount: new Set<() => void>(),
  };

  const on: Garbage = {
    /**
     * Adds a cleanup function to be executed when the Atom is updated.
     *
     * @function
     * @param {() => void} fn The cleanup function to add.
     */
    update: (fn?: () => void) => {
      if (typeof fn === "function") {
        garbage.update.add(fn);
      }
    },
    /**
     * Adds a cleanup function to be executed when the Atom is unmounted.
     *
     * @function
     * @param {() => void} fn The cleanup function to add.
     */
    unmount: (fn?: () => void) => {
      if (typeof fn === "function") {
        garbage.unmount.add(fn);
      }
    },
  };

  /**
   * Emits a change by updating the properties associated with the Atom.
   * @param {Partial<Properties> | ((curr: Properties) => Properties)} props The new variable or a function to transform the existing properties.
   * @returns {Properties} The updated properties.
   */
  const emit = (
    props: Partial<Properties> | ((curr: Properties) => Properties)
  ) => {
    const curr = variant.value;
    if (typeof props === "function") variant.next({ ...props(curr) });
    else variant.next({ ...curr, ...props });
    return variant.value;
  };

  const stateful = isAtomStateFunction(state) ? state(context) : state;
  const observable = new AtomSubject(stateful);
  const { subscribe, previous, redo, undo, next } = observable;

  /**
   * Represents the core fields and properties of an Atom instance.
   *
   * @typedef {Object} Fields
   * @property {State} value The current value of the Atom instance.
   * @property {Context} ctx The context associated with the Atom instance.
   * @property {Properties} props The properties associated with the Atom instance.
   * @property {Function} set A function to set the value of the Atom instance with optional transformations.
   * @property {Function} next A function to update the value of the Atom instance.
   * @property {Function} previous A function to access the previous value of the Atom.
   * @property {Function} subscribe A function to subscribe to changes in the Atom's value.
   * @property {Function} redo A function to redo a previous state change.
   * @property {Function} undo A function to undo a previous state change.
   * @property {Array<State>} history An array containing the history of state changes.
   * @property {Function} emit Sets the context of the Atom instance.
   * @property {Function} dispose Disposes of the Atom instance and associated resources.
   */
  const fields: Fields<State, Context, Properties> = {
    /**
     * Gets the current value of the Atom instance.
     *
     * @function
     * @returns {State} The current value.
     */
    get value() {
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
     * Gets the `properties` associated with the Atom instance.
     *
     * @function
     * @returns {Context} The `properties`.
     */
    get props() {
      return variant.value;
    },

    /**
     * Sets the state with a new value, optionally transforming it using the provided function.
     *
     * @function
     * @param {State} value The new state value or a transformation function.
     * @returns {State} The updated state value after the change.
     */
    set: (value: State) => {
      const params: Params<State, Context, Properties> = {
        props: variant.value,
        previous: observable.value,
        ctx: context,
        value,
      };

      // The set function allows optional transformations and returns the new state.
      if (set) return set(params);
      else return value as unknown as State;
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
     * Sets the properties of the Atom instance.
     *
     * @param {Partial<Properties> | ((currentStatus: Properties) => Properties)} ctx The new properties or a function to update the current properties.
     */
    emit,

    /**
     * Provides control over functions to execute on specific Atom events.
     *
     * @typedef {Object} Garbage
     * @property {Function} update A function to add a cleanup function to be executed when the Atom is updated.
     * @property {Function} unmount A function to add a cleanup function to be executed when the Atom is unmounted.
     */
    on,

    /**
     * Disposes of the set of functions resulting from the last execution of the `use` function.
     */
    dispose: (bin) => {
      const purge = (fn: () => void) => {
        try {
          fn();
        } catch (err) {
          console.error("Error occured during cleanup", err);
        }
      };
      garbage[bin].forEach(purge);
    },
  };

  /**
   * Represents the properties and functions associated with an Atom instance.
   *
   * @typedef {Object} Props
   * @property {Function} use - A function to execute the `use` function with optional arguments and update `garbage`.
   * @property {Function} get A function to get the value of the Atom instance with optional transformations.
   * @property {Set<() => void>} waitlist - A set containing functions to execute when awaiting state changes.
   * @property {Function} await - A function to await state changes and execute associated functions.
   */
  const atomic: Atomic = {
    ...fields,

    /**
     * Execute the `use` function with optional arguments and update `garbage`.
     *
     * @function
     * @param {...Use} args Optional arguments to pass to the `use` function.
     * @returns {void}
     */
    use: (...args: Use) => {
      on.unmount(use?.(fields, ...args));
    },

    /**
     * Retrieves the current state or optionally transforms it using the provided function.
     *
     * @function
     * @param {State} value The current state value or a transformation function.
     * @returns {Data} The transformed value, which could be of a different data type.
     */
    get: (value: State = observable.value) => {
      const params = {
        props: variant.value,
        previous: observable.value,
        ctx: context,
        value,
      };

      // The get function allows optional transformations and returns the transformed value.
      if (get) return get(params);
      else return value as unknown as Data;
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
    await: (args: Use) => {
      const store = Array.from(waitlist).pop();
      if (store) {
        fields.dispose("update");
        waitlist.clear();
        store.use(...args);
      }
      return () => fields.dispose("unmount");
    },
  };

  return atomic;
}
