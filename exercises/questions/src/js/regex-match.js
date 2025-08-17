'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2019-09-06 21:07:28 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} =
  require('gen-q-and-a');

class RegexMatch extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    this.choice(({answer}) => textChoice(answer));
    for (let i = 0; i < N_ALTS; i++) {
      this.choice(({alts}) => textChoice(alts[i]));
    }
    this.freeze();
    this.makeContent();
    this.addExplain(explain(this.params));
  }

}

module.exports = RegexMatch
Object.assign(RegexMatch, {
  id: 'regexMatch',
  title: 'Regex match()',
});


function isCapturing(r) { return r.startsWith('(') && !r.startsWith('(?:'); }

function explain(params) {
  const friendlyList = (list) =>
    list.slice(0, -1).join(', ') + ' and ' + String(list.slice(-1)[0]);
  const regexStr = (r) => `.~/${r}/~`;
  const text = params.text;
  const words = text.split(/\s+/).slice(0, 3);
  const regexs = params.regexs;
  const capturing = regexs.filter(r => isCapturing(r));
  const capturedWords =
    words.filter((_, i) => isCapturing(regexs[i])).map(w=>`.~"${w}"~`);
  const ignored = capturedWords[params.undefIndex];
  let str = `Note that .~match()~ returns a pseudo-array; the element at 
             index 0 of the returned pseudo-array contains the string 
             matched by the entire regex, but the destructuring
             initialization in the program fragment ignores this
             element.  The remaining elements of the pseudo-array
             correspond to capturing parentheses in the regex.\n\n`;
  str += `The regex's ${friendlyList(regexs.map(r=>regexStr(r)))} match
          the words ${friendlyList(words.map(w=>`.~"${w}"~`))}
          respectively.  The capturing regex's are 
          ${friendlyList(capturing.map(r=>regexStr(r)))} which capture 
          ${friendlyList(capturedWords)} respectively, but the destructuring
          initialization ignores the word ${ignored}. Hence .~a~ and .~b~
          will have the values 
          ${friendlyList(params.answer.map(w=>`.~"${w}"~`))} respectively.
          `;
  return str;
}

function textChoice(choice) {
  const choiceText =
    choice.map(c => (c === 'undefined') ? `.~${c}~` : `.~"${c}"~`).
    join(' and ');
  return `The values of .~a~ and .~b~ will be ${choiceText} respectively`;
}

function insert(arr, index, element) {
  const copy = arr.slice();
  copy.splice(index, 0, element);
  return copy;
}

const N_ALTS = 4;
function alternates(text, answer) {
  const alts = [];
  const words = text.split(/\s+/);
  //ensure sufficient words for generating N_ALTS alternatives
  assert(2 * (words.length - 1) + 1 //# of attempted alternates
	  - 1 //presumably one of them matches answer
	  >= N_ALTS);
  let index = 0;
  for (index = 0; index < words.length; index++) {
    const alt1 = [words[index], 'undefined'];
    if (alt1.some((a, i) => a !== answer[i])) alts.push(alt1);
    if (alts.length >= N_ALTS || index === words.length - 1) break;
    const alt2 = [words[index], words[index + 1]];
    if (alt2.some((a, i) => a !== answer[i])) alts.push(alt2);
    if (alts.length >= N_ALTS) break;
  }
  return alts;
}

//Each line should contain a minimum of 3 words in order to generate
//N_ALTS === 4 alternate matches.
const LINES = `
’Twas brillig, and the slithy toves 
      Did gyre and gimble in the wabe: 
All mimsy were the borogoves, 
      And the mome raths outgrabe. 
“Beware the Jabberwock, my son! 
      The jaws that bite, the claws that catch! 
Beware the Jubjub bird, and shun 
   The frumious Bandersnatch!” 
He took his vorpal sword in hand; 
      Long time the manxome foe he sought— 
So rested he by the Tumtum tree 
      And stood awhile in thought. 
`.trim().replace(/[^\w\s]/g, '').replace(/ +/g, ' ')
 .split('\n').map(line => line.trim());


const PARAMS = [
  { text: () => LINES[Rand.natnum(LINES.length)],
    regexs: () => [
      Rand.choice(['\\S+', '(\\S+)', '(\\w+)', '(?:\\S+)', '(?:\\w+)']),
      Rand.choice(['\\w+', '(\\S+)', '(\\w+)', '(?:\\S+)', '(?:\\w+)']),
      Rand.choice(['(\\w+)', '(\\S+)', '(?:\\w+)']),
    ],
    undefIndex: () => Rand.int(0, 2),
  },
  ({regexs}) => regexs.filter(r=>isCapturing(r)).length > 1,
  { _type: 'nonRandom',
    regex: ({regexs}) => new RegExp(regexs.join('\\s+')),
    varsList: ({undefIndex}) =>
      insert(['a', 'b'], undefIndex, undefined).join(', ')
  },
  { _type: 'nonRandom',
    fn: ({text, regex, varsList}) =>
      (Function(`const [ , ${varsList} ] = \`${text}\`.match(${regex});
                 return [a, b];`)),
  },
  { _type: 'nonRandom',
    answer: ({fn}) => fn().map(e => e || 'undefined')
  },
  { _type: 'nonRandom',
    alts: ({text, answer}) => alternates(text, answer)
  },
];
const QUESTION = `
  Given the following program fragment:

  ~~~
  const str = "#{text}";
  const [, #{varsList} ] = str.match(#{regex});
  ~~~
`;


if (process.argv[1] === __filename) {
  console.log(new RegexMatch().qaText());
}
