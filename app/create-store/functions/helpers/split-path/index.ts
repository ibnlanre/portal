import type { Split } from "@/create-store/types/split";

export function splitPath<Path extends string>(path: Path = "" as Path) {
  return <Split<Path>>path.split(".");
}
