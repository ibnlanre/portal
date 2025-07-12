export type AsyncFunction<Data = unknown> = (
  signal: AbortSignal
) => Promise<Data>;
