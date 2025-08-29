/**
 * A utility type that ensures a type is defined and not null or undefined.
 * It intersects the type with `null | {}` to exclude `null` and `undefined`.
 */
export type Defined<T> = (null | {}) & T;
