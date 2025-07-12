export type AsyncFunction<Data = unknown, Params = unknown> = (options: {
  params: Params;
  signal: AbortSignal;
}) => Promise<Data>;
