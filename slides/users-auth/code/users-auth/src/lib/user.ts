import { Errors as E } from 'cs444-js-utils';
import { zodToResult } from './zod-utils.js';

import { z } from 'zod';
import bcrypt from 'bcrypt';

const MIN_PW_LEN = 8;
const MIN_PW_MSG = `password must contain at least ${MIN_PW_LEN} letters`;

//the following are used to build regex's.
//The (?=REGEX) is a lookahead assertion for REGEX
const UPPER = '(?=.*[A-Z])';      //check if following contains upper-case alpha
const LOWER = '(?=.*[a-z])';      //check if following contains lower-case alpha
const DIGIT = '(?=.*[\\d])';      //check if following contains digit
const PUNCT = '(?=.*[^\\s\\w])';  //check if following contains punctuation

//this regex uses lookahead assertions to check pw char requirements
//plus a {n,} quantifier to ensure min pw length.
//Specifically, check for presence of at least one upper-case, lower-case
//digit or punctuation without matching it (that is what is meant by a
//"lookahead assertion"), and then verify that the entire string
//contains at least MIN_PW_LEN chars.
const PW_REGEX =
  new RegExp(`^${UPPER}${LOWER}${DIGIT}${PUNCT}`);
const PW_CONTENT_MSG =
  'password must contain at least one lowercase letter, ' +
  'one uppercase letter, one digit and one punctuation character';


const zEmail = z.string().email().brand<'Email'>();
export type EmailX = z.infer<typeof zEmail>;

const zName = z.string().min(1).regex(/^[a-zA-Z \-\']+$/).brand<'Name'>();
export type NameX = z.infer<typeof zName>;

const zUserId = z.string().brand<'UserId'>();
export type UserIdX = z.infer<typeof zUserId>;

const zUserInfo =  z.object({
  email: z.string().email(),
  firstName: zName,
  lastName: zName,
});

const zPassword = z.string()
  .min(MIN_PW_LEN, { message: MIN_PW_MSG })
  .regex(PW_REGEX, { message: PW_CONTENT_MSG });
export type Password = z.infer<typeof zPassword>;

const zPasswordWithConfirm = z.object({
  password: zPassword,
  confirmPassword: z.string(),
});

//info provided for a user who is registering
const zRegisteringUser = z.object({
  ...zUserInfo.shape,
  ...zPasswordWithConfirm.shape,
  id: z.never({message: "user id field forbidden"}).optional(),
  passwordHash: z.never({message: "passwordHash field forbidden"}).optional(),
  _id: z.never({message: "_id field forbidden"}).optional(),
}).refine(({password, confirmPassword}) => password === confirmPassword,
	  { message: 'password and confirm password do not match' });
export type RegisteringUser = z.infer<typeof zRegisteringUser>;

//info for a registering user with password fields replaced by password hash
const zSecuredRegisteringUser = z.object({
  ...zRegisteringUser.omit({password: true, confirmPassword: true,
			    id: true, passwordHash: true, _id: true}).shape,
  passwordHash: z.string(),
});
export type SecuredRegisteringUser = z.infer<typeof zSecuredRegisteringUser>;

//external info revealed for a registered user
const zRegisteredUser = z.object({
  id: zUserId,
  ...zUserInfo.shape,
});
export type RegisteredUser = z.infer<typeof zRegisteredUser>;


//info provided for a user logging in
const zLogin = z.object({
  email: zEmail,
  password: zPassword,
});
export type Login = z.infer<typeof zLogin>;

//params provided when querying users
const zQuery = z.object({
  id: zUserId.optional(),
  email: zEmail.optional(),
  firstName: zName.optional(),
  lastName: zName.optional(),
  offset: z.preprocess(v => Number(v), z.int().gte(0)).optional(),
  count: z.preprocess(v => Number(v), z.int().gt(0)).optional(),
});
export type Query = z.infer<typeof zQuery>;

//info provided when updating a user
const zUpdateUser = z.object({
  ...zUserInfo.shape,
  ...zPasswordWithConfirm.shape,
  id: z.never({message: "userId field forbidden"}),
  passwordHash: z.never({message: "passwordHash field forbidden"}),
  _id: z.never({message: "_id field forbidden"}),
})
  .partial()
  .extend({ id: zUserId })
  .refine(({password, confirmPassword}) =>
    password === undefined || password === confirmPassword,
	    { message: 'password and confirm password do not match' });
export type UpdateUser = z.infer<typeof zUpdateUser>;

const zUserIdObj = z.object({
  id: zUserId,
});
export type UserId = z.infer<typeof zUserIdObj>;


const VALIDATORS: Record<string, z.ZodSchema> = {
  register: zRegisteringUser,
  login: zLogin,
  query: zQuery,
  get: zUserIdObj,
  remove: zUserIdObj,
  update: zUpdateUser,
};

export interface AuthServices {
  register(params: Record<string, any>)
    : Promise<E.Result<RegisteredUser, E.Errs>>;
  login(params: Record<string, any>)
    : Promise<E.Result<RegisteredUser, E.Errs>>;
  get(params: Record<string, any>)
    : Promise<E.Result<RegisteredUser, E.Errs>>;
  query(params: Record<string, any>)
    : Promise<E.Result<RegisteredUser[], E.Errs>>;
  update(params: Record<string, any>)
    : Promise<E.Result<RegisteredUser, E.Errs>>;
  remove(params: Record<string, any>)
    : Promise<E.Result<void, E.Errs>>;
  close() : Promise<E.Result<void, E.Errs>>;
  clear() : Promise<E.Result<void, E.Errs>>;
  
}

// # of results per page, when paging through results
export const PAGE_SIZE = 5;

export function validate<T>(command: string, req: Record<string, any>)
  : E.Result<T, E.Errs> 
{
  /*
  const preValidator = PRE_VALIDATORS[command];
  if (preValidator) {
    const result = preValidator(req);
    if (!result.isOk) return result as E.Result<T, E.Errs>;
  }
  */
  const validator = VALIDATORS[command] as z.Schema<T>;
  return (validator)
    ? zodToResult(validator.safeParse(req, { reportInput: true }))
    : E.errResult(E.errs(`no validator for command ${command}`, 'INTERNAL'));
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
