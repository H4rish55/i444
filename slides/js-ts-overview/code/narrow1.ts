function f(s: string | number, t: string) : number {
  return (s === t)
    ? s.length
    : (typeof s === 'number')
    ? s
    : t.length;
}

console.log(f('hello', 'hello'), f(22, 'x'), f('ts', 'js'));
