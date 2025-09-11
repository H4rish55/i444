const MAX_TIMEOUT = 3;

function later(fn, ...args) {
  const timeout =
    Math.floor(Math.random()*(MAX_TIMEOUT + 1));
  setTimeout(fn, timeout*1000, ...args);
}
