import type { Reducer, SetStateAction, Dispatch, ReactNode } from "react";
import type { BehaviorSubject } from "subject";

type Key<K, P extends string[] = []> = { use: () => [...P, K] };
type TupleOf<T> = T extends any[] ? T : [T];

export type KeyBuilder<
  T extends Record<string, any>,
  P extends string[] = []
> = {
  [K in keyof T]: T[K] extends (...args: infer R) => any
    ? {
        use: (
          ...args: Parameters<T[K]>
        ) => [...P, Extract<K, string>, ...TupleOf<R>];
      }
    : T[K] extends Record<string, any>
    ? Key<K, P> & KeyBuilder<T[K], [...P, Extract<K, string>]>
    : Key<K, P>;
};

export type Builder<T extends Record<string, any>, P extends string[] = []> = {
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

export interface PortalEntriesProvider {
  children: ReactNode;
}

/**
 * Represents a record of the store value and reducer in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalEntry<S, A> = {
  observable: BehaviorSubject<S>;
  reducer?: Reducer<S, A>;
};

/**
 * Function type for adding a key-value pair to the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalEntryAdder<S, A> = (
  key: string,
  value: PortalEntry<S, A>
) => void;

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
 * Context type for the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalEntriesContext<S, A> = {
  entries: PortalMap<any, any>;
  addItemToEntries: PortalEntryAdder<S, A>;
  removeItemFromEntries: (key: any, storageTypes?: Array<StorageType>) => void;
  clearEntries: () => void;
};

/**
 * Type for the dispatcher function based on the action type.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type Dispatcher<S, A> = A extends undefined
  ? Dispatch<SetStateAction<S>>
  : Dispatch<A>;

/**
 * Represents the entry object in the portal entries.
 */
export type PortalEntryObject = {
  value: any;
  reducer?: any;
};

/**
 * Represents the portal entries with specialized methods for managing the entries.
 */
export type PortalEntries = {
  entries: PortalMap<any, any>;
  remove(key: any, storageTypes?: Array<StorageType>): void;
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
export type PortalImplementation = <S, A = undefined>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
) => PortalState<S, A>;

/**
 * Represents the initial value for the portal store.
 * @template S The type of the store value.
 */
export type Initial<S> = S | (() => S) | Promise<S>;
