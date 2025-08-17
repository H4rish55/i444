'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-11-02 14:18:17 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class VarLetCode extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    this.choice(({answer}) => formatAnswer(answer));
    for (let i = 0; i < 4; i++) {
      this.choice(({alts}) => formatAnswer(alts[i]));
    }
    this.freeze();
    this.addExplain(explain(this.params));
    this.makeContent();
  }

  answerIndex() {
    return 0;
  }
}

module.exports = VarLetCode;
Object.assign(VarLetCode, {
  id: 'varLetCode',
  title: 'Code for var and let',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});


function formatAnswer(answer) {
  if (answer instanceof Error) {
    return `An error \`${answer}\` will occur`;
  }
  else {
    return `.~[ ${answer.join(', ')} ]~`;
  }
}
  
function code(glob, p1, p2, p3, letVar1, letVar2, letVar3) {
  return `
  let x = ${glob};

  function f(a) {
    ${letVar1}x = ${p1};
    if (a > 1) {
      ${letVar2}y = x + ${p2};
      ${letVar3}x = y + ${p3};
    }
    x = y;
    return x + y;
  }`;
}

const fn = (code, ansText) =>
  Function(`
    try { 
      ${code}; 
      return ${ansText};
    }
    catch (err) {
      return err;
    }
  `);

function alts(glob, p1, p2, p3, answer, errIndex) {
  return [
    (answer instanceof Error) ? [ p1 + p2 + p3, glob] : ERRORS[errIndex],
    [ p1 + p2, glob ],
    [ NaN, glob ],
    [p1 + p3, p3 + glob],
  ];
}

const QUESTION = `
Given the following code:

 ~~~
 #{code}
 ~~~

what will be the value of #{ansText}?
`;


const ERRORS = [
  new Error('ReferenceError: y is not defined'),
  new Error("SyntaxError: Identifier 'x' has already been declared"),
  new Error('ReferenceError: x is not defined'),
];

const PARAMS = [
  { glob: () => Rand.int(1, 5),
    letVar1: () => Rand.choice([ '', 'let ', '', 'var ']),
    letVar2: () => Rand.choice(['let ', 'var ', 'var ', 'var ']),
    letVar3: () => Rand.choice(['let ', 'var ', '']),
    p1: () => Rand.int(1, 5),
    p2: () => Rand.int(1, 5),
    p3: () => Rand.int(1, 5),
    arg: () => Rand.choice([0, 1, 2, 3]),
    errIndex: () => Rand.natnum(ERRORS.length),
  },
  { _type: 'nonRandom',
    code: ({glob, p1, p2, p3, letVar1, letVar2, letVar3}) =>
      code(glob, p1, p2, p3, letVar1, letVar2, letVar3),
    ansText: ({arg}) => `[ f(${arg}), x ]`,
  },
  { _type: 'nonRandom',
    answer: ({code, ansText}) => fn(code, ansText).call(null),
  },
  { _type: 'nonRandom',
    alts: ({glob, p1, p2, p3, answer, errIndex}) =>
             alts(glob, p1, p2, p3, answer, errIndex),
  },
];

/*
  arg letvar1   2   3           Answer
 0  0 ''       let  ''    ReferenceError: y is not defined
 1  0 ''       let  let   ReferenceError: y is not defined
 2  0 ''       let  var   ReferenceError: y is not defined
 3  0 let      let  ''    ReferenceError: y is not defined
 4  0 let      let  let   ReferenceError: y is not defined
 5  0 var      let  ''    ReferenceError: y is not defined
 6  0 var      let  let   ReferenceError: y is not defined
 7  0 var      let  var   ReferenceError: y is not defined
 8  0 ''       var  ''    NaN,
 9  0 ''       var  let   NaN,
10  0 ''       var  var   NaN,1
11  0 let      var  ''    NaN,1
12  0 let      var  let   NaN,1
13  0 var      var  ''    NaN,1
14  0 var      var  let   NaN,1
15  0 var      var  var   NaN,1
16  0 let      let  var   SyntaxError: Identifier 'x' has already been declared
17  0 let      var  var   SyntaxError: Identifier 'x' has already been declared
18  2 ''       let  ''    ReferenceError: y is not defined
19  2 ''       let  var   ReferenceError: y is not defined
20  2 let      let  ''    ReferenceError: y is not defined
21  2 var      let  ''    ReferenceError: y is not defined
22  2 var      let  var   ReferenceError: y is not defined
23  2 ''       let  let   ReferenceError: x is not defined
24  2 ''       var  let   ReferenceError: x is not defined
25  2 let      let  let   ReferenceError: x is not defined
26  2 let      var  let   ReferenceError: x is not defined
27  2 var      let  let   ReferenceError: x is not defined
28  2 var      var  let   ReferenceError: x is not defined
29  2 ''       var  ''    10,5
30  2 ''       var  var   10,1
31  2 let      var  ''    10,1
32  2 var      var  ''    10,1
33  2 var      var  var   10,1
34  2 let      let  var   SyntaxError: Identifier 'x' has already been declared
35  2 let      var  var   SyntaxError: Identifier 'x' has already been declared
*/

const TRUE_SYNTAX_EXPLAIN = //#34, #35
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    Since .~a~ is ${arg}, the .~if~-condition is .~true~ (the body of
    the .~if~ will always be parsed irrespective of the value of the
    condition).  The .~var~ declaration of .~x~ is hoisted to the
    start of the function where it clashes with the earlier .~let~
    declaration of .~x~ which results in the .~SyntaxError~.
  `;
const FALSE_SYNTAX_EXPLAIN = //#16, #17
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    Even though the .~if~-condition is false with .~a === ${arg}~, the
    body of the .~if~ is nevertheless parsed.  Hence the .~var~
    declaration of .~x~ in the body is hoisted to the start of the
    function where it clashes with the earlier .~let~ declaration of
    .~x~ which results in the .~SyntaxError~.
  `;
const LET2_NOT_LET3_EXPLAIN = //#0 - #7, #18 - #22
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    Since the scope of .~let y~ declaration is restricted to the 
    .~if~ body, the assignment of .~x = y~ assignment results in
    a .~ReferenceError~.
  `;
const TRUE_LET2_LET3_EXPLAIN = //#23 - #28
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    Since .~a === ${arg}~, the .~if~-condition is true and the body
    of the .~if~ is executed.  The scope of the .~let x~ in the body
    of the .~if~ starts at the start of the .~if~-body and the
    reference to .~x~ in the earlier .~let y = x + ${p2}~
    declaration results in a .~ReferenceError~.
  `;
const TRUE_EMPTY1_EMPTY3_EXPLAIN = //#29
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    The scope of the .~var y = x + ${p2}~ is hoisted to the start of
    the function.  Since there are no declarations for .~x~ in the
    function, all occurrences of .~x~ refer the global .~x~.  Since
    .~a === ${arg}~, the .~if~ condition is true and .~y~ gets the
    value .~${p1 + p2}~.  The assignment .~x = y~ sets .~x~ (which is
    the global .~x~) to .~${p1 + p2}~.  The return value of the
    function is .~${p1 + p2} + ${p1 + p2}~ which is .~${2*(p1 + p2)}~.
    Hence the answer is .~[ ${2*(p1 + p2)}, ${(p1 + p2)}]~.
  `;
const TRUE_LET1_VAR3_EXPLAIN = //#30
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    The scope of the .~var x = y + ${p3}~ is hoisted to the start of
    the function and all occurrences of .~x~ refer to that hoisted
    declaration.  Similarly, the .~y~ declaration too is hoisted to
    the start of the function.  Since .~a === ${arg}~, the .~if~
    condition is true and .~y~ gets the value .~${p1 + p2}~.  The
    assignment .~x = y~ sets .~x~ to .~${p1 + p2}~.  The return value
    of the function is .~${p1 + p2} + ${p1 + p2}~ which is .~${2*(p1 +
    p2)}~.  Since the hoisted .~x~ declaration ensures the global .~x~
    is not affected by the call to .~f()~, the answer is .~[ ${2*(p1 +
    p2)}, ${glob}]~.
  `;
const TRUE_NO_GLOBAL_EXPLAIN = //#31 - #33
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    The scope of .~x~ is restricted to .~f()~ by the initial
    .~${letVar1}~-declaration.  The declaration of .~var y~ in the
    .~if~-body gets hoisted to the start of the function and all
    occurrences of .~y~ in the function body refer to that hoisted
    declaration.  Since .~a === ${arg}~, the .~if~ condition is true
    and .~y~ gets the value .~${p1 + p2}~.  The assignment .~x = y~
    sets .~x~ to .~${p1 + p2}~.  The return value of the function is
    .~${p1 + p2} + ${p1 + p2}~ which is .~${2*(p1 + p2)}~.  Since the
    hoisted .~x~ declaration ensures the global .~x~ is not affected
    by the call to .~f()~, the answer is .~[ ${2*(p1 + p2)},
    ${glob}]~.
  `;
const FALSE_UNDEF_GLOBAL_EXPLAIN = //#8, #9
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    The scope of the .~var y = x + ${p2}~ declaration is hoisted to
    the start of the function.  However, since .~a === ${arg}~, the
    .~if~-condition is false and the body of the .~if~ is not
    executed, hence the assignment .~x = y~ assigns the value
    .~undefined~ to the global .~x~.  The return value of the function
    is .~undefined + undefined~ which is .~NaN~.  Hence the answer is
    .~[ NaN, ]~.
  `;
const FALSE_EMPTY1_VAR2_VAR3_EXPLAIN = //#10
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    Both the .~var y = x + ${p2}~ and the .~var x = y + ${p3}~
    declarations within the body of the .~if~ are hoisted to
    the start of the function.  This means that all occurrences
    of .~x~ within the function refer to the hoisted .~x~
    declaration and not the global .~x~.  Since .~a === ${arg}~,
    the .~if~-condition is false and the body of the .~if~ is not
    executed, hence the assignment .~x = y~ assigns the value
    .~undefined~ to the global .~x~.  The return value of the
    function is .~undefined + undefined~ which is .~NaN~.  Since
    the global .~x~ is unaffected by the function the answer is
    .~[ NaN, ${glob} ]~.      
  `;
const FALSE_X_DECL_Y_HOIST_EXPLAIN = //#11 - #15
  ({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) => `
    The top-level .~${letVar1} x = ${p1}~ declaration in the
    function ensures that all occurrences of .~x~ within the
    function refer to this declaration and not the global
    declaration.  The scope of the .~var y = x + ${p2}~ declaration
    is hoisted to the start of the function.  However, since .~a ===
    ${arg}~, the .~if~-condition is false and the body of the .~if~
    is not executed, hence the assignment .~x = y~ assigns the value
    .~undefined~ to .~x~.  The return value of the function is
    .~undefined + undefined~ which is .~NaN~.  Since the global .~x~
    is unaffected by the function the answer is .~[ NaN, ${glob} ]~.
  `;

const EXPLAINS = {
  ['false-""-let-""']: LET2_NOT_LET3_EXPLAIN, //#0
  ['false-""-let-let']: LET2_NOT_LET3_EXPLAIN, //#1,
  ['false-""-let-var']: LET2_NOT_LET3_EXPLAIN, //#2
  ['false-let-let-""']: LET2_NOT_LET3_EXPLAIN, //#3
  ['false-let-let-let']: LET2_NOT_LET3_EXPLAIN, //#4
  ['false-var-let-""']: LET2_NOT_LET3_EXPLAIN, //#5
  ['false-var-let-let']: LET2_NOT_LET3_EXPLAIN, //#6
  ['false-var-let-var']: LET2_NOT_LET3_EXPLAIN, //#7
  ['false-""-var-""']: FALSE_UNDEF_GLOBAL_EXPLAIN, //#8
  ['false-""-var-let']: FALSE_UNDEF_GLOBAL_EXPLAIN, //#9
  ['false-""-var-var']: FALSE_EMPTY1_VAR2_VAR3_EXPLAIN, //#10
  ['false-let-var-""']: FALSE_X_DECL_Y_HOIST_EXPLAIN, //#11
  ['false-let-var-let']: FALSE_X_DECL_Y_HOIST_EXPLAIN, //#12
  ['false-var-var-""']: FALSE_X_DECL_Y_HOIST_EXPLAIN, //#13
  ['false-var-var-let']: FALSE_X_DECL_Y_HOIST_EXPLAIN, //#14
  ['false-var-var-var']: FALSE_X_DECL_Y_HOIST_EXPLAIN, //#15
  ['false-let-let-var']: FALSE_SYNTAX_EXPLAIN, //#16
  ['false-let-var-var']: FALSE_SYNTAX_EXPLAIN, //#17
  ['true-""-let-""']: LET2_NOT_LET3_EXPLAIN, //#18
  ['true-""-let-var']: LET2_NOT_LET3_EXPLAIN, //#19
  ['true-let-let-""']: LET2_NOT_LET3_EXPLAIN, //#20
  ['true-var-let-""']: LET2_NOT_LET3_EXPLAIN, //#21
  ['true-var-let-var']: LET2_NOT_LET3_EXPLAIN, //#22
  ['true-""-let-let']: TRUE_LET2_LET3_EXPLAIN, //#23
  ['true-""-var-let']: TRUE_LET2_LET3_EXPLAIN, //#24
  ['true-let-let-let']: TRUE_LET2_LET3_EXPLAIN, //#25
  ['true-let-var-let']: TRUE_LET2_LET3_EXPLAIN, //#26
  ['true-var-let-let']: TRUE_LET2_LET3_EXPLAIN, //#27
  ['true-var-var-let']: TRUE_LET2_LET3_EXPLAIN, //#28
  ['true-""-var-""']: TRUE_EMPTY1_EMPTY3_EXPLAIN, //#29
  ['true-""-var-var']: TRUE_LET1_VAR3_EXPLAIN, //#30
  ['true-let-var-""']: TRUE_NO_GLOBAL_EXPLAIN, //#31,
  ['true-var-var-""']: TRUE_NO_GLOBAL_EXPLAIN, //#32
  ['true-var-var-var']: TRUE_NO_GLOBAL_EXPLAIN, //#33
  ['true-let-let-var']: TRUE_SYNTAX_EXPLAIN, //#34
  ['true-let-var-var']: TRUE_SYNTAX_EXPLAIN, //#35
};

function explain(params) {
  const {glob, p1, p2, p3, arg, letVar1, letVar2, letVar3} = params;
  const key = `${arg>1}-${letVar1.trim()||'""'}-` +
	          `${letVar2.trim()}-${letVar3.trim()||'""'}`;
  return EXPLAINS[key](params);
}

/*
function explain({glob, p1, p2, p3, arg, letVar1, letVar2, letVar3}) {
  [letVar1, letVar2, letVar3] = [letVar1, letVar2, letVar3].map(v => v.trim());
  if (arg > 1 && letVar1 === 'let' && letVar3 === 'var') { //#34, #35
    return `
      Since .~a~ is ${arg}, the .~if~-condition is .~true~.  The
      .~var~ declaration of .~x~ is hoisted to the start of the
      function where it clashes with the earlier .~let~ declaration
      of .~x~ which results in the .~SyntaxError~.
    `;
  }
  else if (arg <= 1 && letVar1 === 'let' && letVar3 === 'var') { // #16, #17
    return `
      Even though the .~if~-condition is false with .~a === ${arg}~,
      the body of the .~if~ is nevertheless parsed.  Hence the .~var~
      declaration of .~x~ in the body is hoisted to the start of the
      function where it clashes with the earlier .~let~ declaration of
      .~x~ which results in the .~SyntaxError~.
    `;
  }
  else if (letVar2 === 'let' && letVar3 !== 'let') { //#0 - #7, #18 - #22
    return `
      Since the scope of .~let y~ declaration is restricted to the 
      .~if~ body, the assignment of .~x = y~ assignment results in
      a .~ReferenceError~.
    `;
  }
  else if (arg > 1 && letVar2 === 'let' && letVar3 === 'let') { //#23 - #28
    return `
      Since .~a === ${arg}~, the .~if~-condition is true and the body
      of the .~if~ is executed.  The scope of the .~let x~ in the body
      of the .~if~ starts at the start of the .~if~-body and the
      reference to .~x~ in the earlier .~let y = x + ${p2}~
      declaration results in a .~ReferenceError~.
    `;
  }
  else if (arg > 1 && letVar1 === '' &&  letVar3 === '') { //#29
    assert(letVar2 === 'var');
    return `
      The scope of the .~var y = x + ${p2}~ is hoisted to the start of
      the function.  Since there are no declarations for .~x~ in the
      function, all occurrences of .~x~ refer the global .~x~.  Since
      .~a === ${arg}~, the .~if~ condition is true and .~y~ gets the
      value .~${p1 + p2}~.  The assignment .~x = y~ sets .~x~ (which is
      the global .~x~) to .~${p1 + p2}~.  The return value of the
      function is .~${p1 + p2} + ${p1 + p2}~ which is .~${2*(p1 +
      p2)}~.  Hence the answer is .~[ ${2*(p1 + p2)}, ${(p1 + p2)}]~.
    `;
  }
  else if (arg > 1 && letVar1 === '' &&  letVar3 === '') { //#30
    return `
      The scope of the .~var x = y + ${p3}~ is hoisted to the start of
      the function and all occurrences of .~x~ refer to that hoisted
      declaration.  Since .~a === ${arg}~, the .~if~ condition is true
      and .~y~ gets the value .~${p1 + p2}~.  The assignment .~x = y~
      sets .~x~ to .~${p1 + p2}~.  The return value of the function is
      .~${p1 + p2} + ${p1 + p2}~ which is .~${2*(p1 + p2)}~.  Since
      the hoisted .~x~ declaration ensures the global .~x~ is not
      affected by the call to .~f()~, the answer is .~[ ${2*(p1 +
      p2)}, ${glob}]~.
    `;
  }
  else if (arg > 1) { //#31 - #33
    return `
      The scope of .~x~ is restricted to .~f()~ by the initial
      .~${letVar1}~-declaration.  Since .~a === ${arg}~, the .~if~
      condition is true and .~y~ gets the value .~${p1 + p2}~.  The
      assignment .~x = y~ sets .~x~ to .~${p1 + p2}~.  The return value
      of the function is .~${p1 + p2} + ${p1 + p2}~ which is .~${2*(p1
      + p2)}~.  Since the hoisted .~x~ declaration ensures the global
      .~x~ is not affected by the call to .~f()~, the answer is .~[
      ${2*(p1 + p2)}, ${glob}]~.
    `;
  }
  else if (arg <= 1 && letVar1 === '' && letVar2 === 'var' &&
	   (letVar3 === '' || letVar3 === 'let')) { //#8, #9
    return `
      The scope of the .~var y = x + ${p2}~ declaration is hoisted
      to the start of the function.  However, since .~a === ${arg}~,
      the .~if~-condition is false and the body of the .~if~ is not
      executed, hence the assignment .~x = y~ assigns the value
      .~undefined~ to the global .~x~.  The return value of the
      function is .~undefined + undefined~ which is .~NaN~.  Hence
      the answer is .~[ NaN, ]~.
    `;
  }
  else if (arg <= 1 && letVar1 === '' && letVar2 === 'var' &&
	   letVar3 === 'var') { //#10
    return `
      Both the .~var y = x + ${p2}~ and the .~var x = y + ${p3}~
      declarations within the body of the .~if~ are hoisted to
      the start of the function.  This means that all occurrences
      of .~x~ within the function refer to the hoisted .~x~
      declaration and not the global .~x~.  Since .~a === ${arg}~,
      the .~if~-condition is false and the body of the .~if~ is not
      executed, hence the assignment .~x = y~ assigns the value
      .~undefined~ to the global .~x~.  The return value of the
      function is .~undefined + undefined~ which is .~NaN~.  Since
      the global .~x~ is unaffected by the function the answer is
      .~[ NaN, ${glob} ]~.      
    `;
  }
  else { //#11 - #15
    return `
      The top-level .~${letVar1} x = ${p1}~ declaration in the
      function ensures that all occurrences of .~x~ within the
      function refer to this declaration and not the global
      declaration.  The scope of the .~var y = x + ${p2}~ declaration
      is hoisted to the start of the function.  However, since .~a ===
      ${arg}~, the .~if~-condition is false and the body of the .~if~
      is not executed, hence the assignment .~x = y~ assigns the value
      .~undefined~ to .~x~.  The return value of the function is
      .~undefined + undefined~ which is .~NaN~.  Since the global .~x~
      is unaffected by the function the answer is .~[ NaN, ${glob} ]~.
    `;
  }
}
*/

function doAllCombos(doKeys) {
  const results = { ['0']: {}, ['2']: {} };
  const [glob, p1, p2, p3 ] = [1, 2, 3, 4];
  for (const arg of [0, 2]) {
    const argResults = results[arg];
    for (const letVar1 of [ '', 'let ', 'var ']) {
      for (const letVar2 of  [ 'let ', 'var ' ]) {
	for (const letVar3 of [ '', 'let ', 'var ']) {
	  const codeText = code(glob, p1, p2, p3, letVar1, letVar2, letVar3);
	  const ansText = `[ f(${arg}), x]`;
	  const answer = fn(codeText, ansText).call(null);
	  const answerCombos = argResults[answer] || (argResults[answer] = []);
	  answerCombos.push([letVar1, letVar2, letVar3]);
	}
      }
    }
  }
  if (doKeys) {
    let i = 0;
    console.log('{');
    for (const arg of Object.keys(results)) {
      for (const [answer, answerCombos] of Object.entries(results[arg])) {
	for (const combo of answerCombos) {
	  console.log(`  ['${arg>1}-${combo[0].trim()||'""'}-` +
		      `${combo[1].trim()}-` +
		      `${combo[2].trim()||'""'}']: ${i},`);
	  i++;
	}
      }
    }
    console.log('};');
  }
  else {
    let i = 0;
    for (const arg of Object.keys(results)) {
      for (const [answer, answerCombos] of Object.entries(results[arg])) {
	for (const combo of answerCombos) {
	  console.log(`${String(i).padStart(2)}  ` +
		      `${arg} ${combo[0]||"''  "}     ${combo[1]} ` +
		      `${combo[2]||"''  "}  ${answer}`);
	  i++;
	}
      }
    }
  }
}


if (process.argv[1] === __filename) {
  //doAllCombos();
  //doAllCombos(true);
  console.log(new VarLetCode().qaText());
}

