import type { PortalMap } from "definition";

/**
 * Converts a Map of { observable, reducer } entries to an object of { value, reducer }.
 *
 * @param {Map<any, { observable: any, reducer: any }>} map The Map to convert.
 * @returns {Object} The converted object with { value, reducer } entries.
 */
export function convertMapToObject(map: PortalMap<any, any>) {
  const result: Record<string, { value: any; reducer?: any }> = {};

  map.forEach(({ observable, reducer }, key) => {
    result[key] = {
      value: observable.value,
      reducer: reducer,
    };
  });

  return result;
}
