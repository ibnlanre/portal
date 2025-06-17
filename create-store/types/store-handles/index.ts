export type FilteredStore<Store, Handles extends StoreHandles> = {
  [K in keyof Store as K extends Handles[number] ? K : never]: Store[K];
};

export type StoreHandles = ReadonlyArray<
  "$act" | "$get" | "$key" | "$set" | "$use"
>;
