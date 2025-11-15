export type AsyncAction<Data> =
  | { payload: Data; type: "SUCCESS" }
  | { payload: Error; type: "ERROR" }
  | { type: "LOADING" };
