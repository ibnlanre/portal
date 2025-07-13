import type { UnionToIntersection } from "@/create-store/types/union-to-intersection";

export type LastOfUnion<Union extends unknown> =
  UnionToIntersection<
    Union extends unknown ? (k: Union) => void : never
  > extends (k: infer Last) => void
    ? Last
    : never;
