import { stringify } from "../stringify";

export function compare(left?: unknown, right?: unknown): boolean {
  if (left === right) return true;
  if (!left || !right) return false;

  if (typeof left !== typeof right) return false;
  if (typeof left !== "object") return left === right;

  return stringify(left) === stringify(right);
}
