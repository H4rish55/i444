'use strict';

const TIMESTAMP = 'Time-stamp: <2018-10-04 17:16:54 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class LogicalOperators extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    this.addConstraints(DISTINCT_OPERANDS, DISTINCT_OPERATORS, INCLUDE_ZERO);
    CHOICES.forEach(choiceInfo => this.choice(choiceInfo));
    this.freeze(); 
    this.addExplain(umtParse(BACKGROUND));
    const answer = this.params.answer;
    const answerIndex = this.choices.indexOf(answer);
    this.choiceSpecs[answerIndex].isAnswer = true;
    this.makeContent();
  }

}
module.exports = LogicalOperators;
Object.assign(LogicalOperators, {
  id: 'logical',
  title: 'Logical Operators',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});


const QUESTION = 'What is the value of .~(#{a} #{op0} #{b}) #{op1} #{c}~?';

const PARAMS = [
  { a: () => Rand.int(0, 5),
    b: () => Rand.int(0, 5),
    c: () => Rand.int(0, 5),
    op0: () => Rand.choice(['&&', '||']),
    op1: () => Rand.choice(['&&', '||']),
  },
  { fn0: ({op0}) => (op0 === '&&') ? ((x, y) => x&&y) : ((x, y) => x||y),
    fn1: ({op1}) => (op1 === '&&') ? ((x, y) => x&&y) : ((x, y) => x||y),
  },
  { answer: ({a, b, c, fn0, fn1}) => fn1(fn0(a, b), c), },
];

const DISTINCT_OPERANDS = ({a, b, c}) => a !== b && b !== c && a !== c;
const DISTINCT_OPERATORS = ({op0, op1}) => op0 !== op1;
const INCLUDE_ZERO = ({a, b, c}) => a === 0 || b === 0 || c === 0;

const CHOICES = [ ({a}) => a, ({b}) => b, ({c}) => c, 'true', 'false' ];

const BACKGROUND = `
  This question deals with .~&&~ and .~||~ logical operators in JavaScript:

    + Both operators use *short-circuit* evaluation; that is, the
      operator ignores the second operand if the value of the first
      operand is sufficient to evaluate the result of the operator.
      For example, if the first operand to .~&&~ evaluates to
      .~false~, the result will be .~false~ irrespective of the value
      of the second operand and the second operand will not be
      evaluated.

    + The result of each operator is not necessarily .~true.~ or
      .~false~; instead it is the value of the last operand which
      was evaluated.

    + .~0~ is treated as falsy in a boolean context.
`;

if (process.argv[1] === __filename) {
  console.log(new LogicalOperators().qaText());
}
