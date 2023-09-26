import type { Reducer, SetStateAction, Dispatch } from "react";
import type { CookieOptions } from "./cookieOptions";
import type { BehaviorSubject } from "subject";

type Key<K, P extends readonly string[] = []> = {
  use: <Y extends any[]>(...args: Y) => [...P, K, ...Y];
};

export type KeyBuilder<
  T extends Record<string, any>,
  P extends readonly string[] = []
> = {
  [K in keyof T]: T[K] extends (...args: infer R) => any
    ? {
        get: <Y extends any[]>(...args: Y) => [...P, Extract<K, string>, ...Y];
        use: (...args: Parameters<T[K]>) => [...P, Extract<K, string>, ...R];
      }
    : T[K] extends Record<string, any>
    ? Key<K, P> & KeyBuilder<T[K], [...P, Extract<K, string>]>
    : Key<K, P>;
};

export type Builder<
  T extends Record<string, any>,
  P extends readonly string[] = []
> = {
  use: () => T;
} & KeyBuilder<T, P>;

export type NestedObject<
  T extends Record<string, any>,
  P extends string[]
> = P extends [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends string[]
      ? { [K in First]: NestedObject<T, Rest> }
      : never
    : never
  : T;

/**
 * Represents a record of the store value and reducer in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalEntry<S, A> = {
  observable: BehaviorSubject<S>;
  reducer?: Reducer<S, A>;
  cookieOptions?: CookieOptions;
  waitlist?: Set<Initial<S>>;
};

/**
 * Represents a map of keys and values in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalMap<S, A> = Map<string, PortalEntry<S, A>>;

/**
 * Represents a storage type.
 * @typedef {"local" | "session" | "cookie"} StorageType
 */
export type StorageType = "local" | "session" | "cookie";

/**
 * Represents the type of an action that can be dispatched to update the state.
 *
 * @description
 * If the generic type `A` is defined, the action type is `A`, otherwise, it's `SetStateAction<S>`.
 *
 * @template S The type of the state.
 * @template A The type of the action (optional).
 */
export type Action<S, A> = A | SetStateAction<S>;

/**
 * Represents the type of a subscription to a `Subject`.
 */
export type Subscription = {
  /**
   * Unsubscribes the callback from receiving further updates.
   */
  unsubscribe: () => void;
};

/**
 * Type for the dispatcher function based on the action type.
 * If the type `A` (actions) is `undefined`, the value is of type `S`.
 * Otherwise, the value is of type `A`.
 *
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type Dispatcher<S, A> = Dispatch<Action<S, A>>;

/**
 * Represents the portal entries with specialized methods for managing the entries.
 */
export type PortalEntries = {
  /**
   * Map containing a record of each portal value and reducer function
   * @type {Map}
   */
  entries: PortalMap<any, any>;
  /**
   * Function for deleting a key from the portal system.
   * @param {any} key The key to delete.
   * @returns {void}
   */
  remove(key: any, storageTypes?: Array<StorageType>): void;
  /**
   * Function for clearing all entries from the portal system.
   * @returns {void}
   */
  clear(): void;
};

/**
 * Represents the result of the usePortal hook.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalState<S, A = undefined> = [S, Dispatcher<S, A>];

/**
 * Represents the result of the `usePortal` hook.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalResult<S, A = undefined> = PortalState<S, A> | PortalEntries;

/**
 * Represents the initial value for the portal store.
 * @template S The type of the store value.
 */
export type Initial<S> = S | (() => S) | Promise<S>;

/**
 * Represents the implementation of a portal.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 *
 * @param {any} key The key associated with the portal.
 * @param {Initial<S>} [initialState] The initial state of the portal.
 * @param {Reducer<S, A>} [reducer] The reducer function for the portal.
 *
 * @returns {PortalState<S, A>} A tuple containing the state and a function for updating the state.
 */
export type PortalImplementation<T> = <S extends T, A = undefined>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
) => PortalState<S, A>;

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
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

interface Values<State> {
  then: State;
  now: State;
}

export type Actions<State, Run, Residue, Data, Context> = {
  get?: (values: Values<State>, context: Context) => Data;
  set?: (values: Values<State>, context: Context) => State;
  run?: <Value = Data>(
    props: Fields<State, Value, Context>,
    ...args: Run[]
  ) => Residue;
};

export type AtomConfig<State, Run, Residue, Data, Context> = {
  state: State | ((context: Context) => State);
  actions?: Actions<State, Run, Residue, Data, Context>;
  context?: Context;
};

export interface Atom<State, Run, Residue, Data, Context>
  extends Fields<State, Data, Context> {
  rerun: (...values: Run[]) => void;
  residue: Residue;
}

export * from "./cookieOptions";
export * from "./implementation";
