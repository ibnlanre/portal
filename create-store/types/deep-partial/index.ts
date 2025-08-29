import type { GenericObject } from "@/create-store/types/generic-object";
import type { Primitives } from "@/create-store/types/primitives";
import type { Reference } from "@/create-store/types/reference";

export type DeepPartial<Argument> = Argument extends Primitives | Reference
  ? Argument
  : Argument extends GenericObject
    ? { [Key in keyof Argument]?: DeepPartial<Argument[Key]> }
    : Argument;
