"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const snapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverSnapshot = () => false;

/** Stable hydration plus live OS preference changes. Manual controls stay available. */
export default function useReducedMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
