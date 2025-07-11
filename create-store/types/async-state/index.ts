export type AsyncState<Data> = {
  data: Data | null;
  error: Error | null;
  isLoading: boolean;
};
