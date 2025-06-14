/**
 * Check if a key is valid and safe to use
 * Prevents prototype pollution and other security issues
 */
export function isValidKey(key: string | symbol): boolean {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
