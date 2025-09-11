const TIMEOUT_MILLIS = 2*1000;

export function asyncSucc(fn, ...args) {
  setTimeout(fn, TIMEOUT_MILLIS, ...args);
}

export function asyncErr(msg) {
  setTimeout(() => { throw new Error(msg) }, TIMEOUT_MILLIS);
}

// Utilities

export const p = console.log;

export function t() { return new Date().toTimeString(); }


