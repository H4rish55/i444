'use strict';

const TIMESTAMP = 'Time-stamp: <2019-09-06 21:21:47 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class ReduceFilter extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(umtParse(QUESTION));
    this.choice(({answer}) => '.~#{answer}~');
    for (let i = 0; i < 4; i++) { this.choice(`.~#{alts[${i}]}~`); }
    //   this.choice(({answer, altOffsets: alts}) =>
    // 		  listFormat(altAnswer(answer, alts[i], i)));
    // }
    this.freeze();
    this.addExplain(`
      (#{_0}) is correct since the \`reduce\` is a #{reduceDescr} which
      results in .~#{reduceResult}~.  The \`filter\` #{filterDescr}
      resulting in .~#{answer}~.
    `);
    this.makeContent();
  }
}

module.exports = ReduceFilter;
Object.assign(ReduceFilter, {
  id: 'reduceFilter',
  title: 'Reduce and Filter',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function altAnswer(answer, perturbation, i) {
  return (answer.length > i)
    ? [ ...answer.slice(0, i), answer[i] + perturbation, ...answer.slice(i+1) ]
    : answer.concat([perturbation]);
}
  
function listFormat(list) { return `.~[${list.join(', ')}]~`; }

const REDUCERS = {
  mapIndexAdd: [
    'acc.concat([e+i])',
    (acc, e, i) => acc.concat([e+i]),
    'complicated way of doing a .~map((e, i) => e+i)~ over the original list',
  ],
  mapIndexSub: [
    'acc.concat([e-i])',
    (acc, e, i) => acc.concat([e-i]),
    'complicated way of doing a .~map((e, i) => e-i)~ over the original list',
  ],
  mapIndexMul: [
    'acc.concat([e*i])',
    (acc, e, i) => acc.concat([e*i]),
    'complicated way of doing a .~map((e, i) => e*i)~ over the original list',
  ],
  /* removed since quite complex
  revIndexSub: [
    '[e-i].concat(acc)',
    (acc, e, i) => [e-i].concat(acc),
    'equivalent to applying .reverse().map((e, i) => e-i) to the original list',
  ],
  revIndexAdd: [
    '[e+i].concat(acc)',
    (acc, e, i) => [e+i].concat(acc),
    'equivalent to applying .reverse().map((e, i) => e+i) to the original list',
  ],
  revIndexMul: [
    '[e*i].concat(acc)',
    (acc, e, i) => [e*i].concat(acc),
    'equivalent to applying .reverse().map((e, i) => e*i) to the original list',
  ],
  */
};

const FILTERS = {
  mod3: [
    'filter(e => e % 3 !== 0)',
    e => e % 3 !== 0,
    'selects only those elements which are not divisible by 3',
  ],
  gt2: [
    'filter(e => e > 2)',
    e => e > 2,
    'selects only those elements which are greater than 2',
  ],
  lt4: [
    'filter(e => e < 4)',
    e => e < 4,
    'selects only those elements which are less than 4',
  ],
};

const PARAMS = [
  { a: () => Rand.int(-3, 4),
    b: () => Rand.int(-3, 4),
    c: () => Rand.int(-3, 4),
    reduce: () => Rand.choice(Object.keys(REDUCERS)),
    filter: () => Rand.choice(Object.keys(FILTERS)),
    altOffsets: () => Rand.choices(4, [1, -1, 2, -2, 3, -3, 4, -4]),
  },
  { _type: 'nonRandom',
    reduceExpr: ({reduce}) => REDUCERS[reduce][0],
    reduceFn: ({reduce}) => REDUCERS[reduce][1],
    reduceDescr: ({reduce}) => REDUCERS[reduce][2],
    filterExpr: ({filter}) => FILTERS[filter][0],
    filterFn: ({filter}) => FILTERS[filter][1],
    filterDescr: ({filter}) => FILTERS[filter][2],
  },
  { _type: 'nonRandom',
    reduceResult: ({a, b, c, reduceFn: f}) =>
    [a, b, c].reduce((a, e, i)=>f(a, e, i), []),
  },
  { _type: 'nonRandom',
    answer: ({reduceResult: r, filterFn: f}) => r.filter(e => f(e)),
  },
  { _type: 'nonRandom',
    alts: ({answer: a, altOffsets: alts}) => alts.map((e, i)=>altAnswer(a,e,i)),
  },
];

const QUESTION = `
  What is the result of evaluating the following expression?

  ~~~
  [ #{a}, #{b}, #{c} ]
    .reduce((acc, e, i) => #{reduceExpr}, [])
    .#{filterExpr}
  ~~~
`
if (process.argv[1] === __filename) {
  console.log(new ReduceFilter().qaText());
}

