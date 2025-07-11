export type AsyncEffectCallback<Data = unknown> = (
  signal: AbortSignal
) => Promise<Data>;
