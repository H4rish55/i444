document.addEventListener('DOMContentLoaded', () => {

  const SLIDE_ID_PREFIX = 'umt-slide-';
  const SLIDE_SEL = '.umt-slides section[data-level=h2]';

  const SLIDES_NAV = `
      <ul>	
        <li>
	  <a href="#" title="table of contents"
             class="material-icons md-48 slides-toc">
            toc
          </a>
        </li>
	<li>
	  <a href="#" title="first slide" 
             class="material-icons md-48 first-slide">
            first_page
          </a>
	</li>
	<li>
	  <a href="#" title="previous slide" 
             class="material-icons md-48 previous-slide">
            arrow_back
          </a>
	</li>
	<li>
	  <a href="#" title="next slide"
             class="material-icons md-48 next-slide">
            arrow_forward
          </a>
	</li>
	<li>
	  <a href="#" title="last slide"
             class="material-icons md-48 last-slide">
            last_page
          </a>
	</li>
      </ul>
  `;

  const OFFSETS = {
    '.next-slide': 1,
    '.previous-slide': -1,
    '.first-slide': Number.NEGATIVE_INFINITY,
    '.last-slide': Number.POSITIVE_INFINITY,
  };

  let last;

  function addSlideNav() {
    const nav = document.createElement('nav');
    nav.setAttribute('class', 'umt-slides-control');
    nav.innerHTML = SLIDES_NAV;
    document.querySelector('.umt-content').append(nav);
  }

  function mkId(i) { return `${SLIDE_ID_PREFIX}${i}`; } 

  function setupSlideToc() {
    const toc = [];
    document.querySelectorAll(SLIDE_SEL).forEach((el, i) => {
      const id = el.id = mkId(i);
      const title = el.querySelector('h2')?.innerText;
      if (title) toc.push([id, title]);
    });
    last = toc.length - 1;
    return toc;
  }

  function setupToc() {
    const toc = [];
    document.querySelectorAll(SLIDE_SEL).forEach((el, i) => {
      el.id = mkId(i);
      last = i;
    });
  }

  function getCurrent() {
    const sectionChk =
	  e => e.tagName === 'SECTION' && e.getAttribute('data-level') === 'h2';
    let [ptX, ptY] = [100, 100];
    let section;
    for (let i = 0; !section && i < 5; i++) {
      const currentElements = document.elementsFromPoint(ptX, ptY);
      section = currentElements.find(sectionChk);
      ptX += 50; ptY += 50;
    }
    const id = section?.id;
    const prefix = SLIDE_ID_PREFIX;
    return id && id.startsWith(prefix) ? Number(id.slice(prefix.length)) : 0;
    
  }

  function scrollSlides(offset) {
    let current = getCurrent();
    current += offset;
    if (current < 0) current = 0;
    if (current > last) current = last;
    const url = new URL(window.location);
    url.hash = `#${mkId(current)}`;
    window.location.replace(url.href); //no trace in` history
  }

  function setupToc(tocPairs) {
    const tocElement =
      ([id, title]) => `<a href="#" data-id="${id}">${title}</a>`;
    const tocHtml = `
      <div class="umt-slides-toc">
        ${tocPairs.map(tocElement).join("\n")}
      </div>
    `;
    const toc = document.createElement('div');
    toc.setAttribute('id', 'umt-slides-toc');
    toc.innerHTML = tocHtml;
    toc.querySelectorAll('.umt-slides-toc a').forEach(a => {
      a.addEventListener('click', ev => {
	ev.preventDefault();
	const id = ev.target.getAttribute('data-id');
	const url = new URL(window.location);
	url.hash = id;
	window.location.replace(url.href);
	toc.style.visibility = 'hidden';
      });
    });
    document.body.appendChild(toc);
    document.addEventListener('click', () => {
      //hide toc if click within body
      toc.style.visibility = 'hidden';
    });
  }

  function setupSlidesNavClickHandler() {
    for (const [klass, offset] of Object.entries(OFFSETS)) {
      document.querySelector(klass).addEventListener('click', (ev) => {
	ev.preventDefault();
	scrollSlides(offset);
      });
    }
    //handler for toc control in slides nav; toggle toc visibility
    document.querySelector('.slides-toc').addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const toc = document.querySelector('#umt-slides-toc');
      const visibility = toc.style.visibility;
      toc.style.visibility = (visibility === 'visible') ? 'hidden' : 'visible';
    });
  }

  function setup() {
    const slideBody = document.querySelector('body.umt-slides');
    if (!slideBody) return;
    addSlideNav();
    const tocPairs = setupSlideToc();
    setupToc(tocPairs);
    setupSlidesNavClickHandler();
  }

  setup();
});

