import type { DeepPartial } from "@/create-store/types/deep-partial";

/**
 * @deprecated Use `DeepPartial` or `Partial` directly instead.
 */
export type SetPartial<State> = DeepPartial<State> | Partial<State>;
