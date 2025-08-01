import type { ParseAsNumber } from "@/create-store/types/parse-as-number";

/**
 * Represents the split of a key.
 *
 * @template Key The type of the key.
 * @template Delimiter The type of the delimiter.
 *
 * @description It is a tuple of the split key.
 */
export type Split<
  Key extends string,
  Delimiter extends string = ".",
> = SplitHelper<Key, Delimiter>;

type SplitHelper<
  Key extends string,
  Delimiter extends string,
  Result extends (number | string)[] = [],
> = Key extends `${infer Head}${Delimiter}${infer Tail}`
  ? SplitHelper<Tail, Delimiter, [...Result, ParseAsNumber<Head>]>
  : Key extends ""
    ? Result
    : [...Result, ParseAsNumber<Key>];
