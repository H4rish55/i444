#!/usr/bin/env nodejs

'use strict';

const fs = require('fs');
const util = require('util');

//.1.
const OUT_WIDTH = 5; 

class Wc {
  constructor (nLines, nWords, nChars) {
    this.nLines = nLines || 0;
    this.nWords = nWords || 0;
    this.nChars = nChars || 0;
  }

  update(wc) {
    this.nLines += wc.nLines;
    this.nWords += wc.nWords;
    this.nChars += wc.nChars;
  }

  //.1a.
  toString() {
    const counts =
      [this.nLines, this.nWords, this.nChars];
    let str = '';
    for (let count of counts) {
      str += String(count).padStart(OUT_WIDTH) + ' ';
    }
    return str;
  }

} //class Wc

//.2.
function wc(text) {
  let nLines = 0, nWords = 0, nChars = 0;
  //const re = /([ \t]+)|(\n+)|(\S+)/g;
  const re = /(\n+)|(\S+)|[^\S\n]+/g;
  let match = null;
  while ((match = re.exec(text)) !== null) {
    nChars += match[0].length;
    if (match[1]) {
      nLines += match[1].length;
    }
    else if (match[2]) {
      ++nWords;
    }
  } //while
  return new Wc(nLines, nWords, nChars);
}

//return Wc object for fName. .3.
function wcFile(fName) {
  let text;
  try {
    text = fs.readFileSync(fName);
  }
  catch (err) {
    console.error(err); process.exit(1);
  }
  return wc(text);
}

//.4.
function main(argv) {
  const firstIndex = 2;
  const count = argv.length - firstIndex;
  if (count <= 0) { //could read stdin instead of error
    console.error(`usage: ${argv[1]} FILE...`);
    process.exit(1);
  }
  //.5.
  const totals = new Wc();
  for (let i = firstIndex; i < argv.length; i++) {
    const fName = argv[i];
    const file_wc = wcFile(fName);
    console.log(`${file_wc.toString()}${fName}`);
    totals.update(file_wc);
  }
  if (count > 1) {
    console.log(`${totals.toString()}total`);
  };
}
//.6.

main(process.argv);
