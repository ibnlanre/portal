import type { Join } from "@/create-store/types/join";

export type Components<
  Path extends string,
  Result extends string = ""
> = Path extends `${infer Head}.${infer Tail}`
  ? [Join<[Result, Head]>, ...Components<Tail, Join<[Result, Head]>>]
  : [Join<[Result, Path]>];
