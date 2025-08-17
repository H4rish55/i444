function strRepeat(str: string, repeat: number)
  : string[]
{
  return Array.from({length: repeat})
    .map((_, i) => str.repeat(i + 1));
}


globalThis.console.log(strRepeat('a', 4));
