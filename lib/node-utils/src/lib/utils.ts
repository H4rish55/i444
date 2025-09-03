import fs from 'fs';
import Path from 'path';
import util from 'util';

const { promisify } = util;

import { Errors as E } from 'cs444-js-utils';

export async function readJson(path: string) : Promise<E.Result<any>> {
  let text : string;
  try {
    text = await promisify(fs.readFile)(path, 'utf8');
  }
  catch (e) {
    return E.errResult(E.err(`unable to read ${path}: ${e.message}`, 'E_IO'));
  }
  try {
    if (path.endsWith('.jsonl')) {
      text = '[' + text.trim().replace(/\n/g, ',') + ']';
    }
    return E.okResult(JSON.parse(text));
  }
  catch (e) {
    const msg = `unable to parse JSON from ${path}: ${e.message}`;
    return E.errResult(E.err(msg, 'E_SYNTAX'));
  }
}

export function cwdPath(path: string) : string {
  return (path.startsWith(Path.sep)) ? path : Path.join(process.cwd(), path);
}

export function scriptName() : string {
  return Path.basename(process.argv[1]);
}

export function abort(msg: string, ...args: any[]) : never {
  const text = msg + args.map(a => JSON.stringify(a)).join(' ');
  console.error(text);
  process.exit(1);
}
