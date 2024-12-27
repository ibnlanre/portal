import type { Dictionary } from "../dictionary";
import type { Paths } from "../paths";
import type { ResolveSegment } from "../resolve-segment";
import type { Segments } from "../segments";
import type { Split } from "../split";

export type ResolvePath<
  Store extends Dictionary,
  Key extends Paths<Store> = never,
  Delimiter extends string = "."
> = Split<Key, Delimiter> extends infer Segment
  ? Segment extends Segments<Store, Delimiter>
    ? ResolveSegment<Store, Segment, Delimiter>
    : never
  : never;
