import hljs from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js';

import nodeRepl from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/node-repl.min.js';
hljs.registerLanguage('node-repl', nodeRepl);

import prolog from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/prolog.min.js';
hljs.registerLanguage('prolog', prolog);

import haskell from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/haskell.min.js';
hljs.registerLanguage('haskell', haskell);

import erlang from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/erlang.min.js';
hljs.registerLanguage('erlang', erlang);

import elixir from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/elixir.min.js';
hljs.registerLanguage('elixir', elixir);

import lisp from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/lisp.min.js';
hljs.registerLanguage('lisp', lisp);

import scheme from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/scheme.min.js';
hljs.registerLanguage('scheme', scheme);

import ebnf from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/ebnf.min.js';
hljs.registerLanguage('ebnf', ebnf);

document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('.hljs').forEach((el) => {
    hljs.highlightElement(el);
  });
});

