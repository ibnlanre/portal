import type { Initializer } from "@/create-store/types/initializer";

export type Factory<State> = State | Initializer<State>;
