'use strict';

const TIMESTAMP = 'Time-stamp: <2018-10-06 14:08:20 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class TemplateStrings extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(umtParse(QUESTION));
    this.addExplain(umtParse(BACKGROUND));
    const answer1 = '${names[0]} and ${names[1]}\\n'.length;
    this.choice(({answer}) => answer);
    //following choices will be unique since all names are 5 chars or
    //less which is less than length of ${names[i]}.
    this.choice(answer1);
    this.choice(answer1 - 1);
    this.choice(({answer}) => answer + 1);
    this.choice(({answer}) => answer + 2);
    this.freeze();
    this.addExplain(this.explain());
    this.makeContent();
  }

  explain() {
    const answer = this.choices[0];
    const str = `
      (#{_0}) is correct because the length of .~"#{names[0]}"~ is 
      .~#{names[0].length}~, the length of .~" and "~ is .~5~,
      the length of .~"#{names[1]}"~ is .~#{names[1].length}~,
      and the newline character contributes 1 for a total length of 
      .~(#{names[0].length} + 5 + #{names[1].length} + 1)~
      which is .~${answer}~.
    `;
    return str;
  }

}

module.exports = TemplateStrings;
Object.assign(TemplateStrings, {
  id: 'templates',
  title: 'Template String Literals',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});


const QUESTION = `
  Given the following program excerpt:

  ~~~
  const names = [ '#{names[0]}', '#{names[1]}' ];
  const str = \`\${names[0]} and \${names[1]}\\n\`;
  ~~~
 
  what is the length of string .~str~?
`;

const PARAMS = [
  { names: () => [ Rand.he(), Rand.she() ], },
  { answer: ({names}) => `${names[0]} and ${names[1]}\n`.length, },
];


const BACKGROUND = `
  This question deals with template string literals enclosed within
  backquotes \`\`\`\`.

    + They allow expressions enclosed within \`\${}\` which are
      replaced by their values when evaluated within the context
      in which the string occurs.

    + Like regular single-quote \`'\` and double-quote \`"\` string
      literals, template string literals allow \`\\\`-escape
      sequences.  Unlike regular string literals, template string
      literals allow embedded unescaped newlines which make them
      useful for strings which span multiple lines.
`;

if (process.argv[1] === __filename) {
  console.log(new TemplateStrings().qaText());
}
