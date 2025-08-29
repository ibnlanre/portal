/**
 * Marks an object as atomic.
 * Adds a hidden, immutable symbol property.
 * Safe to call multiple times (idempotent).
 */
export const atomic = Symbol("atomic");
