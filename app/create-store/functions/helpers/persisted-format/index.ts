import type { PersistedEnvelope } from "@/create-store/types/persisted-envelope";
import type { PersistedFormatOptions } from "@/create-store/types/persisted-format-options";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isNullish } from "@/create-store/functions/assertions/is-nullish";

/**
 * Interprets a parsed stored value. Without a `version` the value is the state
 * as stored. With a `version` the value must be a `{ $version, state }`
 * envelope: anything else, an envelope of a version `migrate` cannot handle, a
 * failing migration, and `null` or `undefined` all count as absent.
 * `migrate` runs only for an envelope of a different version. `validate`, if
 * given, then runs on the state; `null`, `undefined` and a throw make it absent.
 *
 * @template State The state the adapter holds.
 * @param raw The parsed stored value.
 * @param options The adapter's `version`, `migrate` and `validate`.
 * @returns The state, or `undefined` when the stored value is absent.
 */
export function readPersisted<State>(
  raw: unknown,
  { migrate, validate, version }: PersistedFormatOptions<State>
): State | undefined {
  if (isNullish(raw)) return undefined;

  let state: unknown = raw;
  if (version !== undefined) {
    if (!isEnvelope(raw)) return undefined;
    state = raw.state;
    if (raw.$version !== version) {
      if (!migrate) return undefined;

      try {
        state = migrate(state, raw.$version);
      } catch (error) {
        console.error("Error occurred while migrating persisted state:", error);
        return undefined;
      }
    }
  }

  if (isNullish(state)) return undefined;
  if (!validate) return state as State;

  try {
    return validate(state) ?? undefined;
  } catch (error) {
    console.error("Error occurred while validating persisted state:", error);
    return undefined;
  }
}

/**
 * Prepares a state for storage: the envelope when versioned, else the bare
 * value.
 *
 * @template State The state the adapter holds.
 * @param value The state to store.
 * @param version The adapter's `version`, if it has one.
 * @returns What the adapter serializes.
 */
export function writePersisted<State>(
  value: State,
  version: number | undefined
): PersistedEnvelope<State> | State {
  return version === undefined ? value : { $version: version, state: value };
}

function isEnvelope(value: unknown): value is PersistedEnvelope<unknown> {
  return (
    isDictionary(value) &&
    typeof value.$version === "number" &&
    Object.prototype.hasOwnProperty.call(value, "state")
  );
}
