import { describe, expect, it } from "@jest/globals";
import { createBuilder } from "component";

describe("createBuilder", () => {
  const obj = {
    dex: undefined,
    foo: {
      bar: {
        baz: (id: number) => id,
      },
      qux: () => "hello",
    },
    num: 123,
    str: "test",
  };

  const use = expect.any(Function);

  it("should create a builder object with correct nested structure", () => {
    const builder = createBuilder(obj);

    expect(builder).toEqual({
      use,
      dex: { use },
      foo: {
        bar: {
          baz: { use },
          use,
        },
        qux: { use },
        use,
      },
      num: { use },
      str: { use },
    });

    expect(builder.foo.bar.baz.use(14)).toEqual(["foo", "bar", "baz", 14]);
    expect(builder.foo.qux.use()).toEqual(["foo", "qux"]);
    expect(builder.num.use()).toEqual(["num"]);
    expect(builder.str.use()).toEqual(["str"]);
  });

  const builder = createBuilder(obj, ["parent"]);

  it("should still have the same structure as its first argument", () => {
    expect(builder).toEqual({
      use,
      dex: { use },
      foo: {
        bar: {
          baz: { use },
          use,
        },
        use,
        qux: { use },
      },
      num: { use },
      str: { use },
    });
  });

  it("should retrieve the nested value using the use method", () => {
    expect(builder.num.use()).toEqual(["parent", "num"]);
    expect(builder.str.use()).toEqual(["parent", "str"]);
    expect(builder.foo.bar.baz.use(110)).toEqual([
      "parent",
      "foo",
      "bar",
      "baz",
      110,
    ]);
  });

  it("should create a builder object with custom prefix", () => {
    expect(builder.foo.qux.use()).toEqual(["parent", "foo", "qux"]);
  });

  it("should correctly retrieve nested value using the use method on the root", () => {
    expect(builder.use()).toEqual(obj);
  });

  it("should return undefined for non-existing nested value", () => {
    expect(builder.use().dex).toBeUndefined();
  });
});
