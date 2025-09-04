export function jgrep(regex, text) {
    const matchInfos = [];
    const gRegex = regex.global ? regex : new RegExp(regex, 'g');
    for (const [lineIndex, line] of text.split('\n').entries()) {
        const matches = [];
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
//# sourceMappingURL=jgrep.js.map