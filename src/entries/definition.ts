import type { Reducer, SetStateAction, Dispatch } from "react";
import { type BehaviorSubject } from "rxjs";

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
 * Context type for the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalEntriesContext<S, A> = {
  entries: PortalMap<any, any>;
  addItemToEntries: PortalEntryAdder<S, A>;
  removeItemFromEntries: (key: string) => void;
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
  entries: Record<string, PortalEntryObject>;
  remove(key: string): void;
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
