export type ContextEffect<Scope> = (
  scope: Scope,
  signal: AbortSignal
) => Promise<void> | void;
