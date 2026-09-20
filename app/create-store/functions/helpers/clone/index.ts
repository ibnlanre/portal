/**
 * Deep-copies arrays and plain records, preserving cycles and descriptor shape.
 * Accessor and already-restricted descriptors are copied by reference, as are
 * values outside the structural model: functions, class instances, and other
 * built-ins such as dates, maps, and typed views.
 *
 * @param value The value to clone.
 * @param seen A cache of already cloned objects, used to preserve cycles.
 *
 * @returns A structurally cloned value.
 */
export function clone<Value>(
  value: Value,
  seen = new WeakMap<object, any>()
): Value {
  if (value === null || typeof value !== "object") return value;

  if (seen.has(value)) return seen.get(value);

  const prototype = Object.getPrototypeOf(value);

  let result: any;
  if (Array.isArray(value)) result = new Array(value.length);
  else if (prototype === Object.prototype || prototype === null)
    result = Object.create(prototype);
  else return value;

  seen.set(value, result);

  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === "length") continue;

    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;

    if (
      descriptor.get ||
      descriptor.set ||
      !descriptor.enumerable ||
      !descriptor.configurable ||
      !descriptor.writable
    ) {
      Object.defineProperty(result, key, descriptor);
      continue;
    }

    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      value: clone(descriptor.value, seen),
      writable: true,
    });
  }

  return result;
}
