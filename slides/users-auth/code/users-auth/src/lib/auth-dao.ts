import * as mongo from 'mongodb';

import * as E from './errors.js';

import * as User from './user.js';

export async function makeAuthDao(dbUrl: string) {
  return await AuthDao.make(dbUrl);
}

type DbUser = User.RegisteredUser & { _id: string };

//options for new MongoClient()
const MONGO_OPTIONS = {
//  ignoreUndefined: true,  //ignore undefined fields in queries
};

type NextId = { _id: string, count: number };

export class AuthDao {

  constructor(private readonly client: mongo.MongoClient,
	      private readonly users: mongo.Collection<DbUser>,
	      private readonly nextId: mongo.Collection<NextId>) {
  }

  static async make(dbUrl: string) : Promise<E.Result<AuthDao, E.Errs>> {
    try {
      const client =
	await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();
      const users = db.collection<DbUser>(USERS_COLLECTION);
      const nextId = db.collection<NextId>(NEXT_ID_COLLECTION);
      await users.createIndex('email');
      return E.okResult(new AuthDao(client, users, nextId));
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }

  /** close off this DAO; implementing object is invalid after 
   *  call to close() 
   *
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async close() : Promise<E.Result<void, E.Errs>> {
    try {
      await this.client.close();
      return E.okResult(undefined);
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }

  /** add user.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async add(user: User.RegisteringUser)
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    const userId = await this.#nextUserId();
    const registeredUser: User.RegisteredUser = { userId, ...user };
    const dbObj = { ...registeredUser, _id: userId, };
    try {
      const collection = this.users;
      await collection.insertOne(dbObj);
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
    return E.okResult(registeredUser);
  }

  /** retrieve user by userId.
   *
   *  Error codes:
   *    NOT_FOUND: no user found for userId
   *    DB: a database error.
   */
  async getByUserId(userId: string)
    : Promise<E.Result<User.RegisteredUser, E.Errs>> 
  {
    try {
      const collection = this.users;
      const projection = { _id: false };
      const user = await collection.findOne({_id: userId}, {projection});
      if (user) {
	return E.okResult(user);
      }
      else {
	return E.errResult(E.Errs.err(`no user for id '${userId}'`,
				     'NOT_FOUND'));
      }
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }

  /** retrieve user by email.
   *
   *  Error codes:
   *    NOT_FOUND: no user found for userId
   *    DB: a database error.
   */
  async getByEmail(email: string)
    : Promise<E.Result<User.RegisteredUser, E.Errs>> 
  {
    try {
      const collection = this.users;
      const projection = { _id: false };
      const user = await collection.findOne({email}, {projection});
      if (user) {
	return E.okResult(user);
      }
      else {
	return E.errResult(E.Errs.err(`no user for id '${email}'`,
				     'NOT_FOUND'));
      }
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }

  /** return list of all users which match filter.  It is not an error
   *  if no users match.
   *
   *  Error codes:
   *    DB: a database error.
   */
  async query(filter: User.Query)
  : Promise<E.Result<User.RegisteredUser[], E.Errs>>
  {
    try {
      const index: number = filter.index ?? 0;
      const count: number = filter.count ?? DEFAULT_COUNT;
      const collection = this.users;
      const q: User.Query & { _id?: string } = { ...filter };
      if (q.index !== undefined) delete q.index;
      if (q.count !== undefined) delete q.count;
      if (q.userId) q._id = q.userId;
      const projection = { _id: false };
      const cursor = await collection.find(q, {projection});
      const entries = await cursor
        .sort({email: 1}).skip(index).limit(count).toArray();
      return E.okResult(entries);
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }

  /** remove user specified userId.
   *
   *  Error codes:
   *    NOT_FOUND: no user found for userId
   *    DB: a database error.
   */
  async remove(userId: string) : Promise<E.Result<void, E.Errs>> {
    try {
      const collection = this.users;
      const delResult = await collection.deleteOne({_id: userId});
      if (!delResult || delResult.deletedCount === 0) {
	const msg = `no user for userId ${userId}`;
	return E.errResult(E.Errs.err(msg, 'NOT_FOUND'));
      }
      if (delResult.deletedCount !== 1) {
	const msg = `expected 1 deletion; got ${delResult.deletedCount}`;
	return E.errResult(E.Errs.err(msg, 'DB'));
      }
      else {
	return E.okResult(undefined);
      }
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }

  /** add updates to user specified userId.
   *
   *  Error codes:
   *    NOT_FOUND: no user found for userId
   *    DB: a database error.
   */
  async update(userId: string, updates: {[key:string]: string})
    : Promise<E.Result<User.RegisteredUser, E.Errs>>
  {
    try {
      const collection = this.users;
      const updateOp = {$set: updates};
      const updateOpts = {
	projection: { _id: false },
	returnDocument: mongo.ReturnDocument.AFTER
      };
      const updateResult =
	await collection.findOneAndUpdate({_id: userId}, updateOp, updateOpts);
      if (!updateResult) {
	return E.errResult(E.Errs.err(`no user for ${userId}`, 'NOT_FOUND'));
      }
      else {
	return E.okResult(updateResult);
      }
    }
    catch (err) {
      console.error(err);
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }


  /** clear all data in this DAO.
   *
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async clear() : Promise<E.Result<void, E.Errs>> {
    try {
      await this.users.deleteMany({});
      return E.okResult(undefined);
    }
    catch (err) {
      return E.errResult(E.Errs.err((err as Error).message, 'DB'));
    }
  }
 
  async #nextUserId() : Promise<string> {
    const query = { _id: NEXT_ID_KEY };
    const update = { $inc: { [NEXT_ID_KEY]: 1 } };
    const options =
      { upsert: true, returnDocument: mongo.ReturnDocument.AFTER };
    const ret =  await this.nextId.findOneAndUpdate(query, update, options);
    const seq = ret[NEXT_ID_KEY];
    return String(seq) + Math.random().toFixed(RAND_LEN).replace(/^0\./, '_');
  }

} //class AuthDao

const USERS_COLLECTION = 'users';
const DEFAULT_COUNT = 5;

const NEXT_ID_COLLECTION = 'nextId';
const NEXT_ID_KEY = 'count';
const RAND_LEN = 2;
