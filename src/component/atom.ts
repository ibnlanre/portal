import { AtomSubject } from "subject";
import {
  Atom,
  AtomConfig,
  Fields,
  Collector,
  Setter,
  Getter,
  Subscription,
} from "definition";
import { isAtomStateFunction, isFunction } from "utilities";

/**
 * Creates an Atom instance for managing and updating state.
 *
 * @template State The type of the state.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of the context associated with the Atom.
 * @template Properties The type of properties associated with the Atom.
 * @template Dependencies An array of argument types for the `use` event.
 * @template Seeds An array of argument types for the `get` event.
 *
 * @param {Object} config Configuration object for the Atom.
 * @param {State | ((context: Context) => State)} config.state Initial state or a function to generate the initial state.
 * @param {Context} [config.context] Context object to be passed to events.
 * @param {Properties} [config.properties] Record of mutable properties on the atom instance.
 *
 * @param {Object} [config.events] events object containing functions to interact with the Atom.
 * @param {(params: Setter<State, Context, Properties>) => State} [config.events.set] Function to set the Atom's state.
 * @param {(params: Getter<State, Context, Properties>) => Data} [config.events.get] Function to get data from the Atom's state.
 * @param {(fields: Fields<State, Context, Properties>, ...dependencies: Dependencies) => Collector} [config.events.use] Function to perform asynchronous events.
 *
 * @returns {Atom<State, Data, Context, Properties,Dependencies, Seeds>} An object containing Atom properties and functions.
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
  Dependencies extends ReadonlyArray<any> = [],
  Seeds extends ReadonlyArray<any> = []
>(
  config: AtomConfig<State, Data, Context, Properties, Dependencies, Seeds>
): Atom<State, Data, Context, Properties, Dependencies, Seeds> {
  const {
    state,
    context = {} as Context,
    properties = {} as Properties,
    events,
  } = config;
  const { set, get, use } = { ...events };

  const variant = new AtomSubject(properties);
  const waitlist = new Set<
    Atom<State, Data, Context, Properties, Dependencies, Seeds>
  >();

  const stateful = isAtomStateFunction(state) ? state(context) : state;
  const observable = new AtomSubject(stateful);
  const { previous, redo, undo, next } = observable;

  const collector = {
    rerun: new Set<() => void>(),
    unmount: new Set<() => void>(),
  };

  const on: Collector = {
    rerun: (fn?: () => void) => {
      if (typeof fn === "function") {
        collector.rerun.add(fn);
      }
    },
    unmount: (fn?: () => void) => {
      if (typeof fn === "function") {
        collector.unmount.add(fn);
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
      const params: Setter<State, Context, Properties> = {
        value,
        props: variant.value,
        previous: observable.value,
        ctx: context,
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
      const purge = (garbage: () => void) => {
        try {
          garbage();
        } catch (err) {
          console.error("Error occured during cleanup", err);
        }
      };
      collector[bin].forEach(purge);
    },
  };

  /**
   * Represents the properties and functions associated with an Atom instance.
   *
   * @typedef {Object} Props
   * @property {Function} use - A function to execute the `use` function with optional arguments and update `collector`.
   * @property {Function} get A function to get the value of the Atom instance with optional transformations.
   * @property {Set<() => void>} waitlist - A set containing functions to execute when awaiting state changes.
   * @property {Function} await - A function to await state changes and execute associated functions.
   */
  const atomic: Atom<State, Data, Context, Properties, Dependencies, Seeds> = {
    ...fields,
    use: (...dependencies: Dependencies) => {
      const value = use?.(fields, ...dependencies);
      if (isFunction(value)) on.unmount(value);
      else {
        on.rerun(value?.rerun);
        on.unmount(value?.unmount);
      }
    },
    get: (
      value: State = observable.value,
      ...seeds: Seeds
    ) => {
      const params: Getter<State, Context, Properties> = {
        value,
        props: variant.value,
        previous: observable.value,
        ctx: context,
      };

      // The get function allows optional transformations and returns the transformed value.
      if (get) {
        const value = get(params, ...seeds);
        return value;
      } else return value as unknown as Data;
    },
    waitlist,
    await: (dependencies: Dependencies) => {
      const store = Array.from(waitlist).pop();
      if (store) {
        waitlist.clear();
        fields.dispose("rerun");
        store.use(...dependencies);
      }
      return () => fields.dispose("unmount");
    },
  };

  return atomic;
}
