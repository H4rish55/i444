#!/usr/bin/env node

const fs = require('fs');
const util = require('util');

//.1.
for (const path of [ './readfile.js',
		     './xxx.js',  ]) {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.error(`cannot read ${path}: ${err}`);
    }
    else {
      console.log(`read ${path}:\n${data.slice(0, 15)}...`);
    }
  });
}

//.2.
function readFilePromise(path) {
  return util.promisify(fs.readFile)(path, 'utf8');
}

for (const path of [ './readfile.js',
		     './xxx.js', ]) {
  readFilePromise(path)
    .then(data => {
      console.log(`read ${path}:\n${data.slice(0, 15)}...`);
    })
    .catch(err => {
      console.error(`cannot read ${path}: ${err}`);
    });
}
