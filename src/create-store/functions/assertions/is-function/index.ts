import type { Initializer } from "@/create-store/types/initializer";

export function isFunction<State>(value: unknown): value is Initializer<State> {
  return typeof value === "function";
}
