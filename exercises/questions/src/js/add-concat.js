'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-10-30 12:53:39 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class AddConcat extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice(({values}) => `.~${str(values[i])}~`);
    }
    this.freeze();
    this.addExplain(`
      Neither operand of the leftmost \`+\` is a string; hence it
      denotes arithmetic addition with the result of .~#{a} + #{b}~
      being .~#{a + b}~.  Since .~"#{c}"~ is a string, the second
      \`+\` denotes string concatenation and the result of .~#{a} +
      #{b} + "#{c}"~ is .~"#{a + b + c}"~.  Since that too is a
      string, the last \`+\` also denotes string concatenation and
      the overall result of .~#{a} + #{b} + "#{c}" + "#{d}"~ is .~"#{a
      + b + c + d}"~.
    `);
    this.makeContent();
  }

}

module.exports = AddConcat;
Object.assign(AddConcat, {
  id: 'addConcat',
  title: 'Arithmetic Addition + String Concatenation',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function str(v) { return typeof v === 'number' ? v : `"${v}"`; }

const QUESTION = `What is the value of .~#{a} + #{b} + "#{c}" + "#{d}"~?`

const PARAMS = [
  { a: () => Rand.choice([1, 2, 3, null, false, true, ]),
    b: () => Rand.choice([3, 4, 5, null, false, true, ]),
    c: () => Rand.choice(['1', '2', '3', ]),
    d: () => Rand.choice(['4', '5', '6', ]),
  },
  { _type: 'nonRandom',
    answer: ({a, b, c, d}) => a + b + c + d,
    alts: ({a, b, c, d}) => [
      String(a) + (Number(b) + Number(c) + Number(d)),
      a + String(b) + c + d,
      a + String(b) + (Number(c) + Number(d)),
      Number(a) + Number(b) + Number(c) + Number(d),
      NaN,
    ],
  },
  { values: ({answer, alts}) => [answer].concat(Rand.choices(4, alts)), },    
];

if (process.argv[1] === __filename) {
  console.log(new AddConcat().qaText());
}
