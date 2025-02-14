import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { ResolvePath } from "@/create-store/types/resolve-path";

type StoreTypeResolver<Value> = Value extends Dictionary
  ? CompositeStore<Value>
  : PrimitiveStore<Value>;

interface Tap<Store extends Dictionary> {
  <Path extends Paths<Store>>(path: Path): StoreTypeResolver<
    ResolvePath<Store, Path>
  >;
}

export interface KeyStore<Store extends Dictionary>
  extends PrimitiveStore<Store> {
  $tap: Tap<Store>;
}
