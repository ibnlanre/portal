import type { Split } from "@/store/types/split";

export function splitPath<Path extends string>(path: Path) {
  return <Split<Path>>path.split(".");
}
