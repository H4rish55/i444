//run an in-memory mongodb server
import { MemDbServer, startMemDbServer } from './mem-db-server.js';

import { AuthDao, makeAuthDao, } from '../lib/auth-dao.js';

import * as User from '../lib/user.js';

import USERS from './test-users.js';

import { assert, expect } from 'chai';

describe('auth DAO', () => {

  //mocha will run beforeEach() before each test to set up these variables
  let memDbServer : MemDbServer;
  let dao: AuthDao;
  
  beforeEach(async function () {
    memDbServer = await startMemDbServer();
    const daoResult = await makeAuthDao(memDbServer.uri);
    assert(daoResult.isOk === true);
    dao = daoResult.val;
  });

  //mocha runs this after each test; we use this to clean up the DAO.
  afterEach(async function () {
    const closeResult = await dao.close();
    assert(closeResult.isOk);
    memDbServer.stop();
  });

  it('should add a user without any errors', async () => {
    const result = await dao.add({...USERS[0], ...HASH});
    assert(result.isOk === true);
    expect(result.val.userId).to.be.a('string');
  });

  it('should retrieve previously added users', async () => {
    let added = [];
    for (const user of USERS) {
      const result = await dao.add({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result1 = await dao.getByEmail(u.email);
      assert(result1.isOk === true);
      expect(result1.val).to.deep.equal(u);
    }
  });

  it('should query users respecting index and count', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.add({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    const [index, count] = [2, 4];
    const qResult = await dao.query({index, count});
    assert(qResult.isOk === true);
    expect(qResult.val).to.have.length(count);
    const sortedUsers =
      [...added].sort((u1, u2) => u1.email.localeCompare(u2.email));
    expect(qResult.val).to.deep.equal(sortedUsers.slice(index, index + count));
  });
  
  it('should query users respecting filter', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.add({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    const filter = { lastName: 'smith' };
    const [index, count] = [1, 2];
    const qResult = await dao.query({index, count, ...filter});
    assert(qResult.isOk === true);
    expect(qResult.val).to.have.length(count);
    const expected =
      added.sort((u1, u2) => u1.email.localeCompare(u2.email))
      .filter(u => u.lastName === 'smith')
      .slice(index, index + count);
    expect(qResult.val).to.deep.equal(expected);
  });

  it('should not retrieve users after clear', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.add({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    await dao.clear();
    for (const u of added) {
      const result1 = await dao.getByUserId(u.userId);
      assert(result1.isOk === false);
      expect(result1.err.nErrors()).to.equal(1);
      expect(result1.err.at(0).code).to.equal('NOT_FOUND');
      const result2 = await dao.getByEmail(u.email);
      assert(result2.isOk === false);
      expect(result2.err.at(0).code).to.equal('NOT_FOUND');
    }
  });

  
  it('should not retrieve users after remove', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.add({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result0 = await dao.remove(u.userId);
      assert(result0.isOk === true);
      const result1 = await dao.getByUserId(u.userId);
      assert(result1.isOk === false);
      expect(result1.err.nErrors()).to.equal(1);
      expect(result1.err.at(0).code).to.equal('NOT_FOUND');
      const result2 = await dao.getByEmail(u.email);
      assert(result2.isOk === false);
      expect(result2.err.nErrors()).to.equal(1);
      expect(result2.err.at(0).code).to.equal('NOT_FOUND');
    }
  });

  it('removing users with bad userId should result in NOT_FOUND', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.add({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result = await dao.remove(u.userId + 'x');
      assert(result.isOk === false);
      expect(result.err.nErrors()).to.equal(1);
      expect(result.err.at(0).code).to.equal('NOT_FOUND');
    }
  });  
  
  it('should update users', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.add({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result = await dao.update(u.userId, {firstName: u.firstName + 'x'});
      assert(result.isOk === true);
    }
    for (const u of added) {
      const result = await dao.getByUserId(u.userId);
      assert(result.isOk === true);
      expect(result.val).to.deep.equal({ ...u, firstName : u.firstName + 'x'});
    }
  });  

  it('updating users with bad userId should result in NOT_FOUND', async () => {
    let added = [];
    for (const user of USERS) {
      const result = await dao.add(user);
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result = await dao.update(u.userId + 'x', {firstName: 'x' });
      assert(result.isOk === false);
      expect(result.err.nErrors()).to.equal(1);
      expect(result.err.at(0).code).to.equal('NOT_FOUND');
    }
  });  
  
  it('should allow NOP update for users', async () => {
    let added = [];
    for (const user of USERS) {
      const result = await dao.add(user);
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const [i, u] of added.entries()) {
      const result = await dao.update(u.userId, USERS[i]);
      assert(result.isOk === true);
    }
  });  

});

const HASH = {
  passwordHash: 'abcd121342abedf',
};
