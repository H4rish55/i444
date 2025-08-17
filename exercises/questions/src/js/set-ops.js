'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2019-09-06 21:08:09 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class SetOps extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < N_CHOICES; i++) {
      this.choice(({choiceKeys}) => `
    		  The function 

                   ~~~
                   ${SET_OPS[choiceKeys[i]].fn}
                   ~~~
                   `);
    }
    this.freeze();
    this.addExplain(BACKGROUND);
    const answerIndex = this.answerIndex();
    this.addExplain(`(#{_${answerIndex}}) is correct. 
                     ${SET_OPS[this.params.questionKey].explain}`);
    for (const i of this.choiceOrder()) {
      if (i === answerIndex) continue;
      const name = SET_OPS[this.params.choiceKeys[i]].name;
      const explain = `the provided function computes the ${name}`;
      this.addExplain(`(#{_${i}}) is wrong; ${explain}`);
    }
    this.makeContent();
  }

  answerIndex() { return this.params.answerIndex; }
}

module.exports = SetOps;
Object.assign(SetOps, {
  id: 'setOps',
  title: 'Set Operations',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const SET_OPS = {
  union: {
    name: String.raw`
           *union* .~setA~ .$\cup$ .~setB~ of sets .~setA~ and .~setB~`,
    desc: `it returns the set containing the elements which 
           are in .~setA~, or in .~setB~ (possibly both)`,
    fn: `
         (setA, setB) => setA.filter(a => !setB.includes(a))
                             .concat(setB)
        `,
    explain: `The .~filter()~ filters out those elements in .~setA~
              which are also in .~setB~, so that the subsequent
              .~concat(setB)~ returns the union.`,
  },
  intersection: {
    name: String.raw`
          *intersection* .~setA~ .$\cap$ .~setB~ of sets
          .~setA~ and .~setB~`,
    desc: `it returns the set containing the elements which 
           are in both .~setA~ and .~setB~`,
    fn: `(setA, setB) => setA.filter(a => setB.includes(a))`,
    explain: `The .~filter()~ simply filters out the elements
              in .~setA~ which are not in .~setB~,
              resulting in the intersection.`,
  },
  relDiff: {
    name: String.raw`
           *relative difference* .~setA~ .$-$ .~setB~ 
           of sets .~setA~ and .~setB~`,
    desc: `it returns the set containing the elements of 
           .~setA~ which are not in .~setB~`,
    fn: `(setA, setB) => setA.filter(a => !setB.includes(a))`,
    explain: `The .~filter()~ filters out those elements in
              .~setA~ which also occur in .~setB~, resulting
              in the set difference.`,
  },
  containment: {
    name: String.raw`
           *containment* relation .~setA~ .$\subseteq$ .~setB~
           between sets .~setA~ and .~setB~`,
    desc: `it returns true iff every element in .~setA~ also
           occurs in .~setB~`,
    fn: `(setA, setB) => setA.every(a => setB.includes(a))`,
    explain: String.raw`
      The function reads almost like the definition of set 
      containment: it returns true iff every .~a~ .$\in$ .~setA~
      is included in .~setB~.`.trim(),
  },
  disjoint: {
    name: `*disjoint*ness relation between sets .~setA~ and .~setB~`,
    desc: `it return true iff .~setA~ and .~setB~ have no common elements`,
    fn: `(setA, setB) => setA.every(a => !setB.include(a))`,
    explain: String.raw`
    The function returns true iff every .~a~ .$\in$ .~setA~
    is not in .~setB~, making the sets disjoint.`.trim(),
      
  },
  equals: {
    name: String.raw`
          *equality* relation .~setA~ .$=$ .~setB~ 
          between sets .~setA~ and .~setB~`,
    desc: `it returns true iff .~setA~ and .~setB~
           have exactly the same elements`,
    fn: `
         (setA, setB) => setA.every(a => setB.includes(a))
                         && setA.length === setB.length
        `,
    explain: String.raw`The first conjunct is true iff .~setA~
             .$\subseteq$ .~setB~.  The subsequent conjunct
             verifies that the sets have the same length. 
             Given the assumption of distinct elements,
             both conjunct will be true iff .~setA~ .$=$
             .~setB~.`,             
  },
};
const SET_OPS_KEYS = Object.keys(SET_OPS).sort();

const N_CHOICES = 5;

const PARAMS = [
  { choiceKeys: () => Rand.choices(N_CHOICES, SET_OPS_KEYS), },
  { questionKey: ({choiceKeys}) => Rand.choice(choiceKeys), },
  { _type: 'nonRandom',
    questionName: ({questionKey}) => SET_OPS[questionKey].name,
    questionDesc: ({questionKey}) => SET_OPS[questionKey].desc,
    answerIndex: ({choiceKeys, questionKey}) => choiceKeys.indexOf(questionKey),
  },
];

const QUESTION = `

  Sets can be represented by arrays which maintain an invariant that
  they always containing *distinct* elements; i.e. a precondition for
  a set operation is that its array operands which represent sets
  contain only distinct elements and a post-condition is that the
  array representing the result set contains only distinct elements.

  Which one of the following functions computes the #{questionName};
  i.e. #{questionDesc}?

`.trim()



const BACKGROUND = `
  ES6 adds a basic .<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set> Set type to JavaScript, but for some reason, 
  it is missing many of the basic operations of set algebra.  It is
  easy to define the missing operations (for example, .~union~ as
  .~new Set([...setA, ...setB])~), but is also worth exploring the
  above representation using arrays with distinct elements.
`;

if (process.argv[1] === __filename) {
  console.log(new SetOps().qaText());
}
