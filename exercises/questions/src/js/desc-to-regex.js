'use strict';

const TIMESTAMP = 'Time-stamp: <2019-09-06 21:07:04 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class DescToRegex extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 4; i++) {
      this.choice(({regexs}) => `.~${regexs[i].toString()}~`);
    }
    this.noneOfTheAbove();
    this.freeze();
    for (const i of this.choiceOrder()) {
      if (i === this.nChoices() - 1) continue; //skip none of the above
      this.addExplain(`(#{_${i}}) is #{statuses[${i}]} because it describes 
                      strings of #{lengths[${i}]} or more \`${CHAR}\`'s.`);
    }
    this.makeContent();
  }

  answerIndex() {
    return (this.params.n !== this.params.lengths[0]) ? 4 : 0;
  }
}

module.exports = DescToRegex
Object.assign(DescToRegex, {
  id: 'descToRegex',
  title: 'Desc to Regex',
});

      
const CHAR = 'a';
const QUESTION = `
  Which *one* of the following regex's describes strings of precisely
  #{n} or more \`${CHAR}\`'s?
`;

const GENERATORS = {
  'kleene': n => new RegExp(`${CHAR.repeat(n+1)}*`),
  'positive': n => new RegExp(`${CHAR.repeat(n)}+`),
  'count': (n, p) => {
    const q = n + 1 - p;
    return new RegExp(`${CHAR.repeat(p)}{${q},}`);
  },
};
const GEN_KEYS = Object.keys(GENERATORS);

const PARAMS = [
  { n: () => Rand.int(2, 6),
    gens: () => [ Rand.choice(GEN_KEYS), Rand.choice(GEN_KEYS),
		  Rand.choice(GEN_KEYS), Rand.choice(GEN_KEYS), ],
  },
  { lengths: ({n}) => [
      Rand.choice( [n - 1, n, n, n + 1 ] ),
      Rand.choice( [n - 1, n + 1 ] ),
      Rand.choice( [n - 1, n + 1 ] ),
      Rand.choice( [n - 1, n + 1 ] ),
    ],
  },
  { pLengths: ({lengths}) => [
      Rand.int(1, lengths[0]),
      Rand.int(1, lengths[1]),
      Rand.int(1, lengths[2]),
      Rand.int(1, lengths[3]),
    ],
    statuses: ({n, lengths}) => [
      lengths[0] === n ? 'correct' : 'incorrect',
      'incorrect',
      'incorrect',
      'incorrect',
    ],
  },
  { _type: 'nonRandom',
    regexs: ({gens, lengths, pLengths}) => [
      GENERATORS[gens[0]](lengths[0], pLengths[0]),
      GENERATORS[gens[1]](lengths[1], pLengths[1]),
      GENERATORS[gens[2]](lengths[2], pLengths[2]),
      GENERATORS[gens[3]](lengths[3], pLengths[3]),
    ],
  },
];

if (process.argv[1] === __filename) {
  console.log(new DescToRegex().qaText());
}
