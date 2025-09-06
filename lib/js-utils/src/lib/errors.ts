// Largely an immutable API

/** A Result is either a success result identified by isOk=true,
 *  or an error result identified by isOk=false.  A success
 *  result has the T success value in its 'val' property; an
 *  error result will have an E error object in its
 *  'err' property.
 *
 *  Modeled on Rust's Result type.
 */

export type Result<T, E=Err> = OkResult<T, E> | ErrResult<T, E>;

export class OkResult<T, E> {
  readonly isOk = true; 

  constructor(readonly val: T) { }

  /** return result of applying fn on val */
  chain<T1, E1>(fn: (v: T) => Result<T1, E1>) : Result<T1, E1> {
    return fn(this.val);
  }
}

export class ErrResult<T, E> {
  readonly isOk = false;

  constructor(readonly err: E) { }

  //useful for converting an error result into a result having a
  //different success type T.
  into<T>() : Result<T, E> { return this as Result<T, E>; }

  /** ignore fn, simply returning this error result */
  chain<T1, E1>(_fn: (v: T1) => Result<T1, E1>) : Result<T1, E> {
    return this as Result<T1, E>;
  }
}

/** factory function for a success result */
export function okResult<T, E=Err>(v: T) : OkResult<T, E> {
  return new OkResult(v);
}

/** factory function for an error result initialized to contain err.
 */
export function errResult<T, E>(err: E) : ErrResult<T, E>
{
  return new ErrResult(err);
}		       


/** An error consists of a human readable message and possible options
 *
 *  Two common options:
 *
 *  code: a string classifying the error, useful for machines.
 *
 *  widget: the id of the main property causing this error.  Useful
 *  for reporting in GUIs.
 */
export class Err {
  constructor(readonly message: string,
	      readonly options: Record<string, string>) {
  }
  toString() {
    return (this.options.code ? `${this.options.code}: ` : '') +  this.message;
  }
};

/** convenience function for building an Err.  Allows following invocations:
 *   
 *     err(msg, code?, widget?)
 *     err(Err, code?, widget?)
 *     err(Error, code?, widget?)
 *
 */
export function err(arg1: any, arg2?: string | Record<string, string>,
		    widget?: string) : Err {
  const msg = (typeof arg1 === 'object' && 'message' in arg1)
    ? arg1.message
    : arg1.toString();
  const options = (typeof arg1 === 'object' && 'options' in arg1)
    ? arg1.options
    : {};
  return (typeof arg2 === 'string')
    ? new Err(msg, { ...options, code: arg2, ... ( widget ? { widget } : {} ) })
    : new Err(msg, { ...options, ...arg2, ... ( widget ? { widget } : {} ) });
}
    

/** allow multiple errors; useful for validation */
export class Errs {
  errors: Err[] = [];
  toString() {
    return this.errors.map(e => e.toString()).join();
  }
  add(arg0: any, ...args: any[]) {
    this.errors.push(err(arg0, ...args));
    return this;
  }
};

/** convert a Result<T, Err> containing a single error to a
 *  Result<T, Errs> containing multiple errors.
 */
export function toErrs<T>(result: Result<T, Err>): Result<T, Errs> {
  if (result.isOk !== false) {
    return result as Result<T, Errs>;
  }
  else {
    const errs = new Errs();
    errs.errors.push(result.err);
    return errResult(errs);
  }
}

/** throw exception with msg and args; use when impossible conditions occur */
export function panic(msg: string, ...args: any) : never {
  throw new Error(msg + args.map((a: any) => JSON.stringify(a)).join(', '));
}


//demo program
/*
function safeDiv(num: number, denom: number) : Result<number> {
  if (denom === 0) return errResult(err('zero denominator'));
  return okResult(num/denom);
}

function demo(result: Result<number>) : Result<string> {
  if (!result.isOk) return result as Result<string>;
  const v = result.val + 1;
  return result.chain((val: number) => okResult('x'.repeat(v*val)))
               .chain((str: string) => okResult(str + 'aaa'));
}

console.log(safeDiv(1, 0));
console.log(safeDiv(1, 2));
console.log(demo(errResult(err('some error', 'ERR_CODE'))));
console.log(demo(okResult(2)));
*/
