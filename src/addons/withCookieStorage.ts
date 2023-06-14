import { useState, useEffect, type Reducer } from "react";
import {
  usePortalImplementation,
  type Initial,
  type UsePortalResult,
} from "./withImplementation";
import { isFunction } from "../utilities";

type CookieOptions = {
  path?: string;
  domain?: string;
  expires?: number | Date;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
};

/**
 * Formats the provided cookie options into a string format compatible with the document.cookie API.
 * @param {CookieOptions} [options] - The cookie options to format.
 * @returns {string} The formatted cookie options as a string.
 */
function formatCookieOptions(options?: CookieOptions): string {
  if (!options) return "";

  const {
    path = "",
    domain = "",
    expires = "",
    secure = false,
    sameSite = "",
  } = options;

  let optionsString = "";
  if (path) optionsString += `;path=${path}`;
  if (domain) optionsString += `;domain=${domain}`;
  if (expires) {
    const expiresDate = new Date(expires);
    optionsString += `;expires=${expiresDate.toUTCString()}`;
  }
  if (secure) optionsString += ";secure";
  if (sameSite) optionsString += `;samesite=${sameSite}`;

  return optionsString;
}

/**
 * Retrieves the value of the cookie with the specified name from the document.cookie.
 * @param {string} name - The name of the cookie.
 * @returns {string|null} The value of the cookie, or null if the cookie is not found.
 */
function getCookieValue(name: string) {
  try {
    const cookies = document?.cookie?.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies?.at(i)?.trim();
      if (cookie?.startsWith(name + "=")) {
        return cookie?.substring(name.length + 1);
      }
    }
  } catch (error) {
    console.error("Error retrieving Document Cookie", error);
  }
  return null;
}

/**
 * Custom hook to access and manage document.cookie state within the portal system.
 * @param {CookieOptions} [options] - The cookie options to format.
 * @returns {string} The formatted cookie options as a string.
 */
export function usePortalWithCookieOptions(cookieOptions?: CookieOptions) {
  /**
   * Custom hook to access and manage state in the portal system with sessionStorage support.
   * @template S The type of the state.
   * @template A The type of the actions.
   *
   * @param {string} key The key to identify the state in the portal system and sessionStorage.
   * @param {S?} initialState The initial state value.
   * @param {Reducer<S, A>?} reducer The reducer function to handle state updates.
   *
   * @returns {UsePortalResult<S, A>} A tuple containing the current state and a function to update the state.
   * @throws {Error} If used outside of a PortalProvider component.
   */
  function usePortalWithCookieStorage<S, A = undefined>(
    key: string,
    initialState?: Initial<S>,
    reducer?: Reducer<S, A>
  ): UsePortalResult<S, A> {
    const [cookieState, setCookieState] = useState<S | undefined>(undefined);

    useEffect(() => {
      const cookieValue = getCookieValue(key);
      if (cookieValue !== null) {
        const parsedState = JSON.parse(decodeURIComponent(cookieValue));
        setCookieState(parsedState);
      } else {
        if (initialState instanceof Promise) {
          initialState.then((value) => {
            const encodedState = encodeURIComponent(JSON.stringify(value));
            const cookieOptionsString = formatCookieOptions(cookieOptions);
            document.cookie = `${key}=${encodedState}${cookieOptionsString}`;
          });
        } else {
          const plainState = isFunction(initialState)
            ? initialState()
            : initialState;
          const encodedState = encodeURIComponent(JSON.stringify(plainState));
          const cookieOptionsString = formatCookieOptions(cookieOptions);
          document.cookie = `${key}=${encodedState}${cookieOptionsString}`;
        }
      }
    }, [key, initialState]);

    const [state, setState] = usePortalImplementation(
      key,
      cookieState,
      reducer
    );

    useEffect(() => {
      const encodedState = encodeURIComponent(JSON.stringify(state));
      const cookieOptionsString = formatCookieOptions(cookieOptions);
      document.cookie = `${key}=${encodedState}${cookieOptionsString}`;
    }, [key, state]);

    return [state, setState];
  }

  return {
    cache: usePortalWithCookieStorage,
  };
}
