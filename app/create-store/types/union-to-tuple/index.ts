import type { LastOfUnion } from "@/create-store/types/last-of-union";

export type UnionToTuple<Union> = UnionToTupleHelper<Union>;

type UnionToTupleHelper<
  Union,
  Tail = LastOfUnion<Union>,
  Rest = Exclude<Union, Tail>,
> = [Tail] extends [never] ? [] : [...UnionToTupleHelper<Rest>, Tail];
