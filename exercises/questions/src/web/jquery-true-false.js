'use strict';

const TIMESTAMP = 'Time-stamp: <2018-11-30 00:40:02 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class JQueryTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      JQuery must always be invoked using the \`$()\` function.
    `,
    value: false,
    explain: `
      \`$()\` is usually merely an alias for the \`jQuery()\` function.
    `,
  },
  { statement: `
      All indexing operations within JQuery selectors are 0-based.
    `,
    value: false,
    explain: `
      Indexing operations which are derived from CSS are 1-based.
    `,
  },
  { statement: `
      \`>\` is used to combine two adjacent selector expressions to indicate 
      that the second selector must select a descendant of an element
      matched by the first selector.
    `,
    value: false,
    explain: `
      \`>\` is used to combine two adjacent selector expressions to
      indicate that the second selector must select an immediate child
      of an element matched by the first selector.
    `,
  },
  { statement: `
      \`+\` is used to combine two adjacent selector expressions to indicate 
      that the second selector must further constrain the element
      matched by the first selector.
    `,
    value: false,
    explain: `
      \`+\` is used to combine two adjacent selector expressions to
      indicate that the second selector must select the immediately
      following sibling of an element matched by the first selector.
    `,
  },
  { statement: `
      A space is used to combine two adjacent selector expressions to indicate 
      that the second selector must select a sibling of an element
      matched by the first selector.
    `,
    value: false,
    explain: `
      A space is used to combine two adjacent selector expressions to
      indicate that the second selector must select a descendant
      of an element matched by the first selector.
    `,
  },
  { statement: `
      \`#klass\` is used in a jQuery selector expression to select
      elements having \`class\` attribute \`klass\`.
    `,
    value: false,
    explain: `
      \`#\` .- "id" selects an element having \`id\` attribute "id".  To
      select elements with \`class\` attribute \`klass\`, the
      necessary selector is \`.klass\`.
    `,
  },
  { statement: `
      \`.ident\` is used in a jQuery selector expression to select a
      element having \`id\` attribute \`ident\`.
    `,
    value: false,
    explain: `
      \`.\` .- "klass" selects elements having \`class\` attribute "klass".  To
      select an element with \`id\` attribute \`ident\`, the
      necessary selector is \`#ident\`.
    `,
  },

  { statement: `
      Indexing operations within JQuery selectors which are
      derived from CSS are 1-based.
    `,
    value: true,
    explain: `
      Indexing operations which are derived from CSS are indeed 1-based.
      Note that indexing operations added by jQuery are 0-based.
    `,
  },
  { statement: `
      \`>\` is used to combine two adjacent selector expressions to indicate 
      that the second selector must select an immediate child of an element
      matched by the first selector.
    `,
    value: true,
    explain: `
      \`>\` is indeed used to combine two adjacent selector
      expressions to indicate that the second selector must select an
      immediate child of an element matched by the first selector.  Note
      that such child selectors can be quite expensive.
    `,
  },
  { statement: `
      \`+\` is used to combine two adjacent selector expressions to
      indicate that the second selector must select the immediately
      following sibling of an element matched by the first selector.
    `,
    value: true,
    explain: `
      \`+\` is indeed used to combine two adjacent selector
      expressions to indicate that the second selector must select the
      immediately following sibling of an element matched by the first
      selector.
    `,
  },
  { statement: `
      A space is used to combine two adjacent selector expressions to
      indicate that the second selector must select a descendant of an
      element matched by the first selector.
    `,
    value: true,
    explain: `
      A space is indeed used to combine two adjacent selector
      expressions to indicate that the second selector must select a
      descendant of an element matched by the first selector.  Note
      that such descendant selectors can be quite expensive.
    `,
  },
  { statement: `
      \`#ident\` is used in a jQuery selector expression to select an
      element having \`id\` attribute \`ident\`.
    `,
    value: true,
    explain: `
      The \`#ident\` selector expression can indeed be  used in a jQuery 
      selector expression to select an  element having \`id\` attribute 
      \`ident\`.  Note that such \`id\` selectors are usually the most
      efficient selectors.
    `,
  },
  { statement: `
      \`.klass\` is used in a jQuery selector expression to select all
      elements having \`class\` attribute \`klass\`.
    `,
    value: true,
    explain: `
      The \`.klass\` selector expression can indeed be  used in a jQuery 
      selector expression to select all  elements having \`class\` attribute 
      \`klass\`.  Note that such \`class\` selectors are quite efficient,
      second only to \`id\` selectors.
    `,
  },
  { statement: `
      Given a jQuery selector expression, it is possible to filter
      the matched elements further by qualifying the selector expression
      with a filter expression after a \`:\`.
    `,
    value: true,
    explain: `
      Such filter expressions include \`:first\`, \`:last\`,
      \`:even\`, \`:odd\`, \`:eq(\` .- "n" .- \`)\`, \`:gt(\` .- "n"
      .- \`)\` and \`:lt(\` .- "n" .- \`)\`.
    `,
  },
  { statement: `
      Given a jQuery matched list representing form elements, it is
      possible to get the value of the first form element in
      the list by using the \`val()\` method, irrespective of
      type of form element.
    `,
    value: true,
    explain: `
      The use of \`val()\` hides the complexity of accessing the
      value of complex widgets like select boxes.
    `,
  },
];

module.exports = JQueryTrueFalse;
Object.assign(JQueryTrueFalse, {
  id: 'jQueryTrueFalse',
  title: 'JQuery',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new JQueryTrueFalse().qaText());
}
