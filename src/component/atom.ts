import { Atom, AtomConfig, Fields } from "definition";
import { AtomSubject } from "subject";
import { isAtomStateFunction } from "utilities";

/**
 * @template State The type of the state.
 * @template A The type of the actions.
 *
 * @param {State} initialState The initial state value.
 *
 * @returns {Atom<State, Use, Data, Context>} An instance of the Atom class.
 */
export function atom<
  State,
  Used extends (() => void) | void,
  Use extends ReadonlyArray<any>,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {},
  Dependencies extends Record<string, Atom<any, any, any, any, any, any>> = {}
>(
  config: AtomConfig<State, Used, Use, Data, Context, Dependencies>
): Atom<State, Used, Use, Data, Context, Dependencies> {
  const {
    state,
    actions,
    context = {} as Context,
    dependencies = {} as Dependencies,
  } = config;
  const {
    set,
    get,
    use,
    act = true,
    run = [] as unknown as Use,
  } = { ...actions };

  const observable = new AtomSubject(
    isAtomStateFunction<State, Context>(state) ? state(context) : state
  );
  const { subscribe, previous, redo, undo, next } = observable;

  /**
   * Represents the result from the last execution of the `use` function.
   * @property {Used | undefined} used - A value resulting from the last execution of the `use` function.
   */
  const usage = {
    variable: undefined as Used | undefined,

    /**
     * A value resulting from the last execution of the `use` function, if provided.
     * Undefined if `use` was not provided or returned undefined.
     * @type {Used | undefined}
     */
    get used(): Used | undefined {
      return this.variable;
    },

    /**
     * Sets the value of the `used` property.
     *
     * @param {Used | undefined} value The new value of the `used` property.
     */
    set used(value: Used | undefined) {
      this.variable = value;
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
  const fields: Fields<State, Data, Context, Dependencies> = {
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
     * Gets the dependencies associated with the Atom instance.
     *
     * @function
     * @returns {Array<any>} An array of dependencies.
     */
    get deps() {
      return dependencies;
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
      const params = {
        then: observable.value,
        now: value,
        used: usage.used,
        use: makeUse,
      };

      // The set function allows optional transformations and returns the new state.
      if (set) return set(params, context);
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
      const params = {
        then: observable.value,
        now: value,
        used: usage.used,
        use: makeUse,
      };

      // The get function allows optional transformations and returns the transformed value.
      if (get) return get(params, context);
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
   * @property {Used | undefined} used - The value resulting from the last execution of the `use` function.
   * @property {Function} use - A function to execute the `use` function with optional arguments and update `used`.
   */

  const props = {
    ...fields,

    /**
     * The value resulting from the last execution of the `use` function
     */
    used: usage.used,

    /**
     * Execute the `use` function with optional arguments and update `used`.
     *
     * @param {...Use} args Optional arguments to pass to the `use` function.
     * @returns {Props}
     */
    use: makeUse,
  };

  /**
   * Execute the `use` function with optional arguments and update `used`.
   *
   * @function
   * @param {...Use} args Optional arguments to pass to the `use` function.
   * @returns {Used | undefined} The value resulting from the last execution of the `use` function.
   */
  function makeUse(...args: Use): Used | undefined {
    if (!use) return;
    const result = use?.(fields, ...args);
    return (usage.used = result);
  }

  Object.values(dependencies).forEach((item) => {
    const atom = item as Atom<any, any, any, any, any, any>;
    atom.subscribe(() => {
      usage.used?.();
      makeUse(...run);
    });
  });

  if (act) makeUse(...run);
  return props;
}
