import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolveSegment } from "@/create-store/types/resolve-segment";
import type { Segments } from "@/create-store/types/segments";
import type { Split } from "@/create-store/types/split";

export type ResolvePath<
  Store extends Dictionary,
  Key extends Paths<Store> = never,
  Delimiter extends string = "."
> = Split<Key, Delimiter> extends infer Segment
  ? Segment extends Segments<Store, Delimiter>
    ? ResolveSegment<Store, Segment, Delimiter>
    : never
  : never;
