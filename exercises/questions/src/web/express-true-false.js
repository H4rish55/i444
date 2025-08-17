'use strict';

const TIMESTAMP = 'Time-stamp: <2018-11-16 17:10:44 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class ExpressTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      An express.js route specification can consist of a string
      containing the literal URL to be matched.
    `,
    value: true,
    explain: `
      An express.js route specification can consists of a literal
      string, a pattern string or a regex.       
    `,
  },
  { statement: `
      An express.js route specification can consist of a string
      containing a express pattern specification
      with patterns specified by path components starting with \`:\`.
    `,
    value: true,
    explain: `
      An express.js route specification can consists of a literal
      string, a pattern string or a regex.       
    `,
  },
  { statement: `
      An express.js route specification can consist of a regular
      expression.
    `,
    value: true,
    explain: `
      An express.js route specification can consists of a literal
      string, a pattern string or a regex.       
    `,
  },
  { statement: `
      The ordering of express.js routes can matter.
    `,
    value: true,
    explain: `
      If multiple express.js routes match the
      same URL then the handler which gets run first depends on the
      relative order of the routes.
    `,
  },
  { statement: `
      It is possible to have an incoming web request run multiple
      express.js route handlers.
    `,
    value: true,
    explain: `
      When the URL for an incoming web request matches multiple
      express.js routes, then it is possible to have a handler
      transfer control to the next matching handler by having
      it call the \`next()\` function which is usually passed
      in as the third argument to the handler.
    `,
  },
  { statement: `
      The only HTTP methods supported by the express.js routing
      framework are the \`GET\` and \`POST\` methods because those
      are the only methods supported by HTML forms.
    `,
    value: false,
    explain: `
       An express.js route supports many HTTP methods including
       \`GET\`, \`POST\`, \`PUT\`, \`DELETE\`, \`PATCH\`, and
       \`DELETE\`.  This makes is possible to use express.js
       to support general web services rather than simply
       the submission of HTML forms.
    `,
  },
  { statement: `
      If it is necessary to call an express.js route handler with some
      additional arguments, then it is possible to add those arguments
      after the first two \`req\` request and \`res\` response
      arguments.
    `,
    value: false,
    explain: `
      It is not possible to add arguments in an arbitrary manner
      as express.js assumes that the third argument is a \`next()\`
      function and that the handler is an error handler if specified
      with four arguments.
    `,
  },
  { statement: `
      The express.js framework comes with out-of-the-box functionality
      to handle the submission of HTML forms.
    `,
    value: false,
    explain: `
      The express.js framework comes with minimal out-of-the-box
      functionality and it is necessary to add middleware to handle
      most HTML form submissions.
    `,
  },
  { statement: `
      It is possible to use the express.js's \`req\` request object to
      store parameter values shared across the entire application.
    `,
    value: false,
    explain: `
      It would not make sense to store application wide parameters in
      a \`req\` request object as that \`req\` object has lifetime
      restricted to a single HTTP request-response cycle.  Such
      parameters should be store in the \`app\` object; in fact, the
      recommended container for such parameters is \`app.locals\`.
    `,
  },
  { statement: `
      If multiple express.js route handlers need to collaborate
      to build a response for a single HTTP request, then they
      should use the \`app\` application context to store
      the shared state.
    `,
    value: false,
    explain: `
      Though this is possible, it would not be a good idea as
      using the \`app\` to store the shared state would need
      some way to ensure that the state is effectively reset 
      before the start of the next similar HTTP request.  What
      would be better is storing the shared state in either
      the \`req\` request or \`res\` response objects as those
      objects disappear at the end of each request-response cycle.
    `,
  },
];

module.exports = ExpressTrueFalse;
Object.assign(ExpressTrueFalse, {
  id: 'expressTrueFalse',
  title: 'Express: True or False',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new ExpressTrueFalse().qaText());
}
