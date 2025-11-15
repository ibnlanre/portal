export function isNullish<T>(value?: null | T): value is null | undefined {
  return value === null || value === undefined;
}
