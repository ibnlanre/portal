import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Factory } from "@/create-store/types/factory";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { Initializer } from "@/create-store/types/initializer";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { Reference } from "@/create-store/types/reference";

export interface Store {
  createStore<State extends Dictionary>(
    state: Factory<State>
  ): CompositeStore<State>;
  createStore<State>(
    state: Initializer<Promise<State>>
  ): Promise<PrimitiveStore<State>>;
  createStore<State extends Reference>(
    state: Factory<State>
  ): PrimitiveStore<State>;
  createStore<State extends GenericObject>(
    state: Factory<State>
  ): CompositeStore<State>;
  createStore<State = undefined>(state?: Factory<State>): PrimitiveStore<State>;
}
