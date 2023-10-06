import type { Reducer, SetStateAction, Dispatch } from "react";
import type { CookieOptions } from "./cookieOptions";
import type { BehaviorSubject } from "subject";

type Key<K, P extends readonly string[] = []> = {
  get: <Y extends any[]>(...args: Y) => [...P, K, ...Y];
  use: () => [...P, K];
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

type Params<
  State,
  Mop extends (() => void) | void,
  Use extends ReadonlyArray<any>,
  Context
> = {
  log: State;
  ctx: Context;
  val: State;
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
 */
export type Fields<State, Data, Context, Dependencies, Status> = {
  value: () => State;
  get: (value?: State) => Data;
  set: (value: State) => State;
  next: (value: State) => void;
  previous: () => State | undefined;
  subscribe: (
    observer: (value: State) => any,
    initiate?: boolean
  ) => {
    unsubscribe: () => void;
  };
  redo: () => void;
  undo: () => void;
  history: State[];
  ctx: Context;
  deps: Dependencies;
  setStatus: (
    status: Partial<Status> | ((currentStatus: Status) => Status)
  ) => void;
};

export interface Events<
  State,
  Mop extends (() => void) | void,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Dependencies,
  Status
> {
  set?: (params: Params<State, Mop, Use, Context>) => State;
  get?: (params: Params<State, Mop, Use, Context>) => Data;
  use?: <Value = Data>(
    fields: Fields<State, Value, Context, Dependencies, Status>,
    ...args: Use
  ) => Mop | undefined;
}

export type AtomConfig<
  State,
  Mop extends (() => void) | void,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Dependencies,
  Status
> = {
  state: State | ((context: Context) => State);
  enabled?: boolean;
  events?: Events<State, Mop, Use, Data, Context, Dependencies, Status>;
  context?: Context;
  dependencies?: Dependencies;
  status?: Status;
};

export interface Atom<
  State,
  Mop extends (() => void) | void,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Dependencies,
  Status
> extends Fields<State, Data, Context, Dependencies, Status> {
  use: (...args: Use) => Mop | undefined;
  mop: Mop | undefined;
  status: Status;
}

type SetAtom<State, Status> = {
  (value: State | SetStateAction<State>): void;
  status: Status;
};

export type UseAtom<Data, State, Status> = [Data, SetAtom<State, Status>];

export * from "./cookieOptions";
export * from "./implementation";
