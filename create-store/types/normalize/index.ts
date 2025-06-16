import type { Dictionary } from "@/create-store/types/dictionary";
import type { GenericObject } from "@/create-store/types/generic-object";

export type Normalize<T extends GenericObject> = {
  [K in keyof (Dictionary | T)]: K extends keyof T ? T[K] : never;
};
