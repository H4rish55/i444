import { AuthDao, makeAuthDao } from './auth-dao.js';
import * as User from './user.js';

import {Errors as E} from 'cs444-js-utils';

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
    if (chk.isOk === false) return chk.into<User.RegisteredUser>();
    const user = chk.val;
    const passwordHash = await bcrypt.hash(user.password, this.rounds);
    const u = { passwordHash, ...user };
    delete u.password; delete u.confirmPassword;
    return await this.dao.addUser(u);
  }

  async login(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    const chk = User.validate<User.Login>('login', params);
    if (chk.isOk === false) return chk.into<User.RegisteredUser>();
    const { email, password } = chk.val;
    const u = await this.dao.getByEmail(email);
    if (!u.isOk || !(await bcrypt.compare(password, u.val.passwordHash))) {
      return E.errResult(E.errs(`invalid login`, 'BAD_LOGIN'));
    }
    else {
      const { passwordHash, ...user } = u.val;
      return E.okResult(user);
    }
  }

  async get(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser, E.Errs>> 
  {
    const chk = User.validate<User.UserId>('get', params);
    if (chk.isOk === false) return chk.into<User.RegisteredUser>();
    const { id } = chk.val;
    return await this.dao.getByUserId(id);
  }

  async query(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser[], E.Errs>>
  {
    const chk = User.validate<User.Query>('query', params);
    if (chk.isOk === false) return chk.into<User.RegisteredUser[]>();
    const result = await this.dao.query(chk.val);
    return result;
  }

  async remove(params: Record<string, any>) : Promise<E.Result<void, E.Errs>> {
    const chk = User.validate<User.UserId>('remove', params);
    if (chk.isOk === false) return chk.into<void>();
    const { id } = chk.val;
    return await this.dao.remove(id);
  }

  async update(params: Record<string, any>)
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    const chk = User.validate<User.UpdateUser>('update', params);
    if (chk.isOk === false) return chk.into<User.RegisteredUser>();
    return await this.dao.update(chk.val);
  }

  async clear() {
    return await this.dao.clear();
  }

} // class AuthServices

const DEFAULT_BCRYPT_ROUNDS = 10;

