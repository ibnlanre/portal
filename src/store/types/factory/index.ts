import type { Initializer } from "@/store/types/initializer";

export type Factory<State> = State | Initializer<State>;
