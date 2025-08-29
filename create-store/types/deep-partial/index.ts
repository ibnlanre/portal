import type { BuiltIn } from "@/create-store/types/built-in";
import type { GenericObject } from "@/create-store/types/generic-object";

export type DeepPartial<Argument> = Argument extends BuiltIn
  ? Argument
  : Argument extends GenericObject
    ? { [Key in keyof Argument]?: DeepPartial<Argument[Key]> }
    : Argument;
