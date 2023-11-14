import { PortalOptions } from "@/definition";
import { usePortalImplementation } from "@/addons";

/**
 * A hook for managing the portal states.
 *
 * @template State The state of the portal
 * @template Path The path to the portal's state
 *
 * @param path The path of the portal's state
 * @param {PortalOptions<Path, State>} [options] The options of the portal's state
 *
 * @returns {PortalState<State>}
 */
export function usePortal<State, Path extends string = string, Data = State>(
  path: Path,
  options?: PortalOptions<Path, State, Data>
) {
  return usePortalImplementation<Path, State, Data>({
    path,
    options,
  });
}
