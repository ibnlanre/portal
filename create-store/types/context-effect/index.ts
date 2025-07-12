export type ContextEffect<Scope, Result = void> = (
  scope: Scope,
  signal: AbortSignal
) => Result;
