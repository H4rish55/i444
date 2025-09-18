const OK = 200;

function setup() {
  document.getElementById('go').addEventListener('click',
						 () => startCrawl());
}

window.onload = setup;

const COURSE_BASE = 'cs544/';
function startCrawl() {
  const loc = window.location.href;
  const courseIndex = loc.indexOf(COURSE_BASE);
  if (courseIndex >= 0) { //only crawl cs544
    const startUrl = loc.substring(0, courseIndex + COURSE_BASE.length);
    crawl([startUrl], startUrl, new UrlInfos(startUrl));
  }
}

function extractTitle(html: string) {
  const titleBeginMatch = html.match(/\<\s*title\s*\>/i);
  if (titleBeginMatch) {
    const titleEndMatch = html.match(/\<\/\s*title\s*\>/i);
    if (titleEndMatch) {
      const titleBeginIndex = titleBeginMatch.index + titleBeginMatch[0].length;
      return html.substring(titleBeginIndex, titleEndMatch.index).trim();
    }
  }
  return '';
}

async function crawl(toDos: string[], startUrl: string, urlInfos: UrlInfos) {
  while (toDos.length > 0) {
    const url = toDos.shift();
    const response = await fetch(url);
    if (response.status !== OK) return;
    const html = await response.text();
    const title = extractTitle(html);
    const urlInfo = urlInfos.add(url);
    urlInfo.title = title;
    updateResult(urlInfo);
    const baseUrl = new URL(url);
    const hrefRegex = /href=\"([^\"]+)\"/ig;  // /g flag critical
    //let m; //old way of matching multiple
    //while ( (m = hrefRegex.exec(html)) ) {
    for (const m of html.matchAll(hrefRegex)) {
      const linkedUrl = new URL(m[1], baseUrl);
      const href = linkedUrl.href;
      const isNew = urlInfos.isNew(href);
      const hrefUrlInfo = urlInfos.add(href);
      hrefUrlInfo.referers.add(url);
      updateResult(hrefUrlInfo);
      if (isNew && href.startsWith(startUrl) && href.match(/\.html?/)) {
	toDos.push(href);
      }
    }
  }
}

const ID_BASE = 'url';
function updateResult(urlInfo: UrlInfo) {
  const id = ID_BASE + urlInfo.index;
  let urlHtml = document.getElementById(id);
  if (!urlHtml) {
    urlHtml = document.createElement('p');
    urlHtml.setAttribute('id', id);
    document.getElementById('results').appendChild(urlHtml);
  }
  const url = urlInfo.url;
  const linkContent = urlInfo.title || url;
  let summary = `<a href="${url}">${linkContent}</a>`;
  let details = 'Referers:<br/>';
  for (const refUrl of urlInfo.referers) {
    details += `<a href="${refUrl}">${refUrl}</a><br/>`;
  }
  urlHtml.innerHTML = `
    <details>
      <summary>${summary}</summary>
      ${details}
    </details>
  `;
}

class UrlInfo {
  readonly url: string;
  readonly index: number;
  readonly referers: Set<string>; //contents updated
  title: string;
  constructor(url: string, index: number) {
    this.url = url; this.index = index; this.referers = new Set();
  }
}

class UrlInfos {
  readonly #infos: { [url: string]: UrlInfo };
  constructor(startUrl: string) {
    this.#infos = { url: new UrlInfo(startUrl, 0) };
  }

  isNew(url: string) : boolean { return !this.#infos[url]; }
  add(url: string) {
    let entry = this.#infos[url];
    if (!entry) {
      entry = new UrlInfo(url, Object.keys(this.#infos).length);
      this.#infos[url] = entry;
    }
    return entry;    
  }
}
