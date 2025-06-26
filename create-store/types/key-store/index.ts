import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

export type KeyStore<State extends Dictionary> = PrimitiveStore<State> & {
  readonly $key: <Path extends Paths<State>>(
    path: Path
  ) => StoreValueResolver<ResolvePath<State, Path>>;
};
