import type { Reducer, SetStateAction, Dispatch } from "react";
import { type BehaviorSubject } from "rxjs";

/**
 * Represents a record of the store value and reducer.
 */
export type PortalEntry<S, A> = {
  observable: BehaviorSubject<S>;
  reducer?: Reducer<S, A>;
};
/**
 * Represents a map of keys and values in the portal entries.
 * @template S
 * @template A
 */
export type PortalType<S, A> = Map<string, PortalEntry<S, A>>;

export type PortalFns = {
  entries: Record<string, { value: any; reducer?: any }>;
  remove(key: string): void;
  clear(): void;
};

/**
 * Function type for setting a key-value pair in the portal entries.
 * @template S
 * @template A
 */
export type PortalSetter<S, A> = (
  key: string,
  value: PortalEntry<S, A>
) => void;

/**
 * Context type for the portal entries.
 * @template S
 * @template A
 */
export type PortalContext<S, A> = {
  entries: PortalType<any, any>;
  addItemToEntries: PortalSetter<S, A>;
  removeItemFromEntries: (key: string) => void;
  clearEntries: () => void;
};

/**
 * @template S
 * @template A
 */
export type Dispatcher<S, A> = A extends undefined
  ? Dispatch<SetStateAction<S>>
  : Dispatch<A>;

/**
 * @template S
 * @template A
 * @typedef {typeof initialState, Dispatcher<S, A>} UsePortalResult
 */
export type UsePortalResult<S, A = undefined> =
  | [S, Dispatcher<S, A>]
  | PortalFns;

/**
 * @template S
 * @typedef {S | (() => S) | Promise<S>} Initial
 */
export type Initial<S> = S | (() => S) | Promise<S>;

type IsString<K> = K extends string ? K : never;
export type PortalKeys<T extends Record<string, any>> = IsString<keyof T>;
