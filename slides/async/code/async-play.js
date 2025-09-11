#!/usr/bin/env node

const Path = require('path');

const TIMEOUT_MILLIS = 100;
function timedFn(fn, timeoutMillis=TIMEOUT_MILLIS) {
  return new Promise(resolve => {
    setTimeout(() => resolve(fn()), timeoutMillis);
  });
}

function timedErr(err, timeoutMillis=TIMEOUT_MILLIS) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(err)), timeoutMillis);
  });
}

function timedVal(val, timeoutMillis=TIMEOUT_MILLIS) {
  return timedFn(() => val, timeoutMillis);
}

function timedMsg(msg, timeoutMillis=TIMEOUT_MILLIS) {
  return timedFn(() => { p(msg); return msg; }, timeoutMillis);
}

function t() { return new Date().toTimeString(); }
function p(msg=t()) { console.log(msg); }

module.exports = { timedFn, timedVal, timedMsg, timedErr, t, p };

//shows that awaiting a sync function does not return until after
//program terminates
async function awaitSync() {
  p('run sync call without await');
  p('after sync call without await');
  await p('run await sync call');
  p('after awaiting sync call');
  return 42;
}

//shows that sync function runs immediately, but await return does not
//return until after program terminates,  Async function runs after
//program top-level completes.
async function awaitSyncAsync() {
  await p('run await sync call');
  p('after awaiting sync call');
  await timedMsg('run await async call');
  p('after awaiting async call');
  return 42;
}

//shows that async function does not run or await return until after
//program top-level completes.
async function awaitAsyncSync() {
  await timedMsg('run await async call');
  p('after awaiting async call');
  await p('run await sync call');
  p('after awaiting sync call');
  return 42;
}


async function promiseSeq() {
  timedMsg('first').then(() => p('second'));
  return 42;
}

async function promiseAll() {
  return Promise.all([timedMsg('first', 1000), timedMsg('second', 100) ]);
}

//note that program does not exit until after all promises resolved,
//even though promiseRace() has completed.
async function promiseRace() {
  return Promise.race([timedMsg('first', 1000), timedMsg('second', 100) ]);
}

async function awaitErr() {
  await timedErr('error');
  return 42;
}

async function catchErr() {
  try {
    await timedErr('error');
    return 'ok';
  }
  catch (err) {
    p(`caught ${err}`);
    return 42;
  }
}
const FNS = {
  awaitSync, awaitSyncAsync, awaitAsyncSync,
  promiseSeq, promiseAll, promiseRace,
  awaitErr, catchErr,
};

function usage() {
  const prog = Path.basename(process.argv[1]);
  console.error(`usage: ${prog} FN`);
  console.error(`  where FN is one of`);
  console.error(`    ${Object.keys(FNS).join(' | ')}`);
  process.exit(1);
}

async function go(args) {
  if (args.length !== 1 || !FNS[args[0]]) usage();
  FNS[args[0]]()
    .then((v) => p(`completed ${args[0]} with ret ${v}`))
    .catch((err) => p(`caught error ${err}`));
  p('end of program');
}


if (process.argv[1] === __filename) {
  go(process.argv.slice(2)).catch(err => p(`top-level catch ${err}`));
}
