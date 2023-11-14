import { GetValueByPath, Paths } from "@/definition";

/**
 * Retrieve the value of an object at the specified path.
 *
 * @template Registry The type of the registry.
 * @template Path The type of the path.
 * @template Value The type of the value.
 *
 * @param {Registry} object - The object to retrieve the value from.
 * @param {Path} path - The path to the value.
 *
 * @returns {Value} - The value at the specified path.
 */
export function getValue<
  Registry extends Record<string, any>,
  Path extends Paths<Registry>,
  Value extends GetValueByPath<Registry, Path>
>(object: Registry, path: Path, delimiter = ".") {
  let value = object;
  const paths = path.split(delimiter);
  for (const key of paths) value = value[key];
  return value as unknown as Value;
}
