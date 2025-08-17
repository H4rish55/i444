'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-11-17 23:55:05 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class ExpressRoutes extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice(({choices, perm}) => userChoices(perm, choices[i]));
    }
    this.freeze();
    this.addExplain(explain(this.params));
    this.makeContent();
  }

}

module.exports = ExpressRoutes
Object.assign(ExpressRoutes, {
  id: 'expressRoutes',
  title: 'Express Routes',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function explain(params) {
  const keys = urlKeys(params.url);
  const route = (keys.length > 1) ? 'Routes' : 'Route';
  let text = `
   ${route} ${keys.map(k => `\`${params.routesMap[k]}\``).join(' and ')}
   will match URL \`${params.url}\`.
  `;
  if (keys.length > 1) {
    text += `
      Note that both \`:id\` and \`:id.html\` match ${params.secondary}.html.
    `.trim();
  }
  return text;
}

const QUESTION = `
Given the following express.js route specifications:

  # \`#{routes[0]}\`.

  # \`#{routes[1]}\`.

  # \`#{routes[2]}\`.

Which of the above route specifications will match the URL
\`#{url}\`?
`;

const ROUTES_INFO = [
  { BASE: (primary) => `/${primary}` },
  { ID: (primary) => `/${primary}/:id` },
  { ID_HTML: (primary) => `/${primary}/:id.html` },
];

const KEYS = ROUTES_INFO.map(o => Object.keys(o)[0]);
const ROUTES = ROUTES_INFO.map(o => Object.values(o)[0]);

function urls(primary, secondary) {
  return [
    `/${primary}`,
    `/${primary}/${secondary}`,
    `/${primary}/${secondary}.html`,
    `/${primary}/${secondary}.html`,
    `/${primary}/${secondary}.html`,
  ];
}

// Return text giving external a, b, c choices.
function userChoices(perm, choices) {
  return choices.map(c => `(${'abc'[perm.indexOf(c)]})`).
    sort().
    join(' and ')
    + '.';
}

function urlKeys(url) {
  return (
      /^\/\w+$/.test(url) ? [ 'BASE' ]
    : /^\/\w+\/\w+.html$/.test(url) ? [ 'ID', 'ID_HTML' ] : [ 'ID' ]
  );
}

//return answer based on indexes of KEYS.
function answer(url) {
  return urlKeys(url).map(k => KEYS.indexOf(k));
}

//return choices based on indexes of KEYS.
function choices(url) {
  const ans = answer(url);
  const indexes = new Array(ROUTES.length).fill(0).map((_, i) => i);
  ans.forEach(a => indexes.splice(indexes.indexOf(a), 1));
  if (ans.length === 1) {
    return [
      indexes,
      [ indexes[0] ],
      [ indexes[1] ],
      [ ans[0], indexes[0] ],
    ];
  }
  else {
    return [
      [ 0 ],
      [ 1 ],
      [ 2 ],
      [ ans[0], indexes[0] ],
    ];
  }
}

const PARAMS = [
  { primary: () => Rand.choice(['docs', 'users', 'app', 'auth']),
    perm: () => Rand.permutation(ROUTES.length),
  },
  { secondary: ({primary}) => primary + Rand.choice([1, 2, 3, 4]),
  },
  { url: ({primary, secondary}) => Rand.choice(urls(primary, secondary)),
  },
  { _type: 'nonRandom',
    routesMap: ({primary}) =>
    Object.assign({}, ...KEYS.map((k, i) => ({ [k]: ROUTES[i](primary) }))),
    routes: ({primary, perm}) => perm.map(i => ROUTES[i](primary)),
    choices: ({url}) => [ answer(url) ].concat(choices(url)),
  },
];

if (process.argv[1] === __filename) {
  console.log(new ExpressRoutes().qaText());
}
