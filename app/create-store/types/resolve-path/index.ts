import type { GenericObject } from "@/create-store/types/generic-object";
import type { Paths } from "@/create-store/types/paths";
import type { ResolveSegment } from "@/create-store/types/resolve-segment";
import type { SplitStorePath } from "@/create-store/types/store-path";

export type ResolvePath<
  Store extends GenericObject,
  Key extends Paths<Store, Delimiter> = never,
  Delimiter extends string = ".",
> = ResolveSegment<Store, SplitStorePath<Key, Delimiter>, Delimiter>;
