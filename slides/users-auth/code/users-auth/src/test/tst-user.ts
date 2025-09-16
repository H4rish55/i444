import * as tst from 'node:test';      //use node's builtin test framework

import * as User from '../lib/user.js';

import USERS from './test-users.js';

import { assert, expect } from 'chai';

tst.suite('users', () => {

  tst.suite('register', () => {
    
    tst.test('should register a good user', async () => {
      const user = {...USERS[0], ...PW, };
      const result = User.validate('register', user );
      assert(result.isOk === true);
      expect(result.val).to.deep.equal(user);
    });

    tst.test('should not register a user with missing props', async () => {
      const user: Record<string, any> = {...USERS[0], ...PW, };
      for (const k of Object.keys(user)) {
	const u = { ...user };
	delete u[k];
	const result = User.validate('register', u );
	assert(result.isOk === false);
	expect(result.err.errors.at(0).options.code).to.equal('E_MISSING');
      }
    });

    
    tst.test('should not register a user with a bad email', async () => {
      const user: Record<string, any> = {...USERS[0], ...PW, };
      user.email = user.email.replace('@', '');
      const result = User.validate('register', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not register a user with a bad name', async () => {
      for (const k of [ 'firstName', 'lastName' ]) {
	const user: Record<string, any> = {...USERS[0], ...PW, };
	user[k] += '@';
	const result = User.validate('register', user );
	assert(result.isOk === false);
	expect(result.err.errors).to.have.length(1);
	expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
      }
    });

    
    tst.test('should not register a user with a short pw', async () => {
      const user: Record<string, any> = {...USERS[0], ...PW, };
      user.password = user.confirmPassword = user.password.slice(1);
      const result = User.validate('register', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not register a user with a bad pw', async () => {
      const user: Record<string, any> = {...USERS[0], ...PW, };
      user.password = user.confirmPassword = user.password.replace(/\W/g, 'x');
      const result = User.validate('register', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not register a user with mismatch pw', async () => {
      const user: Record<string, any> = {...USERS[0], ...PW, };
      user.confirmPassword += 'x';
      const result = User.validate('register', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not register a user with a mismatched bad pw', async () => {
      const user: Record<string, any> = {...USERS[0], ...PW, };
      user.password = user.password.replace(/\W/g, 'x');
      const result = User.validate('register', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(2); //bad pw + mismatch pw
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not register a user with forbidden field', async () => {
      for (const f of [ '_id', 'id', 'passwordHash' ]) {
	const user: Record<string, any> = {...USERS[0], ...PW, [f]: 'xxx', };
	const result = User.validate('register', user );
	assert(result.isOk === false);
	expect(result.err.errors).to.have.length(1);
	expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
      }
    });

  });

  tst.suite('login', () => {

    tst.test('should login a good user', async () => {
      const user = { email: USERS[0].email, password: PASSWORD, };
      const result = User.validate('login', user );
      assert(result.isOk === true);
      expect(result.val).to.deep.equal(user);
    });

    tst.test('should not login user with missing props', async () => {
      const user: Record<string, string> =
	{ email: USERS[0].email, password: PASSWORD, };
      for (const k of Object.keys(user)) {
	const u = { ...user };
	delete u[k];
	const result = User.validate('login', u );
	assert(result.isOk === false);
	expect(result.err.errors.at(0).options.code).to.equal('E_MISSING');
      }
    });

    
    tst.test('should not login a user with a bad email', async () => {
      const user = { email: USERS[0].email, password: PASSWORD, };
      user.email = user.email.replace('@', '') as User.EmailX;
      const result = User.validate('login', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    
    tst.test('should not login a user with a short pw', async () => {
      const user = { email: USERS[0].email, password: PASSWORD, };
      user.password = user.password.slice(1);
      const result = User.validate('login', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not login a user with a bad pw', async () => {
      const user = { email: USERS[0].email, password: PASSWORD, };
      user.password = user.password.replace(/\W/g, 'x');
      const result = User.validate('login', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

  });  

  tst.suite('get/remove', () => {

    tst.test('should get/remove with id', async () => {
      for (const k of ['get', 'remove']) {
	const user = { id: '1234', };
	const result = User.validate(k, user);
	assert(result.isOk === true);
      }
    });
	     
    tst.test('should not get/remove with missing id', async () => {
      for (const k of ['get', 'remove']) {
	const user = { userId: '1234', };
	const result = User.validate(k, user );
	assert(result.isOk === false);
	expect(result.err.errors.at(0).options.code).to.equal('E_MISSING');
      }
    });
    
  });
    
  tst.suite('query', () => {
    
    tst.test('empty query is fine', async () => {
      const query = {};
      const result = User.validate('query', query );
      assert(result.isOk === true);
      expect(result.val).to.deep.equal(query);
    });

    tst.test('empty query with valid offset and count is fine', async () => {
      const query = {offset: '15', count: '8', };
      const result = User.validate('query', query );
      console.dir(result, {depth: null});
      assert(result.isOk === true);
      expect(result.val).to.deep.equal({offset: 15, count: 8});
    });

    tst.test('empty query with invalid offset or count fails', async () => {
      for (const k of [ 'offset', 'count' ]) {
	const query = {[k]: '15x', };
	const result = User.validate('query', query );
	assert(result.isOk === false);
	expect(result.err.errors).to.have.length(1);
	expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
      }
    });

    
  });
	  
  tst.suite('update', () => {
    
    tst.test('should update a good user', async () => {
      for (const [k, v] of Object.entries(USERS[0])) {
	const user = { id: '1234', [k]: v };
	const result = User.validate('update', user );
	assert(result.isOk === true);
	expect(result.val).to.deep.equal(user);
      }
    });

    tst.test('should not update a user with a  missing id', async () => {
      const result = User.validate('update', USERS[0] );
      assert(result.isOk === false);
      expect(result.err.errors.at(0).options.code).to.equal('E_MISSING');
    });

    
    tst.test('should not update a user with a bad email', async () => {
      const user: Record<string, any> = {id: '1234', email: 'xATabc.com' };
      const result = User.validate('update', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    
    tst.test('should not update a user with a bad name', async () => {
      for (const k of [ 'firstName', 'lastName' ]) {
	const user = { id: '1234', [k]: 'name@', };
	const result = User.validate('update', user );
	assert(result.isOk === false);
	expect(result.err.errors).to.have.length(1);
	expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
      }
    });

    tst.test('should not update a user with a short pw', async () => {
      const user: Record<string, any> = {id: '1234', ...PW, };
      user.password = user.confirmPassword = user.password.slice(1);
      const result = User.validate('update', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not update a user with a bad pw', async () => {
      const user: Record<string, any> = {id: '1234', ...PW, };
      user.password = user.confirmPassword = user.password.replace(/\W/g, 'x');
      const result = User.validate('update', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not update a user with mismatch pw', async () => {
      const user: Record<string, any> = {id: '1234', ...PW, };
      user.confirmPassword += 'x';
      const result = User.validate('update', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(1);
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not update a user with a mismatched bad pw', async () => {
      const user: Record<string, any> = {id: '1234', ...PW, };
      user.password = user.password.replace(/\W/g, 'x');
      const result = User.validate('update', user );
      assert(result.isOk === false);
      expect(result.err.errors).to.have.length(2); //bad pw + mismatch pw
      expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
    });

    tst.test('should not update a user with forbidden field', async () => {
      for (const f of [ '_id', 'passwordHash' ]) {
	const user: Record<string, any> = {id: '1234', ...PW, [f]: 'xxx', };
	const result = User.validate('update', user );
	assert(result.isOk === false);
	expect(result.err.errors).to.have.length(1);
	expect(result.err.errors.at(0).options.code).to.equal('E_BAD_VAL');
      }
    });

  });

  
});



const PASSWORD = 'aBcd123!';
const PW = {
  password: PASSWORD,
  confirmPassword: PASSWORD,
};
