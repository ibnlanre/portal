import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

export interface KeyStore<Store extends Dictionary>
  extends PrimitiveStore<Store> {
  readonly $tap: <Path extends Paths<Store>>(
    path: Path
  ) => StoreValueResolver<ResolvePath<Store, Path>>;
}
