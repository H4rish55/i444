import assert from 'node:assert';
import * as tst from 'node:test';

tst.suite('suite with before/after', () => {

  let data;
  tst.before(() => {
    console.log("suite before");
    data = { secret: 42 };
  });

  tst.after(() => console.log('suite after'));

  tst.beforeEach(async () => {
    console.log('beforeEach');
  });

  tst.test('check data', () => {
    assert.equal(data.secret, 42, "expect key to be 42");
  });
    
  tst.test('check computation', () => {
    assert.equal(1 + 1, 2, "expect 1 + 1 to be 2");
  });


});
