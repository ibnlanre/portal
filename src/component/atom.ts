import { AtomConfig } from "definition";
import { AtomSubject } from "subject";
import { isAtomStateFunction } from "utilities";

/**
 * @template State The type of the state.
 * @template A The type of the actions.
 *
 * @param {State} initialState The initial state value.
 *
 * @returns {Atom<State, A>} An instance of the Atom class.
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

  const observable = new AtomSubject(
    isAtomStateFunction<State, Context>(state) ? state(context) : state
  );
  const { subscribe, previous, redo, undo, next } = observable;

  /**
   * Represents the core fields and properties of an Atom instance.
   *
   * @property {State} value - The current value of the Atom instance.
   * @property {Context} ctx - The context associated with the Atom instance.
   * @property {Function} next - A function to update the value of the Atom instance.
   * @property {Function} previous - A function to access the previous value of the Atom.
   * @property {Function} set - A function to set the value of the Atom instance with optional transformations.
   * @property {Function} get - A function to get the value of the Atom instance with optional transformations.
   * @property {Function} subscribe - A function to subscribe to changes in the Atom's value.
   * @property {Function} redo - A function to redo a previous state change.
   * @property {Function} undo - A function to undo a previous state change.
   */
  const fields = {
    /**
     * Gets the current value of the Atom instance.
     * @returns {State} The current value.
     */
    get value() {
      return observable.value;
    },
    /**
     * Gets the context associated with the Atom instance.
     * @returns {Context} The context.
     */
    get ctx() {
      return context;
    },
    next,
    previous,
    set: (value: State) => {
      // The set function allows optional transformations and returns the new state.
      return set
        ? set({ then: observable.value, now: value }, context)
        : (value as unknown as State);
    },
    get: (value: State) => {
      // The get function allows optional transformations and returns the transformed value.
      return get
        ? get({ then: observable.value, now: value }, context)
        : (value as unknown as Data);
    },
    /**
     * Subscribes to changes in the Atom's value.
     *
     * @param {Function} observer - The callback function to be called with the new value.
     * @returns {Object} An object with an `unsubscribe` function to stop the subscription.
     */
    subscribe,
    /**
     * Redoes a previous state change.
     */
    redo,
    /**
     * Undoes a previous state change.
     */
    undo,
  };

  /**
   * Represents the properties and functions associated with an Atom instance.
   *
   * @property {Residue | undefined} residue - A value resulting from the last execution of the 'run' function.
   * @property {Function} rerun - A function to re-execute the 'run' function with optional arguments and update 'residue'.
   */
  const props = {
    ...fields,
    /**
     * A value resulting from the last execution of the 'run' function, if provided.
     * Undefined if 'run' was not provided or returned undefined.
     * @type {Residue | undefined}
     */
    residue: run?.(fields),
    /**
     * Re-execute the 'run' function with optional arguments and update 'residue'.
     *
     * @param {...Run[]} args - Optional arguments to pass to the 'run' function.
     */
    rerun: (...args: Run[]) => {
      props.residue = run?.(fields, ...args);
    },
  };

  return props;
}
