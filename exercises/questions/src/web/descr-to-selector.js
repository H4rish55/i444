'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-12-01 01:52:59 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');
const { SELECTORS, SELECTOR_INFO, DOMAINS } = require('./selector-info');

class DescrToSelector extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 4; i++) {
      this.choice(({alts}) => decorate(alts[i]));
    }
    this.noneOfTheAbove();
    this.freeze();
    this.addExplain('#{explain}');
    this.makeContent();
  }

}

function decorate(alt) {
  alt = alt.trim();
  return `\`${alt}\`.`;
}
module.exports = DescrToSelector;
Object.assign(DescrToSelector, {
  id: 'descrToSelector',
  title: 'Description to Selector',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const QUESTION = `
  Which one of the following CSS selectors #{descr}?
`;


function topIndexes(top) {
  return (
    SELECTORS.map((s, i) => SELECTOR_INFO[s].top === top ? i : -1).
    filter(i => i >= 0)
  );
}

const PARAMS = [
  { d: () => Rand.natnum(DOMAINS.length),
    top: () => Rand.choice([ 'id', 'klass' ]),
  },
  { indexes: ({top}) => Rand.permutation(topIndexes(top)), },
  ({indexes}) => { assert(indexes.length === 4); return true; },
  { _type: 'nonRandom', 
    j: ({indexes}) => indexes[0],
  },
  { _type: 'nonRandom',
    domain: ({d}) => DOMAINS[d],
    selector: ({j}) => SELECTORS[j],
  },
  { _type: 'nonRandom',
    element: ({domain}) => domain.element,
    klass: ({domain}) => domain.klass,
    id: ({domain}) => domain.id,
    descr: ({selector}) => SELECTOR_INFO[selector].choices[0].trim(),
  },
  { _type: 'nonRandom',
    alts: ({indexes}) => indexes.map(i => SELECTORS[i]),
    explain: ({selector}) => SELECTOR_INFO[selector].explain,
  },
  
];

if (process.argv[1] === __filename) {
  console.log(new DescrToSelector().qaText());
}
