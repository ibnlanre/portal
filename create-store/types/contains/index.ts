export type Contains<T, Arr extends readonly unknown[]> = T extends Arr[number]
  ? 1
  : 0;
