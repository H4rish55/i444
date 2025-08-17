'use strict';

const TIMESTAMP = 'Time-stamp: <2018-11-04 19:24:25 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class PrototypeTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      The prototype of an object can be found using its .~prototype~
      property.
    `,
    value: false,
    explain: `
      The .~prototype~ property is found on the constructor of the object;
      the object itself does not have any .~prototype~ property on an object.
    `,
  },
  { statement: `
      The .~__proto__~ property of an object's constructor references 
      an object's prototype.
    `,
    value: false,
    explain: `
     The deprecated .~__proto__~ property of an object, not it's constructor
     references its prototype.
    `,
  },
  { statement: `
      Given an object .~obj~, .~obj.getPrototypeOf()~ returns the prototype for
      .~obj~.
    `,
    value: false,
    explain: `
      There is no .~getPrototypeOf()~ method on an arbitrary object;
      the prototype can be retrieved using .~Object.getPrototypeOf(obj)~.
    `,
  },
  { statement: `
      Given an object .~obj~, .~obj.setPrototypeOf(proto)~ can be used
      to set the prototype of .~obj~ to .~proto~.
    `,
    value: false,
    explain: `
      There is no .~setPrototypeOf()~ method on an arbitrary object;
      the prototype can be set using .~Object.setPrototypeOf(obj, proto)~.
    `,
  },
  { statement: `
      If two objects share the same prototype, then setting a property
      on one object will make that property available on the other
      object.
    `,
    value: false,
    explain: `
      Setting a property in an object affects only that object's *own*
      properties; it will not affect any other objects having the same
      prototype.
    `,
  },
  { statement: `
      Once an object has been created, its prototype cannot be changed.
    `,
    value: false,
    explain: `
      It is possible to change the prototype to some object .~proto~ 
      after creating an object .~obj~ using 
      .~Object.setPrototypeOf(obj, proto)~.
    `,
  },
  { statement: `
      It must always be the case that .~Object.getPrototypeOf(obj) 
      === obj.constructor.prototype~.
    `,
    value: false,
    explain: `
     Immediately after constructing .~obj~ it will be the case that 
     .~Object.getPrototypeOf(obj) === obj.constructor.prototype~;
     however, the prototype for .~obj~ may be changed subsequently
     and hence the equality may not always hold.
    `,
  },
  { statement: `
      The expression .~Object.getProtoypeOf(obj)~ can be used
      to get the prototype of an object .~obj~.      
    `,
    value: true,
    explain: `
      This is the recommended way to get the current prototype of an 
      object.
    `,
  },
  { statement: `
      The expression .~obj.__proto__~ can be used
      to get the prototype of an object .~obj~.      
    `,
    value: true,
    explain: `
      This is a deprecated way to get the current prototype of an 
      object.  .~Object.getPrototypeOf(obj)~ should be used instead.
    `,
  },
  { statement: `
      The expression .~Object.setProtoypeOf(obj, proto)~ can be used
      to set the prototype of an object .~obj~ to .~proto~.      
    `,
    value: true,
    explain: `
      This is the recommended way to dynamically change the prototype of an 
      object.
    `,
  },
  { statement: `
      The expression .~obj.__proto__ = proto~ can be used
      to set the prototype of an object .~obj~ to .~proto~.      
    `,
    value: true,
    explain: `
      This is a deprecated way;  .~Object.setProtoypeOf(obj, proto)~
      should be used instead.
    `,
  },
];

module.exports = PrototypeTrueFalse;
Object.assign(PrototypeTrueFalse, {
  id: 'prototypeTrueFalse',
  title: 'Prototype True or False',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new PrototypeTrueFalse().qaText());
}
