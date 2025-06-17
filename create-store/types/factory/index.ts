import type { Initializer } from "@/create-store/types/initializer";

export type Factory<State> = Initializer<State> | State;
