'use strict';

const TIMESTAMP = 'Time-stamp: <2022-11-16 09:44:04 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class Representations extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      All valid XML documents are well-formed.
    `,
    value: true,
    explain: `
       For a XML document to be valid it must satisfy some kind of
       schema for the document, but it must also be well-formed;
       i.e. be properly nested.
    `,
  },
  { statement: `
      All well-formed XML documents are valid.
    `,
    value: false,
    explain: `
       If a XML document is well-formed then it must be
       properly nested.  However, in order to be valid,
       it must additionaly satisfy some external document
       schema.  Hence the statement is *false*.
    `,
  },
  { statement: `
      JSON uses a subset of JavaScript syntax and hence is referred to
      as "JavaScript Object Notation".
    `,
    value: false,
    explain: `
      JSON is poorly named and its syntax is not a subset of JavaScript
      syntax.  Specifically, JSON requires property names (aka keys) to
      be double-quoted strings while JavaScript does not.
    `,
  },
  { statement: `
      HTML tags must be properly nested.
    `,
    value: false,
    explain: `
      Historically, browsers have always allowed "sloppy" HTML markup,
      rendering documents even when they have an incorrect nesting
      structure.  This behavior has been embraced by recent standards
      which specify the exact semantics of some badly nested HTML
      constructs.  In fact, the current standards require some elements
      like \`link\` to be used without a closing tag.
    `,
  },
  { statement: `
      HTML can be represented as an XML document.
    `,
    value: true,
    explain: `
      There is a dialect of HTML called XHTML which achieves exactly
      this.  Unfortunately, since XML documents must be well-formed
      (properly nested), XHTML precludes the common practice of
      using sloppy markup which is prevalent in the HTML community.
      Hence XHTML never became extremely popular but is still used
      fairly extensively.
    `,
  },
  { statement: `
      REST allows multiple representations for the same resource.
    `,
    value: true,
    explain: `
      REST has the word ."representation\`\`." in the expansion
      ."REpresentational State Transfer\`\`." of its acronym and does
      indeed allow multiple representations for the same resource.
    `,
  },
  { statement: `
      XML is the most popular representation used in modern
      REST web services
    `,
    value: false,
    explain: `
      XML was initially an extremely popular representation used
      in web services when the idea of web services first became
      popular, especially during the SOAP era.  However, JSON
      is more popular as a representation in modern web services.
    `,
  },
  { statement: `
      XML attributes should be used for representing atomic information 
      without any internal structure of interest to the application.
    `,
    value: true,
    explain: `
      Representing atomic information like opaque ID's without any
      internal structure is an appropriate use of XML attributes.
    `,
  },
  { statement: `
      A DTD is used to specify the requirements a XML document
      must meet in order to be well-formed.
    `,
    value: false,
    explain: `
      The determination of whether an XML document is well-formed can
      be made without reference to any external resource; all that is
      required is that the XML document structure is properly nested.
      A DTD is used to ensure that the XML is *valid* when it meets
      additional restrictions on the allowed elements, attributes and
      their relationships
    `,
  },
  { statement: ` 
      A DTD is used to specify the requirements a XML document
      must meet in order to be valid.
    `,
    value: true,
    explain: `
      A DTD is used to ensure that well-formed XML is *valid* when it
      meets additional restrictions on the allowed elements,
      attributes and their relationships
    `,
  },
  { statement: `
      Relax-NG is used to specify the requirements for an XML representation
      to be *valid*.
    `,
    value: true,
    explain: `
      Technologies like Relax-NG, DTD's and XML-Schema are used to
      specify the requirements for an XML representation to be
      *valid*.
    `,
  },
  { statement: `
      Relax-NG is used to specify the requirements for a JSON representation
      to be *valid*.
    `,
    value: false,
    explain: `
      Technologies like Relax-NG, DTD's and XML-Schema are used to
      specify the requirements for an XML representation (not JSON
      representation) to be *valid*.  Similar technology called
      JSON-schema exists for JSON.
    `,
  },
  { statement: `
      It is possible to use HTML as a representation for REST web services.
    `,
    value: true,
    explain: `
      Any well defined representation including HTML can be used.  In fact,
      HTML has some advantages over JSON in that it directly supports
      HATEOS via links and forms.  A problem is that its vocabulary is
      fixed but domain semantics can be associated with HTML content
      using microformats like \`itemscope\` or RDF-a.  Having said that,
      current practice uses HTML largely as a representation to be consumed
      by humans, preferring JSON and XML for web service representations.
    `,
  },
];

module.exports = Representations;
Object.assign(Representations, {
  id: 'representationsTrueFalse',
  title: 'Representations: True or False',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new Representations().qaText());
}
