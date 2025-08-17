'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2022-11-01 13:59:33 umrigar>';

const {ChoiceQuestion, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

class DomEvents extends ChoiceQuestion {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.addQuestion(QUESTION);
    this.choice(({seq}) => choice(seq));
    this.choice(({seq}) => choice(phaseExchange(seq)));
    this.choice(({seq}) => choice(perturb(seq, 1)));
    this.choice(({seq}) => choice(perturb(seq, 2)));
    this.choice(({seq}) => choice(perturb(seq, 3)));
    this.freeze();
    this.addExplain(explain(this.params));
    this.makeContent();
  }

}

module.exports = DomEvents
Object.assign(DomEvents, {
  id: 'domEvents',
  title: 'DOM Events',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

function explain(params) {
  const {word, seq} = params;
  const endId = (word === 'span') ? 'span1' : 'para1';
  const stopIndex = seq.findIndex(s => s.stop);
  const stopText =
	(stopIndex < 0)
	? `Since there are not calls to stop propagation of the event, 
           the event bubbles all the way back up.`
        : `Since the .~stopPropagation()~ function is called on the event
           at \`${seq[stopIndex].label}\`, the output stops propagating
           after printing \`${seq[stopIndex].label}\`.`
  return `
    When the word \`${word}\` is clicked, the \`click\` event will
    be capture-propagated down from \`div1\` to \`${endId}\`
    and then bubbled up from \`${endId}\` to \`div1\`.  ${stopText}
  `;
}

function perturb(seq, n) {
  const out = seq.map(o => Object.assign({}, o));
  const len = out.length;
  let index = out.findIndex(o => o.stop);
  if (index < 0) index = 0;
  for (let i = index; i < len && i < index + n; i++) {
    out[i].stop = false;
  }
  out[(index + n)%len].stop = true;
  //[seq, n, out].forEach(e => console.log(e)); console.log('');
  return out;
}

function phaseExchange(seq) {
  const len = seq.length/2;
  return seq.slice(len).concat(seq.slice(0, len));
}

function choice(seq) {
  const out = output(seq);
  return `
    The output will be

    \`\`\`
     ${out}
    \`\`\`
  `;
}
function output(seq) {
  let out = '';
  for (const spec of seq) {
    out += `${spec.label}\n`;
    if (spec.stop) break;
  }
  return out;
}

const QUESTION = `
Given the following HTML fragment:

\`\`\`
    <div id="div1">
      <p id="para1"> Here is a <span id="span1">span</span></p>
    </div>
\`\`\`

and the following script set up to operate on the page containing
the above fragment:

~~~
//addEventListener(event, handler, isCapture) adds handler for
//event.  The handler is added to the capture phase if isCapture 
//is truthy, otherwise it is added to the bubble phase.

function f(label, stop) {
  return (event) => {
    console.log(label);
    if (stop) event.stopPropagation();
  };
}

document.querySelector('#div1').
  addEventListener('click', f('div1-capture', #{div1CaptureStop}),
                   true);
document.querySelector('#para1').
  addEventListener('click', f('para1-capture', #{para1CaptureStop}),
                   true);
document.querySelector('#span1').
  addEventListener('click', f('span1-capture', #{span1CaptureStop}),
                   true);


document.querySelector('#span1').
  addEventListener('click', f('span1-bubble', #{span1BubbleStop}));
document.querySelector('#para1').
  addEventListener('click', f('para1-bubble', #{para1BubbleStop}));
document.querySelector('#div1').
  addEventListener('click', f('div1-bubble', #{div1BubbleStop}));
                   
~~~

what will be logged on the console assuming that the mouse
is clicked at the word \`#{word}\`?
`;

const PARAMS = [
  { word: () => Rand.choice(['Here', 'span']),
    div1BubbleStop: () => Rand.choice([false, false, true ]),
    para1CaptureStop: () => Rand.choice([false, false, false, false, true ]),
    para1BubbleStop: () => Rand.choice([false, true ]),
    span1CaptureStop: () => Rand.choice([false, false, false, true ]),
    span1BubbleStop: () => Rand.choice([false, true ]),
  },
  { _type: 'nonRandom',
    div1CaptureStop: () => false
  },
  { _type: 'nonRandom',
    seq: ({word, div1CaptureStop, div1BubbleStop,
	   para1CaptureStop, para1BubbleStop,
	   span1CaptureStop, span1BubbleStop}) =>
    (word === 'span')
    ? [
      { label: 'div1-capture', stop: div1CaptureStop, },
      { label: 'para1-capture', stop: para1CaptureStop, },
      { label: 'span1-capture', stop: span1CaptureStop, },
      { label: 'span1-bubble', stop: span1BubbleStop, },
      { label: 'para1-bubble', stop: para1BubbleStop, },
      { label: 'div1-bubble', stop: div1BubbleStop, },
    ]
    : [
      { label: 'div1-capture', stop: div1CaptureStop, },
      { label: 'para1-capture', stop: para1CaptureStop, },
      { label: 'para1-bubble', stop: para1BubbleStop, },
      { label: 'div1-bubble', stop: div1BubbleStop, },
    ],
  },
];

if (process.argv[1] === __filename) {
  console.log(new DomEvents().qaText());
}

/*
<!DOCTYPE html>
<html>
  <body>
    <h1> DOM Events Test </h1>

    <div id="div1">
      <p id="para1"> Here is a <span id="span1">span</span></p>
    </div>

    <script>
      const EVENTS = {
        div1: [
          { type: 'capture', },
          { type: 'bubble', },
        ],  
        para1: [
          { type: 'capture', stop: true, },
          { type: 'bubble', stop: true, },
        ],  
        span1: [
          { type: 'capture', },
          { type: 'bubble', },
        ],  
      };

      const EVENT = 'click';

      for (const [id, specs] of Object.entries(EVENTS)) {
        for (const spec of specs) {
          const type = spec.type || 'bubble';
          const useCapture = type === 'capture';
          const label = `${id}-${type}`;
          const stop = spec.stop || false;
          const fn = (ev) => {
            console.log(label);
            if (stop) ev.stopPropagation();
          };
          document.getElementById(id).
            addEventListener(EVENT, fn, useCapture);
        }
      }
    </script>

  </body>
</html>
*/
