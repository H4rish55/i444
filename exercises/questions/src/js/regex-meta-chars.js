'use strict';

const TIMESTAMP = 'Time-stamp: <2019-09-20 10:47:06 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class RegexMetaChars extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    this.addConstraints(...CONSTRAINTS);
    this.choice(({a}) => describe(a));
    this.choice(({b}) => describe(b));
    this.choice(({c}) => describe(c));
    this.choice(({d}) => describe(d));
    this.noneOfTheAbove();
    this.addExplain(umtParse(BACKGROUND));
    this.freeze();
    this.makeContent();
  }

  answerIndex() {
    return this.params.noneOfTheAbove ? 4 : 0;
  }
}

module.exports = RegexMetaChars;
Object.assign(RegexMetaChars, {
  id: 'regexMetaChars',
  title: 'Regex MetaChars',
});

const QUESTION = `
  Which *one* of the following choices lists characters which are #{question}?
`;

function describe(c) { return `${CHARS[c][0]} \`${c}\``; }

//external => outside char class; internal => inside char class
const CHARS = {
  ['*']: [ 'Asterisk', new Set([ 'external' ]), ],
  ['+']: [ 'Plus sign', new Set([ 'external' ]) ],
  ['?']: [ 'Question mark', new Set([ 'external' ]), ],
  ['|']: [ 'Vertical bar', new Set([ 'external' ]), ],
  ['.']: [ 'Period', new Set([ 'external' ]), ],
  ["'(' and ')'"]: [ 'parentheses', new Set([ 'external' ]), ],
  ["'{' and '}'"]: [ 'braces', new Set([ 'external' ]), ],
  ["'[' and ' ']'"]: [ 'square brackets', new Set([ 'external' ]), ],
  ['$']: [ 'Dollar sign', new Set([ 'external' ]), ],
  ['-']: [ 'Minus sign', new Set([  'internal' ]), ],
  ['^']: [ 'Up arrow', new Set([ 'external', 'internal' ]), ],
  ['\\']: [ 'Backslash', new Set([ 'external', 'internal' ]), ],
  //['`']: [ 'backquote', new Set(), ],
  ['\'']: [ 'Forward quote', new Set(), ],
  ['"']: [ 'Double quote', new Set(), ],
  ['&']: [ 'Ampersand', new Set(), ],
  [',']: [ 'Comma', new Set(), ],
  [';']: [ 'Semi-colon', new Set(), ],
  ['#']: [ 'Hash sign', new Set(), ],
  ['!']: [ 'Exclamation point', new Set(), ],
};

const CHECKERS = {
  'special regex characters inside character classes':
    set => set.has('internal'),
  'special regex characters outside character classes':
    set => set.has('external'),
  'special regex characters':
    set => (set.has('external') || set.has('internal')),
  '*not* special regex characters': set => set.size === 0,
}

const PARAMS = {
  noneOfTheAbove: () => Rand.choice([1, 2, 3, 4]) === 2, 
  question: () => Rand.choice(Object.keys(CHECKERS)),
  a: () => Rand.choice(Object.keys(CHARS)),
  b: () => Rand.choice(Object.keys(CHARS)),
  c: () => Rand.choice(Object.keys(CHARS)),
  d: () => Rand.choice(Object.keys(CHARS)),
};

const CONSTRAINTS = [
  ({noneOfTheAbove, question, a}) =>
    CHECKERS[question](CHARS[a][1]) !== noneOfTheAbove,
  ({question, b: x}) => !CHECKERS[question](CHARS[x][1]),
  ({question, c: x}) => !CHECKERS[question](CHARS[x][1]),
  ({question, d: x}) => !CHECKERS[question](CHARS[x][1]),
];


const BACKGROUND = `
  The special regex chars are

    + *Asterisk* \`*\`: This suffix operator denotes 0-or-more matches
      of the preceeding regex, but only outside character classes.

    + *Plus sign* \`+\`: This suffix operator denotes 1-or-more
      matches of the preceeding regex, but only outside character
      classes.


    + *Question mark* \`?\`: This suffix operator denotes an optional
      match with the preceeding regex, but only outside character
      classes.

    + *Vertical bar* \`|\`: This infix binary operator denotes a match
      with either one of its two operand regex's, but only outside
      character classes.

    + *Dot* \`.\`: This character denotes a match
      with any single character other than a newline, but only outside
      character classes.

    + *Parentheses* \`(\` *and* \`)\`: Parentheses are used for
      overriding the default precedence of the regex operators.
      They can also be used to capture the strings which match
      the contained regex into program variables.  They have this
      meaning only outside
      character classes.

    + *Braces* \`{\` *and* \`}\`: Braces are used as suffix
      operators for specifying a constrained number of matches
      with their preceeding regex.  They have this
      meaning only outside
      character classes.

   + *Square brackets* \`[\` *and* \`]\`: Square brackets 
     are used for specifying a character class which will
     match only a single character. They have this
      meaning only outside
      character classes.

   + *Dollar sign* \`$\`: A dollar sign is a anchor regex
     which anchors the rest of the regex to match only at
     the end of a string (or at the end of a line if the 
     \`m\` flag is specified).  It has this
      meaning only outside
      character classes.

   + *Minus sign* \`-\`: This is special only inside character
     classes to indicate a range of characters.  It is not
     special at the start of a character class since that
     would not make sense for a range specification.

   + *Up arrow* \`^\`: This can be used both inside and outside of
     character classes, albeit with different meanings.  Wihin a
     character class, it negates the meaning of the rest of the
     character class but only when used at the start of the character
     class.  Outside of a character class it stands for start of a
     string (or at beginning of a line if the \`m\` flag is
     specified
  
   + *Backslash* \`\\\`: This is the only character which has
     the same meaning both inside and outside a character class.
     If followed by a special character it is used to escape that
     special character so that the special character can be matched.
     If followed by a alphabetic character it introduces special
     syntax for matching classes of characters like digits, whitespace,
     etc.

All other special characters are not regex characters.
`;

if (process.argv[1] === __filename) {
  console.log(new RegexMetaChars().qaText());
}
