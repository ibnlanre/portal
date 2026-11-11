import type { ReservedKey } from "@/create-store/types/reserved-key";

/** A shape without the names every store owns; a reserved key is an error. */
export type NoReservedKeys<Shape> = Shape & {
  [Key in ReservedKey]?: never;
};
