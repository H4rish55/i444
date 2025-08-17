'use strict';

const TIMESTAMP = 'Time-stamp: <2018-10-06 14:01:34 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class Falsy extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice(({sets}) => friendlyList(sets[i].sort()));
    }
    this.freeze();
    this.addExplain(umtParse(BACKGROUND));
    this.addExplain(`(#{_0}) is the answer because ${this.choices[0]} 
                    are all falsy values.`.trim());
    for (const i of this.choiceOrder()) {
      if (i === 0) continue;
      this.addExplain(`(#{_${i}}) is not the answer because it contains 
                       truthy value .~#{truthies[${i - 1}]}~.`.trim());
    }
    this.makeContent();
  }

}
module.exports = Falsy;
Object.assign(Falsy, {
  id: 'falsy',
  title: 'Falsy Values',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const VALUES = {
  ['false']: [ false, 0 ],
  ['undefined']: [ false, 1 ],
  ['null']: [ false, 2 ],
  ['0']: [ false, 3 ],
  ['""']: [ false, 4 ],
  ['NaN']: [ false, 5 ],
  ['"false"']: [ true, 6 ],
  ['"undefined"']: [ true, 7 ],
  ['"null"']: [ true, 8 ],
  ['"0"']: [ true, 9 ],
  ['"NaN"']: [ true, 10 ],
  ['[]']: [ true, 11 ],
  ['{}']: [ true, 12 ],
};

// function toBitSet(vals) {
//   return vals.reduce((acc, e)=>acc|(1<<VALUES[e][1]), 0);
// }

// function fromBitSet(s) {
//   return s.toString(2).
//     split('').
//     reverse().
//     reduce((acc, e, i) => acc.concat(e === '1' ? [REV_VALUES[i]] : []), []);
// }

const FALSIES = Object.keys(VALUES).filter(e => !VALUES[e][0]);
const TRUTHIES = Object.keys(VALUES).filter(e => VALUES[e][0]);

const PARAMS = [
  { truthies: () => Rand.choices(4, TRUTHIES), },
  { sets: ({truthies}) => (
    [ Rand.choices(Rand.int(3, 6), FALSIES),
      Rand.choices(Rand.int(2, 5), FALSIES).concat([truthies[0]]),
      Rand.choices(Rand.int(2, 5), FALSIES).concat([truthies[1]]),
      Rand.choices(Rand.int(2, 5), FALSIES).concat([truthies[2]]),
      Rand.choices(Rand.int(2, 5), FALSIES).concat([truthies[3]]),
    ])
  },
];

// const REV_VALUES =
// Object.assign({}, ...Object.entries(VALUES).map(([k, v]) => ({[v[1]]: k})));

const QUESTION = `
  Which is the largest set below such that all values in the set
  are falsy?
`;

function friendlyList(list) {
  return list.
    map(e=>`.~${e}~`).
    join(', ').
    replace(/\,([^,]+)$/, ' and$1');
}

const BACKGROUND = `
  The falsy values in JavaScript are ${friendlyList(FALSIES)}.
  Note that the string versions of those values are all truthy 
  as are [] and {}.
`;

if (process.argv[1] === __filename) {
  console.log(new Falsy().qaText());
}
