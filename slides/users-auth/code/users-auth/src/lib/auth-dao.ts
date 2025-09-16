import * as mongo from 'mongodb';

import { Errors as E } from 'cs444-js-utils';

import * as User from './user.js';

export async function makeAuthDao(dbUrl: string) {
  return await AuthDao.make(dbUrl);
}

//always store external id fields as mongo _id fields
type DbUser = User.SecuredRegisteringUser & { _id: User.UserIdX };

//options for new MongoClient()
const MONGO_OPTIONS = {
//  ignoreUndefined: true,  //ignore undefined fields in queries
};

const ID_GEN_KEY = 'NextId' as const;
type IdGen = {
  _id: typeof ID_GEN_KEY,
  [ID_GEN_KEY]: number,
};

export class AuthDao {

  constructor(private readonly client: mongo.MongoClient,
	      private readonly users: mongo.Collection<DbUser>,
	      private readonly idGen: mongo.Collection<IdGen>) {
  }

  static async make(dbUrl: string) : Promise<E.Result<AuthDao, E.Errs>> {
    try {
      const client =
	await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();
      const users = db.collection<DbUser>('users');
      await users.createIndex({ email: 1 }, { unique: true });
      const idGen = db.collection<IdGen>('idGen');
      return E.okResult(new AuthDao(client, users, idGen));
    }
    catch (err) {
      return E.errResult(E.errs((err as Error).message, 'DB'));
    }
  }

  /** close off this DAO; implementing object is invalid after 
   *  call to close() 
   *
   *  Error Codes: 
   *    E_DB: a database error was encountered.
   */
  async close() : Promise<E.Result<void, E.Errs>> {
    try {
      await this.client.close();
      return E.okResult(undefined);
    }
    catch (e) {
      return E.errResult(E.errs((e as Error).message, 'E_DB'));
    }
  }

  /** clear all data in this DAO.
   *
   *  Error Codes: 
   *    E_DB: a database error was encountered.
   */
  async clear() : Promise<E.Result<void, E.Errs>> {
    try {
      await this.users.deleteMany({});
      await this.idGen.deleteMany({});
      return E.okResult(undefined);
    }
    catch (e) {
      return E.errResult(E.errs((e as Error).message, 'E_DB'));
    }
  }


  /** add user.
   *  Error Codes: 
   *    E_DB: a database error was encountered.
   *    E_EXISTS: user with same email already exists.
   */
  async addUser(user: User.SecuredRegisteringUser)
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    const id = (await this.nextId()) as User.UserIdX;
    const dbUser = { _id: id, ...user };
    try {
      const collection = this.users;
      await collection.insertOne(dbUser);
    }
    catch (e) {
      if ((e instanceof mongo.MongoError) &&
	  (e.code ?? 0) === MONGO_UNIQUE_ERR) {
	return E.errResult(E.errs(`user email '${user.email}' already exists`,
				 'E_EXISTS'));
      }
      else {
	return E.errResult(E.errs((e as Error).message, 'E_DB'));
      }
    }
    const { passwordHash, ...rest } = user;
    return E.okResult({id, ...rest});
  }

  /** retrieve user by userId.
   *
   *  Error codes:
   *    E_NOT_FOUND: no user found for userId
   *    E_DB: a database error.
   */
  async getByUserId(userId: User.UserIdX)
    : Promise<E.Result<User.RegisteredUser, E.Errs>> 
  {
    try {
      const collection = this.users;
      const projection = { _id: false };
      const user = await collection.findOne({_id: userId}, {projection});
      if (user) {
	const { passwordHash, ...rest } = user;
	return E.okResult({id: userId, ...rest});
      }
      else {
	return E.errResult(E.errs(`no user for id '${userId}'`, 'E_NOT_FOUND'));
      }
    }
    catch (err) {
      return E.errResult(E.errs((err as Error).message, 'E_DB'));
    }
  }

  /** retrieve user by email.
   *
   *  Error codes:
   *    E_NOT_FOUND: no user found for userId
   *    E_DB: a database error.
   */
  async getByEmail(email: string)
    : Promise<E.Result<User.RegisteredUser & { passwordHash: string }, E.Errs>> 
  {
    try {
      const collection = this.users;
      const user = await collection.findOne({email});
      if (user) {
	const { _id, ...rest } = user;
	return E.okResult({id: _id, ...rest});
      }
      else {
	return E.errResult(E.errs(`no user for id '${email}'`, 'E_NOT_FOUND'));
      }
    }
    catch (err) {
      return E.errResult(E.errs((err as Error).message, 'E_DB'));
    }
  }

  /** return list of all users which match filter.  It is not an error
   *  if no users match.
   *
   *  Error codes:
   *    E_DB: a database error.
   */
  async query(filter: User.Query)
  : Promise<E.Result<User.RegisteredUser[], E.Errs>>
  {
    try {
      const offset: number = filter.offset ?? 0;
      const count: number = filter.count ?? User.PAGE_SIZE;
      const collection = this.users;
      const q: User.Query & { _id?: User.UserIdX } = { ...filter };
      if (q.offset !== undefined) delete q.offset;
      if (q.count !== undefined) delete q.count;
      if (q.id) q._id = q.id;
      const cursor = await collection.find(q);
      const entries = await cursor
        .sort({email: 1}).skip(offset).limit(count).toArray();
      return E.okResult(entries.map((e: DbUser) => {
	const { _id, passwordHash, ...rest} = e;
	return { id: _id, ...rest };
      }));
    }
    catch (err) {
      return E.errResult(E.errs((err as Error).message, 'E_DB'));
    }
  }

  /** remove user specified userId.
   *
   *  Error codes:
   *    E_NOT_FOUND: no user found for userId
   *    E_DB: a database error.
   */
  async remove(userId: User.UserIdX) : Promise<E.Result<void, E.Errs>> {
    try {
      const collection = this.users;
      const delResult = await collection.deleteOne({_id: userId});
      if (!delResult || delResult.deletedCount === 0) {
	const msg = `no user for userId '${userId}'`;
	return E.errResult(E.errs(msg, 'E_NOT_FOUND'));
      }
      if (delResult.deletedCount !== 1) {
	const msg = `expected 1 deletion; got ${delResult.deletedCount}`;
	return E.errResult(E.errs(msg, 'E_DB'));
      }
      else {
	return E.okResult(undefined);
      }
    }
    catch (err) {
      return E.errResult(E.errs((err as Error).message, 'E_DB'));
    }
  }

  /** add updates to user specified userId.
   *
   *  Error codes:
   *    E_NOT_FOUND: no user found for userId
   *    E_DB: a database error.
   */
  async update(updates: User.UpdateUser) 
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    try {
      const collection = this.users;
      const { id, ...updates1 } = updates;
      const updateOp = {$set: updates1};
      const updateOpts = {
	projection: { _id: false },
	returnDocument: mongo.ReturnDocument.AFTER
      };
      const updateResult =
	await collection.findOneAndUpdate({_id: id}, updateOp, updateOpts);
      if (!updateResult) {
	return E.errResult(E.errs(`no user for '${id}'`, 'E_NOT_FOUND'));
      }
      else {
	const { passwordHash, ...rest } = updateResult;
	return E.okResult({id, ...rest});
      }
    }
    catch (err) {
      return E.errResult(E.errs((err as Error).message, 'E_DB'));
    }
  }


  // Returns a unique, difficult to guess id.
  // db exceptions caught by callers
  // See discussion in
  // <https://www.mongodb.com/resources/products/fundamentals/generating-globally-unique-identifiers-for-use-with-mongodb>
  private async nextId() : Promise<string> {
    const query = { _id: ID_GEN_KEY };
    const update = { $inc: { [ID_GEN_KEY]: 1 } };
    const options =
      { upsert: true, returnDocument: mongo.ReturnDocument.AFTER };
    const ret =  (await this.idGen.findOneAndUpdate(query, update, options))!;
    const seq = ret[ID_GEN_KEY];
    return String(seq) + Math.random().toFixed(RAND_LEN).replace(/^0\./, '_');
  }
  

} //class AuthDao

//error code within mongo exception indicating a violation of a
//uniqueness constraint.
const MONGO_UNIQUE_ERR = 11000;

const RAND_LEN = 2;
