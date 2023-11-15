import type { SetStateAction, Dispatch } from "react";

import type { BehaviorSubject } from "@/subject";
import { CookieOptions } from "./cookie";

export type GetState<Path, State> = (path: Path) => State;
export type SetStore<Path, State> = (value: State, path: Path) => void;

export type Config<Path, State, Data = State> = {
  /**
   * The key to use in the storage.
   * @default path
   */
  key?: string;
  /**
   * Set the value in the storage.
   *
   * @default (value: State, path: Path) => JSON.stringify(value)
   *
   * @param value The value from the portal.
   * @param path The path to the value in the store.
   * @returns The value to be stored.
   */
  set?: (value: State, path: Path) => string;
  /**
   * Get the value from the storage.
   *
   * @default (value: string, path: Path) => JSON.parse(value)
   *
   * @param value The value from the store.
   * @param path The path to the value in the store.
   * @returns The initial value to portal.
   */
  get?: (value: string, path: Path) => State;
  /**
   * Select the required data from the state.
   *
   * @default (value: State) => Data
   *
   * @param value The state value.
   * @returns The selected data.
   */
  select?: (value: State) => Data;
};

export interface CookieConfig<Path, State> extends Config<Path, State> {
  /**
   * The options for the cookie.
   */
  cookieOptions?: CookieOptions;
}

export type PortalOptions<Path, State, Data = State> = {
  /**
   * Override the portal value with the value from the `get` method.
   * @default true
   */
  override?: boolean;

  /**
   * The initial value of the portal.
   */
  state?: State;

  /**
   * Callback to run after the state is updated.
   */
  set?: SetStore<Path, State>;

  /**
   * Method to get the initial value.
   *
   * @description
   * - The value returned by this method will be used as the initial value.
   * - When the value is undefined, the initial value will be used.
   */
  get?: GetState<Path, State>;

  /**
   * Select the data from the state.
   *
   * @default (value: State) => Data
   * @param value The state value.
   * @returns The selected data.
   */
  select?: (value: State) => Data;
};

export type PortalValue<Path, State> = {
  /**
   * A set of middlewares to run when the state is updated.
   */
  storage: Set<SetStore<Path, State>>;

  /**
   * The BehaviorSubject that contains the current value of the store.
   */
  observable: BehaviorSubject<State>;
};

export interface UsePortalImplementation<
  Path extends string,
  State,
  Data = State
> {
  path: Path;
  initialState?: State;
  options?: PortalOptions<Path, State, Data>;
}

/**
 * Represents a map of keys and values in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalMap<State, Path> = Map<Path, PortalValue<Path, State>>;

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
 * @template Registry The type of the store.
 */
export interface UsePortal<Registry extends Record<string, any>> {
  /**
   * Custom hook to access and manage state in the portal system.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   * @returns {[State, Dispatch<SetStateAction<State>>]} A tuple containing the state and a function for updating the state.
   */
  <Path extends Paths<Registry>, State extends GetValueByPath<Registry, Path>>(
    path: Path,
    options?: PortalOptions<Path, State>
  ): PortalState<State>;
  /**
   * Custom hook to access and manage state in the portal system with localStorage support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  local<
    Path extends Paths<Registry>,
    State extends GetValueByPath<Registry, Path>
  >(
    path: Path,
    config?: Config<Path, State>
  ): PortalState<State>;
  /**
   * Custom hook to access and manage state in the portal system with sessionStorage support.
   *
   * @template Path The type of the path.
   * @template State The type of the state.
   *
   * @param {Path} path The path to the store value.
   * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
   */
  session<
    Path extends Paths<Registry>,
    State extends GetValueByPath<Registry, Path>
  >(
    path: Path,
    config?: Config<Path, State>
  ): PortalState<State>;

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
  cookie<
    Path extends Paths<Registry>,
    State extends GetValueByPath<Registry, Path>
  >(
    path: Path,
    config?: CookieConfig<Path, State>
  ): PortalState<State>;
}
