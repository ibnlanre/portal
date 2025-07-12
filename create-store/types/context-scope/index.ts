import type { FC, PropsWithChildren } from "react";

export type ContextScope<Context, Scope> = [
  FC<PropsWithChildren<{ value: Context }>>,
  () => Scope,
];
