export function shallowMerge<Target extends {}, Source>(
  target: Target,
  source: Source
) {
  const base = <Target>(
    Object.create(
      Object.getPrototypeOf(target),
      Object.getOwnPropertyDescriptors(target)
    )
  );

  return Object.defineProperties(
    base,
    Object.getOwnPropertyDescriptors(source)
  ) as Target & Source;
}
