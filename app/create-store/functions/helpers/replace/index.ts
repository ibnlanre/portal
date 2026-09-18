type MergeNode = {
  changed: boolean;
  fields: Map<PropertyKey, Value>;
  merge: boolean;
  parents: Set<MergeNode>;
  result?: any;
  source: any;
  target: any;
};

type Value = { node?: MergeNode; value: unknown };
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
    if (cached) return { node: cached, value: undefined };

    const keys = Reflect.ownKeys(source).filter(
      (key) => !arrays || key !== "length"
    );
    const node: MergeNode = {
      changed:
        Object.getPrototypeOf(target) !== Object.getPrototypeOf(source) ||
        (arrays && target.length !== source.length) ||
        (!merge &&
          Reflect.ownKeys(target).length !== Reflect.ownKeys(source).length),
      fields: new Map(),
      merge,
      parents: new Set(),
      source,
      target,
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
    return { node, value: undefined };
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
          configurable: true,
          enumerable: Object.prototype.propertyIsEnumerable.call(
            node.target,
            key
          ),
          value: node.target[key],
          writable: true,
        });
      }
    }
    for (const [key, child] of node.fields) {
      Object.defineProperty(node.result, key, {
        configurable: true,
        enumerable: Object.prototype.propertyIsEnumerable.call(
          node.source,
          key
        ),
        value: child.node ? child.node.result : child.value,
        writable: true,
      });
    }
  }
  return (root.node ? root.node.result : root.value) as Target;
}

function isPlainObject(value: unknown): value is Record<PropertyKey, any> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
