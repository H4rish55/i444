import * as tst from 'node:test';

import * as E from '../lib/errors.js';

import { assert, expect } from 'chai';

//use assert(result.isOk === true) and assert(result.isOk === false)
//to ensure that typescript narrows result correctly


tst.suite('errors', () => {

  tst.test('should return an ok result', () => {
    const val = 42;
    const result = E.okResult(val);
    assert(result.isOk === true);
    expect(result.val).to.equal(val);
  });

  tst.test('should return an error result with default options', () => {
    const error = ERRORS[0];
    const result = E.errResult(E.err(error.message));
    assert(result.isOk === false);
    expect(result.err.message).to.equal(error.message);
  });

  tst.test('should return an error result with specified error code', () => {
    const error = ERRORS[0];
    const result = E.errResult(E.err(error.message, 'BAD'));
    assert(result.isOk === false);
    expect(result.err.message).to.equal(error.message);
    expect(result.err.options).to.deep.equal({code: 'BAD'});
  });

  tst.test('should return an error result with specified code and widget', () => {
    const result = E.errResult(E.err(ERR.message, 'BAD', 'name'));
    assert(result.isOk === false);
    expect(result.err.message).to.equal(ERR.message);
    expect(result.err.options)
      .to.deep.equal({code: 'BAD', widget: 'name'});
  });

  tst.test('should support multiple errors using Errs.', () => {
    const errs = new E.Errs().add(ERRORS[0]).add(ERRORS[1]);
    const result = E.errResult(errs);
    assert(result.isOk === false);
    expect(result.err.errors).to.have.length(2);
    expect(result.err.errors[1].message).to.equal(ERRORS[1].message);
    expect(result.err.errors[1].options).to.deep.equal(ERRORS[1].options);
  });


  tst.test('should return an error result with specified message and options', () => {
    for (const error of ERRORS) {
      const result = E.errResult(E.err(error.message, error.options));
      assert(result.isOk === false);
      expect(result.err.message).to.equal(error.message);
      expect(result.err.options).to.deep.equal(error.options);
    }
  });

  tst.test('should accept an Error as an error result', () => {
    const code = 'SOME_CODE';
    const error = new Error(ERRORS[0].message);
    const result = E.errResult(E.err(error, code));
    assert(result.isOk === false);
    expect(result.err.message).to.equal(ERRORS[0].message);
    expect(result.err.options.code).to.equal(code);
  });


  tst.test('should stringify an Object as an error result', () => {
    const errObj = { toString: () => ERR.message };
    const result = E.errResult(E.err(errObj));
    assert(result.isOk === false);
    expect(result.err.message).to.equal(ERR.message);
  });

  tst.test('should allow chaining functions', () => {
    const result = E.okResult(3)
      .chain((x: number) => E.okResult(x*11))
      .chain((x: number) => E.okResult(x+9));
    assert(result.isOk === true);
    expect(result.val).to.equal(42);
  });

  tst.test('should detect error within chaining functions', () => {
    const e = ERR;
    const result = E.okResult(3)
      .chain((x: number) => E.errResult(E.err(e.message, e.options)))
      .chain((x: number) => E.okResult(x+9));
    assert(result.isOk === false);
    expect(result.err.message).to.equal(e.message);
    expect(result.err.options).to.deep.equal(e.options);
  });

  tst.test('should allow chaining functions using Errs', () => {
    const result = E.okResult<number, E.Errs>(3)
      .chain((x: number) => E.okResult(x*11))
      .chain((x: number) => E.okResult(x+9));
    assert(result.isOk === true);
    expect(result.val).to.equal(42);
  });

  tst.test('should allow changing error type', () => {
    const result = E.okResult(3)
      .chain((x: number) => E.errResult(new E.Errs().add(ERR)))
      .chain((x: number) => E.okResult<number, E.Errs>(x+9));
    assert(result.isOk === false);
    expect(result.err.errors).to.have.length(1);
    expect(result.err.errors[0]).to.deep.equal(ERR);
  });

  
  
});

const DEFAULT_ERR_OPTIONS = { code: 'UNKNOWN', };

const ERRORS = [
  { message: 'here is an error', options: { code: 'BAD_VALUE' } }, 
  { message: 'yet another error', options: { code: 'BAD_ARG', widget: 'arg' } },
  { message: 'some other error',
    options: { code: 'BAD_NAME', widget: 'name', info: 'some error details' } },
];

const ERR = ERRORS[0];
