import type { IsBuiltIn } from "@/create-store/types/is-builtin";

/**
 * Recursively flattens intersection types, including nested object intersections.
 *
 * Unlike the basic approach that only flattens top-level intersections,
 * this version properly handles nested object properties that are intersections.
 *
 * Preserves functions, arrays, Sets, Maps, and other built-in objects as-is,
 * while only prettifying plain objects.
 *
 * @template T - The type to prettify
 *
 * @example
 * ```typescript
 * // Basic intersection flattening
 * type Basic = Prettify<{ a: string } & { b: number }>;
 * // Result: { a: string; b: number }
 *
 * // Nested intersection handling
 * type Nested = Prettify<{ user: { name: string } } & { user: { age: number } }>;
 * // Result: { user: { name: string; age: number } }
 *
 * // Preserves arrays, Sets, Maps
 * type WithCollections = Prettify<{ items: string[] } & { users: Set<User> }>;
 * // Result: { items: string[]; users: Set<User> }
 * ```
 */
export type Prettify<T> = {
  [K in keyof T]: IsBuiltIn<T[K]> extends 1 ? T[K] : Prettify<T[K]>;
} & {};
