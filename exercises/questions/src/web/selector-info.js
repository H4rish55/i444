const DOMAINS = [
  { element: 'p', klass: 'chemical', id: 'h2o' },
  { element: 'ul', klass: 'sport', id: 'tennis' },
  { element: 'div', klass: 'algorithm', id: 'quicksort' },
  { element: 'section', klass: 'department', id: 'cs' },
  { element: 'ol', klass: 'course', id: 'cs544' },
  { element: 'article', klass: 'airplane', id: 'N28000' },
  { element: 'blockquote', klass: 'monument', id: 'lincoln-memorial' },
];

const ALTS = {
  idDescendant: `
    selects all elements having a \`class\` attribute \`#{klass}\`
    which are descendants of the \`<#{element}>\` HTML element
    with \`id\` attribute \`#{id}\`
  `,
  idChild: `
    selects all elements having a \`class\` attribute \`#{klass}\`
    which are immediate children of the \`<#{element}>\` HTML
    element with \`id\` attribute \`#{id}\`
  `,
  idSibling: `
    selects all elements having a \`class\` attribute \`#{klass}\` which
    are preceeded by a sibling \`<#{element}>\` HTML element with \`id\`
    attribute \`#{id}\`
  `,
  idImmediateSibling: `
    selects all elements having a \`class\` attribute \`#{klass}\`
    which are preceeded immediately by a sibling \`<#{element}>\`
    HTML element with \`id\` attribute \`#{id}\`
  `,
  idParentDesc: `
    selects the \`<#{element}>\` HTML element having an \`id\`
    attribute of \`#{id}\`which has a descendant element having a \`class\`
    attribute \`#{klass}\`
  `,
  idParentChild: `
    selects the \`<#{element}>\` HTML element having an \`id\` attribute of
    \`#{id}\` which has an immediate child element having a \`class\`
    attribute \`#{klass}\`
  `,
  classDescendant: `
    selects the element having an \`id\` attribute \`#{id}\` which is a
    descendant of the \`<#{element}>\` HTML element with \`class\`
    attribute \`#{klass}\`
  `,
  classChild: `
    selects the element having an \`id\` attribute \`#{id}\` which
    is an immediate child of the \`<#{element}>\` HTML element with
    \`class\` attribute \`#{klass}\`
  `,
  classSibling: `
    selects the element having an \`id\` attribute \`#{id}\` which
    is preceeded by a sibling \`<#{element}>\` HTML element with \`class\`
    attribute \`#{klass}\`
  `,
  classImmediateSibling: `
    selects the element having an \`id\` attribute \`#{id}\` which is
    preceeded immediately by a sibling \`<#{element}>\` HTML element
    with \`class\` attribute \`#{klass}\`
  `,
  classParentDesc: `
    selects the \`<#{element}>\` HTML element having an \`class\`
    attribute of \`#{klass}\` which has a descendant element having an
    \`id\` attribute \`#{id}\`
  `,
  classParentChild: `
    selects the \`<#{element}>\` HTML element having an \`class\`
    attribute of \`#{klass}\` which has an immediate child element
    having an \`id\` attribute \`#{id}\`
  `,
};


//First element in choices is correct answer
const SELECTOR_INFO = {

  '#{element}##{id} .#{klass}': {
    choices: [
      ALTS['idDescendant'],
      ALTS['idChild'],
      ALTS['idSibling'],
      ALTS['idParentDesc'],
      ALTS['idParentChild'],
    ],
    top: 'id',
    explain: `
      The selector \`#{element}##{id}\` selects a HTML element
      with tag \`<#{element}>\` having an \`id\` attribute \`#{id}\`.
      The space between that selector and the following \`.#{klass}\`
      selector establishes the \`#{element}##{id}\` selector as
      the context within which descendant elements with \`class\` attribute
      \`.#{klass}\` are selected.
    `,
  },

  '#{element}##{id} > .#{klass}': {
    choices: [
      ALTS['idChild'],
      ALTS['idDescendant'],
      ALTS['idSibling'],
      ALTS['idParentDesc'],
      ALTS['idParentChild'],
    ],
    top: 'id',
    explain: `
      The selector \`#{element}##{id}\` selects a HTML element with
      tag \`<#{element}>\` having an \`id\` attribute \`#{id}\`.  The
      \`>\` between that selector and the following \`.#{klass}\`
      selector establishes the \`#{element}##{id}\` selector as the
      context within which immediate child elements with \`class\`
      attribute \`.#{klass}\` are selected.
    `,
  },

  '#{element}##{id} ~ .#{klass}': {
    choices: [
      ALTS['idSibling'],
      ALTS['idChild'],
      ALTS['idDescendant'],
      ALTS['idParentDesc'],
      ALTS['idParentChild'],
    ],
    top: 'id',
    explain: `
      The \`~\` between the \`#{element}##{id}\` selector and the 
      following \`.#{klass}\` selector establishes the element selected 
      by the \`#{element}##{id}\` selector as a preceeding sibling
      element for selecting following sibling elements with \`class\`
      attribute \`#{klass}\`.
    `,
  },

  '#{element}##{id} + .#{klass}': {
    choices: [
      ALTS['idImmediateSibling'],
      ALTS['idChild'],
      ALTS['idDescendant'],
      ALTS['idParentDesc'],
      ALTS['idParentChild'],
    ],
    top: 'id',
    explain: `
      The \`+\` between the \`#{element}##{id}\` selector and the
      following \`.#{klass}\` selector establishes the element selected
      by \`#{element}##{id}\` selector as a preceeding sibling 
      element for selecting the immediately following sibling element 
      with  \`class\` attribute \`.#{klass}\`.
    `,
  },

  '#{element}.#{klass} ##{id}': {
    choices: [
      ALTS['classDescendant'],
      ALTS['classChild'],
      ALTS['classSibling'],
      ALTS['classParentDesc'],
      ALTS['classParentChild'],
    ],
    top: 'klass',
    explain: `
      The selector \`#{element}.#{klass}\` selects all HTML elements
      with tag \`<#{element}>\` having a \`class\` attribute \`#{klass}\`.
      The space between that selector and the following \`##{id}\`
      selector establishes the \`#{element}.#{klass}\` selector as
      the context within which a descendant element with \`id\` attribute
      \`##{id}\` is selected.
    `,
  },


  '#{element}.#{klass} > ##{id}': {
    choices: [
      ALTS['classChild'],
      ALTS['classDescendant'],
      ALTS['classSibling'],
      ALTS['classParentDesc'],
      ALTS['classParentChild'],
    ],
    top: 'klass',
    explain: `
      The selector \`#{element}.#{klass}\` selects all HTML elements
      with tag \`<#{element}>\` having a \`class\` attribute
      \`#{klass}\`.  The \`>\` between that selector and the following
      \`##{id}\` selector establishes the \`#{element}.#{klass}\`
      selector as the context within which the immediate child element
      with \`id\` attribute \`##{id}\` is selected.
    `,
  },

  '#{element}.#{klass} ~ ##{id}': {
    choices: [
      ALTS['classSibling'],
      ALTS['classChild'],
      ALTS['classDescendant'],
      ALTS['classParentDesc'],
      ALTS['classParentChild'],
    ],
    top: 'klass',
    explain: `
      The \`~\` between the \`#{element}.#{klass}\` selector and the 
      following \`##{id}\` selector establishes the element selected 
      by the \`#{element}.#{klass}\` selector as a preceeding sibling
      element for selecting following sibling elements with \`id\`
      attribute \`#{id}\`.
    `,
  },

  '#{element}.#{klass} + ##{id}': {
    choices: [
      ALTS['classImmediateSibling'],
      ALTS['classChild'],
      ALTS['classDescendant'],
      ALTS['classParentDesc'],
      ALTS['classParentChild'],
    ],
    top: 'klass',
    explain: `
      The \`+\` between the \`#{element}.#{klass}\` selector and the 
      following \`##{id}\` selector establishes the element selected 
      by the \`#{element}.#{klass}\` selector as a preceeding sibling
      element for selecting the immediately following sibling element 
      with \`id\` attribute \`#{id}\`.
    `,
  },



};

const SELECTORS = Object.keys(SELECTOR_INFO).sort();

module.exports = { SELECTORS, SELECTOR_INFO, DOMAINS };
