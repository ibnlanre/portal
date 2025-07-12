export type ContextEffect<Context, Store> = (
  store: Store,
  context: Context
) => Promise<void> | void;
