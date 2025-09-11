#!/usr/bin/env nodejs

//BAD CODE!!
function sleep(seconds) {
  const stop = Date.now() + seconds*1000;
  while (Date.now() < stop) {
    //busy waiting: yuck!
  }
}

setTimeout(() => console.log('timeout'),
	   1000 /*delay in milliseconds*/);

sleep(5);
console.log('sleep done');
