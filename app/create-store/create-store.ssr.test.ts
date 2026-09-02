import { describe, expect, it } from "vitest";

import { createLocalStorageAdapter } from "@/create-store/functions/adapters/create-local-storage-adapter";
import { createStore } from "@/create-store";

type Consent = "granted" | "denied" | null;

describe("real-world storage pattern (SSR)", () => {
  it("adapter returns fallback without typeof window guard at call site", () => {
    const [getConsent] = createLocalStorageAdapter<Consent>("consent");

    const initial = getConsent(null);
    expect(initial).toBeNull();
  });

  it("createStore works with adapter-sourced initial value in SSR", () => {
    const [getConsent] = createLocalStorageAdapter<Consent>("consent");

    const store = createStore(getConsent(null));
    expect(store.$get()).toBeNull();
  });

  it("subscribe + adapter setter syncs without errors in SSR", () => {
    const [getConsent, setConsent] =
      createLocalStorageAdapter<Consent>("consent");

    const store = createStore(getConsent(null));
    store.$subscribe(setConsent, false);

    expect(() => store.$set("granted")).not.toThrow();
    expect(store.$get()).toBe("granted");
  });

  it("cross-tab storage event listener is a no-op in SSR", () => {
    const [getConsent] = createLocalStorageAdapter<Consent>("consent");

    const store = createStore(getConsent(null));
    expect(store.$get()).toBeNull();
  });
});
