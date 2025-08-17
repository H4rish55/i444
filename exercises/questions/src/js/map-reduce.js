'use strict';

const TIMESTAMP = 'Time-stamp: <2019-09-06 21:22:41 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class MapReduce extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(umtParse(QUESTION));
    this.addConstraints(({mapFn, reduceFn}) => mapFn !== reduceFn);
    let choices;
    const addFn = (x, y) => x + y;
    const mulFn = (x, y) => x * y;
    const fn = (sym) => (sym === '+') ? addFn : mulFn;
    choices = [
      ({a, b, c, mapFn, reduceFn, mapConst, init}) =>
	[a, b, c].map(e => fn(mapFn)(mapConst, e))
	.reduce((acc, e)=>fn(reduceFn)(acc, e), init),
      ({a, b, c, mapFn, reduceFn, mapConst, init}) =>
	[a, b, c].map(e => fn(mapFn)(mapConst, e))
	.reduce((acc, e)=>fn(reduceFn)(acc, e)),
      ({a, b, c, mapFn, reduceFn, mapConst, init}) =>
	[a, b, c].map(e => fn(mapFn)(mapConst, e+1))
	.reduce((acc, e)=>fn(reduceFn)(acc, e), init),
      ({a, b, c, mapFn, reduceFn, mapConst, init}) =>
	[a, b, c].map(e => fn(mapFn)(mapConst, e+1))
	.reduce((acc, e)=>fn(reduceFn)(acc, e)),
      ({a, b, c, mapFn, reduceFn, mapConst, init}) =>
	[a, b, c].map(e => fn(mapFn)(mapConst, e))
	.reduce((acc, e)=>fn(reduceFn)(acc, e + 1), init),
    ];
    choices.forEach(c => this.choice(c));
    this.freeze();
    const { a, b, c, mapFn, reduceFn, mapConst, init } = this.params;
    const expr0 = `[${a}, ${b}, ${c}].map(e => ${mapConst} #{mapFn} e)`
    const expr0Val = [a, b, c].map(e => fn(mapFn)(mapConst, e));
    const reduceExpr = `reduce((acc, e) => acc ${reduceFn} e, ${init})`;
    const reduceStr =
      expr0Val.reduce((acc, e) => `(${acc} ${reduceFn} ${e})`, String(init));
    this.addExplain(`
      (#{_0}) is correct since .~${expr0}~ is .~[${expr0Val.join(', ')}]~; 
      running .~${reduceExpr}~ on this yields .~${reduceStr}~ which 
      evaluates to the result .~${this.choices[0]}~.  Note the use 
      of the initial value .~#{init}~  as the initial value for the 
      \`reduce\` accumulator.
    `);
    this.makeContent();
  }
}

module.exports = MapReduce;
Object.assign(MapReduce, {
  id: 'mapReduce',
  title: ' Map Reduce',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const PARAMS = {
  a: () => Rand.int(1, 5),
  b: () => Rand.int(1, 4),
  c: () => Rand.int(1, 5),
  mapConst: () => Rand.int(1, 4),
  mapFn: () => Rand.choice(['+', '*']),
  reduceFn: () => Rand.choice(['+', '*']),
  init: () => Rand.int(2, 4),
};

const QUESTION = `
  What is the result of evaluating the following expression?

  ~~~
  [ #{a}, #{b}, #{c} ].map(e => #{mapConst} #{mapFn} e)
             .reduce((acc, e) => acc #{reduceFn} e, #{init})         
  ~~~
`
if (process.argv[1] === __filename) {
  console.log(new MapReduce().qaText());
}
