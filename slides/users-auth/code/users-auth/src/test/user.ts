import * as User from '../lib/user.js';

import USERS from './test-users.js';

import { assert, expect } from 'chai';

describe('users', () => {

  
  it('should validate a good registering user', async () => {
    const user = {...USERS[0], ...PW, };
    const result = User.validate('register', user );
    assert(result.isOk === true);
    expect(result.val).to.deep.equal(user);
  });

  it('should not validate a registering user with missing props', async () => {
    const user: Record<string, any> = {...USERS[0], ...PW, };
    for (const k of Object.keys(user)) {
      const u = { ...user };
      delete u[k];
      const result = User.validate('register', u );
      assert(result.isOk === false);
      expect(result.err.at(0).code).to.equal('MISSING');
    }
  });

  
  it('should not validate a registering user with a bad email', async () => {
    const user: Record<string, any> = {...USERS[0], ...PW, };
    user.email = user.email.replace('@', '');
    const result = User.validate('register', user );
    assert(result.isOk === false);
    expect(result.err.at(0).code).to.equal('BAD_REQ');
  });

  
  it('should not validate a registering user with a short pw', async () => {
    const user: Record<string, any> = {...USERS[0], ...PW, };
    user.password = user.password.slice(0, 7);
    const result = User.validate('register', user );
    assert(result.isOk === false);
    expect(result.err.at(0).code).to.equal('BAD_REQ');
  });

  it('should not validate a registering user with a bad pw', async () => {
    const user: Record<string, any> = {...USERS[0], ...PW, };
    user.password = user.password.replace(/\W/g, 'x');
    const result = User.validate('register', user );
    assert(result.isOk === false);
    expect(result.err.at(0).code).to.equal('BAD_REQ');
  });

  it('should not validate a registering user with mismatch pw', async () => {
    const user: Record<string, any> = {...USERS[0], ...PW, };
    user.confirmPassword += 'x';
    const result = User.validate('register', user );
    assert(result.isOk === false);
    expect(result.err.at(0).code).to.equal('BAD_REQ');
  });

  

});

// const USERS = testUsers.map(u0 => {
//   const u = { ...u0 };
//   //u.password = PW; delete u.passwordHash;
//   return u;
// });

const BAD_VALS = [
  [ 'loginId', 'zerksis+', ],
  [ 'firstName', 'zerksis(' ],
  [ 'lastName', 'zerksis)' ],
  [ 'password', 'Abcd12344', ],
  [ 'password', 'Abcd12!', ],
  [ 'password', 'abcd1234!' ],
  [ 'password', 'abcdefgh!' ],
];

const PASSWORD = 'Abcd1234!';
const PW = {
  password: PASSWORD,
  confirmPassword: PASSWORD,
};
