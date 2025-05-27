import type { BasicStore } from "@/create-store/types/basic-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Paths } from "@/create-store/types/paths";
import type { ResolvePath } from "@/create-store/types/resolve-path";
import type { StoreHandles } from "@/create-store/types/store-handles";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

interface KeyStoreMethods<State extends Dictionary> extends BasicStore<State> {
  readonly $key: <Path extends Paths<State>>(
    path: Path
  ) => StoreValueResolver<ResolvePath<State, Path>>;
}

export type KeyStore<
  State extends Dictionary,
  Handles extends StoreHandles = ["$act", "$get", "$key", "$set", "$use"]
> = Pick<
  KeyStoreMethods<State>,
  Extract<keyof KeyStoreMethods<State>, Handles[number]>
>;
