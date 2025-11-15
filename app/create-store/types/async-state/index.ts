export type AsyncState<Data> =
  | {
      data: Data;
      error: null;
      isLoading: false;
    }
  | {
      data: null;
      error: Error;
      isLoading: false;
    }
  | {
      data: null;
      error: null;
      isLoading: true;
    };
