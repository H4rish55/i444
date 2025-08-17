'use strict';

const TIMESTAMP = 'Time-stamp: <2019-03-24 22:49:22 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class HeadersTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      ASCII is an 8-bit character encoding.
    `,
    value: false,
    explain: `
      ASCII is a 7-bit character encoding.
    `,
  },
  { statement: `
      UTF-8 is a fixed-length character encoding for Unicode.
    `,
    value: false,
    explain: `
      UTF-8 is a variable-length character encoding for Unicode,
      using one to  four bytes to represent each Unicode code
      point.
    `,
  },
  { statement: `
      The \`Referer:\` request header will *always* be set to the
      URL of the page which originated the request.
    `,
    value: false,
    explain: `
      The \`Referer:\` request header will not be set for a HTTP
      request sent from a HTTPS page.  In general, it is not be set to
      avoid privacy problems, as setting it allows web sites to track
      users.
    `,
  },
  { statement: `
      The \`Character-Set:\` header is used to specify the
      character set of text content within a HTTP request.
    `,
    value: false,
    explain: `
      There is no \`Character-Set:\` header.  It is the
      \`Content-Type:\` header which is used to specify the character
      set; it has a primary value which is a MIME-TYPE, but can also
      have a \`charset=\` suffix which describes the character set
      used by text content in the request.
    `,
  },
  { statement: `
      The \`Accept-Charset:\` header is used to specify the
      character set of text content within a HTTP request.
    `,
    value: false,
    explain: `
      The \`Accept-Charset:\` header specifies the character set which
      can be used in the response.  It is the \`Content-Type:\` header
      which is used to specify the character set; it has a primary
      value which is a MIME-TYPE, but can also have a \`charset=\`
      suffix which describes the character set used by text content in
      the request.
    `,
  },
  { statement: `
      The \`Accept-Encoding:\` header is used to specify the
      character set of text content within a HTTP request.
    `,
    value: false,
    explain: `
      The \`Accept-Encoding:\` header specifies the content encoding,
      usually a compression algorithm, which can be understood by the
      client.  It is the \`Content-Type:\` header which is used to
      specify the character set; it has a primary value which is a
      MIME-TYPE, but can also have a \`charset=\` suffix which
      describes the character set used by text content in the request.
    `,
  },
  { statement: `
      The \`Accept:\` header is used to specify the
      character set of text content within a HTTP request.
    `,
    value: false,
    explain: `
      The \`Accept:\` header specifies the content MIME types which
      can be understood by the client.  It is the \`Content-Type:\`
      header which is used to specify the character set; it has a
      primary value which is a MIME-TYPE, but can also have a
      \`charset=\` suffix which describes the character set used by
      text content in the request.
    `,
  },
  { statement: `
      The \`Content-Type:\` header is used to specify the
      character set of text content within a HTTP request.
    `,
    value: true,
    explain: `
      The \`Content-Type:\` header is used to specify the character
      set; it has a primary value which is a MIME-TYPE, but can also
      have a \`charset=\` suffix which describes the character set
      used by text content in the request.
    `,
  },
  { statement: `
      The \`Accept:\` header is a content negotiation header used
      by a client to specify the MIME types it understands.
    `,
    value: true,
    explain: `
      The \`Accept:\` header specifies the content MIME types which can
      be understood by the client.  It's value consists of comma-separated 
      MIME types with each MIME type  suffixed with an optional q-factor 
      weight preceeded by a \`;\`.  An example header is:

      \`\`\`
      Accept: text/html, application/xml;q=0.9, */*;q=0.8
      \`\`\`

    `,
  },
  { statement: `
      The \`Accept-Charset:\` header is a content negotiation header used
      by a client to specify the character sets it understands.
    `,
    value: true,
    explain: `
      The \`Accept-Charset:\` header specifies the character sets which can
      be understood by the client.  It's value consists of comma-separated
      character sets with each character set suffixed with an optional q-factor
      weight preceeded by a \`;\`.  An example header is:

      \`\`\`
      Accept-Charset: utf-8, iso-8859-1;q=0.5
      \`\`\`

    `,
  },
  { statement: `
      The \`Accept-Language:\` header is a content negotiation header used
      by a client to specify the human language and locale variant it prefers.
    `,
    value: true,
    explain: `
      The \`Accept-Language:\` header specifies the human language which
      can be understood by the client.  It's value consists of 
      comma-separated 2 or 3 character language specification followed 
      optionally by a \`-\` followed by a  locale specification.  
      This language-locale may optionally be followed by a q-factor 
      weight preceeded by a \`;\`.  An example header is:

      \`\`\`
      Accept-Language: en-US,en;q=0.5
      \`\`\`

    `,
  },
  { statement: `
      The \`Host:\` header is a required header for HTTP/1.1.
    `,
    value: true,
    explain: `
      The \`Host:\` header must be sent in all HTTP/1.1 requests.
      It specifies the requested domain name and optionally the
      TCP port number via which the server is contacted.  This
      is often used for virtual hosting for serving multiple
      domains using a single server.  An example header is:

      \`\`\`
      Host: zdu.binghamton.edu
      \`\`\`

    `,
  },
];

module.exports = HeadersTrueFalse;
Object.assign(HeadersTrueFalse, {
  id: 'headersTrueFalse',
  title: 'HTTP Headers',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new HeadersTrueFalse().qaText());
}
