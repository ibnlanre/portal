import type { DeepPartial } from "@/create-store/types/deep-partial";

export type SetPartial<State> = DeepPartial<State> | Partial<State>;
