/** pair giving col-indexes of match within a line */
type MatchCol = [
    number,
    number
];
export type MatchInfo = {
    readonly lineIndex: number; /** 0-based line index */
    readonly matches: MatchCol[]; /** matches on line */
    readonly line: string; /** matching line */
};
export declare function jgrep(regex: RegExp, text: string): MatchInfo[];
export {};
