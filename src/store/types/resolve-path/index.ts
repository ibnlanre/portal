import type { Dictionary } from "@/store/types/dictionary";
import type { Paths } from "@/store/types/paths";
import type { ResolveSegment } from "@/store/types/resolve-segment";
import type { Segments } from "@/store/types/segments";
import type { Split } from "@/store/types/split";

export type ResolvePath<
  Store extends Dictionary,
  Key extends Paths<Store> = never,
  Delimiter extends string = "."
> = Split<Key, Delimiter> extends infer Segment
  ? Segment extends Segments<Store, Delimiter>
    ? ResolveSegment<Store, Segment, Delimiter>
    : never
  : never;
