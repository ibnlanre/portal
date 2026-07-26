import type { GenericObject } from "@/create-store/types/generic-object";
import type { IsBuiltIn } from "@/create-store/types/is-builtin";
import type { IsNever } from "@/create-store/types/is-never";
import type { Prettify } from "@/create-store/types/prettify";

/**
 * Recursively replaces properties from Target with properties from Source.
 *
 * @template Target - The target type to be replaced
 * @template Source - The source type to replace with
 *
 * Behavior:
 * - If Source is never, returns Target unchanged
 * - If Target is never, returns Source
 * - If Source is a built-in type, returns Source directly
 * - If both are objects, merges them recursively
 * - Otherwise returns NonNullable<Source>
 */
export type Replace<Target, Source> =
  IsNever<Source> extends 1
    ? Target
    : IsNever<Target> extends 1
      ? Source
      : IsBuiltIn<Source> extends 1
        ? Source
        : [Target] extends [GenericObject]
          ? [Source] extends [GenericObject]
            ? ReplaceHelper<Target, Source>
            : Source
          : NonNullable<Source>;

/**
 * Merges two object types, with Source properties taking precedence.
 * Properties that exist in both become required with Source's type.
 */
type ReplaceHelper<
  Target extends GenericObject,
  Source extends GenericObject,
> = Prettify<
  Pick<Source, Exclude<keyof Source, keyof Target>> &
    Pick<Target, Exclude<keyof Target, keyof Source>> & {
      [Key in keyof Source as Key extends keyof Target
        ? Key
        : never]-?: Replace<Target[Key], Source[Key]>;
    }
>;
