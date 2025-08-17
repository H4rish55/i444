'use strict';

const TIMESTAMP = 'Time-stamp: <2018-12-03 14:14:14 umrigar>';

const assert = require('assert');

const {
  ChoiceQuestion, Rand, umtParse,
  emacsTimestampToMillis, functionBodyWithSubsituteParams,
} = require('gen-q-and-a');

class EventLoop extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    for (let i = 0; i < 5; i++) {
      this.choice(({alts}) => altToChoice(alts[i]));
    }
    this.freeze();
    //prog(this.params);
    this.addExplain(explain(this.params));
    this.makeContent();
  }

}

module.exports = EventLoop;
Object.assign(EventLoop, {
  id: 'eventLoop',
  title: 'JavaScript Event Loop',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function explain({d0, d1, d2, d3, perm}) {
  const schedule = makeSchedule(d0, d1, d2, d3);
  let ret = 'Assume that the program starts at time 0:\n\n';
  for (const t of
       Object.keys(schedule).sort((a, b) => (Number(a) - Number(b)))) {
    ret += `*Time ${t}* .;\n`;
    ret += schedule[t].replace(/\n+/g, ' ').trim() + '\n\n';
  }
  ret += `
    Hence the output is

    \`\`\`
    third
    done
    ${perm.join('\n' + ' '.repeat(4))}
    \`\`\`
  `.trim();
  return ret;
}

function makeSchedule(d0, d1, d2, d3) {
  const schedule = { [d0]: '', [d1]: '', [d2]: '', [d2+d3]: '' };
  schedule[0] = `
    The \`first\` timer is started with a timeout of ${d0} seconds.
    The \`second\` timer is started with a timeout of ${d1} seconds.
    The delay loop is started with a delay ${d2} seconds.
  `;
  schedule[d2] += `
    The delay loop terminates with \`third\` printed.
    The \`fourth\` timer is started with a timeout of ${d3} seconds.
    The program prints \`done\`, terminates and returns control to
    the event loop.
  `;
  for (const [time, msg] of
       [[d0, 'first'], [d1, 'second']].sort((a, b)=>a[0]-b[0])) {
    if (time > d2) {
      schedule[time] +=  `
        The \`${msg}\` timer expires and the event is queued.
	Since the event queue is empty the event is handled immediately
        and  \`${msg}\` is printed.
      `;
    }
    else {
      schedule[time] += `
        The \`${msg}\` timer expires; since the delay loop is still
        running the event is queued.
      `;
      schedule[d2] += `
        The \`${msg}\` timeout event is handled and
        \`${msg}\` is printed
      `;
    }
  }
  schedule[d2+d3] += `
    The \`fourth\` timeout expires, the timeout event is handled and
    \`fourth\` is printed.
  `;
  return schedule;
}

function prog({d0, d1, d2, d3}) {

  function print(msg) { console.log(msg); }

  function delayPrint(msg, delayMillis) {
    const end = Date.now() + delayMillis;
    while (true) { //busy wait
      if (Date.now() >= end) {
	print(msg);
	break;
      }
    }
  }

  //aliases
  const [p, dp] = [print, delayPrint];


  setTimeout(() => p('first'), d0*1000);

  setTimeout(() => p('second'), d1*1000);
  
  delayPrint('third', d2*1000);

  setTimeout(() => p('fourth'), d3*1000);

  p('done');

}

function altToChoice(alt) {
  const outs = [ 'third', 'done' ].concat(alt).join('\n' + ' '.repeat(4));
  return `
    The values printed will be

    \`\`\`
    ${outs}
    \`\`\`
  `;
}

const QUESTION = `
What will be the output of the following program?

~~~
${functionBodyWithSubsituteParams(prog)}
~~~
`;

function delays(thirdTime, perm) {
  assert(perm.length === 3);
  const indexes = {};
  perm.forEach((k, i) => indexes[k] = i);
  let fourthTime = 0;
  const timers = {};
  for (let i = 0; i < perm.length; i++) {
    const msg = perm[i];
    if (msg === 'fourth') {
      const fourthTimer = Rand.int(1, 4);
      timers.fourth = fourthTimer;
      fourthTime = thirdTime + fourthTimer;
    }
    else {
      timers[msg] = fourthTime + i + 1;
    }
  }
  return timers;
}

function alts(perm) {
  return [
    perm,
    [ perm[1], perm[0], perm[2] ],
    [ perm[0], perm[2], perm[1] ],
    [ perm[2], perm[1], perm[0] ],
    [ perm[1], perm[2], perm[0] ],
  ];
}

const PARAMS = [
  { d2: () => Rand.int(2, 5),
    perm: () => Rand.permutation(['first', 'second', 'fourth']),
  },
  { delays: ({d2, perm}) => delays(d2, perm), },
  { _type: 'nonRandom',
    d0: ({delays}) => delays['first'],
    d1: ({delays}) => delays['second'],
    d3: ({delays}) => delays['fourth'],
    alts: ({perm}) => alts(perm),
  },
];


if (process.argv[1] === __filename) {
  console.log(new EventLoop().qaText());
}
