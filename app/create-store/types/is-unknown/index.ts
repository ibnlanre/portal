import type { IsAny } from "@/create-store/types/is-any";

export type IsUnknown<T> = IsAny<T> extends 1 ? 0 : unknown extends T ? 1 : 0;
