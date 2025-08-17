'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-10-05 23:09:22 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class VarLetRules extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    SCOPE_KEYS.forEach(k => this.choice(SCOPES[k]));
    this.freeze();
    this.makeContent();
  }

  answerIndex() {
    return SCOPE_KEYS.indexOf(ANSWERS[this.params.question]);
  }
}

module.exports = VarLetRules;
Object.assign(VarLetRules, {
  id: 'varLetRules',
  title: 'Rules for var and let',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const QUESTION =
  `A variable .~x~ declared using .~#{question} x~ will have scope`;

const SCOPES = {
  block:    `From the start of the block containing the declaration
             to the end of the block containing the declaration`,
  fn:       `From the start of the body of the containing function to
             the end of the body of the containing function.`,
  declBlock:`From the line containing the declaration to the end of
             the block containing the declaration.`,
  declFn:   `From the line containing the declaration to the end of
             the function containing the declaration.`,
  loop:     `From the start of the enclosing loop till the end of
             the enclosing loop.`,
}
const SCOPE_KEYS = Object.keys(SCOPES).sort();

const ANSWERS = {
  ['let']: 'block',
  ['var']: 'fn',
};


const PARAMS = [
  { question: () => Rand.choice(Object.keys(ANSWERS)), },
];

const BACKGROUND = `
  VarLetRules can be a major source of bugs and it is best to use the loop
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
  console.log(new VarLetRules().qaText());
}
