import { AuthDao, makeAuthDao } from './auth-dao.js';
import * as User from './user.js';

import * as E from './errors.js';

import bcrypt from 'bcrypt';

export async function makeAuthServices(dbUrl: string,
				       rounds=DEFAULT_BCRYPT_ROUNDS)
  : Promise<E.Result<AuthServices, E.Errs>>
{
  const daoResult = await makeAuthDao(dbUrl);
  if (!daoResult.isOk) return daoResult as E.Result<AuthServices, E.Errs>;
  const dao = daoResult.val;
  return E.okResult(new AuthServices(dao, rounds));
}

export class AuthServices {

  private readonly dao: AuthDao;
  private readonly rounds: number;
  
  constructor(dao: AuthDao, rounds: number) {
    this.dao = dao;
    this.rounds = rounds;
  }

  async close() {
    return this.dao.close();
  }

  async register(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    const chk = User.validate<User.RegisteringUser>('register', params);
    if (!chk.isOk) return chk;
    const user = chk.val;
    const { email } = user;
    const getResult = await this.dao.getByEmail(email);
    if (getResult.isOk === true) {
      const msg = `there is already a user for email ${email}`;
      return E.errResult(E.Errs.err(msg, 'EXISTS'));
    }
    const passwordHash = await bcrypt.hash(user.password, this.rounds);
    const u = { passwordHash, ...user };
    delete u.password; delete u.confirmPassword;
    return await this.dao.add(u);
  }

  async login(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    const chk = User.validate<User.Login>('login', params);
    if (!chk.isOk) return chk;
    const { email, password } = chk.val;
    const u = await this.dao.getByEmail(email);
    if (!u.isOk || !(await bcrypt.compare(password, u.val.passwordHash))) {
      return E.errResult(E.Errs.err(`invalid login`, 'BAD_LOGIN'));
    }
    else {
      return u;
    }
  }

  async get(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser, E.Errs>> 
  {
    const chk = User.validate<User.UserId>('get', params);
    if (!chk.isOk) return chk;
    const { userId } = chk.val;
    return await this.dao.getByUserId(userId);
  }

  async query(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser[], E.Errs>>
  {
    const chk = User.validate<User.Query>('query', params);
    if (!chk.isOk) return chk as E.Result<User.RegisteredUser[], E.Errs>;
    const result = await this.dao.query(chk.val);
    return result;
  }

  async remove(params: Record<string, any>) : Promise<E.Result<void, E.Errs>> {
    const chk = User.validate<User.UserId>('remove', params);
    if (!chk.isOk) return chk as E.Result<void, E.Errs>;
    const { userId } = chk.val;
    return await this.dao.remove(userId);
  }

  async update(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    const chk = User.validate<User.UpdateUser>('update', params);
    if (!chk.isOk) return chk;
    const updates = { ...chk.val };
    delete updates.userId;
    return await this.dao.update(chk.val.userId, updates);
  }

  async clear() {
    return await this.dao.clear();
  }

} // class AuthServices

const DEFAULT_BCRYPT_ROUNDS = 10;

const PW_RES = [ /\d/, /[A-Z]/, /[a-z]/, /\W/ ];
const MIN_PW_LEN = 8;

function chkPassword(pw: string) {
  if (/\s/.test(pw)) {
    return 'password cannot contain whitespace';
  }
  else if (pw.length < MIN_PW_LEN) {
    return `password must contain least ${MIN_PW_LEN} characters`;
  }
  else if (!PW_RES.every(re => re.test(pw))) {
    return `
      password must contain a one-or-more lowercase and uppercase
      alphabetic characters, a digit and a special character.
    `.replace(/\s+/g, ' ');
  }
  return '';
}

/*
const CMDS = {
  register: {
    fields: {
      _id: { chk: () => `_id cannot be specified`,  },
      passwordHash: { chk: () => `passwordHash cannot be specified`,  },
      loginId: {
	chk: /[\w\-]+/,
	required: true,
      },
      firstName: {
	chk: /[\w\-\`\s\.]+/,
	required: true,
      },
      lastName: {
	chk: /[\w\-\`\s\.]+/,
	required: true,
      },
      password: {
	chk: (pw: string) => chkPassword(pw),
	required: true,
      },
    },
  },
  
  login: {
    fields: {
      loginId: { required: true, },
      password: { required: true, },
    },
  },
  
  get: {
    fields: {
      userId: { required: true, },
    },
  },

  query: {
    fields: {
      index: {
	chk: /\d+/,
	valFn: (v: string) => Number(v),
      },
      count: {
	chk: /\d+/,
	valFn: (v: string) => Number(v),
      },
    },
  },	
  
  remove: {
    fields: {
      userId: { required: true, },
    },
  },

  update: {
    fields: {
      userId: {	required: true,  },
      _id: { chk: () => `_id cannot be updated`,  },
      loginId: { chk: () => `loginId cannot be updated`,  },
      passwordHash: { chk: () => `passwordHash cannot be updated`,  },
      firstName: { chk: /[\w\-\`\s]+/,  },
      lastName: { chk: /[\w\-\`\s]+/, },
      password: { chk: (pw: string) => chkPassword(pw),  },
    },
  },
  
};
*/
