import * as E from './errors.js';

import { z } from 'zod';

type ZodResult<T> =
  { success: true, data: T } | { success: false, error: z.ZodError };

type Message = string;
type ErrInfo = { message: Message, options?: Record<string, string> };
type IssueFn = (issue: z.ZodIssue) => Message | ErrInfo;
type IssueInfos = Record<string, Message | ErrInfo | IssueFn>;

export function zodToResult<T>(zod: ZodResult<T>, issueInfos: IssueInfos = {}) 
  : E.Result<T, E.Errs>
{
  if (zod.success === true) {
    return E.okResult(zod.data);
  }
  else {
    return zodErrorToResultError(zod.error, issueInfos) as E.Result<T, E.Errs>
  }
}



function zodErrorToResultError<T>(zodError: z.ZodError, issueInfos: IssueInfos)
  : E.Result<void, E.Errs>
{
  const errors = new E.Errs();
  for (const zIssue of zodError.issues) {
    const msg = zIssue.message;
    let issueInfo = issueInfos[msg];
    if (typeof issueInfo === 'function') {
      issueInfo = issueInfo(zIssue);
    }
    const message =
      (typeof issueInfo === 'object')
      ? issueInfo.message
      : (typeof issueInfo === 'string') 
      ? issueInfo
      : issueMessage(zIssue);
    const code = issueCode(zIssue);
    const path = (zIssue.path ?? []).join('|');
    const options = (typeof issueInfo === 'object')
      ? { ... (issueInfo.options ?? {}), path }
      : { path };
    const err = E.Err.err(message, code, options);
    errors.add(err);
  }
  return (errors.nErrors() > 0) ? E.errResult(errors) : E.okResult(undefined);
}


function issueMessage(zIssue: z.ZodIssue) {
  let message = zIssue.message;
  const path = zIssue.path ?? [];
  const widget = (path.at(-1) ?? '').toString();
  if (zIssue.code === z.ZodIssueCode.invalid_type) {
    if (zIssue.received === 'undefined') {
      message = `${widget} is required`.trim();
    }
    else {
      message = `${widget} must have type ${zIssue.expected}`.trim();
    }
  }
  return message;
}

function issueCode(zIssue: z.ZodIssue) {
  let code = 'BAD_REQ';
  if (zIssue.code ===  z.ZodIssueCode.invalid_type) {
    if (zIssue.received === 'undefined') {
      code = 'MISSING';
    }
    else {
      code = 'BAD_TYPE';
    }
  }
  return code;
}

