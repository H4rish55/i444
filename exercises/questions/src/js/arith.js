'use strict';

const TIMESTAMP = 'Time-stamp: <2022-09-13 21:55:44 umrigar>';

const {ChoiceQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class Arith extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addConstraints(REM_CONSTRAINT);
    this.addQuestion(QUESTION);
    CHOICES.forEach(choiceInfo => this.choice(choiceInfo));
    this.noneOfTheAbove();
    this.freeze(); 
    this.addExplain(umtParse(BACKGROUND));
    this.addExplain(CHOICES[0].explain);
    for (const i of this.choiceOrder()) {
      if (i === 0 || i === this.nChoices() - 1) {
	continue; //skip answer and noneOfTheAbove
      }
      this.addExplain(CHOICES[i].explain);
    }
    this.makeContent();
  }

}

module.exports = Arith;
Object.assign(Arith, {
  id: 'arith',
  title: 'Arithmetic Operators',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const QUESTION = 'What is the value of .~#{a} + #{b} * #{c} % #{d}~?';

const PARAMS = {
  a: () => Rand.int(1),
  b: () => Rand.int(2),
  c: () => Rand.int(-10, 10),
  d: () => Rand.int(-5, 5)
};

const REM_CONSTRAINT = 
  ({c, d}) => {
    return (
      d !== 0 &&
      c%d !== 0 &&
      Math.abs(d) !== 2 &&
      Math.abs(c) !== Math.abs(d) &&	
      ((c >= 0) != (d >= 0)) &&
      Math.abs(c) > Math.abs(d)
    );
  };

const CHOICES = [
  { choiceFn: ({a, b, c, d}) => a + b*c%d,
    explain: `
      (#{_0}) is correct since .~(#{b} * #{c}) % #{d}~ has the sign 
      of the dividend and has value .~#{(b * c) % d}~.  
      So the result is .~#{a} + #{(b * c) % d}~ which is 
      #{a + b*c%d}, the result.
    `
  },
  { choiceFn: ({a, b, c, d}) => a + b*(c%d),
    explain: `
      (#{_1}) is incorrect since it uses incorrect right associativity for
      .~*~ and .~%~, effectively evaluating  
      .~#{a} + #{b}*(#{c}%#{d})~ to .~#{a + b*(c%d)}~.
    `
  },
  { choiceFn: ({a, b, c, d}) => a + b*(-c%d),
    explain: `
      (#{_2}) is incorrect since it uses both incorrect right associativity for
      .~*~ and .~%~, as well as the incorrect sign for the result
      of .~%~,  effectively evaluating .~#{a} + #{b}*(#{-c}%#{d})~ 
      to .~#{a + b*(-c%d)}~.
    `
  },
  { choiceFn: ({a, b, c, d}) => a + b*(-c)%d,
    explain: `
      (#{_3}) is incorrect since it uses the incorrect sign 
      for the result of .~%~,  effectively 
      evaluating .~#{a} + #{b}*(#{-c})%#{d}~ to .~#{a + b*(-c)%d}~.
    `,
  }
];

const BACKGROUND = `
  This question deals with two aspects of JavaScript:

    + *Associativity and precedence of arithmetic operators*.  The
      ."multiplicative**." operators .~*~, .~/~ and .~%~ are left-associative
      and have higher precedence than the ."additive**." operators .~+~, 
      .~-~ (which too are left associative).  Hence 
      .~#{a} + #{b} * #{c} % #{d}~ parenthesizes as 
      .~#{a} + ((#{b} * #{c}) % #{d})~.

    + The .~%~ operator which computes the remainder.  It is important to
      to realize that in JavaScript the result always has the sign of
      the dividend; hence .~(#{c} % #{d})~ evaluates to .~#{c%d}~.

      Note that the operation of the .~%~ operation differs between
      different programming languages.  Differences arise when an
      operand is negative; also, some languages use it for "modulo"
      rather than remainder.  For details, see  
      .<https://en.wikipedia.org/wiki/Modulo_operation> "this
      Wikipedia article".      
`;

if (process.argv[1] === __filename) {
  console.log(new Arith().qaText());
}
