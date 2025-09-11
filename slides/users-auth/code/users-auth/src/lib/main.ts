import Path from 'path';

import { makeAuthDao } from './auth-dao.js';
import { AuthServices, makeAuthServices } from './auth-services.js';

import * as E from './errors.js';

export default async function main(args: string[]) {
  if (args.length !== 3) {
    usage();
  }
  let services;
  try {
    const [dbUrl, cmd, paramsJson] = args;
    if (CMDS.indexOf(cmd) < 0) {
      panic(`invalid command ${cmd}; must be one of ${CMDS.join('|')}`);
    }
    const servicesResult = await makeAuthServices(dbUrl);
    if (!servicesResult.isOk) panic(servicesResult);
    services = servicesResult.val;
    let params;
    try {
      params = JSON.parse(paramsJson);
    }
    catch (err) {
      const msg = (err as Error).message;
      panic(`bad data json ${paramsJson}; ${msg}`);
    }
    const result = await dispatch(services, cmd, params);
    if (result.isOk === true)  {
      console.log(result.val);
    }
    else {
      panic(result.err);
    }
  }
  catch (e) {
    panic(e);
  }
  finally {
    if (services) await services.close();
  }
}

async function dispatch(services: AuthServices, cmd: string,
		        params: Record<string, any>)
  : Promise<E.Result<any, E.Errs>>
{
  switch (cmd) {
    case 'register':
      return await services.register(params);
    case 'login':
      return await services.login(params);
    case 'get':
      return await services.get(params);
    case 'query':
      return await services.query(params);
    case 'update':
      return await services.update(params);
    case 'remove':
      return await services.remove(params);
    case 'clear':
      return await services.clear();
    default:
      console.assert(false, `impossible command ${cmd}`);	
  }
}

const CMDS = [
  'register', 'login', 'get', 'query', 'update', 'remove', 'clear'
];
function usage() {
  panic(`usage: ${Path.basename(process.argv[1])} DB_URL (${CMDS.join('|')}) 
        PARAMS_JSON`.replace(/\s\s+/g, ' '));
}

function panic(err: any) : never {
  console.error(err.toString());
  process.exit(1);
}

