import type { PersistContext } from "@/create-store/types/persist-context";

const messages = {
  read: "Error occurred while reading persisted state:",
  remove: "Error occurred while removing persisted state:",
  write: "Error occurred while persisting state:",
};

/**
 * Reports a persistence failure to `onError`, or to `console.error` without
 * one. A handler that throws is logged and ignored.
 *
 * @param onError The `onError` option, if any.
 * @param error What failed.
 * @param context Where it failed.
 */
export function fail(
  onError: ((error: unknown, context: PersistContext) => void) | undefined,
  error: unknown,
  context: PersistContext
) {
  if (!onError) {
    console.error(messages[context.action], error);
    return;
  }

  try {
    onError(error, context);
  } catch (handler) {
    console.error("Error occurred in the onError handler:", handler);
  }
}
