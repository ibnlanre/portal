import { isDefined } from "@/cookie-storage/helpers/is-defined";

export function isEnabled<Value>(
  value: Value
): value is Exclude<Value, false | undefined> {
  return isDefined(value) && value !== false;
}
