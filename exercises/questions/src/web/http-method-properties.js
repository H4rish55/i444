'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-10-29 17:18:24 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class HttpMethodProperties extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice(({subsets}) => friendlyList(subsets[i]) + '.');
    }
    this.freeze();
    for (const i of this.choiceOrder()) {
      this.addExplain(explain(this.params, i))
    }
    this.makeContent();
  }

  answerIndex() { return this.params.answerIndex; }
}

module.exports = HttpMethodProperties
Object.assign(HttpMethodProperties, {
  id: 'HttpMethodProperties',
  title: 'HTTP Method Properties',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function friendlyList(list) {
  return list.
    map(e=>`\`${e}\``).
    join(', ').
    replace(/\,([^,]+)$/, ' and$1');
}

function explain(params, index) {
  const { subsets, scores, maxScore, property, answerIndex } = params;
  const score = scores[index];
  const isCorrect = (score === maxScore);
  const status = (isCorrect) ? 'correct' : 'incorrect';
  const subset = subsets[index];
  let explain = `(#{_${index}}) is ${status} because `;
  if (isCorrect) {
    explain += friendlyList(subset) + ' ';
    explain += (subset.length > 1) ? 'are ' : 'is ';
    explain += `*${property}*`;
  }
  else if (typeof score === 'number') {
    explain += 'even though ' + friendlyList(subset) + ' ';
    explain += (subset.length > 1) ? 'are ' : 'is ';
    explain += `*${property}* `;
    explain +=
      `the answer (#{_${answerIndex}}) has ${maxScore} ${property} methods`;
  }
  else {
    explain += friendlyList(score) + ' ';
    explain += (score.length > 1) ? 'are ' : 'is ';
    explain += `not *${property}*`;
  }
  return explain + '.';
}

function subsetScore(subset, property) {
  let score = 0, exceptions = [];
  subset.forEach(m => {
    if (METHODS[m].indexOf(property) >= 0) {
      score++;
    }
    else {
      exceptions.push(m);
    }
  });
  return (exceptions.length > 0) ? exceptions : score;
}

const QUESTION = `
  Which one of the following alternatives describes the largest
  set of methods *all* of which are *#{property}*?   
`;

const METHODS = {
  GET: [ 'safe', 'idempotent' ],
  HEAD: [ 'safe', 'idempotent' ],
  POST: [],
  PATCH: [],
  PUT: [ 'idempotent' ],
  DELETE: [ 'idempotent' ],
};

const PARAMS = [
  { property: () => Rand.choice(['safe' , 'idempotent']),
    subsets: () => Rand.subsets(5, Object.keys(METHODS, 1, 4)),
  },
  { _type: 'nonRandom',
    scores: ({subsets, property}) =>
                subsets.map(s => subsetScore(s, property)),
  },
  { _type: 'nonRandom',
    maxScore: ({scores}) =>
      scores.reduce((acc, e) => typeof e === 'number' && e > acc ? e : acc, -1),
  },
  ({scores, maxScore}) => scores.filter(s => s === maxScore).length === 1,
  { _type: 'nonRandom',
    answerIndex: ({ scores, maxScore }) =>
                       scores.findIndex(s => maxScore === s),
  },
];

if (process.argv[1] === __filename) {
  console.log(new HttpMethodProperties().qaText());
}
