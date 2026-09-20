import { useRef } from "react";

/**
 * A custom hook that compares dependencies and returns a version number.
 * The version number increments only when the dependencies change.
 *
 * @param input The input value to compare against the previous value.
 * If not provided, it defaults to `undefined`.
 *
 * @returns The current version number.
 */
export function useVersion(input?: unknown): number {
  const ref = useRef<unknown>(undefined);
  const versionRef = useRef(0);

  if (!sameDependencies(ref.current, input)) {
    ref.current = input;
    versionRef.current += 1;
  }

  return versionRef.current;
}

function sameDependencies(previous: unknown, next: unknown): boolean {
  if (Array.isArray(previous) && Array.isArray(next)) {
    return (
      previous.length === next.length &&
      previous.every((value, index) => Object.is(value, next[index]))
    );
  }
  return Object.is(previous, next);
}
