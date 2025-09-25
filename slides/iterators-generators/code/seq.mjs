export default
function makeSeq(lo=0, hi=Number.MAX_SAFE_INTEGER, inc=1) {
  //return obj implementing iterable protocol
  return {
    [Symbol.iterator]() { //fn property syntax
      let value = lo;
      //return obj implementing iterator protocol
      return {
	next() {
	  const obj = { done: value > hi, value };
	  value += inc;
	  return obj;
	},
      };
    },
  };
}
//.1.

for (const v of makeSeq(3, 5)) { console.log(v); }
for (const v of makeSeq(3, 10, 2)) { console.log(v); }

for (const v of makeSeq()) {
  if (v > 3) break;
  console.log(v);
}

//.2.
for (const i of makeSeq(1, 2)) { //nested seq obj lifetimes
  for (const j of makeSeq(3, 4)) {
    console.log(i, j);
  }
}
