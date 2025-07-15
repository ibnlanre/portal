import { createCloneFunction, Handlers } from "@ibnlanre/clone";

/**
 * Safely clones a value while preserving functions by reference.
 * This is the preferred clone function to use in store implementations.
 *
 * @param value The value to clone
 * @returns A cloned value with functions preserved by reference
 */
export const clone = createCloneFunction((registry) => {
  registry
    .setHandler(Object, Handlers.Object)
    .setHandler(Array, Handlers.Array);
});
