import * as tst from 'node:test';      //use node's builtin test framework

//run an in-memory mongodb server
import { MemDbServer, startMemDbServer } from './mem-db-server.js';

import { AuthDao, makeAuthDao, } from '../lib/auth-dao.js';

import * as User from '../lib/user.js';

import USERS from './test-users.js';

import { assert, expect } from 'chai';

tst.suite('auth DAO', () => {

  //mocha will run beforeEach() before each test to set up these variables
  let memDbServer : MemDbServer;
  let dao: AuthDao;
  
  tst.beforeEach(async function () {
    memDbServer = await startMemDbServer();
    const daoResult = await makeAuthDao(memDbServer.uri);
    assert(daoResult.isOk === true);
    dao = daoResult.val;
  });

  //mocha runs this after each test; we use this to clean up the DAO.
  tst.afterEach(async function () {
    const closeResult = await dao.close();
    assert(closeResult.isOk);
    memDbServer.stop();
  });

  tst.test('should add a user without any errors', async () => {
    const result = await dao.addUser({...USERS[0], ...HASH});
    assert(result.isOk === true);
    expect(result.val.id).to.be.a('string');
  });

  tst.test('should retrieve previously added users', async () => {
    let added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result1 = await dao.getByEmail(u.email);
      assert(result1.isOk === true);
      const { passwordHash, ...user1 } = result1.val;
      expect(user1).to.deep.equal(u);
    }
  });

  tst.test('should query users respecting index and count', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    const [offset, count] = [2, 4];
    const qResult = await dao.query({offset, count});
    assert(qResult.isOk === true);
    expect(qResult.val).to.have.length(count);
    const sortedUsers =
      [...added].sort((u1, u2) => u1.email.localeCompare(u2.email));
    expect(qResult.val)
      .to.deep.equal(sortedUsers.slice(offset, offset + count));
  });
  
  tst.test('should query users respecting filter', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    const filter = { lastName: 'smith' as User.NameX };
    const [offset, count] = [1, 2];
    const qResult = await dao.query({offset, count, ...filter});
    assert(qResult.isOk === true);
    expect(qResult.val).to.have.length(count);
    const expected =
      added.sort((u1, u2) => u1.email.localeCompare(u2.email))
      .filter(u => u.lastName === 'smith')
      .slice(offset, offset + count);
    expect(qResult.val).to.deep.equal(expected);
  });

  tst.test('should not retrieve users after clear', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    await dao.clear();
    for (const u of added) {
      const result1 = await dao.getByUserId(u.id);
      assert(result1.isOk === false);
      expect(result1.err.errors).to.have.length(1);
      expect(result1.err.errors.at(0).options.code).to.equal('E_NOT_FOUND');
      const result2 = await dao.getByEmail(u.email);
      assert(result2.isOk === false);
      expect(result2.err.errors.at(0).options.code).to.equal('E_NOT_FOUND');
    }
  });

  
  tst.test('should not retrieve users after remove', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result0 = await dao.remove(u.id);
      assert(result0.isOk === true);
      const result1 = await dao.getByUserId(u.id);
      assert(result1.isOk === false);
      expect(result1.err.errors).to.have.length(1);
      expect(result1.err.errors.at(0).options.code).to.equal('E_NOT_FOUND');
      const result2 = await dao.getByEmail(u.email);
      assert(result2.isOk === false);
      expect(result2.err.errors).to.have.length(1);
      expect(result2.err.errors.at(0).options.code).to.equal('E_NOT_FOUND');
    }
  });

  tst.test('remove users with bad userId should get E_NOT_FOUND', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const result = await dao.remove((u.id + 'x') as User.UserIdX);
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_NOT_FOUND');
    }
  });  
  
  tst.test('should update users', async () => {
    const added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const firstName = (u.firstName + 'x') as User.NameX;
      const result = await dao.update({id: u.id, firstName});
      assert(result.isOk === true);
    }
    for (const u of added) {
      const result = await dao.getByUserId(u.id);
      assert(result.isOk === true);
      expect(result.val).to.deep.equal({ ...u, firstName : u.firstName + 'x'});
    }
  });  

  tst.test('updating users with bad userId should result in NOT_FOUND', async () => {
    let added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const u of added) {
      const id = (u.id + 'x') as User.UserIdX;
      const firstName = (u.firstName + 'x') as User.NameX;
      const result = await dao.update({id, firstName});
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_NOT_FOUND');
    }
  });  
  
  tst.test('should allow NOP update for users', async () => {
    let added = [];
    for (const user of USERS) {
      const result = await dao.addUser({...user, ...HASH});
      assert(result.isOk === true);
      added.push(result.val);
    }
    expect(added.length).to.equal(USERS.length);
    for (const [i, u] of added.entries()) {
      const result = await dao.update({id: u.id, ...USERS[i]});
      assert(result.isOk === true);
    }
  });  

});

const HASH = {
  passwordHash: 'abcd121342abedf',
};
