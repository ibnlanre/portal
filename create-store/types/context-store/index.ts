import type { FC, PropsWithChildren } from "react";

export type ContextStore<Context, Store> = [
  FC<PropsWithChildren<{ value: Context }>>,
  () => Store,
];
