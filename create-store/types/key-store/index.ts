import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";
import type { BasicStore } from "../basic-store";

export interface KeyStore<State extends Dictionary> extends BasicStore<State> {
  readonly $key: <Path extends Paths<State>>(
    path: Path
  ) => StoreValueResolver<ResolvePath<State, Path>>;
}
