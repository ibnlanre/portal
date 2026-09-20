/**
 * Copy store data at the write boundary and create mutable updater drafts.
 * Properties become data properties: getters are evaluated once and frozen
 * descriptors cannot leak input references or make a draft unwritable.
 * Functions and opaque instances (e.g. promises, weak collections, classes)
 * remain references; their private state is outside Portal's data model.
 */
export function cloneState<State>(
  value: State,
  seen = new WeakMap<object, any>()
): State {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);
  const prototype = Object.getPrototypeOf(value);
  let result: any;
  if (Array.isArray(value)) result = new Array(value.length);
  else if (prototype === Object.prototype || prototype === null)
    result = Object.create(prototype);
  else if (value instanceof Date) result = new Date(value.getTime());
  else if (value instanceof RegExp) {
    result = new RegExp(value.source, value.flags);
    result.lastIndex = value.lastIndex;
  } else if (value instanceof Map) result = new Map();
  else if (value instanceof Set) result = new Set();
  else if (value instanceof ArrayBuffer) result = value.slice(0);
  else if (
    typeof SharedArrayBuffer !== "undefined" &&
    value instanceof SharedArrayBuffer
  )
    result = value.slice(0);
  else if (ArrayBuffer.isView(value)) {
    const buffer = cloneState(value.buffer, seen);
    result =
      value instanceof DataView
        ? new DataView(buffer, value.byteOffset, value.byteLength)
        : new (value.constructor as any)(
            buffer,
            value.byteOffset,
            (value as any).length
          );
  } else return value;
  seen.set(value, result);
  if (value instanceof Map) {
    for (const [key, item] of value)
      result.set(cloneState(key, seen), cloneState(item, seen));
  } else if (value instanceof Set) {
    for (const item of value) result.add(cloneState(item, seen));
  }
  for (const key of Reflect.ownKeys(value)) {
    if (
      (Array.isArray(value) && key === "length") ||
      (value instanceof RegExp && key === "lastIndex")
    )
      continue;
    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: Object.prototype.propertyIsEnumerable.call(value, key),
      value: cloneState((value as any)[key], seen),
      writable: true,
    });
  }
  return result;
}
