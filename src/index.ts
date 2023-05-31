"use client";

let globe = typeof global !== "undefined" ? global : window;
if (!globe) throw new Error("Global Object is undefined");

if (!globe["__$portal_ENTRIES"]) globe.__$portal_ENTRIES = new Map();
export const getPortalEntries = <K, V>() =>
  globe.__$portal_ENTRIES as PortalKeys<K, V>;

if (!globe["__$portal_REDUCERS"]) globe.__$portal_REDUCERS = new WeakMap();
export const getPortalReducers = <V, A>() =>
  globe.__$portal_REDUCERS as PortalReducers<V, A>;

export * from "./usePortal";
