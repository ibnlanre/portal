import type { Snapshot } from "@/create-store/types/snapshot";
export type Subscriber<State> = (value: Snapshot<State>) => void;
