export function makeRegex(regexStr) {
    try {
        return new RegExp(regexStr);
    }
    catch (err) {
        return null;
    }
}
//# sourceMappingURL=utils.js.map