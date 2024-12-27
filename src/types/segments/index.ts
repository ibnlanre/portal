import type { Dictionary } from "../dictionary";
import type { Paths } from "../paths";
import type { Split } from "../split";

export type Segments<
  Store extends Dictionary,
  Delimiter extends string = "."
> = Split<Paths<Store, Delimiter>, Delimiter>;
