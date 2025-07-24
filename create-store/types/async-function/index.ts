export type AsyncFunction<Data = unknown> = (
  controller: AbortController
) => Promise<Data>;
