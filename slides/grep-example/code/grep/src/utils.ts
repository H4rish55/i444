export function makeRegex(regexStr: string) : RegExp {
  try {
    return new RegExp(regexStr);
  }
  catch (err) {
    return null;
  }
}

