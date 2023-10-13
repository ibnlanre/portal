import { AtomSubject } from "subject";
import {
  Atom,
  AtomConfig,
  Fields,
  Garbage,
  Params,
  Subscription,
} from "definition";
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
 * @returns {Atom<State, Data, Context, Properties,Use>} An object containing Atom properties and functions.
 */
export function atom<
  State,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {},
  Properties extends {
    [key: string]: any;
  } = {},
  Use extends ReadonlyArray<any> = []
>(
  config: AtomConfig<State, Data, Context, Properties, Use>
): Atom<State, Data, Context, Properties, Use> {
  const {
    state,
    context = {} as Context,
    properties = {} as Properties,
    events,
  } = config;
  const { set, get, use } = { ...events };

  const variant = new AtomSubject(properties);
  const waitlist = new Set<Atom<State, Data, Context, Properties, Use>>();

  const stateful = isAtomStateFunction(state) ? state(context) : state;
  const observable = new AtomSubject(stateful);
  const { previous, redo, undo, next } = observable;

  const garbage = {
    update: new Set<() => void>(),
    unmount: new Set<() => void>(),
  };

  const on: Garbage = {
    update: (fn?: () => void) => {
      if (typeof fn === "function") {
        garbage.update.add(fn);
      }
    },
    unmount: (fn?: () => void) => {
      if (typeof fn === "function") {
        garbage.unmount.add(fn);
      }
    },
  };

  const emit = (
    props: Partial<Properties> | ((curr: Properties) => Properties)
  ) => {
    const curr = variant.value;
    if (typeof props === "function") variant.next({ ...props(curr) });
    else variant.next({ ...curr, ...props });
    return variant.value;
  };

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
    get value() {
      return observable.value;
    },
    get ctx() {
      return context;
    },
    get props() {
      return variant.value;
    },
    set: (value: State) => {
      const params: Params<State, Context, Properties> = {
        props: variant.value,
        previous: observable.value,
        ctx: context,
        value,
      };

      // The set function allows optional transformations and returns the new state.
      if (set) {
        const value = set(params);
        return value;
      } else return value as unknown as State;
    },
    next,
    previous,
    subscribe: (observers, initialize) => {
      let state: Subscription, props: Subscription;

      if (observers.state) {
        state = observable.subscribe(observers.state, initialize);
      }
      if (observers.props) {
        props = variant.subscribe(observers.props, initialize);
      }

      return {
        unsubscribe: () => {
          state?.unsubscribe();
          props?.unsubscribe();
        },
      };
    },
    redo,
    undo,
    get history() {
      return observable.history;
    },
    emit,
    on,
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
  const atomic: Atom<State, Data, Context, Properties, Use> = {
    ...fields,
    use: (...args: Use) => {
      const value = use?.(fields, ...args);
      on.unmount(value);
    },
    get: (value: State = observable.value) => {
      const params = {
        props: variant.value,
        previous: observable.value,
        ctx: context,
        value,
      };

      // The get function allows optional transformations and returns the transformed value.
      if (get) {
        const value = get(params);
        return value;
      } else return value as unknown as Data;
    },
    waitlist,
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
