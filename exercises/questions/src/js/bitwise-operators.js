'use strict';

const TIMESTAMP = 'Time-stamp: <2018-10-06 13:54:02 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class BitwiseOperators extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addConstraints(DISTINCT_OPERANDS);
    this.addQuestion(QUESTION);
    this.choice(({answer}) => answer);
    this.choice(({answer}) => (answer === 0) ? 1 : 0);
    this.choice(({a, answer, mult}) => answer + a*mult);
    this.choice(({b, answer, mult}) => answer + b*mult);
    this.choice(({c, answer, mult}) => answer + c*mult); 
    this.freeze();
    this.addExplain(this.explain());
    this.makeContent();
  }

  explain(answer) {
    const str = `
      (#{_0}) is correct since .~(#{a} | #{b})~ is .~#{a|b}~ and 
      .~#{a|b} & ~~#{c}~ is .~#{(a|b) & ~c}~, which when shifted #{dir}
      .~#{d}~ bit(s) is .~#{answer}~.
    `;
    return str;
  }

}

module.exports = BitwiseOperators;
Object.assign(BitwiseOperators, {
  id: 'bitwise',
  title: 'Bitwise Operators',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const QUESTION = `
  What is the value of .~((#{a} | #{b}) & ~~#{c}) #{op} #{d}~?`;

const PARAMS = [
  { a: () => Rand.int(2, 9),
    b: () => Rand.int(2, 9),
    c: () => Rand.int(2, 9),
    d: () => Rand.int(1, 4),
    op: () => Rand.choice(['<<', '>>', '<<']),
  },
  { _type: 'nonRandom',
    shiftFn: ({op}) => ((op === '<<') ? ((v, n) => v<<n) : ((v, n) => v>>n)),
    mult: ({op, d}) => ((op === '<<') ? (1 << d) : 1),
    dir: ({op}) => ((op === '<<') ? 'left' : 'right'),
  },
  { _type: 'nonRandom',
    answer: ({a, b, c, d, shiftFn}) => shiftFn(((a | b) & ~c), d),
  },  
];

const DISTINCT_OPERANDS = ({a, b, c}) => a !== b && b !== c && a !== c;

const CHOICES = [ ({a}) => a, ({b}) => b, ({c}) => c, 'true', 'false' ];

if (process.argv[1] === __filename) {
  console.log(new BitwiseOperators().qaText());
}
