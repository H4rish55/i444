/** pair giving col-indexes of match within a line */
type MatchCol = [
  number,  /** 0-based start col # (inclusive) */
  number,  /** 0-based end col # (exclusive) */
];

export type MatchInfo = {
  readonly lineIndex: number,     /** 0-based line index */
  readonly matches: MatchCol[],   /** matches on line */
  readonly line: string,          /** matching line */
}; 

export function jgrep(regex : RegExp, text: string) : MatchInfo[] {
  const matchInfos = [];
  const gRegex = regex.global ? regex : new RegExp(regex, 'g');
  for (const [lineIndex, line] of text.split('\n').entries()) {
    const matches : MatchCol[] = [];
    for (const m of line.matchAll(gRegex)) {
      matches.push([m.index, m.index + m[0].length]);
    }
    if (matches.length > 0) {
      const matchInfo = { lineIndex, matches, line, };
      matchInfos.push(matchInfo);
    }
  }
  return matchInfos;
} //grep()
