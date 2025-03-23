import type { Dictionary } from "@/create-store/types/dictionary";

export type NonCallableKeys<
  Value extends Dictionary,
  Key extends keyof Value
> = Value[Key] extends Function ? never : Key;
