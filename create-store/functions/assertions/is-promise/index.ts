export function isPromise<State>(state: unknown): state is Promise<State> {
  return state instanceof Promise;
}
