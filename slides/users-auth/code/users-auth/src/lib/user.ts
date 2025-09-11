import * as E from './errors.js';
import { zodToResult } from './zod-utils.js';

import { z } from 'zod';
import bcrypt from 'bcrypt';

const MIN_PW_LEN = 8;
const MIN_PW_MSG = `password must contain at least ${MIN_PW_LEN} letters`;

//the following are used to build regex's.
//The (?=REGEX) is a lookahead assertion for REGEX
const UPPER = '(?=.*[A-Z])';
const LOWER = '(?=.*[a-z])';
const DIGIT = '(?=.*[\\d])';
const PUNCT = '(?=.*[^\\s\\w])';

//this regex uses lookahead assertions to check pw char requirements
//plus a {n,} quantifier to ensure min pw length.
const PW_REGEX =
  new RegExp(`^${UPPER}${LOWER}${DIGIT}${PUNCT}.{${MIN_PW_LEN},}`);
const PW_CONTENT_MSG =
  'password must contain at least one lowercase letter, ' +
  'one uppercase letter, one digit and one punctuation character';

const UserInfo =  z.object({
  email: z.string().email(),
  firstName: z.string().min(1).regex(/^[\w\s]+$/),
  lastName: z.string().min(1).regex(/^[\w\s]+$/),
});

const Password = z.object({
  password: z.string().min(MIN_PW_LEN, { message: MIN_PW_MSG })
    .regex(PW_REGEX, { message: PW_CONTENT_MSG }),
  confirmPassword: z.string(),
});

const RegisteringUser = UserInfo.merge(Password)
  .merge(z.object({
    // would like to forbid these, but including them causes type
    // problems
    // userId: z.never().optional(),
    // passwordHash: z.never().optional(),
  }))    
  .refine(({password, confirmPassword}) => password === confirmPassword,
	  { message: 'password and confirm password do not match' });

export type RegisteringUser = z.infer<typeof RegisteringUser>;

const SecuredRegisteringUser = UserInfo.merge(
  z.object({passwordHash: z.string()})
);

export type SecuredRegisteringUser = z.infer<typeof SecuredRegisteringUser>;

const UserId = z.object({
  userId: z.string(),
});

export type UserId = z.infer<typeof UserId>;

const RegisteredUser = SecuredRegisteringUser.merge(UserId);

export type RegisteredUser = z.infer<typeof RegisteredUser>;


const Login = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type Login = z.infer<typeof Login>;

    

const Query = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  index: z.number().gte(0).int().optional(),
  count: z.number().positive().int().optional(),
});

export type Query = z.infer<typeof Query>;

const UpdateUser =
  UserInfo.partial().merge(Password.partial()).merge(UserId)
    .refine(({password, confirmPassword}) =>
      password === undefined || password === confirmPassword,
	    { message: 'password and confirm password do not match' });

export type UpdateUser = z.infer<typeof UpdateUser>;

type PreValidator = (req: Record<string, any>) => E.Result<void, E.Errs>;

function checkForbidden(req: Record<string, any>, forbidden: string[])
  : E.Result<void, E.Errs> 
{
  //check for forbidden fields; nice if zod could do this
  for (const f of forbidden) {
    if (req[f] !== undefined) {
      return E.errResult(E.Errs.err(`request cannot contain ${f}`, 'BAD_REQ'));
    }
  }
  return E.okResult(undefined);
}
  
const PRE_VALIDATORS: Record<string, PreValidator> = {
  register: (req: Record<string, any>) =>
    checkForbidden(req, ['passwordHash', 'userId',]),
  update: (req: Record<string, any>) => checkForbidden(req, ['passwordHash']),
}

const VALIDATORS: Record<string, z.ZodSchema> = {
  register: RegisteringUser,
  login: Login,
  query: Query,
  get: UserId,
  remove: UserId,
  update: UpdateUser,
};

export function validate<T>(command: string, req: Record<string, any>)
  : E.Result<T, E.Errs> 
{
  const preValidator = PRE_VALIDATORS[command];
  if (preValidator) {
    const result = preValidator(req);
    if (!result.isOk) return result as E.Result<T, E.Errs>;
  }
  const validator = VALIDATORS[command];
  return (validator)
    ? zodToResult(validator.safeParse(req))
    : E.errResult(E.Errs.err(`no validator for command ${command}`, 'INTERNAL'));
}

/*
const USER = {
  email: 'x@x.com',
  firstName: 'x',
  lastName: 'x',
  password: 'abcD#1234',
  confirmPassword: 'abcD#1234',
};
const result = validate('register', USER);
console.log(result);
*/

/*
const u: z.infer<typeof UserId> = {userId: 'x'};//UpdateUser;
let x: never = u;



export interface RegisteredUser extends User {
  userId: string;
};
*/
