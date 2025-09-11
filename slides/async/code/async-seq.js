//Given promiseFns as an iterable of single argument
//async functions returning a Promise.
//Returns promise resulting from sequentially applying
//each function in promiseFns to result of previous
//one, starting with initial promise init.
async function asyncSequencePromises(init, promiseFns) {
  let v = await init;
  for (const fn of promiseFns) v = await fn(v);
  return v;
}

//.1.
//Use reduce when promiseFns is an array.
//Does not work, cannot use await within lambdas?
async function asyncReduceSequencePromises(init, promiseFns) {
  return promiseFns.reduce(async function (acc, fn) {
    p(acc)
    return await fn(acc);
  }, await init);
}
