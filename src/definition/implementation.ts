import type { CookieOptions, Initial } from "definition";
import type { Reducer } from "react";

/**
 * Represents the configuration options for the implementation of a custom hook
 * to access and manage state in the portal system with Atom storage support.
 *
 * @template S The type of the state.
 * @template A The type of the actions.
 */
export type Implementation<S, A = undefined> = {
    /**
     * Unique key identifier for the portal.
     */
    key: any;
  
    /**
     * The initial state value.
     */
    initialState?: Initial<S>;
  
    /**
     * The reducer function to handle state updates.
     */
    reducer?: Reducer<S, A>;

    /**
     * The options to set a cookie state to, if any.
     */
    cookieOptions?: CookieOptions;
  
    /**
     * If true, override an existing portal entry with the same key.
     */
    override?: boolean;
  };
  