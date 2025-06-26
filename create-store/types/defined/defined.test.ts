import type { Defined } from "./index";

import { expectTypeOf, test } from "vitest";

test("Defined type should exclude undefined", () => {
  expectTypeOf<Defined<string | undefined>>().toEqualTypeOf<string>();
  expectTypeOf<Defined<number | undefined>>().toEqualTypeOf<number>();
  expectTypeOf<Defined<null | undefined>>().toEqualTypeOf<null>();
  expectTypeOf<Defined<undefined>>().toEqualTypeOf<never>();
  expectTypeOf<Defined<number | string>>().toEqualTypeOf<number | string>();
});
