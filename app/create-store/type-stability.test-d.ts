import type { AsyncBrowserStorageAdapterOptions } from "@/create-store/types/async-browser-storage-adapter";
import type { BrowserStorageAdapterOptions } from "@/create-store/types/browser-storage-adapter";
/**
 * Type acceptance for `primitive`, `composite` and `collection`. A read
 * returns exactly the type you gave; hover shows named store types; generic
 * helpers keep their members; no cast is needed to state a type.
 *
 * Each case is a type alias that must be `true`, and every statement must
 * compile. Compile this one file only; it is not run by vitest.
 */
import type { CollectionStore } from "@/create-store/types/collection-store";
import type { CompositeStore } from "@/create-store/types/composite-store";
import type { CookieStorageAdapterOptions } from "@/create-store/types/cookie-storage";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { StateOf } from "@/create-store/types/state-of";
import type { StorageAdapterOptions } from "@/create-store/types/storage-adapter";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";
import { persist } from "@/create-store/functions/utilities/persist";

type Brand = string & { __brand: "Id" };
type Check<T extends true> = T;

type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
type Step = "details" | "pin";
declare const brand: Brand;

interface Interface {
  a: number;
  list: Nested[];
  nested: Nested;
}
type Line = { sku: string };
interface Nested {
  id: Brand;
  tags: string[];
}
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };
class Money {
  constructor(public cents: number) {}
  format() {
    return `${this.cents}`;
  }
}

// -------------------------------------------- primitive round-trips
const read = <Value>(initial: Value) => primitive<Value>(initial).$get();
export const rt_brand = read<Brand>(brand);
export type rt_brandType = Check<Equal<typeof rt_brand, Brand>>;
export const rt_optionalBrand = read<Brand | undefined>(undefined);
export type rt_optionalBrandType = Check<
  Equal<typeof rt_optionalBrand, Brand | undefined>
>;
export const rt_brandArray = read<Brand[]>([]);
export type rt_brandArrayType = Check<Equal<typeof rt_brandArray, Brand[]>>;
export const rt_date = read(new Date(0));
export type rt_dateType = Check<Equal<typeof rt_date, Date>>;
export const rt_class = read(new Money(1));
export type rt_classType = Check<Equal<typeof rt_class, Money>>;
export const rt_interface = read<Interface>({
  a: 1,
  list: [],
  nested: { id: brand, tags: [] },
});
export type rt_interfaceType = Check<Equal<typeof rt_interface, Interface>>;
export const rt_union = read<Shape>({ kind: "circle", r: 1 });
export type rt_unionType = Check<Equal<typeof rt_union, Shape>>;
export const rt_literal = read<Step>("details");
export type rt_literalType = Check<Equal<typeof rt_literal, Step>>;
export const rt_tuple = read<[number, string]>([1, "a"]);
export type rt_tupleType = Check<Equal<typeof rt_tuple, [number, string]>>;
export const rt_map = read(new Map<string, { a: number[] }>());
export type rt_mapType = Check<
  Equal<typeof rt_map, Map<string, { a: number[] }>>
>;
export const rt_set = read(new Set<Brand>());
export type rt_setType = Check<Equal<typeof rt_set, Set<Brand>>>;
export const rt_optional = read<{ o?: number; p: string | undefined }>({
  p: undefined,
});
export type rt_optionalType = Check<
  Equal<typeof rt_optional, { o?: number; p: string | undefined }>
>;
export const rt_record = read<Record<string, Brand>>({});
export type rt_recordType = Check<
  Equal<typeof rt_record, Record<string, Brand>>
>;

// No cast needed to state a nullable type.
export const picked = primitive<null | string>(null);
export type pickedType = Check<
  Equal<typeof picked, PrimitiveStore<null | string>>
>;
export const initialized = primitive<number>(() => 1);
export type initializedType = Check<
  Equal<typeof initialized, PrimitiveStore<number>>
>;

// ------------------------------------------------ composite members
const rows = primitive<Line[]>([]);
const app = composite({
  addToCart(line: Line) {
    app.cart.items.$set((items) => [...items, line]);
  },
  cart: composite({ items: primitive<Line[]>([]) }),
  picked: primitive<null | Step>(null),
  theme: primitive<"dark" | "light">("light"),
  title: "",
  user: composite({ name: "" }),
});
export type branchIsNamed = Check<
  Equal<typeof app.theme, PrimitiveStore<"dark" | "light">>
>;
export type leafIsPrimitive = Check<
  Equal<typeof app.title, PrimitiveStore<string>>
>;
export type nestedIsComposite = Check<
  Equal<(typeof app.user)["name"], PrimitiveStore<string>>
>;
export type nullableBranchIsNamed = Check<
  Equal<typeof app.picked, PrimitiveStore<null | Step>>
>;
export const method: (line: Line) => void = app.addToCart;
export const state = app.$get();
export type stateOmitsMethods = Check<
  Equal<
    typeof state,
    {
      cart: { items: Line[] };
      picked: null | Step;
      theme: "dark" | "light";
      title: string;
      user: { name: string };
    }
  >
>;
export const branchRead: Line[] = app.cart.items.$get();
app.$set({ cart: { items: [] }, title: "x" });
app.$set({ picked: null, user: { name: "" } });
app.$set((state) => ({ title: state.title + "!" }));
// @ts-expect-error a method is not state, so it cannot be written
app.$set({ addToCart: () => {} });
// @ts-expect-error a primitive branch takes its value, not a partial of it
app.$set({ theme: { dark: true } });
app.user.name.$set("Jane");
export const [selected] = app.$use((s) => s.user.name);
export type selectedType = Check<Equal<typeof selected, string>>;
void rows;

// A shape that is an interface still works.
interface Settings {
  compact: boolean;
  locale: string;
}
declare const settingsShape: Settings;
export const settings = composite(settingsShape);
export type settingsLeaf = Check<
  Equal<typeof settings.locale, PrimitiveStore<string>>
>;

export type wrapReturn = Check<
  Equal<ReturnType<typeof wrap<{ a: number }>>, StateOf<{ a: number }>>
>;
// ----------------------------------------------------- generic helper
export function wrap<Shape extends { a: number }>(shape: Shape) {
  return composite(shape).$get();
}
export function wrapPrimitive<Value>(initial: Value): Value {
  return primitive<Value>(initial).$get();
}
export function wrapStore<Shape extends { a: number }>(shape: Shape) {
  const store: CompositeStore<Shape> = composite(shape);
  return store.$subscribe;
}

// ------------------------------------------------------- collection
const drafts = collection((organisation: string) =>
  composite({ lines: primitive<Line[]>([]), organisation })
);
export type collectionIsNamed = Check<
  Equal<
    typeof drafts,
    CollectionStore<
      CompositeStore<{
        lines: PrimitiveStore<Line[]>;
        organisation: string;
      }>
    >
  >
>;
export const entryLines: Line[] = drafts("acme").lines.$get();
export const hasEntry: boolean = drafts.$has("acme");
export const keys: string[] = drafts.$keys();
drafts.$delete("acme");
drafts.$clear();
export const collectionState = drafts.$get();
export type collectionStateType = Check<
  Equal<
    typeof collectionState,
    Record<string, { lines: Line[]; organisation: string }>
  >
>;
export const inComposite = composite({ drafts });
export const nested: Line[] = inComposite.drafts("acme").lines.$get();
// A key is a string: a number is a type error, and `make` receives a string.
// @ts-expect-error a number is not a key
drafts(1);
// @ts-expect-error a number is not a key
drafts.$has(1);
// @ts-expect-error a number is not a key
drafts.$delete(1);
export const keyOfMake = collection((key) => {
  const received: string = key;
  return primitive(received);
});

// A reserved shape key is a type error as well as a runtime one.
composite({
  // @ts-expect-error "$get" belongs to every store
  $get: 1,
});

// `watch` is typed per adapter: a function for the custom adapter, `true` or a
// function for the async one, and nothing for local, session and cookie.
const storage = { getItem: () => null, removeItem() {}, setItem() {} };
export const customFn: BrowserStorageAdapterOptions<number> = {
  ...storage,
  watch: () => () => {},
};
export const customTrue: BrowserStorageAdapterOptions<number> = {
  ...storage,
  // @ts-expect-error the custom adapter takes only a function
  watch: true,
};
export const customName: BrowserStorageAdapterOptions<number> = {
  ...storage,
  // @ts-expect-error the custom adapter takes only a function
  watch: "x",
};
export const customFalse: BrowserStorageAdapterOptions<number> = {
  ...storage,
  // @ts-expect-error the custom adapter takes only a function
  watch: false,
};
export const asyncTrue: AsyncBrowserStorageAdapterOptions<number> = {
  ...storage,
  watch: true,
};
export const asyncFn: AsyncBrowserStorageAdapterOptions<number> = {
  ...storage,
  watch: () => () => {},
};
export const asyncName: AsyncBrowserStorageAdapterOptions<number> = {
  ...storage,
  // @ts-expect-error a string is not accepted
  watch: "x",
};
export const asyncFalse: AsyncBrowserStorageAdapterOptions<number> = {
  ...storage,
  // @ts-expect-error `false` is not accepted
  watch: false,
};
export const noBroadcast: BrowserStorageAdapterOptions<number> = {
  ...storage,
  // @ts-expect-error there is no `broadcast`
  broadcast: true,
};
export const noBroadcastAsync: AsyncBrowserStorageAdapterOptions<number> = {
  ...storage,
  // @ts-expect-error there is no `broadcast`
  broadcast: true,
};

export const localWatch: StorageAdapterOptions<number> = {
  // @ts-expect-error local and session storage take no `watch`
  watch: true,
};
export const localBroadcast: StorageAdapterOptions<number> = {
  // @ts-expect-error there is no `broadcast`
  broadcast: true,
};
export const cookieWatch: CookieStorageAdapterOptions<number> = {
  // @ts-expect-error cookies take no `watch`
  watch: true,
};
export const cookieBroadcast: CookieStorageAdapterOptions<number> = {
  // @ts-expect-error there is no `broadcast`
  broadcast: true,
};

// ------------------------------------------- persist with your own interface
// An adapter typed from an interface with optional fields works for a store
// whose state has the same fields as `T | undefined`, with no casts.
interface Journal {
  checkDate?: string;
  date: string;
  lines: Line[];
}
const journalAdapter = (id: string) =>
  asyncAdapter<Journal>(`journal:${id}`, {
    getItem: () => undefined as never,
    removeItem() {},
    setItem() {},
  });
const journalShape = {
  checkDate: primitive<string | undefined>(undefined),
  date: "",
  lines: primitive<Line[]>([]),
};
export const persistComposite = persist(
  composite(journalShape),
  journalAdapter("a")
);
export const persistCollectionOfComposites = persist(
  collection(() => composite(journalShape)),
  journalAdapter
);
export const persistPrimitive = persist(
  primitive<Journal>({ date: "", lines: [] }),
  journalAdapter("a")
);

// Soundness: the adapter must still fit the store in both directions.
interface Other {
  unrelated: number;
}
const otherAdapter = asyncAdapter<Other>("other", {
  getItem: () => undefined as never,
  removeItem() {},
  setItem() {},
});
// @ts-expect-error an adapter of another state is not accepted
persist(composite(journalShape), otherAdapter);
// @ts-expect-error nor for a collection's entries
persist(
  collection(() => composite(journalShape)),
  () => otherAdapter
);
interface Narrower {
  date: string;
  extra: number;
  lines: Line[];
}
const narrower = asyncAdapter<Narrower>("narrower", {
  getItem: () => undefined as never,
  removeItem() {},
  setItem() {},
});
// @ts-expect-error the store's state cannot be written to an adapter that needs more
persist(composite(journalShape), narrower);
