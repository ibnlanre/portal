export function escapeKey(key: string): string {
  return key.replace(/\\/g, "\\\\").replace(/\./g, "\\.");
}

export function overlappingPaths(
  left: string | undefined,
  right: string | undefined
): boolean {
  const a = splitStorePath(left);
  const b = splitStorePath(right);
  return a
    .slice(0, Math.min(a.length, b.length))
    .every((key, index) => key === b[index]);
}

export function readStorePath(state: unknown, path: string | undefined): any {
  let value: any = state;
  for (const key of splitStorePath(path)) {
    if (value == null || !Object.prototype.hasOwnProperty.call(value, key))
      return undefined;
    value = value[key];
  }
  return value;
}

export function splitStorePath(path: string | undefined): string[] {
  if (path === undefined) return [];
  const keys = [""];
  for (let index = 0; index < path.length; index++) {
    const character = path[index];
    if (character === "\\") {
      const next = path[++index];
      if (next !== "." && next !== "\\") {
        throw new TypeError("Store paths only escape dots and backslashes");
      }
      keys[keys.length - 1] += next;
    } else if (character === ".") keys.push("");
    else keys[keys.length - 1] += character;
  }
  return keys;
}
