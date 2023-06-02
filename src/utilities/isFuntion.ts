/**
 *
 * Check if the provided value is a function.
 * @param v - Value to be checked.
 * @returns `true` if the value is a function, `false` otherwise.
 */
export const isFunction = (v: any): v is Function => typeof v === "function";
