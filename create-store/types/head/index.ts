export type Head<Rest extends Type[], Last extends Type, Type = any> = [
  ...Rest,
  Last,
];
