/** A "word" is defined to be a maximal sequence of non-whitespace characters.
 */

// *Hint*: A string `str` can be split into an array of words using
// `str.split(/\s+/)`.

// #1: 3-points
/** Given a string `text` returns a string which contains the same characters
 *  as `text` but in lexicographically sorted order.
 */
function sortStrChars(text: string): string {
  return text.split("").sort().join("");
}

// #2: 3-points
/** Given a string `text` returns an array giving the lengths of all the
 *  words in `text`.
 */
function wordLengths(text: string): number[] {
  const split_text = text.split(/\s+/)
  const len_arr: number[] = split_text.filter(w => w.length > 0).map(num => num.length)
  return len_arr;
}

// #3: 3-points
/** Return an array containing all the words in `text` whose length is
 *  a multiple of `multiple`.
 */
function selectWords(text: string, multiple = 1): string[] {
  const split_text = text.split(/\s+/).filter(w => w.length > 0)
  const res: string[] = split_text.filter(char => char.length % multiple === 0)
  return res;
}

// #4: 5-points
/** Return an array of the words in `text` in lower-case except for
 *  the first character of each word which must be lower-case if the
 *  length of the word is even and upper-case if the length of the
 *  word is odd.  The case of a non-alphabetic character should not be
 *  changed.
 */
function casedWords(text: string): string[] {
  const split_text = text.split(/\s+/);
  const res: string[] = split_text
    .filter((word) => word)
    .map((word) => {
      const lower_char = word.toLowerCase();
      const first_char = word[0];

      if (/[a-zA-Z]/.test(first_char)) {
        if (lower_char.length % 2 === 0) {
          return lower_char;
        } else {
          const combined_str = lower_char[0].toUpperCase() + lower_char.slice(1);
          return combined_str;
        }
      } else {
        const rest = lower_char.slice(1);
        return first_char + rest;
      }
    });
  return res;
}

// #5: 5-points
/** Return an array of the words in `text` with each character in each
 *  word having alternate case, with the case of the first character
 *  in the word being lower-case if its length is even and upper-case
 *  if its length is odd.  The case of a non-alphabetic character
 *  should not be changed but will count towards the case of a
 *  subsequent character.
 */
function alternatingCase(text: string): string[] {
  const split_text = text.split(/\s+/).filter((w) => w.length > 0);

  const res: string[] = split_text.map((char) => {
    const initialMakeUpper = char.length % 2 === 1;
    const charArray = char.split("");
    const result = charArray.reduce((acc, ch, index) => {
      const makeUpper = initialMakeUpper ? index % 2 === 0 : index % 2 === 1;
      if (/[A-Za-z]/.test(ch)) {
        const transformed = makeUpper ? ch.toUpperCase() : ch.toLowerCase();
        return acc + transformed;
      } else {
        return acc + ch;
      }
    }, "");
    return result;
  });

  return res;
}

// #6: 5-points
/** Return `text` with each alphabetic character rotated by `n`
 *  positions: i.e., if `n` is 4, `'a'` will become `'e'`, `'z'` will
 *  become `'d'`, `'y'` will become `'c'`, `'A'` will become `'E'`,
 *  `'Z'` will become `'D'`, and `'Y'` will become `'C'`.  You may
 *  assume that the character codes for the lower-case characters are
 *  contiguous with `code('a') + 1 === code('b')` and ... and
 *  `code('y') + 1 === code('z')`; similarly for the upper-case
 *  characters.
 *
 *  Note that using the default value of `n` results in
 *  .<https://en.wikipedia.org/wiki/ROT13> ROT13.
 */
function rotAlphabets(text: string, n = 13): string {
  const res: string = text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        const alphabetIndex = char.charCodeAt(0) - "a".charCodeAt(0);
        const newIndex = (alphabetIndex + n) % 26;
        return String.fromCharCode("a".charCodeAt(0) + newIndex);
      } else if (/[A-Z]/.test(char)) {
        const alphabetIndex = char.charCodeAt(0) - "A".charCodeAt(0);
        const newIndex = (alphabetIndex + n) % 26;
        return String.fromCharCode("A".charCodeAt(0) + newIndex);
      } else {
        return char;
      }
    })
    .join("");

  return res;
}

// #7: 5-points
/** The function should split `text` into `n` words having lengths
 *  `len_1`, `len_2`, ..., `len_n` and returns the value of
 *   the polynomial:
 *
 *   len_1 * x**0 + len_2 * x**1 + len_3 * x**2 + ... + len_n * x**(n-1)
 *
 *   The function should return 0 if there are no words in `text`
 */
function wordLenPoly(text: string, x: number): number {
  const split_text = text.split(/\s+/).filter(w => w.length > 0)
  const lengths: number[] = split_text.map(word => word.length)
  const res: number = lengths.reduce((acc, len, i) => acc + len * x ** i, 0)
  return res;
}

// #8: 5-points
/** When given a binary function `fn`, `map2()` should return an array
 *  containing the result of mapping the function over the elements of
 *  `arr1` and `arr2`.  If `arr1` and `arr2` have different
 *  lengths, then the length of the returned array should be that of
 *  the shorter input array
 */
function map2<T1, T2, T>(fn: (a: T1, b: T2) => T, arr1: T1[], arr2: T2[]): T[] {
  const min_length = Math.min(arr1.length, arr2.length)

  const res: T[] = arr1
    .slice(0, min_length)
    .map((first, i) => {
      const second = arr2[i]
      return fn(first, second)
    })

  return res;
}

// #9: 5-points
/** Return the result of mapping binary function `fn` over elements of
 *  `arr` and its reverse.  Your code may *not* use
 *  `Array.prototype.reverse()` or `Array.prototype.toReversed()`.
 */
function rmap2<T1, T2>(fn: (a: T1, b: T1) => T2, arr: T1[]): T2[] {
  const len = arr.length
  const res: T2[] = arr.map((left, i) => {
    const right = arr[len - 1 - i]
    return fn(left, right)
  })
  return res
}

// #10: 5-points
/** Returns an array `ret` having the same length as `arr`, with
 *  `ret[i]` being the sum of `arr[0]`, `arr[1]`, ..., `arr[i]`.
 */
function partialSums(arr: number[]): number[] {
  const res: number[] = arr.reduce(
    (acc, num) => [...acc, (acc.at(-1) ?? 0) + num],
    [] as number[]
  )
  return res
}

// #11: 3-points
/** Returns an array `ret` having the same length as `arr`, with
 *  `ret[0]` being arr[0] and ret[i] for i > 0 being
 *  `fn(...fn(fn(arr[0], arr[1]), arr[2]), ..., arr[i])`.
 */
function partialFnAppls<T>(fn: (a: T, b: T) => T, arr: T[]): T[] {
  if (arr.length === 0) return []

  const result: T[] = arr.slice(1).reduce(
    (acc, val) => [...acc, fn(acc.at(-1) as T, val)],
    [arr[0]]
  )

  return result
}

export default {
  sortStrChars,
  wordLengths,
  selectWords,
  casedWords,
  alternatingCase,
  rotAlphabets,
  wordLenPoly,
  map2,
  rmap2,
  partialSums,
  partialFnAppls,
};