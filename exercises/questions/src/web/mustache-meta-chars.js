'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-11-25 21:16:16 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class MustacheMetaChars extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    
    this.choice(({correct}) => friendlyList(correct));
    for (let i = 0; i < 4; i++) {
      this.choice(({incorrect}) => friendlyList(incorrect[i]));
    }
    this.freeze();
    this.addExplain(explain(this.params, 0));
    for (const i of this.choiceOrder()) {
      if (i !== 0) this.addExplain(explain(this.params, i))
    }
    this.makeContent();
  }

}

module.exports = MustacheMetaChars
Object.assign(MustacheMetaChars, {
  id: 'mustacheMetaChars',
  title: 'Mustache Meta Chars',
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
  const { correct, incorrect } = params;
  const isCorrect = (index === 0);
  const status = (isCorrect) ? 'correct' : 'incorrect';
  let explain = `(#{_${index}}) is ${status} because `;
  let metas;
  if (isCorrect) {
    metas = correct;
  }
  else {
    const alt = incorrect[index - 1];
    metas = alt.filter(c => METAS.indexOf(c) >= 0);
    const nonMetas = alt.filter(c => NON_METAS.indexOf(c) >= 0);
    explain += friendlyList(nonMetas) + ' ';
    explain +=
      (nonMetas.length > 1)
      ? 'are not mustache meta-character.'
      : 'is not a mustache meta-character.';
    if (metas.length > 0) explain += ' OTOH, ';
  }
  if (metas.length > 0) {
    const tense = (metas.length > 1) ? 'are all' : 'is';
    explain += friendlyList(metas) +
      ` ${tense} among mustache meta-characters:`;
    metas.forEach(c => {
      explain += (`\n\n  + \`${c}\` is ${CHARS[c]}.`);
    });
  }
  return explain;
}

const QUESTION = `
  Which one of the following alternatives describes the largest
  set of characters *all* of which are Mustache *meta-characters*?   
`;

const CHARS = {
  ['{']: 'used to enclose mustache directives',
  ['}']: 'used to close mustache directives',
  ['#']: 'used to start mustache conditional or iterative sections',
  ['/']: 'used to close mustache sections',
  ['^']: 'used to indicate start of a negated mustache conditional section',
  ['>']: 'used to indicate inclusion of a template using a mustache partial',
  ['<']: false,
  ['@']: false,
  ['|']: false,
  ['!']: false,
};

const METAS = Object.keys(CHARS).filter(k => CHARS[k]);
const NON_METAS = Object.keys(CHARS).filter(k => !CHARS[k]);

function incorrect() {
  const alts = [];
  while (alts.length < 4) {
    const alt = Rand.choices(Rand.int(0, 4), METAS).
      concat(Rand.choices(Rand.int(1, 3), NON_METAS)).
      sort();
    if (!alts.find(a => a.length === alt.length &&
	 	   a.every((x, i) => alt[i] === x))) {
      alts.push(alt);
    }
  }
  return alts;
}

const PARAMS = [
  { 
    correct: () => Rand.choices(Rand.int(1, 3), METAS),
    incorrect: () => incorrect(),
  },
];

if (process.argv[1] === __filename) {
  console.log(new MustacheMetaChars().qaText());
}
