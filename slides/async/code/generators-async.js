#!/usr/bin/env node

//.1.
function* asyncFn() {
  const value = yield new Promise((resolve) => {
    setTimeout(() => resolve(42), 2000);
  });
  //we can access value
  console.log(value); //outputs 42
}

//drive generator
const iterator = asyncFn();
const iteration = iterator.next();
iteration.value.then(v => iterator.next(v));


		     
