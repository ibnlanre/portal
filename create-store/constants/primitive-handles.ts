import type { StoreHandles } from "@/create-store/types/store-handles";

export const DEFAULT_PRIMITIVE_HANDLES = Object.freeze<StoreHandles>([
  "$act",
  "$get",
  "$set",
  "$use",
]);

export type DEFAULT_PRIMITIVE_HANDLES = typeof DEFAULT_PRIMITIVE_HANDLES;
