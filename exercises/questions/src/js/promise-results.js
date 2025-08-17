'use strict';

const TIMESTAMP = 'Time-stamp: <2018-12-02 19:08:01 umrigar>';

const assert = require('assert');

const {
  ChoiceQuestion, Rand, umtParse,
  emacsTimestampToMillis, functionBodyWithSubsituteParams,
} = require('gen-q-and-a');

class PromiseResults extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice((params) => choice(i, params));
    }
    this.freeze();
    this.addExplain(explain(this.params));
    this.makeContent();
  }

}

module.exports = PromiseResults;
Object.assign(PromiseResults, {
  id: 'promiseResults',
  title: 'Promise Results',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function explain({start, a, b, isThrow1, isThrow2, throwFn, catchFn, incFn}) {
  let [v, isThrown] = [start, false];
  let ret = 'The promise-chain within `f()` is resolved as follows:\n\n';
  //Promise.resolve(val)
  ret += `
      # The \`Promise.resolve(val)\` initializes the promise-chain 
        with .~${v}~.\n
  `;
  //first then
  if (isThrow1) {
    ret += `
      # The \`resolve()\` for the first \`then()\` is called with
        value .~${v}~.  It throws an error object with value .~(${v} +
        ${b})~ which is .~${v + b}~.\n
    `;
    isThrown = true; v += b;
  }
  else {
    ret += `
      # The \`resolve()\` for the first \`then()\` is called with
        value .~${v}~.  It resolves to .~(${v} + ${a})~.  Hence the
        promise-chain continues with value .~${v + a}~.\n
    `;
    v += a;
  }
  //second then
  if (isThrown) {
    ret += `
      # Because of the exception thrown by the first \`then()\`
        the second \`then()\` is skipped with the error object
        remaining at .~${v}~.\n
    `;    
  }
  else if (isThrow2) {
    ret += `
      # The \`resolve()\` for the second \`then()\` is called with
        value .~${v}~.  It throws an error object with value .~(${v} +
        ${b})~ which is .~${v + b}~.\n
    `;
    isThrown = true; v += b;
  }
  else {
    ret += `
      # The \`resolve()\` for the second \`then()\` is called with
        value .~${v}~.  It resolves to .~(${v} + ${a})~.  Hence the
        promise-chain continues with value .~${v + a}~.\n
    `;
    v += a;
  }
  //catch
  if (isThrown) {
    const thrower = (isThrow1) ? 'first' : 'second';
    ret += `
      # Since the ${thrower} \`then()\` threw an error object .~${v}~,
        the \`catch()\` is entered with .~err~ set to .~${v}~.  It
        returns .~(${v} * ${b})~.  Hence the promise-chain value 
        is set to .~${v * b}~.\n
    `;
    v *= b;
  }
  else {
    ret += `
      # Since no exceptions occurred earlier in the promise-chain,
        the \`catch()\` is skipped with the promise-chain continuing
        with value .~${v}~.
    `;
  }
  //last then
  ret += `
      # The \`resolve()\` for the last \`then()\` is called with
        promise-chain value of .~${v}~.  It resolves to .~(${v} +
        ${a})~.  Hence the return value of the promise-chain is .~${v
        + a}~.\n
  `;
  v += a;
  ret += `So the function returns .~${v}~.`;
  return ret;
}

//note that we cannot use util.functionBodyWithSubsituteParams() and
//use that function to evaluate the answer as that would require
//async function evaluation which the question generation framework
//cannot do.

const THEN_THROWS = {
  'false-false': {
    0: [false, false],
    1: [false, true],
    2: [true, false],
  },
  'false-true': {
    0: [false, true],
    1: [false, false],
    2: [true, true ],
  },
  'true-false': {
    0: [true, false],
    1: [false, false],
    2: [false, true],
  },
  'true-true': {
    0: [true, true],
    1: [false, false],
    2: [false, true],
  },
}

//index === 0: Generate answer.
//index === 1: flip then1 function
//index === 2: flip then2 function
//above generates only 3 choices because when then1 is throw, then2 is don't-care
//if index >= 3, perturb start value
function choice(index, params) {
  const {start, a, b, isThrow1, isThrow2, throwFn, catchFn, incFn} = params;
  let [isThrowFn1, isThrowFn2] = [isThrow1, isThrow2];
  if (0 < index && index < 3) {
    [isThrowFn1, isThrowFn2] = THEN_THROWS[`${isThrow1}-${isThrow2}`][index];
  }
  const then1Fn = (isThrowFn1) ? throwFn : incFn;
  const then2Fn = (isThrowFn2) ? throwFn : incFn;
  let v = start + ((index < 3) ? 0 : (a + b + index - 3));
  try {
    v = then1Fn(v);
    if (!isThrowFn1) v = then2Fn(v);
  }
  catch (err) {
    v = catchFn(err);
  }
  v = incFn(v);
  return v;
}

const QUESTION = `
Given the following code:

~~~
async function f(val, a, b) {
  return await
    Promise.resolve(val).
    then(#{then1Fn}).
    then(#{then2Fn}).
    catch(#{catchFn}).
    then(#{incFn});
}
~~~

what will be the result of calling .~await f(#{start}, #{a}, #{b})~?
`;



const PARAMS = [
  { start: () => Rand.int(5, 15),
    a: () => Rand.int(2, 5),
    b: () => Rand.int(2, 4),
    isThrow1: () => Rand.choice([false, true]),
    isThrow2: () => Rand.choice([false, true]),
  },
  ({a, b}) => a !== b,
  { _type: 'nonRandom',
    //since toString() on functions always return source text of function,
    //a and b below must be defined externally
    incFn: ({a, b}) => (v) => v + a,
    catchFn: ({a, b}) => (err) => err * b,
    throwFn: ({a, b}) => (v) => { throw v + b },
  },
  { _type: 'nonRandom',
    then1Fn: ({isThrow1, incFn, throwFn}) => (isThrow1) ? throwFn : incFn,
    then2Fn: ({isThrow2, incFn, throwFn}) => (isThrow2) ? throwFn : incFn,
  },
];


if (process.argv[1] === __filename) {
  console.log(new PromiseResults().qaText());
}
