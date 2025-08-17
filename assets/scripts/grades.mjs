window.addEventListener('load', () => {
  const id = (window.location.hash ?? '').replace('#', '');
  const content = document.querySelector('#content');
  if (content === null) return;
  const [width, height] = [content.scrollWidth, content.scrollHeight];
  document.querySelectorAll('.note-container').forEach(note => {
    const { x, y } = note.dataset;
    note.style.left = `${x*width}px`;
    note.style.top = `${y*height}px`;

    const display = () => {
      note.querySelector('.note-text').style.visibility = 'visible';
    };

    const hide = () => {
      note.querySelector('.note-text').style.visibility = 'hidden';
    };
    note.addEventListener('mouseover', display);
    note.addEventListener('mouseout', hide);

    if (note.id === id) {
      display();
      const timer = setTimeout(() => { hide(); clearTimeout(timer); }, 5000);
    }
			  
  });
  const m = id.match(/^x-([\d\.]+)-y-([\d\.]+)$/);
  if (m) {
    const [x, y] = [ Number(m[1]), Number(m[2]) ];
    const holder = document.querySelector('#content-holder');
    const [scrollX, scrollY] = [ x*width - EXTRA, y*height - EXTRA ];
    holder.scrollTo(scrollX, scrollY);
  }
});

const EXTRA = 50;
