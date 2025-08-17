'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-10-09 13:54:19 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class Loops extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    LOOP_KEYS.forEach(k => this.choice(LOOPS[k].name));
    this.freeze();
    this.addExplain(BACKGROUND);
    const correctIndex = this.answerIndex();
    const answerExplain = TASKS[this.params.taskKey].explain;
    const {taskKey} = this.params;
    this.addExplain(`(#{_${correctIndex}}) ${answerExplain}`);
    for (const i of this.choiceOrder()) {
      if (i === correctIndex) continue;
      const explain = explainWhyNot(taskKey, LOOP_KEYS[i]);
      this.addExplain(`(#{_${i}}) is wrong; ${explain}`);
    }
    this.makeContent();
  }

  answerIndex() {
    return LOOP_KEYS.indexOf(this.params.answerKey);
  }
}

module.exports = Loops;
Object.assign(Loops, {
  id: 'loops',
  title: 'Choice of Loops',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function explainWhyNot(taskKey, loopKey) {
  const loop = LOOPS[loopKey];
  let level = ['adequate', 'fail', 'poor']
      .find(k => loop[k] && loop[k].indexOf(taskKey) >= 0);
  assert(level);
  switch (level) {
  case 'adequate':
    return `a ${loop.name} would be adequate, but would not
            be the best choice`;
  case 'fail':
    return `a ${loop.name} is not applicable at all`;
  case 'poor':
    assert(loopKey === 'doWhileLoop');
    return `a ${loop.name} would be a poor choice since it is
            executed at least once and avoiding that behavior
            would require additional code.`;
  }
}

const QUESTION = `
  What is the best way of #{question}? Note that *best way* is defined as
  one which centralizes all loop control.
`.trim()


const TASKS = {
  arrayElements: {
    question: 'looping directly through the elements of an array in order',
    best: 'forOfLoop',
    explain: `
      is correct since the \`for-of\` loop is the best choice for
      looping over the elements of an array .~arr~ in order:
  
      ~~~
      for (const element of array) {
        ...
      }
      ~~~
     `,
  },
  arrayIndexes: {
    question: 'looping directly through the indexes of an array in order',
    best: 'forLoop',
    explain: `
      is correct since the \`for\` loop is the best choice for looping
      through the indexes of an array .~arr~ in order:

      ~~~
      for (let index = 0; index < arr.length; index++) {
        ...
      }
      ~~~
      `,
  }, 
  objectProperties: {
    question: `looping directly through all the enumerable properties 
               of an object`,
    best: 'forInLoop',
    explain: `
      is correct since the \`for-in\` loop is the best choice for
      looping over all the enumerable properties of an object .~obj~,
      including inherited properties:

      ~~~
      for (const prop in obj) {
        ...
      }
      ~~~
    `,
  },
  intSeq: {
    question: 'looping directly through a sequence of consecutive integers',
    best: 'forLoop',
    explain: `
      is correct since the standard \`for\` loop is the best choice for
      looping through consecutive integers in the semi-closed interval
      \`[m, n)\`:

      ~~~
      for (let i = m; i < n; i++) {
        ...
      }
      ~~~
    `,
  },
  'intSeqCond': {
    question: `looping directly through a sequence of consecutive integers 
               but quitting early when a condition is false`,
    best: 'forLoop',
    explain: `
      is correct since the standard \`for\` loop is normally used for
      looping through a sequence of integers, but is more general and
      has the same capability as the general .~while~-loop.  Since the
      requirement here is for looping through consecutive integers
      while checking a condition, the .~for~-loop is the best choice.
      Specifically, the following code can be used for looping through
      consecutive integers in the semi-closed interval \`[m, n)\`
      while checking a condition .~cond~:

      ~~~
      for (let i = m; cond && i < n; i++) {
        ...
      }
      ~~~
    `,
  },
  'loopCond': {
    question: `looping till a condition is false, where the condition may 
               be false initially`,
    best: 'whileLoop',
    explain: `
      is correct since the standard \`while\` loop is the 
      best choice for looping while a condition .~cond~ is true; 
      it is guaranteed to not execute when the condition is 
      initially false:

      ~~~
      while (cond) {
        ...
      }
      ~~~
    `,
  },
  'loopCond1': {
    question: `looping till a condition  is false, where the condition
               is known to always be initially true.`,
    best: 'doWhileLoop',
    explain: `
      is correct since the \`do-while\` loop is the best 
      choice if a condition .~cond~ is known to always be initially 
      true; the condition  is checked only after the the body of the 
      loop is executed:
 
      ~~~
      do {
        ...
      } while (cond)
      ~~~
    `,
  },
};

const LOOPS = {
  forLoop: {
    name: '`for` loop',
    adequate: [ 'arrayElements', 'loopCond', 'loopCond1' ],
    fail: [ 'objectProperties' ],
  },
  whileLoop: {
    name: '`while` loop',
    adequate: [ 'arrayElements', 'arrayIndexes', 'intSeq', 'intSeqCond',
		'loopCond1' ],
    fail: [ 'objectProperties' ],
  },
  doWhileLoop: {
    name: '`do-while` loop',
    poor: [ 'arrayElements', 'arrayIndexes', 'intSeq', 'intSeqCond',
	    'loopCond' ],
    fail: [ 'objectProperties' ],
  },
  forInLoop: {
    name: '`for-in` loop',
    fail: [ 'intSeq', 'intSeqCond', 'arrayIndexes',
	    'arrayElements', 'loopCond', 'loopCond1' ],
  },
  forOfLoop: {
    name: '`for-of` loop',
    fail: [ 'intSeq', 'intSeqCond', 'arrayIndexes',
	    'objectProperties', 'loopCond', 'loopCond1' ],
  },
}
const LOOP_KEYS = Object.keys(LOOPS).sort();


const PARAMS = [
  { taskKey: () => Rand.choice(Object.keys(TASKS)), },
  { question: ({taskKey}) => TASKS[taskKey].question,
    answerKey: ({taskKey}) => TASKS[taskKey].best,
  }
];

const BACKGROUND = `
  Loops can be a major source of bugs and it is best to use the loop
  which matches the looping conditions as closely as possible.  The
  choice should be one which:

    + Documents the analysis which went into setting up the loop.  So
      a more specific looping construct would be preferred over a more
      general one; for example, a .~do~ .- .~while~-loop would be
      preferred over a more general .~while~-loop as it documents the
      fact that the analysis indicated that the condition was expected
      to be initially true and that the loop body should be executed
      at least once.

    + Centralizes loop control.  So it best if the initial conditions,
      termination conditions and loop condition changes are restricted
      to a clearly identifiable loop header.  This is why a general
      .~while~ loop becomes the last choice as the loop condition can
      be changed anywhere within the body based possibly on multiple
      variables.
`;

if (process.argv[1] === __filename) {
  console.log(new Loops().qaText());
}
