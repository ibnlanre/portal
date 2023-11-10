import type { SetStateAction, Dispatch } from "react";
import type { BehaviorSubject } from "@/subject";

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

export type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? K extends "use" | "get"
          ? never
          : `${K}` | `${K}.${Paths<T[K]>}`
        : never;
    }[keyof T]
  : "";

export type ParseAsNumber<Key extends string | number> =
  Key extends `${infer Value extends number}` ? Value : Key;

export type GetValueByPath<
  T,
  Path extends string | number
> = ParseAsNumber<Path> extends keyof T
  ? T[ParseAsNumber<Path>]
  : Path extends `${infer Key}.${infer Rest}`
  ? ParseAsNumber<Key> extends keyof T
    ? GetValueByPath<T[ParseAsNumber<Key>], Rest>
    : never
  : never;

/**
 * Represents a map of keys and values in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalMap<State, Path> = Map<Path, BehaviorSubject<State>>;

/**
 * Represents a storage type.
 * @typedef {"local" | "session" | "cookie"} StorageType
 */
export type StorageType = "local" | "session" | "cookie";

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
 * Represents the result of the usePortal hook.
 * @template State The type of the store value.
 */
export type PortalState<State> = [State, Dispatch<SetStateAction<State>>];

export * from "./cookieOptions";
export * from "./atom";
