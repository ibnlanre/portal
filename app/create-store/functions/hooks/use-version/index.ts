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
  const ref = useRef<unknown>();
  const version = useRef(0);

  if (!compare(ref.current, input)) {
    ref.current = input;
    version.current += 1;
  }

  return version.current;
}
