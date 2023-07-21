import { portal } from "./map";
import { removeItemFromEntries } from "./removeItemFromEntries";

/**
 * Clears all entries from the portal.
 * @returns {void}
 */
export const clearEntries = () => {
  portal.forEach((value) => {
    removeItemFromEntries(value);
  });
};
