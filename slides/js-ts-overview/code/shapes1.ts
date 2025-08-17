type Rect = { tag: 'Rect', w: number, h: number };

type Circle = { tag: 'Circle', r: number };

//Shape is a discriminated union, discriminated by tag
type Shape = Rect | Circle;

function area(s: Shape) {
  switch (s.tag) {
    case 'Rect':
      return s.w * s.h;
    case 'Circle':
      return Math.PI*s.r*s.r;
    default:
      const _exhaustiveCheck: never = s;
      return _exhaustiveCheck;
  }
}


const shapes: Shape[] =
  [ { tag: 'Rect', w: 2, h: 3}, { tag: 'Circle', r: 1 } ];

for (const s of shapes) console.log(area(s));
