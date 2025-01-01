import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { Split } from "@/create-store/types/split";

export type Segments<
  Store extends Dictionary,
  Delimiter extends string = "."
> = Split<Paths<Store, Delimiter>, Delimiter>;
