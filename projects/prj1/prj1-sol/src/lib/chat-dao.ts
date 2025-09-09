import * as mongo from 'mongodb';

import * as T from './chat-types.js';
import { Errors as E } from 'cs444-js-utils';

export async function makeChatDao(dbUrl: string) {
  return await ChatDao.make(dbUrl);
}

//options for new MongoClient()
const MONGO_OPTIONS = {
  //ignoreUndefined: true,  //ignore undefined fields in queries
};




//always store external id fields as mongo _id fields
type DbType<IdX, T extends { id: IdX}> = Omit<T, 'id'> & { _id: IdX };

type DbUser = DbType<T.UserIdX, T.User>;

// TODO: define many more types

export class ChatDao {
  //called by below static make() factory function with
  //parameters to be cached in this instance.
  constructor(private readonly client: mongo.MongoClient
	      //TODO: other args, typically collections
	     ) {
  }

  //static factory function; should do all async operations like
  //getting a connection and creating indexes.  Finally, it
  //should use the constructor to return an instance of this class.
  //returns error code DB on database errors.
  static async make(dbUrl: string) : Promise<E.Result<ChatDao, E.Errs>> {
    try {
      const client =
	await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();

      // TODO: create collections and indexes
      const dao = new ChatDao(client /* TODO: other args */);
      return E.okResult(dao);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }


  //TODO: add DAO methods

}

//error code within mongo exception indicating a violation of a
//uniqueness constraint.
const MONGO_UNIQUE_ERR = 11000;


