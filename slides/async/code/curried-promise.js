function p(...args) { console.log(...args); }
function t() { return new Date().toTimeString(); }

const DELAY_MILLIS = 2000;

//Returns a curried function f, such that calling .1.f(a)(b)
//will result in a promise encapsulating the result of an
//async call to fn(a, b) after DELAY_MILLIS.
function curriedPromise(fn) {
  return (a) => (b) => 
    new Promise(function(resolve, reject) {
      setTimeout(function() {
	let value, err;
	try {
	  value = fn(a, b);
	}
	catch (e) {
	  err = e;
	}
	if (err) reject(err); else resolve(value);
      }, DELAY_MILLIS);
    }); 
}

