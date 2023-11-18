import type { SetStateAction, Dispatch } from "react";

import type { BehaviorSubject } from "@/subject";
import { CookieOptions } from "./cookie";

export type GetState<State> = (state: State) => State;
export type SetStore<State> = (value: State) => void;

export type PortalOptions<Store, State, Data = State> = {
  /**
   * The store to use for the portal.
   */
  store?: Store;

  /**
   * The initial value of the portal.
   *
   * @description
   * If the `path` is defined within the portal, the state will be ignored.
   */
  state?: State;

  /**
   * Select the required data from the state.
   *
   * @default (value: State) => Data
   * @param value The state value.
   *
   * @returns The selected data.
   */
  select?: (value: State) => Data;

  /**
   * Callback to run after the state is initialized or updated.
   *
   * @summary
   * - when the state is initialized or updated.
   * - if the state is updated by the `get` method.
   */
  set?: SetStore<State>;

  /**
   * Method to get the initial value.
   *
   * @description
   * - When the `get` method is undefined, the initial value will be used.
   * - If `override` is false, the value returned will not override the initial value.
   * - This method is only called once, except when the `key` changes.
   */
  get?: GetState<State>;
};

export interface Config<Store, State, Data = State>
  extends Omit<PortalOptions<Store, State, Data>, "set" | "get"> {
  /**
   * The key to use in the storage.
   * @default path
   */
  key?: string;

  /**
   * Set the value in the storage.
   *
   * @default (value: State) => JSON.stringify(value)
   *
   * @param value The value from the portal.
   * @returns The value to be stored.
   */
  set?: (value: State) => string;

  /**
   * Get the value from the storage.
   *
   * @default (value: string) => JSON.parse(value)
   *
   * @param value The value from the portal.
   * @returns The value to set the portal to.
   */
  get?: (value: string) => State;
}

export interface CookieConfig<Store, State> extends Config<Store, State> {
  /**
   * The options for the cookie.
   */
  cookieOptions?: CookieOptions;
}

export type PortalValue<State> = {
  /**
   * A set of middlewares to run when the state is updated.
   */
  storage: Set<SetStore<State>>;

  /**
   * The BehaviorSubject that contains the current value of the store.
   */
  observable: BehaviorSubject<State>;
};

export interface UsePortalImplementation<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
> {
  path: Path;
  initialState?: State;
  options?: PortalOptions<Store, State, Data>;
}

/**
 * Represents a map of keys and values in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalMap<State, Path> = Map<Path, PortalValue<State>>;

/**
 * Represents the result of the usePortal hook.
 * @template State The type of the store value.
 */
export type PortalState<State, Data = State> = [
  Data,
  Dispatch<SetStateAction<State>>
];

/**
 * Represents the path to a value in a store.
 *
 * @description
 * Do not modify this type, without taking into consideration the following:
 * 1. Methods defined within the Record values.
 * 2. Number and Array types.
 *
 * @summary
 * 1. It is a string literal type.
 * 2. It is a union of all the possible paths in the store.
 */
export type Paths<Base, Delimiter extends string = "."> = Base extends Record<
  infer Keys extends string | number,
  infer Value
>
  ? {
      [Key in Keys]: Key extends string | number
        ? Extract<Value, Base[Key]> extends Record<string, any>
          ? `${Key}` | `${Key}${Delimiter}${Paths<Base[Key], Delimiter>}`
          : `${Keys}`
        : never;
    }[Keys]
  : never;

export type ParseAsNumber<Key extends string | number> =
  Key extends `${infer Value extends number}` ? Value : Key;

export type GetValueByPath<
  T,
  Path extends string | number,
  Delimiter extends string = "."
> = ParseAsNumber<Path> extends keyof T
  ? T[ParseAsNumber<Path>]
  : Path extends `${infer Key}${Delimiter}${infer Rest}`
  ? ParseAsNumber<Key> extends keyof T
    ? GetValueByPath<T[ParseAsNumber<Key>], Rest>
    : never
  : never;

/**
 * Represents the result of the makeUsePortal function.
 * @template Store The type of the store.
 */
export interface UsePortal<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data = State
> {
  /**
   * Custom hook to access and manage state in the portal system.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   * @returns {[State, Dispatch<SetStateAction<State>>]} A tuple containing the state and a function for updating the state.
   */
  (path: Path, options?: PortalOptions<Store, State>): PortalState<State>;
  /**
   * Custom hook to access and manage state in the portal system with localStorage support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  local(path: Path, config?: Config<Store, State>): PortalState<State>;
  /**
   * Custom hook to access and manage state in the portal system with sessionStorage support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  session(path: Path, config?: Config<Store, State>): PortalState<State>;

  /**
   * Custom hook to access and manage state in the portal system with cookie support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   * @template Store The type of the store.
   *
   * @param {Path} path The path to the store value.
   * @param {CookieOptions} cookieOptions The options for the cookie.
   *
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  cookie(path: Path, config?: CookieConfig<Store, State>): PortalState<State>;
}
