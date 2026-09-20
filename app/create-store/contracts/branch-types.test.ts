import { expectTypeOf, it } from "vitest";

import { createStore, type PrimitiveStore } from "../../index";

it("exposes atomic values as whole-value stores and interfaces as branches", () => {
  interface State {
    date: Date;
    items: { name: string }[];
    user: { name: string };
  }
  const store = createStore<State>({
    date: new Date(0),
    items: [],
    user: { name: "A" },
  });
  expectTypeOf(store.user.name.$get()).toEqualTypeOf<string>();
  store.$at("user.name").$set("B");
  expectTypeOf(store.items).toEqualTypeOf<PrimitiveStore<{ name: string }[]>>();
  expectTypeOf(store.date).toEqualTypeOf<PrimitiveStore<Date>>();
  if (false) {
    // @ts-expect-error arrays are not stores of element handles
    store.items.map((item) => item.name.$get());
    // @ts-expect-error read the atomic snapshot before calling Date methods
    store.date.getTime();
    // @ts-expect-error atomic implementation members are not paths
    store.$at("date.getTime");
  }
});

it("represents dictionary and optional-path absence", () => {
  const store = createStore<{
    profile?: { name: string };
    users: Record<string, { name: string }>;
  }>({ users: {} });
  expectTypeOf(store.users.$at("missing").$get()).toEqualTypeOf<
    undefined | { readonly name: string }
  >();
  expectTypeOf(store.$at("users.missing.name").$get()).toEqualTypeOf<
    string | undefined
  >();
  expectTypeOf(store.$at("profile.name").$get()).toEqualTypeOf<
    string | undefined
  >();
  expectTypeOf(store.users.missing).toEqualTypeOf<
    PrimitiveStore<undefined | { name: string }> | undefined
  >();
  store.$at("users.new.name").$set("A");
  if (false) {
    // @ts-expect-error absence must be checked
    store.users.$at("missing").$get().name;
    // @ts-expect-error invalid value
    store.$at("users.new.name").$set(1);
    // @ts-expect-error invalid declared path
    store.$at("profile.age");
  }
});
