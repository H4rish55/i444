type MatchInfo = {
    readonly lineN: number; /** 1-based line # */
    readonly colN: number; /** 0-based col # */
    readonly length: number; /** length of match */
    readonly line: string; /** matching line */
};
export default function grep(regex: RegExp, text: string): MatchInfo[];
export {};
