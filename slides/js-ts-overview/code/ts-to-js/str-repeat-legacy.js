function strRepeat(str, repeat) {
    return Array.from({ length: repeat })
      .map(function (_, i) {
             return str.repeat(i + 1); 
    });
}
globalThis.console.log(strRepeat('a', 4));
