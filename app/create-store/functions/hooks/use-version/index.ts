import { useRef } from "react";

import { compare } from "@/create-store/functions/helpers/compare";

/**
 * A custom hook that compares dependencies and returns a version number.
 * The version number increments only when the dependencies change.
 *
 * @param input The input value to compare against the previous value.
 * If not provided, it defaults to `undefined`.
 *
 * @returns An array containing the current version number.
 */
export function useVersion(input?: unknown): number {
  const ref = useRef<unknown>(undefined);
  const versionRef = useRef(0);

  if (!compare(ref.current, input)) {
    ref.current = input;
    versionRef.current += 1;
  }

  return versionRef.current;
}
