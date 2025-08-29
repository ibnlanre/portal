import type { Primitives } from "@/create-store/types/primitives";
import type { Reference } from "@/create-store/types/reference";

export type Normalize<Value> = Value extends Primitives | Reference
  ? Value
  : { [K in keyof Value]: Normalize<Value[K]> };
