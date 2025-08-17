'use strict';

const TIMESTAMP = 'Time-stamp: <2019-09-23 10:44:55 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class Conversions extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: '.~{} == {}~',
    value: false,
    explain: `
      Objects compare .~==~ equal only if they are the same; i.e. have
      the same references; since each occurrence of .~{}~ constructs
      a new object, the equality evaluates to *false*
    `,
  },
  { statement: '.~{} === {}~',
    value: false,
    explain: `
      Objects compare .~===~ equal only if they are the same; i.e. have
      the same references; since each occurrence of .~{}~ constructs
      a new object, the equality evaluates to *false*
    `,
  },
  { statement: '.~"0" == ""~',
    value: false,
    explain: `
     The two strings have different lengths and are unequal.  This happens
     even though .~"0" == 0~ and .~0 == ""~, violating transitivity
    `,
  },
  { statement: '.~0 === "0"~',
    value: false,
    explain: `
      .~===~ does not do any type conversions, hence the integer .~0~
      cannot .~===~-compare equal to string .~"0"~
    `,
  },
  { statement: '.~false === "0"~',
    value: false,
    explain: `
      .~===~ does not do any type conversions, hence the boolean .~false~
      cannot .~===~-compare equal to string .~"0"~
    `,
  },
  { statement: '.~false === 0~',
    value: false,
    explain: `
      .~===~ does not do any type conversions, hence the boolean .~false~
      cannot .~===~-compare equal to number .~0~
    `,
  },
  { statement: `
      If .~a == b~, then .~a === b~
    `,
    value: false,
    explain: `
      .~==~ is a looser equality than .~===~ which does
      no type conversion.  So it is possible that .~==~
      is true, but .~===~ is false; for example, 
      .~0 == false~ but not .~0 === false~
    `,
  },
  { statement: '.~false == NaN~',
    value: false,
    explain: `
      No value compares equal to \`NaN\` (including itself).
      Hence the equality is *false*
    `,
  },
  { statement: '.~false === NaN~',
    value: false,
    explain: `
      No value compares equal to \`NaN\` (including itself).
      Hence the equality is *false*
    `,
  },
  { statement: `
      If .~a === b~, then .~a == b~
    `,
    value: true,
    explain: `
      .~==~ is a looser equality than .~===~ which does
      no type conversion.  So whenever .~===~
      is true without type conversions,  .~==~ will also
      be true
    `,
  },
  { statement: '.~1 == true~',
    value: true,
    explain: `
      .~==~-equality does conversions; since .~true~ converts to .~1~,
      the two expressions compare equal according to .~==~.
    `,
  },
  { statement: '.~0 == false~',
    value: true,
    explain: `
      .~==~-equality does conversions; since .~false~ converts to .~0~,
      the two expressions compare equal according to .~==~.
    `,
  },
  { statement: '.~0 == ""~',
    value: true,
    explain: `
      .~==~-equality does conversions; since .~0~ converts to .~""~,
      the two expressions compare equal according to .~==~.
    `,
  },
  { statement: '.~2 == "2"~',
    value: true,
    explain: `
      .~==~-equality does conversions; since .~"2"~ converts to .~2~,
      the two expressions compare equal according to .~==~.
    `,
  },
  { statement: '.~undefined == null~',
    value: true,
    explain: `
      The falsy values .~undefined~ and .~compare equal according to .~==~
    `,
  },
];

module.exports = Conversions;
Object.assign(Conversions, {
  id: 'conversionsTrueFalse',
  title: 'Conversions True or False',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new Conversions().qaText());
}

