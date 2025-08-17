'use strict';

const TIMESTAMP = 'Time-stamp: <2018-12-03 21:12:53 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class PromisesTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      A *promise* is a function which is called when an event occurs.
    `,
    value: false,
    explain: `
      A *promise* is an object, not a function.  Specifically, it is
      an object which is usually used to wrap the result of calling
      an asynchronous function and allows blocking until the result
      is available (using \`then()\` and \`catch()\` methods).
    `,
  },
  { statement: `
      If \`p\` is  a \`Promise\`, then \`p.then(fn)\` will return
      whatever the call \`fn()\` returns.
    `,
    value: false,
    explain: `
      \`p.then(fn)\` returns a \`Promise\` which when settled contains
     the value returned or exception thrown by \`fn()\`.
    `,
  },
  { statement: `
      If \`p\` is  a \`Promise\`, then \`p.catch(err)\` will throw
      the \`err\` object.
    `,
    value: false,
    explain: `
      \`p.catch(fn)\` returns a \`Promise\` which when settled contains
     the value returned or exception thrown by \`fn()\`.
    `,
  },
  { statement: `
      A promise is created using the constructor call:

      ~~~
      new Promise(resolve, reject)
      ~~~

      where \`resolve\` and \`reject\` are 1-argument functions.
    `,
    value: false,
    explain: `
      The \`Promise\` constructor takes a *single* executor function
      argument..
    `,
  },
  { statement: `
      Multiple handlers \`handler1\` and \`handler2\` can be attached 
      to the promise \`p\` using code:

      ~~~
      p.then(handler1)
       .then(handler2);
      ~~~
    `,
    value: false,
    explain: `
      The first \`then()\` returns a new \`Promise\`; hence handler
      \`handler2\` is not attached to \`p\`.  If it is necessary to
      attach multiple handlers \`handler1\` and \`handler2\` 
      to promise \`p\`, the code used should be:

      ~~~ 
      p.then(handler1);
      p.then(handler2);
      ~~~
    `,
  },

  { statement: `
      A *promise* is an object which wraps a result representing
      success or error.
    `,
    value: true,
    explain: `
      A *promise* is an object which is usually used to wrap the
      result of calling an asynchronous function and allows blocking
      until the result is available (using \`then()\` and \`catch()\`
      methods).
    `,
  },
  { statement: `
      If \`p\` is  a \`Promise\`, then \`p.then(fn)\` will return
      a \`Promise\` wrapping the result of calling \`fn()\`.
    `,
    value: true,
    explain: `
      \`p.then(fn)\` returns a \`Promise\` which when settled contains
     the value returned or exception thrown by \`fn()\`.
    `,
  },
  { statement: `
      If \`p\` is  a \`Promise\`, then \`p.catch(fn)\` will return
      a \`Promise\` wrapping the result of calling \`fn()\`.
    `,
    value: true,
    explain: `
      \`p.catch(fn)\` returns a \`Promise\` which when settled contains
     the value returned or exception thrown by \`fn()\`.
    `,
  },
  { statement: `
      A promise is created using the constructor call:

      ~~~
      new Promise(executor)
      ~~~

      where \`executor\` is a 2-argument function \`executor(resolve,
      reject)\`, with \`resolve\` and \`reject\` themselves being
      1-argument functions.
    `,
    value: true,
    explain: `
      The \`Promise\` constructor takes a *single* executor function
      argument..
    `,
  },
  { statement: `
      A promise chain like

      ~~~
      p.then(handler1)
       .then(handler2)
       .then(handler3);
      ~~~

     will create 3 new promises as the return value of each call to
     \`then()\`.
    `,
    value: true,
    explain: `
      Calling \`then()\` always returns a new \`Promise\`.
    `,
  },

];

module.exports = PromisesTrueFalse;
Object.assign(PromisesTrueFalse, {
  id: 'promisesTrueFalse',
  title: 'Promises True or False',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new PromisesTrueFalse().qaText());
}
