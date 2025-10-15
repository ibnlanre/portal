import type { BuiltIn } from "@/create-store/types/built-in";
import type { GenericObject } from "@/create-store/types/generic-object";

/**
 * Recursively makes all properties of a type optional, including nested objects.
 *
 * Built-in types (primitives, dates, functions, etc.) are preserved as-is,
 * while object types have all their properties made optional recursively.
 *
 * @template Argument - The type to make deeply partial
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   profile: {
 *     name: string;
 *     settings: {
 *       theme: 'light' | 'dark';
 *     };
 *   };
 * }
 *
 * type PartialUser = DeepPartial<User>;
 * // Result: {
 * //   id?: number;
 * //   profile?: {
 * //     name?: string;
 * //     settings?: {
 * //       theme?: 'light' | 'dark';
 * //     };
 * //   };
 * // }
 * ```
 */
export type DeepPartial<Argument> = Argument extends BuiltIn
  ? Argument
  : Argument extends GenericObject
    ? NullableObject<Argument>
    : Argument;

type NullableObject<Argument> = {
  [Key in keyof Argument]?: DeepPartial<Argument[Key]>;
};
