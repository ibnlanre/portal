import { DependencyList } from "react";
import { shallowEqual } from "./shallowEqual";

/**
 * A function that compares two dependency lists shallowly.
 *
 * @param {DependencyList | null | undefined} prevValue The previous dependency list.
 * @param {DependencyList} currValue The current dependency list.
 *
 * @returns {boolean} Whether the two dependency lists are equal shallowly.
 */
export function shallowCompare(
  prevValue?: DependencyList | null,
  currValue?: DependencyList
): boolean {
  if (!prevValue || !currValue) return false;
  if (prevValue === currValue) return true;
  if (prevValue.length !== currValue.length) return false;

  for (let i = 0; i < prevValue.length; i++) {
    if (!shallowEqual(prevValue[i], currValue[i])) return false;
  }

  return true;
}
