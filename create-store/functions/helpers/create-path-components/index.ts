import type { Components } from "@/create-store/types/components";

/**
 * Creates an array of path components from a given path string.
 *
 * @description
 * This function takes a path string and splits it into components based on the dot notation.
 * It generates an array of components where each component represents a segment of the path.
 *
 * @param path The path string to split into components.
 * @returns An array of path components.
 */
export function createPathComponents<Path extends string>(
  path?: Path
): Components<Path> {
  if (!path) return [] as unknown as Components<Path>;
  return path.split(".").map((_, index, segments) => {
    return segments.slice(0, index + 1).join(".");
  }) as Components<Path>;
}
