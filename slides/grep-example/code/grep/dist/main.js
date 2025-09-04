#!/usr/bin/env node
//library import paths without /'s.
import Path from 'path';
import process from 'process';
import fs from 'fs';
//project import paths must have /'s.
import { jgrep } from './jgrep.js';
import { makeRegex } from './utils.js';
function abort(...args) {
    console.error(...args); //... spreads args
    process.exit(1);
}
function main() {
    if (process.argv.length < 4) { //[nodePath, progPath, ...realArgs] = argv
        abort('usage: %s REGEX FILE...', Path.basename(process.argv[1])); //basename
    }
    const regex = makeRegex(process.argv[2]);
    if (regex === null)
        abort("bad regex '%s'", process.argv[2]);
    const paths = process.argv.slice(3);
    for (const path of paths) {
        grepPath(regex, path);
    }
}
function grepPath(regex, path) {
    try {
        const content = fs.readFileSync(path, 'utf8');
        const coordMatches = jgrep(regex, content);
        coordMatches.forEach(({ lineIndex, matches, line }) => {
            matches.forEach(([colN, _]) => {
                console.log(`${path}:${lineIndex + 1}:${colN}: ${line}`);
            });
        });
    }
    catch (err) {
        console.error(`cannot read ${path}: ${err}`);
    }
}
main();
//# sourceMappingURL=main.js.map