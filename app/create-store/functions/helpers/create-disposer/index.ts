/**
 * Tracks cleanups attached to one store so `$dispose()` can run them once.
 * A cleanup registered after disposal runs immediately.
 */
export function createDisposer() {
  let disposed = false;
  const cleanups = new Set<() => void>();

  /** Registers a cleanup and returns a function that detaches it. */
  function add(cleanup: () => void) {
    if (disposed) {
      cleanup();
      return () => {};
    }
    cleanups.add(cleanup);
    return () => {
      cleanups.delete(cleanup);
    };
  }

  /** Marks the store disposed and runs the attached cleanups; once only. */
  function run() {
    if (disposed) return;
    disposed = true;
    const pending = Array.from(cleanups);
    cleanups.clear();
    const errors: unknown[] = [];
    for (const cleanup of pending) {
      try {
        cleanup();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1)
      throw new AggregateError(errors, "Store cleanups failed");
  }

  return {
    add,
    isDisposed: () => disposed,
    run,
  };
}
