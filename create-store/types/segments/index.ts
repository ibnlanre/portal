import type { GenericObject } from "@/create-store/types/generic-object";
import type { Paths } from "@/create-store/types/paths";
import type { Split } from "@/create-store/types/split";

export type Segments<
  Store extends GenericObject,
  Delimiter extends string = ".",
> = Split<Paths<Store, Delimiter>, Delimiter>;
