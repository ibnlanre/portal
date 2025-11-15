export type Tail<Head extends Type, Rest extends Type[], Type> = [
  Head,
  ...Rest,
];
