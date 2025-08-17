'use strict';

const TIMESTAMP = 'Time-stamp: <2018-11-18 00:04:25 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class CacheTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: public, max-age=8640000
      \`\`\`

      is a good choice for caching static assets like images, 
      scripts and stylesheets
    `,
    value: true,
    explain: `
      Using \`public\` caching for static assets is useful as
      it allows the cached asset to be shared by multiple clients.
      The pattern often used for caching static assets is to have
      a distinct URL for each version of the asset; hence specifying
      an effectively infinite expiry time with no validation is
      desired to maximize the effective of caching.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: private, max-age=8640000
      \`\`\`

      is a good choice for caching static assets like images, 
      scripts and stylesheets
    `,
    value: false,
    explain: `
      It typically makes sense to have static assets shared by multiple
      clients; hence specifying a \`private\` cache is not a good choice.

      The pattern often used for caching static assets is to have
      a distinct URL for each version of the asset; hence specifying
      an effectively infinite expiry time with no validation is
      desired to maximize the effective of caching.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: no-cache, no-store, must-revalidate
      \`\`\`

      is a good choice for caching static assets like images, 
      scripts and stylesheets
    `,
    value: false,
    explain: `
      The provided header does not allow any caching; this does not
      make sense for static assets.

      The pattern often used for caching static assets is to have
      a distinct URL for each version of the asset; hence specifying
      an effectively infinite expiry time with no validation is
      desired to maximize the effective of caching.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: private, no-cache, must-revalidate
      \`\`\`

      is a good choice for caching the contents of a shopping cart.
    `,
    value: true,
    explain: `
      A shopping cart is typically not shared among different
      users; hence using a \`private\` cache makes sense.
      Since the contents of a cart is dynamic and may have
      changed on the server, it is a good idea to ensure
      that cached content is not used without validation;
      hence the \`no-cache, must-revalidate\`.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: public, no-cache, must-revalidate
      \`\`\`

      is a good choice for caching the contents of a shopping cart.
    `,
    value: false,
    explain: `
      A shopping cart is typically not shared among different users;
      hence specifying a \`public\` cache does not makes sense.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: public, no-cache,  max-age=86400, must-revalidate
      \`\`\`

      is a good choice for caching a static HTML page which may 
      be updated once a day.  It is critical that clients never 
      see a stale version.
    `,
    value: true,
    explain: `
      The provided cache directives ensure the required behavior with
      the page not being served from the cache without validation.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: public, max-age=86400
      \`\`\`

      is a good choice for caching a static HTML page which may 
      be updated once a day.  It is critical that clients never 
      see a stale version.
    `,
    value: false,
    explain: `
      The provided cache directives allow serving cached responses without
      validation.  Hence it is possible that clients may see a stale
      version and so the directives do not meet the requirements.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: public, no-cache,  max-age=86400, must-revalidate
      \`\`\`

      is a good choice for caching a static HTML page which may 
      be updated once a day.  It is acceptable that clients may
      see a stale version.
    `,
    value: false,
    explain: `
      The provided cache directives ensure that the page is not served
      from the cache without validation.  This is stronger validation
      behavior than required.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: public, max-age=86400
      \`\`\`

      is a good choice for caching a static HTML page which may 
      be updated once a day.  It is acceptable that clients may
      see a stale version.
    `,
    value: true,
    explain: `
      The provided cache directives allow serving cached responses without
      validation.  Hence it is possible that clients may see a stale
      version and so the directives does meet the requirements.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: public, max-age=86400
      \`\`\`

      is a good choice for caching a bank statement.
    `,
    value: false,
    explain: `
      The provided cache directives allow caching sensitive information
      like a bank statement in shared caches which is unacceptable.
      In fact, a bank statement should never be cached by specifying
      the \`no-store\` directive.
    `,
  },
  { statement: `
      The cache control header 
      
      \`\`\`
      Cache-Control: private, no-store, no-cache, must-revalidate
      \`\`\`

      is a good choice for caching a bank statement.
    `,
    value: true,
    explain: `
      The provided cache directives ensures that sensitive information
      like a bank statement is never cached (by specifying
      the \`no-store\` directive).  The other directives should not
      strictly be necessary.
    `,
  },
  { statement: `
      Specifying a cache control header

      \`\`\`
      Cache-Control: no-store
      \`\`\`

      ensures that a response will never be cached.
    `,
    value: false,
    explain: `
      The statement will be true if all caches work
      as required.  However, there is no guarantee 
      that this will always be the case and hence it
      is not a good idea to depend only on this
      directive to protect sensitive information.
    `,
  },
  { statement: `
      HTTPS responses cannot be cached by intermediate
      caches.
    `,
    value: true,
    explain: `
      Since intermediate caches cannot read HTTPS encrypted
      responses, those responses cannot be cached.
    `,
  },
  { statement: `
      HTTPS responses cannot be cached by browsers.
    `,
    value: false,
    explain: `
      It should not make a difference whether the response
      was returned as a result of a HTTP or HTTPS request;
      the caching will be done as per the returned headers.
    `,
  },
  { statement: `
      A request is a conditional \`GET\` if it specifies
      a \`ETag\` header.
    `,
    value: false,
    explain: `
      The presence of an \`ETag\` header does not make
      a \`GET\` request conditional; making the request
      conditional requires a condition header like 
      \`If-Match\`, \`If-None-Match\`, \`If-Modified-Since\`
      and \`If-Unmodified-Since\`. 
    `,
  },
  { statement: `
      A request is a conditional \`GET\` if it specifies
      a \`If-None-Match\` header.
    `,
    value: true,
    explain: `
      The presence of an \`If-None-Match\` header makes a \`GET\`
      request conditional, returning a full response body only if the
      resource's etag value does not match that provided as the value
      of the \`If-None-Match\` header.
    `,
  },
  { statement: `
      A request is a conditional \`GET\` if it specifies
      a \`If-Modified-Since\` header.
    `,
    value: true,
    explain: `
      The presence of an \`If-Modified-Since\` header makes a \`GET\`
      request conditional, returning a full response body only if the
      resource's last modification time is later than the value 
      specified in the \`If-Modified-Since\` header.
    `,
  },
];

module.exports = CacheTrueFalse;
Object.assign(CacheTrueFalse, {
  id: 'cacheTrueFalse',
  title: 'HTTP Caching',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new CacheTrueFalse().qaText());
}

