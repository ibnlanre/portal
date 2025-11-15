import type { Components } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("Components type utility", () => {
  it("should split a single-level path correctly", () => {
    type Result = Components<"level1">;
    expectTypeOf<Result>().toEqualTypeOf<["level1"]>();
  });

  it("should split a multi-level path correctly", () => {
    type Result = Components<"level1.level2.level3">;
    expectTypeOf<Result>().toEqualTypeOf<
      ["level1", "level1.level2", "level1.level2.level3"]
    >();
  });

  it("should handle an empty path", () => {
    type Result = Components<"">;
    expectTypeOf<Result>().toEqualTypeOf<[""]>();
  });
});
