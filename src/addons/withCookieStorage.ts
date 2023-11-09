import { useEffect } from "react";

import { usePortalImplementation } from "./withImplementation";
import { cookieStorage } from "@/component";
import { getValue } from "@/utilities";
import { portal } from "@/subject";

import type { Builder, CookieOptions, Paths, PortalState } from "@/definition";

export function usePortalWithCookieStorage<
  Store extends Record<string, any>,
  Path extends Paths<Builder<Store, any>>
>(
  builder: Builder<Store, any>,
  path: Path,
  options?: CookieOptions
): PortalState<string> {
  const initialState = getValue(builder.use(), path);
  const { value, ...cookieOptions } = portal.resolveCookieEntry(
    path,
    initialState,
    options
  );

  const [state, setState] = usePortalImplementation<string, Path>(path, value);
  useEffect(() => {
    cookieStorage.setItem(path, value, cookieOptions);
  }, [state]);

  return [value, setState];
}
