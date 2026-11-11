/** Names a shape key may not use: they belong to every store. */
export type ReservedKey =
  | "$dispose"
  | "$get"
  | "$onDispose"
  | "$reset"
  | "$set"
  | "$subscribe"
  | "$use";
