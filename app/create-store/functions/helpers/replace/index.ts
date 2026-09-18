function isPlainObject(value: unknown): value is Record<PropertyKey, any> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

type Value = { value: unknown; node?: MergeNode };
type MergeNode = {
  target: any;
  source: any;
  merge: boolean;
  fields: Map<PropertyKey, Value>;
  parents: Set<MergeNode>;
  changed: boolean;
  result?: any;
};

/**
 * Merge an owned patch without cloning untouched state. Arrays replace rather
 * than merge, but equal elements can still share their previous snapshots.
 * Track pairs, not just source objects: aliases can occur at different paths.
 */
export function replace<Target>(target: Target, source: unknown): Target {
  const nodes: MergeNode[] = [];
  const merged = new WeakMap<object, WeakMap<object, MergeNode>>();
  const replaced = new WeakMap<object, WeakMap<object, MergeNode>>();

  function visit(target: any, source: any, merge: boolean): Value {
    if (Object.is(target, source)) return { value: target };
    const arrays = Array.isArray(target) && Array.isArray(source);
    if (!arrays && !(isPlainObject(target) && isPlainObject(source))) {
      return { value: source };
    }
    merge = merge && !arrays;
    const cache = merge ? merged : replaced;
    let sources = cache.get(target);
    if (!sources) cache.set(target, (sources = new WeakMap()));
    const cached = sources.get(source);
    if (cached) return { value: undefined, node: cached };

    const keys = Reflect.ownKeys(source).filter(
      (key) => !arrays || key !== "length"
    );
    const node: MergeNode = {
      target,
      source,
      merge,
      fields: new Map(),
      parents: new Set(),
      changed:
        Object.getPrototypeOf(target) !== Object.getPrototypeOf(source) ||
        (arrays && target.length !== source.length) ||
        (!merge &&
          Reflect.ownKeys(target).length !== Reflect.ownKeys(source).length),
    };
    sources.set(source, node);
    nodes.push(node);
    for (const key of keys) {
      const exists = Object.prototype.hasOwnProperty.call(target, key);
      const child = visit(
        exists ? (target as any)[key] : undefined,
        (source as any)[key],
        merge
      );
      node.fields.set(key, child);
      if (child.node) child.node.parents.add(node);
      if (
        !exists ||
        (!child.node && !Object.is((target as any)[key], child.value))
      ) {
        node.changed = true;
      }
    }
    return { value: undefined, node };
  }

  const root = visit(target, source, true);
  // Propagate differences through cyclic components before allocating anything.
  // An unchanged cycle therefore keeps its identity rather than becoming a copy.
  const changed = nodes.filter((node) => node.changed);
  for (let index = 0; index < changed.length; index++) {
    for (const parent of changed[index].parents) {
      if (!parent.changed) {
        parent.changed = true;
        changed.push(parent);
      }
    }
  }
  for (const node of nodes) {
    node.result = !node.changed
      ? node.target
      : Array.isArray(node.source)
        ? new Array(node.source.length)
        : Object.create(Object.getPrototypeOf(node.target));
  }
  for (const node of changed) {
    if (node.merge) {
      for (const key of Reflect.ownKeys(node.target)) {
        Object.defineProperty(node.result, key, {
          value: node.target[key],
          writable: true,
          configurable: true,
          enumerable: Object.prototype.propertyIsEnumerable.call(
            node.target,
            key
          ),
        });
      }
    }
    for (const [key, child] of node.fields) {
      Object.defineProperty(node.result, key, {
        value: child.node ? child.node.result : child.value,
        writable: true,
        configurable: true,
        enumerable: Object.prototype.propertyIsEnumerable.call(
          node.source,
          key
        ),
      });
    }
  }
  return (root.node ? root.node.result : root.value) as Target;
}
