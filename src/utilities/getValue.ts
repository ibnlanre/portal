import { GetValueByPath, Paths } from "@/definition";

/**
 * Retrieve the value of an object at the specified path.
 *
 * @template Store The type of the store.
 * @template Path The type of the path.
 * @template Value The type of the value.
 *
 * @param {Store} object The object to retrieve the value from.
 * @param {Path} path The path to the value.
 *
 * @returns {Value} The value at the specified path.
 */
export function getValue<
  Store extends Record<PropertyKey, unknown>,
  Path extends Paths<Store, Delimiter>,
  Value,
  Delimiter extends string = ".",
>(object: Store, path: Path, delimiter: Delimiter = "." as Delimiter): Value {
  let value: any = object;
  const paths = path.split(delimiter);
  for (const key of paths) value = value[key];
  return value as Value;
}
