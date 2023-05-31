import { Dispatch, SetStateAction, ReducerState, Reducer } from 'react';

/**
 *
 * Custom hook for creating a portal with basic state management.
 * @param key - Unique key identifier for the portal.
 * @param initialState - Optional initial state of the portal.
 * @returns A tuple containing the state and dispatch function for updating the state using setState.
 */
declare function usePortal<S>(key: string, initialState?: S): [S, Dispatch<SetStateAction<S>>];
/**
 *
 * Custom hook for creating a portal with an optional reducer to update the state.
 * @param key - Unique key identifier for the portal.
 * @param initialState - Initial state of the portal, which could be a reducer state.
 * @param reducer - Optional reducer function to handle state updates.
 * @returns A tuple containing the state and dispatch function for updating the state.
 */
declare function usePortal<S, A>(key: string, initialState: S & ReducerState<Reducer<S, A>>, reducer?: Reducer<S, A>): [typeof initialState, Dispatch<A>];

declare const getPortalEntries: <K, V>() => PortalKeys<K, V>;
declare const getPortalReducers: <V, A>() => PortalReducers<V, A>;

export { getPortalEntries, getPortalReducers, usePortal };
