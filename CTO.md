I think B is the strongest idea here. A has a useful API insight buried inside an overclaim, and C is where I’d push back hardest.

### A: useful, but “kind is a type fact” is not universally true

For a simple schema:

```ts
defineStore(z.object({ ... }))
defineStore(z.number())
```

yes, TypeScript can absolutely derive:

```ts
CompositeStore<Output>;
PrimitiveStore<Output>;
```

and I like the consequence that users should not have to choose between `createPrimitiveStore` and `createCompositeStore`.

But this:

> the schema output is statically an object or not

is only clean for schemas whose output has one definite structural kind.

What about:

```ts
z.union([z.string(), z.object({ value: z.string() })]);
```

or transforms whose output is:

```ts
string | { value: string };
```

Now the store kind genuinely depends on the produced value.

Even simpler:

```ts
type Output = Foo | null;
```

If Portal's composite distinction is based on dictionary-ness, the type itself no longer gives you one leaf implementation.

So I would take the API conclusion without adopting the philosophical claim:

> **Users should almost never manually select the store implementation.**

That’s good.

`createPrimitiveStore` and `createCompositeStore` becoming internal implementation details also sounds good to me.

But I wouldn't demote:

```ts
createStore(value);
```

as an “untyped escape hatch.” It's not untyped at all:

```ts
createStore({
  count: 0,
  user: { name: "Ridwan" },
});
```

can infer an excellent type without any schema.

A schema adds a runtime/schema-level definition, defaults, maybe normalization, etc. It isn't what makes `createStore` typed.

---

### B: this is the one I would seriously pursue

This is genuinely interesting:

```ts
const Counter = defineStore(counterSchema);

const [CounterProvider, useCounterStore] = createContextStore(Counter);
```

because now `defineStore` isn't merely a curried `createStore`.

It becomes an actual **store definition**.

That gives it a reason to exist.

Potentially:

```ts
const Counter = defineStore(counterSchema);

Counter.create();
Counter.create({ count: 10 });

createContextStore(Counter);
```

or, if you want the definition callable:

```ts
const Counter = defineStore(counterSchema);

Counter();
Counter({ count: 10 });

createContextStore(Counter);
```

I prefer this direction substantially more than:

```ts
defineStore(schema)(value);
```

if the only benefit of the latter is schema inference.

A descriptor can carry things Portal may legitimately care about later:

```ts
Counter.schema;
Counter.default;
Counter.create;
```

without stuffing them into individual store instances.

And more importantly, it establishes a clean distinction:

```ts
createStore(value);
```

means **create this store now**.

```ts
defineStore(schema);
```

means **define this kind of store for repeated creation**.

That's an intelligible API boundary.

This also makes `createContextStore` cleaner because it can accept either:

```ts
createContextStore(() => createStore(...))
```

for arbitrary factories, if you retain that escape hatch, or:

```ts
createContextStore(Counter);
```

for a defined store.

I wouldn't necessarily kill factory support internally or publicly, though. Factories can do things schemas cannot:

```ts
createContextStore((props) => {
  const socket = useSocket(props.room);

  return createStore({
    room: props.room,
    socket,
  });
});
```

Depending on what `createContextStore` permits today, a factory may represent actual construction logic, not merely a workaround for missing types.

So B shouldn't be:

> the factory is the disease

It should be:

> **schema-defined stores shouldn't require a factory ceremony.**

That's much stronger and more accurate.

---

### C: I would not adopt this as stated

This equation worries me:

```ts
defineStore(schema)(value) ==
  createStore(combine(resolveSchema(schema), value));
```

because it quietly changes what a schema means.

Consider:

```ts
const schema = z.object({
  retries: z.number().default(3),
});
```

and then:

```ts
Counter({
  retries: "banana" as any,
});
```

Under C, Portal happily creates:

```ts
{
  retries: "banana";
}
```

The schema says `number`, but at runtime it means almost nothing except “please mine some defaults from this object.”

That is a strange contract.

DeepSeek phrases this as:

> zod contributes types + defaults

but Zod does not provide runtime types. TypeScript does. If Portal deliberately refuses validation, then Zod is mostly being used as an elaborate default-value description language plus a source for inferred static types.

That raises the question of whether a schema should be involved in this feature at all.

There's another subtle issue with:

```ts
combine(resolveSchema(schema), value);
```

Defaults and merging are not necessarily equivalent to schema resolution.

For example:

```ts
z.object({
  settings: z.object({
    theme: z.string().default("dark"),
    density: z.string().default("comfortable"),
  }),
});
```

Given:

```ts
{
  settings: {
    theme: "light",
  },
}
```

Portal's deep `combine` may conveniently produce the desired result.

Great.

But schemas can express things that aren't structural merge semantics:

- transforms
- preprocessors
- refinements
- coercion
- unions
- catches
- pipes
- computed defaults
- discriminated alternatives

Once `defineStore` accepts an arbitrary Standard Schema/Zod schema, saying “we only steal its defaults” becomes increasingly difficult to explain.

So I'd decide what contract you actually want.

If `defineStore` means:

> define a store whose values conform to this schema

then parsing/validation belongs somewhere in its lifecycle.

If it means:

> infer my store type and derive an initial value from this schema

then I think calling it a schema-backed store is misleading unless the docs are extremely explicit.

---

And there's one assumption DeepSeek hasn't attacked yet that I think is more fundamental:

### Why does `defineStore` need a schema at all?

Suppose the real feature you want is a reusable store definition.

Then perhaps the primitive should be something like:

```ts
const Counter = defineStore({
  count: 0,
});
```

and optionally:

```ts
const Counter = defineStore(
  z.object({
    count: z.number().default(0),
  })
);
```

Both yield a reusable definition.

Then the conceptual hierarchy becomes:

```ts
createStore(value);
```

Create one immediately.

```ts
defineStore(definition);
```

Create a reusable store definition.

```ts
createContextStore(definition);
```

Put that definition behind React context.

**Schema support becomes one way to define a store, rather than the architecture around which Portal has to contort itself.**

That is the assumption I would attack next.

So if you're choosing among DeepSeek's three: **topple B first.** It introduces a genuinely useful abstraction boundary without forcing Portal to redefine what schemas mean or pretending `createStore(value)` is somehow second-class.
