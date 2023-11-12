import { GetValueByPath, Paths } from "@/definition";

/**
 * Retrieve the value of an object at the specified path.
 *
 * @template Ledger The type of the ledger.
 * @template Path The type of the path.
 * @template Value The type of the value.
 *
 * @param {Ledger} object - The object to retrieve the value from.
 * @param {Path} path - The path to the value.
 *
 * @returns {Value} - The value at the specified path.
 */
export function getValue<
  Ledger extends Record<string, any>,
  Path extends Paths<Ledger>,
  Value extends GetValueByPath<Ledger, Path>
>(object: Ledger, path: Path, delimiter = ".") {
  let value = object;
  const paths = path.split(delimiter);
  for (const key of paths) value = value[key];
  return value as unknown as Value;
}
