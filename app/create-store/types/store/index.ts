import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Factory } from "@/create-store/types/factory";
import type { Possible } from "@/create-store/types/possible";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Initializer } from "../initializer";

export interface Store {
  <State extends Dictionary>(state: Factory<State>): CompositeStore<State>;
  <State>(state: Initializer<Promise<State>>): Promise<PrimitiveStore<State>>;
  <State>(state: Factory<State>): PrimitiveStore<State>;
  <State>(state?: Possible<Factory<State | undefined>>): PrimitiveStore<
    State | undefined
  >;
}
