import type { Dictionary } from "@/store/types/dictionary";
import type { Paths } from "@/store/types/paths";
import type { Split } from "@/store/types/split";

export type Segments<
  Store extends Dictionary,
  Delimiter extends string = "."
> = Split<Paths<Store, Delimiter>, Delimiter>;
