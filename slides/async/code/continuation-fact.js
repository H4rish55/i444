#!/usr/bin/env nodejs

'use strict';

//.1.
//cc is current continuation.
//cc(n): continue as per function cc() with return value n
//Note no return.  //indicates traditional factorial
function contFact(n, cc) { //function fact(n) {
  if (n <= 1) {
    cc(1);                 //return 1;
  }
  else {
    contFact(n - 1,       //return n*fact(n - 1);
	     (f1) => cc(n*f1));
  }
}

contFact(5, (f) => console.log(f));

