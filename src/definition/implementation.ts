import type { CookieOptions } from "@/definition";

/**
 * Represents the configuration options for the implementation of a custom hook
 * to access and manage state in the portal system with Atom storage support.
 *
 * @template S The type of the state.
 * @template A The type of the actions.
 */
export type Implementation<State, Path> = {
    /**
     * Unique key identifier for the portal.
     */
    path: Path;
  
    /**
     * The initial state value.
     */
    initialState?: State;

    /**
     * The options to set a cookie state to, if any.
     */
    cookieOptions?: CookieOptions;
  
    /**
     * If true, override an existing portal entry with the same key.
     */
    override?: boolean;
  };
  