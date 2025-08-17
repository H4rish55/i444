'use strict';

const TIMESTAMP = 'Time-stamp: <2020-12-07 01:32:41 umrigar>';

const {TrueFalseQuestion, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class ReactTrueFalse extends TrueFalseQuestion {

  constructor(params) {
    super(params, STATEMENTS);
  }

}

const STATEMENTS = [
  { statement: `
      A react component can change its \`props\`.
    `,
    value: false,
    explain: `
      Component properties are immutable.
    `,
  },
  { statement: `
      If a react component does not have any state then it cannot
      be defined using an ES6 \`class\`.
    `,
    value: false,
    explain: `
      A react component without state can be defined using a 
      JavaScript function instead of using an ES6 \`class\`, but
      it would not be wrong to use an ES6 \`class\`.
    `,
  },
  { statement: `
      If a react component tracks the value of an input widget
      in its \`state\`, then when the value of the input widget
      changes to \`val\`, it is possible to update the component's
      state using a simple assignment \`state = val\`.
    `,
    value: false,
    explain: `
      All state changes must be made using the \`setState()\` 
      method.  This ensures that react is informed about state
      changes so that it can decide whether it needs to re-render
      the component.
    `,
  },
  { statement: `
    Accessing a property \`s\` of a react component's state must
    be done using \`this.getState(s)\`.
    `,
    value: false,
    explain: `
      There is no \`getState()\` method; reading a property of
      a component's state can be done directly using an expression
      like \`state.s\`.
    `,
  },
  { statement: `
      If the class \`C\` implementing a react component has a method
      \`m()\` and \`c = <C />\`, then it is possible to invoke the
      method using the expression \`c.m()\`.
    `,
    value: false,
    explain: `
      When \`c\` is set to \`<C />\`, it is not an instance of
      \`class C\` and does not have any \`m()\` method.  Actually,
      \`c\` will wrap an instance of \`class C\`, but the wrapper
      does not delegate method calls to the underlying instance.
    `,
  },
  { statement: `
      Given the following function defining a react component

      ~~~
      function Fact(props) {
       function f(n) { return n <= 1 ? 1 : n*f(n-1); }
       let rows = [];
       for (let i = 1; i <= props.n; i++) {
         rows.push(<tr><td>{i}</td><td>{f(i)}</td></tr>);
       }
       return (
         <table>
           <tr><th>N</th><th>Factorial(N)</th></tr>
           {rows}
         </table>
       );
      }
      ~~~

      then the JSX expression \`<Fact n="5"/>\` will
      render a table containing the first 5 factorials.
    `,
    value: false,
    explain: `
      Its close, but no cigar.  Since \`rows\` is a list of JSX
      elements, each element must have a distinct \`key\` element
      which can be used by react to identify different elements.  The
      simplest solution is to simply using \`i\` as the \`key\` for
      each row by changing the statement which pushes to \`rows\` as
      follows:

      ~~~~
         rows.push(<tr key={i}><td>{i}</td><td>{f(i)}</td></tr>);
      ~~~~

      as well as adding a \`key\` to the header row.

    `,
  },
  { statement: `
      When the state of a react component needs to be initialized from
      a web service, the state should be initialized by calling the
      web service in the component's \`constructor\`.
    `,
    value: false,
    explain: `
      The web service call is likely to be asynchronous and asynchronous
      calls should not be made from within a \`constructor\`.  Such 
      initialization should be deferred to the \`componentDidMount()\`
      lifecycle method.
    `,
  },
  { statement: `
      If an event handler for a react component needs to refer to
      the component, then the component can be accessed from within
      the handler using the \`target\` property of the \`event\`
      argument to the handler.
    `,
    value: false,
    explain: `
      The \`event.target\` refers to the DOM element for which the
      handler is being invoked, not the react component.  Instead
      \`this\` is used to refer to the component as long as it
      has been pre-bound to the component using code like

      ~~~
      this.handler = this.handler.bind(this);
      ~~~

      in the component's constructor.
    `,
  },
  { statement: `
      Since the \`props\` of a react component correspond to HTML
      attributes, their values are restricted to \`String\`'s.
    `,
    value: false,
    explain: `
      The \`props\` of a react component can be arbitrary JavaScript
      objects.  This makes it possible to even pass react components
      or functions via \`props\`.
    `,
  },
  { statement: `
      A JSX expression can contain arbitrary HTML markup.
    `,
    value: false,
    explain: `
      A JSX expression is not HTML; in fact, if it starts
      with a tag, then it must meet the requirements for
      a well-formed XML fragment which requires all tags
      to be properly nested.  This is not true for HTML.
      For example, the valid HTML fragment \`<br>\` is
      not a valid JSX expression and must be represented
      as \`<br/>\`.
    `,
  },

  { statement: `
      The \`props\` of a react component should be treated as immutable 
      by code within the component.
    `,
    value: true,
    explain: `
      Changing a component's \`props\` by code within the component is
      likely to result in strange behavior.
    `,
  },
  { statement: `
      A react component which does not have any state can be defined
      using a JavaScript function.
    `,
    value: true,
    explain: `
      A stateless react component can indeed be defined using a
      JavaScript function which should return the JSX rendering
      for the component.
    `,
  },
  { statement: `
      The names of all user-defined react components must start
      with an upper-case character.
    `,
    value: true,
    explain: `
      The names of all user-defined react components must start
      with an upper-case character so that react can distinguish
      them from components corresponding to HTML elements.     
    `,
  },
  { statement: `
      If an event handler for a react component needs to refer to
      the component, then it is necessary to ensure that \`this\`
      is bound to the component before the handler is invoked.
    `,
    value: true,
    explain: `
      A common idiom for ensuring this is to explicitly bind the handler
      to the component in the component constructor using code like

      ~~~
      this.handler = this.handler.bind(this);
      ~~~
    `,
  },
  { statement: `
      If the state of a react component needs to be updated, then the
      update must be made using the component's \`setState()\` method.
    `,
    value: true,
    explain: `
      All state changes must be made using the \`setState()\` 
      method.  This ensures that react is informed about state
      changes so that it can decide whether it needs to re-render
      the component.
    `,
  },
  { statement: `
      The \`props\` of a react component can be arbitrary JavaScript
      objects.
    `,
    value: true,
    explain: `
      This makes it possible to even pass react components or
      functions via \`props\`.
    `,
  },
  { statement: `
      A JSX expression must contain properly nested tags.
    `,
    value: true,
    explain: `
      If a JSX expression starts with a tag, then it must
      meet the restrictions for a well-formed XML fragment,
      i.e. all tags must be properly nested.
    `,
  },
  { statement: `
      The react implementation takes care to not re-render 
      components unless absolutely necessary.
    `,
    value: true,
    explain: `
      The react implementation uses a virtual-DOM to ensure
      minimal re-rendering.  This is necessary to obtain
      reasonable performance in apps with many 1000's of components.
    `,
  },
];

module.exports = ReactTrueFalse;
Object.assign(ReactTrueFalse, {
  id: 'reactTrueFalse',
  title: 'React',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});



if (process.argv[1] === __filename) {
  console.log(new ReactTrueFalse().qaText());
}
