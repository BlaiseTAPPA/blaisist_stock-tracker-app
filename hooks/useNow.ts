"use client";

import { useSyncExternalStore } from "react";

// One shared clock for every relative date on the page: a single interval,
// started by the first subscriber and stopped with the last one.
const TICK_MS = 60_000;

let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => now;
// No clock on the server: the time zone and the current time are the
// browser's, so the server render (and the hydration pass) gets `null` and
// must not print anything that depends on them.
const getServerSnapshot = () => null;

/**
 * Current time in ms, refreshed every minute; `null` during the server render
 * and hydration, so date text is only rendered in the browser (no hydration
 * mismatch between the server's and the viewer's time zone).
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
