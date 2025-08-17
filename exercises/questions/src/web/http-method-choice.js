'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2018-10-29 17:16:50 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class HttpMethodChoice extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice(({indexes, services, methods}) =>
		  description(indexes[i], services[i], methods[i]) + '.');
    }
    this.freeze();
    this.addExplain(`\`${this.params.methods[0]}\` is a good choice 
                     for (#{_0})`);
    const order = this.choiceOrder().slice();
    order.splice(order.indexOf(0), 1);
    for (const i of order) {
      const goodMethods = ALTERNATIVES[this.params.indexes[i]].methods;
      const suffix =
	goodMethods.length > 1 ? 'are better choices' : 'is a better choice';
      let explain = `
        \`${this.params.methods[i]}\` is a poor choice for (#{_${i}}).
        ${goodMethods.map(m => '`'+m+'`').join(' and ')} ${suffix}.
      `;
      this.addExplain(explain);
    }
    this.makeContent();
  }

}

module.exports = HttpMethodChoice
Object.assign(HttpMethodChoice, {
  id: 'httpMethodChoice',
  title: 'HTTP Method Choice',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function description(index, service, method) {
  const desc = ALTERNATIVES[index].description.trim().
    replace(/\#\{service\[0\]\}/g, service[0]).
    replace(/\#\{service\[1\]\}/g, service[1]);
  return `*Task*: ${desc}; *Method*: \`${method}\``;
}

const ALTERNATIVES = [
  { description: `
      Searching a #{service[0]} for a particular #{service[1]}
    `,
    methods: [ 'GET' ],
  }, 
  { description: `
     Adding a new #{service[1]} to a #{service[0]} with the URL for the
     new #{service[1]} chosen by the server
    `,
    methods: [ 'POST' ],
  },
  { description: `
      Adding a new #{service[1]} to a #{service[0]} with the URL for the
      new #{service[1]} chosen by the client
    `,
    methods: [ 'PUT' ],
  }, 
  { description: `
      Updating the information for an existing #{service[1]} 
      in a #{service[0]}
    `,
    methods: [ 'PATCH', 'POST' ],
  },
  { description: `
      Removing all information for a #{service[1]} from a #{service[0]}
    `,
    methods: [ 'DELETE' ],
  },
  { description: `
      Completely replacing the entry for a #{service[1]} in a #{service[0]}
      with a new entry
    `,
    methods: [ 'PUT' ],
  },
  { description: `
      Getting the content-type for a particular #{service[1]} in a 
      #{service[0]}
    `,
    methods: ['HEAD'],
  },
];

const INDEXES = new Array(ALTERNATIVES.length).fill(0).map((_,i) => i);
  
const QUESTION = `
  Which one of the following alternatives associates an
  appropriate HTTP method for the described task?
`;

function otherMethod(methods) {
  let method;
  do {
    method = Rand.choice(METHODS);
  } while (methods.indexOf(method) >= 0);
  return method;
}

const METHODS = [ 'GET', 'HEAD','POST','PATCH', 'PUT', 'DELETE', ];

const SERVICES = [
  [ 'library catalog', 'book' ],
  [ 'people-finder service', 'person' ],
  [ 'e-commerce catalog', 'product' ],
  [ 'blog', 'post' ],
];

const PARAMS = [
  { indexes: () => Rand.choices(5, INDEXES),
    services: () => new Array(5).fill(0).map(_=> Rand.choice(SERVICES)),
  },
  { methods: ({indexes}) => {
      return indexes.map((index, i) => {
        const methods = ALTERNATIVES[index].methods;
        return (i===0) ? Rand.choice(methods) : otherMethod(methods);
      });
    },
  },
];

if (process.argv[1] === __filename) {
  console.log(new HttpMethodChoice().qaText());
}
