/**
 * Represents a store key.
 */
type Key<K, P extends readonly string[] = []> = {
  get: <Y extends any[]>(...args: Y) => [...P, K, ...Y];
  use: () => [...P, K];
};

/**
 * Represents a builder for a store key.
 * @template T The type of the store.
 * @template P The type of the path.
 */
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

/**
 * Represents a builder for a store.
 * @template T The type of the store.
 * @template P The type of the path.
 */
export type Builder<
  T extends Record<string, any>,
  P extends readonly string[] = []
> = {
  use: () => T;
} & KeyBuilder<T, P>;

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
 * Represents the debounce options.
 * 
 * @typedef {Object} DebounceOptions
 * 
 * @property {number} [delay=0] The delay in milliseconds before invoking the effect.
 * @property {boolean} [leading=false] The effect function should be invoked on the leading edge.
 * @property {boolean} [trailing=true] The effect function should be invoked on the trailing edge.
 */
export interface DebounceOptions {
  /**
   * The delay in milliseconds before invoking the effect.
   * @default 0
   * @type {number}
   * @memberof DebounceOptions
   */
  delay?: number;
  /**
   * The effect function should be invoked on the leading edge.
   * @default false
   * @type {boolean}
   * @memberof DebounceOptions
   * @description If `true`, the effect function will be invoked immediately after the first invocation.
   * @see https://css-tricks.com/debouncing-throttling-explained-examples/
   */
  leading?: boolean;
  /**
   * The effect function should be invoked on the trailing edge.
   * @default true
   * @type {boolean}
   * @memberof DebounceOptions
   * @description If `true`, the effect function will be invoked after the `delay` milliseconds timeout.
   * @see https://css-tricks.com/debouncing-throttling-explained-examples/
   */
  trailing?: boolean;
}

export * from "./portal";
export * from "./cookie";
export * from "./atom";
