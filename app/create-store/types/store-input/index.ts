import type { GenericFunction } from "@/create-store/types/generic-function";

/** What a store accepts in a write. */
export type StoreInput<Value> = Value extends {
  $set: (action: infer Action) => void;
}
  ? Exclude<Action, GenericFunction>
  : never;
