import type { Components } from "@/create-store/types/components";

export function createPathComponents<Path extends string>(
  path?: Path
): Components<Path> {
  if (!path) return [] as unknown as Components<Path>;

  const segments = path.split(".");
  const components = segments.reduce((acc, _, index) => {
    acc.push(segments.slice(0, index + 1).join("."));
    return acc;
  }, [] as string[]);

  return components as Components<Path>;
}
