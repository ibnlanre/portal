import { describe, expectTypeOf, it } from "vitest";
import type { ResolvePath } from ".";

describe("ResolvePath", () => {
  it("should get a top-level value", () => {
    type Result = ResolvePath<
      {
        user: {
          id: number;
          name: string;
          address: {
            city: string;
            zip: number;
          };
        };
      },
      "user"
    >;

    type Expected = {
      id: number;
      name: string;
      address: {
        city: string;
        zip: number;
      };
    };
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should get a number key", () => {
    type Result = ResolvePath<
      {
        42: {
          43?: {
            44: string;
          };
        };
      },
      "42.43"
    >;

    type Expected =
      | {
          44: string;
        }
      | undefined;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should not allow accessing a non-existent key", () => {
    type Result = ResolvePath<
      {
        items: {
          id: number;
          name: string;
        }[];
      },
      "items"
    >;

    type Expected = {
      id: number;
      name: string;
    }[];
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
