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




type DbType<IdX, T extends { id: IdX}> = Omit<T, 'id'> & { _id: IdX };

type DbUser = DbType<T.UserIdX, T.User>;
type DbChatRoom = DbType<T.RoomIdX, T.ChatRoom>;
type DbChatMsg = {
  _id: T.MsgIdX;
  userId: T.UserIdX;
  roomId: T.RoomIdX;
  msg: string;
  creationTime: T.Iso8601X;
};

export class ChatDao {
  //called by below static make() factory function with
  //parameters to be cached in this instance.
  constructor(private readonly client: mongo.MongoClient,
              private readonly users: mongo.Collection<DbUser>,
              private readonly chatRooms: mongo.Collection<DbChatRoom>,
              private readonly chatMsgs: mongo.Collection<DbChatMsg>,
              private nextId: number = 1
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
      const users = db.collection<DbUser>('users');
      const chatRooms = db.collection<DbChatRoom>('chatRooms');
      const chatMsgs = db.collection<DbChatMsg>('chatMsgs');
      await users.createIndex({ 'chatName': 1 }, { unique: true });
      await users.createIndex({ 'email': 1 }, { unique: true });
      await chatRooms.createIndex({ 'roomName': 1 }, { unique: true });
      await chatMsgs.createIndex({ 'userId': 1 });
      await chatMsgs.createIndex({ 'roomId': 1 });
      await chatMsgs.createIndex({ 'creationTime': -1 });
      await chatMsgs.createIndex({ 'msg': 'text' });

      const dao = new ChatDao(client, users, chatRooms, chatMsgs);
      return E.okResult(dao);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  private generateId<IdType extends string>(prefix: string): IdType {
    const counter = this.nextId++;
    const random = Math.floor(Math.random() * 10000);
    return T.brand<IdType>(`${counter}_${random}`);
  }

  /** close this chat DAO */
  async close(): Promise<E.Result<void, E.Errs>> {
    try {
      await this.client.close();
      return E.okResult(undefined);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** clear out all data */
  async clear(): Promise<E.Result<void, E.Errs>> {
    try {
      await this.users.deleteMany({});
      await this.chatRooms.deleteMany({});
      await this.chatMsgs.deleteMany({});
      this.nextId = 1;
      return E.okResult(undefined);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** create a new user and return its newly generated ID */
  async makeUser(user: T.RawUser): Promise<E.Result<T.UserIdX, E.Errs>> {
    try {
      const now = T.brand<T.Iso8601X>(new Date().toISOString());
      const id = this.generateId<T.UserIdX>('user');
      
      const dbUser: DbUser = {
        ...user,
        _id: id,
        creationTime: now,
        lastUpdateTime: now,
      };
      
      await this.users.insertOne(dbUser);
      return E.okResult(id);
    }
    catch (error) {
      if ((error as any).code === MONGO_UNIQUE_ERR) {
        return E.errResult(E.errs('user with chatName or email already exists', 'E_EXISTS'));
      }
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** return user-info for previously created user */
  async getUser(userKey: T.UserKey): Promise<E.Result<T.User, E.Errs>> {
    try {
      let query: any;
      if ('id' in userKey) {
        query = { _id: userKey.id };
      } else if ('chatName' in userKey) {
        query = { chatName: userKey.chatName };
      } else if ('email' in userKey) {
        query = { email: userKey.email };
      }

      const dbUser = await this.users.findOne(query);
      if (!dbUser) {
        return E.errResult(E.errs('user not found', 'E_NOT_FOUND'));
      }

      const user: T.User = {
        ...dbUser,
        id: dbUser._id,
      };
      delete (user as any)._id;

      return E.okResult(user);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** update previously created user specified by id with updates */
  async updateUser(id: T.UserIdX, updates: Partial<T.RawUser>): Promise<E.Result<T.User, E.Errs>> {
    try {
      const now = T.brand<T.Iso8601X>(new Date().toISOString());
      const updateDoc = {
        ...updates,
        lastUpdateTime: now,
      };

      const result = await this.users.findOneAndUpdate(
        { _id: id },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        return E.errResult(E.errs('user not found', 'E_NOT_FOUND'));
      }

      const user: T.User = {
        ...result,
        id: result._id,
      };
      delete (user as any)._id;

      return E.okResult(user);
    }
    catch (error) {
      if ((error as any).code === MONGO_UNIQUE_ERR) {
        return E.errResult(E.errs('user with chatName or email already exists', 'E_EXISTS'));
      }
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** create a new chat room and return its newly generated ID */
  async makeChatRoom(room: T.RawChatRoom): Promise<E.Result<T.RoomIdX, E.Errs>> {
    try {
      const now = T.brand<T.Iso8601X>(new Date().toISOString());
      const id = this.generateId<T.RoomIdX>('room');
      
      const dbRoom: DbChatRoom = {
        ...room,
        _id: id,
        creationTime: now,
        lastUpdateTime: now,
      };
      
      await this.chatRooms.insertOne(dbRoom);
      return E.okResult(id);
    }
    catch (error) {
      if ((error as any).code === MONGO_UNIQUE_ERR) {
        return E.errResult(E.errs('chat room with roomName already exists', 'E_EXISTS'));
      }
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** return info for previously created chat room */
  async getChatRoom(roomKey: T.RoomKey): Promise<E.Result<T.ChatRoom, E.Errs>> {
    try {
      let query: any;
      if ('id' in roomKey) {
        query = { _id: roomKey.id };
      } else if ('roomName' in roomKey) {
        query = { roomName: roomKey.roomName };
      }

      const dbRoom = await this.chatRooms.findOne(query);
      if (!dbRoom) {
        return E.errResult(E.errs('chat room not found', 'E_NOT_FOUND'));
      }

      const room: T.ChatRoom = {
        ...dbRoom,
        id: dbRoom._id,
      };
      delete (room as any)._id;

      return E.okResult(room);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** create a new chat msg and return its newly generated ID */
  async makeChatMsg(chatMsg: T.RawChatMsg): Promise<E.Result<T.MsgIdX, E.Errs>> {
    try {
      const userResult = await this.getUser({ chatName: chatMsg.chatName });
      if (!userResult.isOk) {
        return userResult.into<T.MsgIdX>();
      }
      const userId = userResult.val.id;

      const roomResult = await this.getChatRoom({ roomName: chatMsg.roomName });
      if (!roomResult.isOk) {
        return roomResult.into<T.MsgIdX>();
      }
      const roomId = roomResult.val.id;

      const now = T.brand<T.Iso8601X>(new Date().toISOString());
      const id = this.generateId<T.MsgIdX>('msg');
      
      const dbMsg: DbChatMsg = {
        _id: id,
        userId,
        roomId,
        msg: chatMsg.msg,
        creationTime: now,
      };
      
      await this.chatMsgs.insertOne(dbMsg);
      return E.okResult(id);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  /** return info for previously created chat msgs which satisfy findParams */
  async findChatMsgs(findParams: T.FindParams): Promise<E.Result<T.ChatMsg[], E.Errs>> {
    try {
      const roomResult = await this.getChatRoom({ roomName: findParams.roomName });
      if (!roomResult.isOk) {
        return roomResult.into<T.ChatMsg[]>();
      }
      const roomId = roomResult.val.id;

      let userId: T.UserIdX | undefined;
      if (findParams.chatName) {
        const userResult = await this.getUser({ chatName: findParams.chatName });
        if (!userResult.isOk) {
          return userResult.into<T.ChatMsg[]>();
        }
        userId = userResult.val.id;
      }

      const searchParams = {
        id: findParams.id,
        roomId,
        userId,
        words: findParams.words,
        earliest: findParams.earliest,
        latest: findParams.latest,
        offset: findParams.offset,
        limit: findParams.limit
      };
      
      return await this.findChatMsgsById(searchParams);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

  private async findChatMsgsById(params: any): Promise<E.Result<T.ChatMsg[], E.Errs>> {
    try {
      const { offset = 0, limit = T.PAGE_SIZE, id, words, earliest, latest, roomId, userId } = params;
      
      let query: any = {};
      
      if (roomId) {
        query.roomId = roomId;
      }
      
      if (userId) {
        query.userId = userId;
      }
      
      if (id) {
        query._id = id;
      }
      
      if (words) {
        query.$text = { $search: words };
      }
      
      if (earliest || latest) {
        query.creationTime = {};
        if (earliest) query.creationTime.$gte = earliest;
        if (latest) query.creationTime.$lte = latest;
      }

      const cursor = this.chatMsgs.find(query)
        .sort({ creationTime: -1, msg: 1, _id: 1 })
        .skip(offset)
        .limit(limit);

      const dbMsgs = await cursor.toArray();
      
      const msgs: T.ChatMsg[] = [];
      for (const dbMsg of dbMsgs) {
        const userResult = await this.getUser({ id: dbMsg.userId });
        if (!userResult.isOk) continue;
        
        const roomResult = await this.getChatRoom({ id: dbMsg.roomId });
        if (!roomResult.isOk) continue;
        
        const msg: T.ChatMsg = {
          id: dbMsg._id,
          chatName: userResult.val.chatName,
          roomName: roomResult.val.roomName,
          msg: dbMsg.msg,
          creationTime: dbMsg.creationTime,
        };
        msgs.push(msg);
      }

      return E.okResult(msgs);
    }
    catch (error) {
      return E.errResult(E.errs((error as Error).message, 'E_DB'));
    }
  }

}

//error code within mongo exception indicating a violation of a
//uniqueness constraint.
const MONGO_UNIQUE_ERR = 11000;


