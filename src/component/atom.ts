import {
  Atom,
  AtomConfig,
  Fields,
  Collector,
  Setter,
  Getter,
} from "@/definition";
import { AtomSubject } from "@/subject";
import { isAtomStateFunction, isFunction } from "@/utilities";

/**
 * Atom:
 * ---
 * ---
 * 
 * @description 
 * Creates an Atom instance for managing and updating state.
 *
 * ---
 * Generics:
 * ---
 * ---
 * 
 * @template State - The type of the state.
 * @template Data - The type of data returned by the `get` event.
 * @template Properties - The type of the properties associated with the Atom.
 * @template Context - The type of context associated with the Atom.
 * @template UseArgs - An array of argument types for the `use` event.
 * @template GetArgs - An array of argument types for the `get` event.
 * 
 * --- 
 * Parameters:
 * ---
 * ---
 *
 * @typedef {Object} AtomConfig
 * @param {AtomConfig} config - Configuration object for the Atom.
 * @param {State | ((properties: Properties) => State)} config.state - Initial state or a function to generate the initial state.
 * @param {Properties} [config.properties] - Properties object to be passed to events.
 * @param {Context} [config.context] - Record of mutable context on the atom instance.
 * @param {number} [config.delay] - Delay in milliseconds to wait before executing the `use` function.
 * @param {Object} [config.events] - events object containing functions to interact with the Atom.
 * 
 * ---
 * 
 * @param {(params: Setter<State, Properties, Context>) => State} [config.events.set] - Function to set the Atom's state.
 * @param {(params: Getter<State, Properties, Context>) => Data} [config.events.get] - Function to get data from the Atom's state.
 * @param {(fields: Fields<State, Properties, Context>, ...useArgs: UseArgs) => Collector} [config.events.use] - Function to perform asynchronous events.
 *
 * ---
 * Returns:
 * ---
 * ---
 * 
 * @typedef {Object} Atom
 * @returns {Atom<State, Data, Properties, Context, UseArgs, GetArgs>} An object containing Atom context and functions.
 */
export function atom<
  State,
  Data = State,
  Properties extends {
    [key: string]: any;
  } = {},
  Context extends {
    [key: string]: any;
  } = {},
  UseArgs extends ReadonlyArray<any> = [],
  GetArgs extends ReadonlyArray<any> = []
>(
  config: AtomConfig<State, Data, Properties, Context, UseArgs, GetArgs>
): Atom<State, Data, Properties, Context, UseArgs, GetArgs> {
  const {
    state,
    properties = {} as Properties,
    context = {} as Context,
    delay = 0,
    events,
  } = config;
  const { set, get, use } = { ...events };

  const currentState = isAtomStateFunction(state) ? state(properties) : state;
  const observable = new AtomSubject(currentState);
  const { next, previous, redo, undo, update } = observable;

  const contextual = new AtomSubject(context);
  const waitlist = new Set<
    Atom<State, Data, Properties, Context, UseArgs, GetArgs>
  >();

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

  /**
   * Sets the context of the Atom instance.
   * @param {Partial<Context> | ((curr: Context) => Context)} ctx The context to set.
   * @returns {Context} The updated context.
   */
  const emit = (ctx: Partial<Context> | ((curr: Context) => Context)) => {
    const curr = contextual.value;
    if (typeof ctx === "function") contextual.update({ ...ctx(curr) });
    else contextual.update({ ...curr, ...ctx });
    return contextual.value;
  };

  /**
   * Executes a function and catches any errors.
   * @param {() => void} garbage The function to execute.
   * @returns {void}
   */
  const purge = (garbage: () => void) => {
    try {
      garbage();
    } catch (err) {
      console.error("Error occured during cleanup", err);
    }
  };

  /**
   * Represents the core fields and context of an Atom instance.
   *
   * @typedef {Object} Fields
   * @property {State} value The current value of the Atom instance.
   * @property {Properties} props The properties associated with the Atom instance.
   * @property {Context} ctx The context associated with the Atom instance.
   * @property {Function} set A function to set the value of the Atom instance with optional transformations.
   * @property {Function} next A function to update the value of the Atom instance.
   * @property {Function} previous A function to access the previous value of the Atom.
   * @property {Function} subscribe A function to subscribe to changes in the Atom's value.
   * @property {Function} redo A function to redo a previous state change.
   * @property {Function} undo A function to undo a previous state change.
   * @property {Array<State>} timeline An array containing the timeline of state changes.
   * @property {Function} emit Sets the context of the Atom instance.
   * @property {Function} dispose Disposes of the Atom instance and associated resources.
   */
  const fields: Fields<State, Properties, Context> = {
    get timeline() {
      return observable.timeline;
    },
    get current() {
      return observable.value;
    },
    get previous() {
      return previous();
    },
    get next() {
      return next();
    },
    subscribe: observable.subscribe,
    dispatch: update,
    get props() {
      return properties;
    },
    get ctx() {
      return contextual.value;
    },
    set: (value: State) => {
      const params: Setter<State, Properties, Context> = {
        value,
        ctx: contextual.value,
        current: observable.value,
        props: properties,
        emit,
      };

      // The set function allows optional transformations and returns the new state.
      if (set) update(set(params));
      else update(value);
    },
    provide: contextual.subscribe,
    redo,
    undo,
    emit,
    on,
    dispose: (bin) => {
      collector[bin].forEach(purge);
      collector[bin].clear();
    },
  };

  /**
   * Represents the context and functions associated with an Atom instance.
   *
   * @typedef {Object} AtomInstance
   * @property {Function} use - A function to execute the `use` function with optional arguments and update `collector`.
   * @property {Function} get A function to get the value of the Atom instance with optional transformations.
   * @property {Set<() => void>} waitlist - A set containing functions to execute when awaiting state changes.
   * @property {Function} await - A function to await state changes and execute associated functions.
   */
  const atomInstance: Atom<State, Data, Properties, Context, UseArgs, GetArgs> =
    {
      ...fields,
      use: (...useArgs: UseArgs) => {
        const value = use?.(fields, ...useArgs);
        if (isFunction(value)) on.unmount(value);
        else {
          on.rerun(value?.rerun);
          on.unmount(value?.unmount);
        }
      },
      get: (value: State = observable.value, ...getArgs: GetArgs) => {
        const params: Getter<State, Properties, Context> = {
          value,
          ctx: contextual.value,
          current: observable.value,
          props: properties,
          emit,
        };

        // The get function allows optional transformations and returns the transformed value.
        if (get) return get(params, ...getArgs);
        else return value as unknown as Data;
      },
      await: (useArgs: UseArgs) => {
        const store = Array.from(waitlist).pop();
        if (store) {
          waitlist.clear();
          fields.dispose("rerun");
          store.use(...useArgs);
        }
        return () => fields.dispose("unmount");
      },
      waitlist,
      delay,
    };

  return atomInstance;
}
