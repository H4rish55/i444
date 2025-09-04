export default function grep(regex, text) {
    const matchInfos = [];
    const gRegex = regex.global ? regex : new RegExp(regex, 'g');
    for (const [lineIndex, line] of text.split('\n').entries()) {
        for (const m of line.matchAll(gRegex)) {
            const matchInfo = {
                lineN: lineIndex + 1,
                colN: m.index,
                length: m[0].length,
                line,
            };
            matchInfos.push(matchInfo);
        }
    }
    return matchInfos;
} //grep()
//# sourceMappingURL=grep.js.map