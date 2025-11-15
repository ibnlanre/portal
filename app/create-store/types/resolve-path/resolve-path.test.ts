import type { ResolvePath } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("ResolvePath", () => {
  it("should get a top-level value", () => {
    type Result = ResolvePath<
      {
        user: {
          address: {
            city: string;
            zip: number;
          };
          id: number;
          name: string;
        };
      },
      "user"
    >;

    type Expected = {
      address: {
        city: string;
        zip: number;
      };
      id: number;
      name: string;
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
      | undefined
      | {
          44: string;
        };

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
