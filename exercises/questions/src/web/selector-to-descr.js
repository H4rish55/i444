'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-12-01 01:53:17 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');
const { SELECTORS, SELECTOR_INFO, DOMAINS } = require('./selector-info');

class SelectorToDescr extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice(({alts}) => decorate(alts[i]));
    }
    this.freeze();
    this.addExplain('#{explain}');
    this.makeContent();
  }

}

function decorate(alt) {
  alt = alt.trim();
  return alt[0].toUpperCase() + alt.slice(1) + '.';
}
module.exports = SelectorToDescr;
Object.assign(SelectorToDescr, {
  id: 'selectorToDescr',
  title: 'Selector to Description',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const QUESTION = `
  Which one of the following alternatives describes the
  CSS selector \`#{selector}\`
`;


const PARAMS = [
  { d: () => Rand.natnum(DOMAINS.length),
    j: () => Rand.natnum(SELECTORS.length), 
  },
  { _type: 'nonRandom',
    domain: ({d}) => DOMAINS[d],
    selector: ({j}) => SELECTORS[j],
  },
  { _type: 'nonRandom',
    element: ({domain}) => domain.element,
    klass: ({domain}) => domain.klass,
    id: ({domain}) => domain.id,
  },
  { _type: 'nonRandom',
    alts: ({selector}) => SELECTOR_INFO[selector].choices,
    explain: ({selector}) => SELECTOR_INFO[selector].explain,
  },
  
];

if (process.argv[1] === __filename) {
  console.log(new SelectorToDescr().qaText());
}
