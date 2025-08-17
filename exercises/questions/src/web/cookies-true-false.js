'use strict';

const TIMESTAMP = 'Time-stamp: <2018-11-17 13:39:54 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class CookiesTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      A cookie value *always* consists of comma-separated strings.
    `,
    value: false,
    explain: `
      The cookie specification does not put any restriction on
      the value of a cookie; the syntax of a cookie value is
      determined entirely by the application using the cookie.
    `,
  },
  { statement: `
      A cookie is sent from the client to the server using the
      \`Set-Cookie:\` header.
    `,
    value: false,
    explain: `
      The \`Set-Cookie:\` header is used to send a cookie from
      the server to the client.
    `,
  },
  { statement: `
      A cookie is sent from the server to the client using the
      \`Cookie:\` header.
    `,
    value: false,
    explain: `
      The \`Cookie:\` header is used to send cookies from
      the client to the server.
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`Secure\` attribute, then that cookie can only be stored
      in encrypted storage.
    `,
    value: false,
    explain: `
      The \`Secure:\` attribute specifies the security of the cookie
      transmission, not storage.  Specifically, if the \`Secure:\`
      attribute is set, then the cookie will be sent from the client
      to the server only for responses resulting from HTTPS requests.
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`Secure\` attribute, then that cookie can only be transmitted
      for HTTPS requests.
    `,
    value: true,
    explain: `
      If the \`Secure:\`
      attribute is set, then the cookie will be sent from the client
      to the server only for responses resulting from HTTPS requests.
      This attribute should be used for cookies whose values contain
      sensitive information like authentication tokens to ensure that
      the sensitive information is not sent over unsecure HTTP.
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`HttpOnly\` attribute, then that cookie will not be sent
      for HTTPS requests.
    `,
    value: false,
    explain: `
      The \`HttpOnly:\` attribute specifies the client accessibility
      of the cookie value, not its transmission.  Specifically, if the
      \`HttpOnly:\` attribute is set, then the cookie value will not
      be accessible using \`document.cookie\` in the client.
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`HttpOnly\` attribute, then that cookie will not be accessible
      in the client using \`document.cookie\`.
    `,
    value: true,
    explain: `
      The \`HttpOnly:\` attribute specifies the client accessibility
      of the cookie value.  Specifically, if the \`HttpOnly:\`
      attribute is set, then the cookie value will not be accessible
      using \`document.cookie\` in the client.  This attribute can
      be used to avoid exposing sensitive information in a client
      which may have been compromised using a cross-site scripting
      (XSS) attack.
    `,
  },
  { statement: `
      A cookie is sent from the client to the server using the
      \`Cookie:\` header.
    `,
    value: true,
    explain: `
      The \`Cookie:\` header is used to send cookies from the client
      to the server.  The header value is a \`;\`-separated list of
      "name" .- \`=\` .- "value" cookie pairs.
    `,
  },
  { statement: `
      A cookie is sent from the server to the client using the
      \`Set-Cookie:\` header.
    `,
    value: true,
    explain: `
      The \`Set-Cookie:\` header is used to send cookies from the
      server to the client.  The header value must consist of
      \`;\`-separated fields with a required "name" .- \`=\` .-
      "value" field defining the cookie.  Other optional fields can be
      used to specify the cookie domain, path, expiration and
      security.
    `,
  },
  { statement: `
      A *session cookie* is one which disappears once the current
      browser session is closed.
    `,
    value: true,
    explain: `
      A session cookie is defined with no expiration time or an
      expiration time in the past; it does disappear once the current
      browser session is closed.
    `,
  },
  { statement: `
      A *session cookie* is used to maintain a user's session ID.
    `,
    value: false,
    explain: `
      A session cookie is commonly thought of as a cookie which
      disappears once the current browser session is closed.  If user
      sessions are tracked using cookies, then those cookies should be
      referred to with something like *session-id cookies* to avoid
      confusion with session cookies.    
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`Domain\` attribute set to a particular domain "D", then that cookie 
      will be sent within a client request only if the request domain
      is "D" or one of its sub-domains.
    `,
    value: true,
    explain: `
      Specifying the domain attribute as "D" restricts the sending of
      a cookie only to "D" or one of its sub-domains.
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`Domain\` attribute set to a particular domain "D", then that
      cookie will be sent within a client request only if the request
      domain matches "D" exactly.
    `,
    value: false,
    explain: `
      Specifying the domain attribute as "D" restricts the sending of
      a cookie only to "D" or one of its *sub-domains*.
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`Path\` attribute set to a particular path "P", then that cookie 
      will be sent within a client request only if the request path
      starts with "P".
    `,
    value: true,
    explain: `
      Specifying the path attribute as "D" restricts the sending of
      a cookie only to "P" or one of its sub-paths.
    `,
  },
  { statement: `
      If a \`Set-Cookie:\` header specifies a cookie having the
      \`Path\` attribute set to a particular path "P", then that
      cookie will be sent within a client request only if the request
      path matches "P" exactly.
    `,
    value: false,
    explain: `
      Specifying the path attribute as "P" restricts the sending of
      a cookie only to "P" or one of its *sub-paths*.
    `,
  },
  
  
];

module.exports = CookiesTrueFalse;
Object.assign(CookiesTrueFalse, {
  id: 'cookiesTrueFalse',
  title: 'HTTP Cookies',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new CookiesTrueFalse().qaText());
}
