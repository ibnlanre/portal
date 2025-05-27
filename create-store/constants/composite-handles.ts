import type { StoreHandles } from "@/create-store/types/store-handles";

import { DEFAULT_PRIMITIVE_HANDLES } from "./primitive-handles";

export const DEFAULT_COMPOSITE_HANDLES = Object.freeze<StoreHandles>([
  ...DEFAULT_PRIMITIVE_HANDLES,
  "$key",
]);

export type DEFAULT_COMPOSITE_HANDLES = typeof DEFAULT_COMPOSITE_HANDLES;
