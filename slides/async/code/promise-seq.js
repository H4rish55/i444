//Given promiseFns as an iterable of single argument
//functions returning a Promise.
//Returns promise resulting from sequentially applying
//each function in promiseFns to result of previous
//one, starting with initial promise init.
function sequencePromises(init, promiseFns) {
  let p = init;
  for (const fn of promiseFns) p = p.then((v)=>fn(v));
  return p;
}

//.1.
//Use reduce when promiseFns is an array
function reduceSequencePromises(init, promiseFns) {
  return promiseFns.reduce(function(acc, fn) {
    return acc.then((v) => fn(v))
  }, init);
}
