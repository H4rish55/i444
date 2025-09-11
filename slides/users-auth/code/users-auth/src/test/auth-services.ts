//run an in-memory mongodb server
import { MemDbServer, startMemDbServer } from './mem-db-server.js';

import { AuthServices, makeAuthServices } from '../lib/auth-services.js';

import { AuthDao, makeAuthDao } from '../lib/auth-dao.js';

import * as User from '../lib/user.js';

import USERS from './test-users.js';

import { assert, expect } from 'chai';



describe('auth services', () => {

  //mocha will run beforeEach() before each test to set up these variables
  let memDbServer : MemDbServer;
  let services : AuthServices;
  beforeEach(async function () {
    memDbServer = await startMemDbServer();
    const servicesResult = await makeAuthServices(memDbServer.uri);
    assert(servicesResult.isOk === true);
    services = servicesResult.val;
  });

  //mocha runs this after each test; we use this to clean up the DAO.
  afterEach(async function () {
    const closeResult = await services.close();
    assert(closeResult.isOk);
    memDbServer.stop();
  });

  it('should register a user without any errors', async () => {
    const result = await services.register({...USERS[0], ...PW});
    assert(result.isOk === true);
    expect(result.val.userId).to.be.a('string');
  });

  it('adding an existing user should result in EXISTS error', async () => {
    const result1 = await services.register({ ...USERS[0], ...PW, });
    assert(result1.isOk === true);
    expect(result1.val.userId).to.be.a('string');
    const result2 = await services.register({ ...USERS[0], ...PW, });
    assert(result2.isOk === false);
    expect(result2.err.nErrors()).to.equal(1);
    expect(result2.err.at(0).code).to.equal('EXISTS');
  });

  it('adding forbidden fields should result in BAD_REQ errors', async () => {
    for (const prop of [ 'userId', 'passwordHash']) {
      const user = { ...USERS[0], ...PW, [prop]: 'x' };
      const result = await services.register(user);
      assert(result.isOk === false);
      expect(result.err.at(0)?.code).to.equal('BAD_REQ');
    }
  });
  
  it('should login previously registered users without errors', async () => {
    for (const u of USERS) {
      const result = await services.register({ ...u, ...PW});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
    }
    for (const u of USERS) {
      const result = await services.login({email: u.email, password: PASSWORD});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
    }
  });

  it('should retrieve previously registered users without errors', async () => {
    const userIds = [];
    for (const u of USERS) {
      const result = await services.register({...u, ...PW});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
      userIds.push(result.val.userId);
    }
    for (const userId of userIds) {
      const result = await services.get({userId});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
    }
  });

  it('should error NOT_FOUND when retrieving with bad userId', async () => {
    const userIds = [];
    for (const u of USERS) {
      const result = await services.register({...u, ...PW});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
      userIds.push(result.val.userId);
    }
    for (const userId of userIds) {
      const result = await services.get({userId: userId + '1'});
      assert(result.isOk === false);
      expect(result.err.nErrors()).to.equal(1);
      expect(result.err.at(0)?.code).to.equal('NOT_FOUND');
    }
  });

  it('should error NOT_FOUND when removing with bad userId', async () => {
    const userIds = [];
    for (const u of USERS) {
      const result = await services.register({...u, ...PW,});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
      userIds.push(result.val.userId);
    }
    for (const userId of userIds) {
      const result = await services.remove({userId: userId + '1'});
      assert(result.isOk === false);
      expect(result.err.nErrors()).to.equal(1);
      expect(result.err.at(0)?.code).to.equal('NOT_FOUND');
    }
  });

  it('should not login removed users with error BAD_LOGIN', async () => {
    let userIds = [];
    for (const u of USERS) {
      const result = await services.register({...u, ...PW});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
      userIds.push(result.val.userId);
    }
    for (const userId of userIds) {
      const result = await services.remove({userId});
      assert(result.isOk === true);
      expect(result.val).to.be.undefined;
    }
    for (const u of USERS) {
      const result = await services.login({email: u.email, password: PASSWORD});
      assert(result.isOk === false);
      expect(result.err.nErrors()).to.equal(1);
      expect(result.err.at(0)?.code).to.equal('BAD_LOGIN');
    }
  });


  it('should not login unregistered users with error BAD_LOGIN', async () => {
    for (const u of USERS) {
      const result = await services.login({email: u.email, password: PASSWORD});
      assert(result.isOk === false);
      expect(result.err.nErrors()).to.equal(1);
      expect(result.err.at(0)?.code).to.equal('BAD_LOGIN');
    }
  });
  
  it('should error MISSING on missing fields', async () => {
    const fields = [
      'email', 'firstName', 'lastName', 'password', 'confirmPassword'
    ];
    for (const field of fields) {
      const user: Record<string, any> = { ...USERS[0], ...PW,  };
      delete user[field];
      const result = await services.register(user);
      assert(result.isOk === false);
      expect(result.err.nErrors()).to.equal(1);
      expect(result.err.at(0)?.code).to.equal('MISSING');
    }
  });

  it('should error BAD_REQ on bad fields', async () => {
    for (const [field, val] of BAD_VALS) {
      const user : Record<string, any> = { ...USERS[0], ...PW, };
      user[field] = val;
      const result = await services.register(user);
      assert(result.isOk === false);
      expect(result.err.at(0)?.code).to.equal('BAD_REQ');
    }
  });
  
  it('should error BAD_REQ on bad firstName', async () => {
    const user: Record<string, any> = { ...USERS[0], ...PW, };
    user.firstName += '@';
    const result = await services.register(user);
    assert(result.isOk === false);
    expect(result.err.at(0)?.code).to.equal('BAD_REQ');
  });
  

  it('should error BAD_REQ on bad lastName', async () => {
    const user = { ...USERS[0], ...PW,  };
    user.lastName += '&';
    const result = await services.register(user);
    assert(result.isOk === false);
    expect(result.err.at(0)?.code).to.equal('BAD_REQ');
  });
  
  it('should error BAD_REQ on insufficiently strong password', async () => {
    const user = { ...USERS[0], ...PW, };
    user.password = user.password.replace(/\W/g, '');
    const result = await services.register(user);
    assert(result.isOk === false);
    expect(result.err.at(0)?.code).to.equal('BAD_REQ');
  });

  it('should update previously registered users without errors', async () => {
    const users = [];
    for (const u of USERS) {
      const result = await services.register({...u, ...PW});
      assert(result.isOk === true);
      expect(result.val.userId).to.be.a('string');
      users.push(result.val);
    }
    for (const user of users) {
      const update = { userId: user.userId, firstName: 'x' };
      const result = await services.update(update);
      assert(result.isOk === true);
      expect(result.val).to.deep.equal({...user, firstName: 'x'});
    }
  });

  it('updating forbidden fields should result in BAD_REQ errors', async () => {
    const user = { ...USERS[0], ...PW, };
    const result = await services.register(user);
    assert(result.isOk === true);
    const u = result.val;
    expect(u.userId).to.be.a('string');
    for (const prop of [ 'passwordHash']) {
      const update = { userId: u.userId, [prop]: 'x' };
      const result = await services.update(update);
      assert(result.isOk === false);
      expect(result.err.at(0)?.code).to.equal('BAD_REQ');
    }
  });
  
  it('should error BAD_REQ when updating fields with bad values', async () => {
    const user = { ...USERS[0], ...PW, };
    const result = await services.register(user);
    assert(result.isOk === true);
    const u = result.val;
    expect(u.userId).to.be.a('string');
    for (const [field, val] of BAD_VALS) {
      const update: Record<string, any> = { userId: u.userId, [field]: val };
      const result = await services.update(update);
      assert(result.isOk === false);
      expect(result.err.at(0)?.code).to.equal('BAD_REQ');
    }
  });

  it('should query users respecting index and count', async () => {
    const users = [];
    for (const u of USERS) {
      const addResult = await services.register({...u, ...PW});
      assert(addResult.isOk === true);
      expect(addResult.val.userId).to.be.a('string');
      users.push(addResult.val);
    }
    expect(users.length).to.equal(USERS.length);
    const [index, count] = [2, 4];
    const qResult = await services.query({index, count});
    assert(qResult.isOk === true);
    expect(qResult.val).to.have.length(count);
    const sortedUsers =
      [...users].sort((u1, u2) => u1.email.localeCompare(u2.email));
    expect(qResult.val).to.deep.equal(sortedUsers.slice(index, index + count));
  });
  
  it('should query users respecting filter', async () => {
    const users = [];
    for (const u of USERS) {
      const addResult = await services.register({...u, ...PW});
      assert(addResult.isOk === true);
      expect(addResult.val.userId).to.be.a('string');
      users.push(addResult.val);
    }
    expect(users.length).to.equal(USERS.length);
    const filter = { lastName: 'smith' };
    const [index, count] = [1, 2];
    const qResult = await services.query({index, count, ...filter});
    assert(qResult.isOk === true);
    expect(qResult.val).to.have.length(count);
    const expected = 
      users.sort((u1, u2) => u1.email.localeCompare(u2.email))
      .filter(u => u.lastName === 'smith')
      .slice(index, index + count);
    expect(qResult.val).to.deep.equal(expected);
  });


});

const PASSWORD = 'Abcd1234!';

const PW = {
  password: PASSWORD,
  confirmPassword: PASSWORD,
};


const BAD_VALS = [
  [ 'email', 'zerksis+', ],
  [ 'firstName', 'zerksis(' ],
  [ 'lastName', 'zerksis)' ],
  [ 'password', 'Abcd12344', ],
  [ 'password', 'Abcd12!', ],
  [ 'password', 'abcd1234!' ],
  [ 'password', 'abcdefgh!' ],
];
