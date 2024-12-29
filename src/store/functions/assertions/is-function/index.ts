import type { Initializer } from "@/store/types/initializer";

export function isFunction<State>(value: unknown): value is Initializer<State> {
  return typeof value === "function";
}
