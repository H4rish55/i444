import { makeRegex } from './utils.js';
import { jgrep, MatchInfo } from './jgrep.js';

//map of interesting elements
type Widgets = { [key: string]: HTMLElement };
  
function setup() : void {
  const ids = [ 'regex', 'url', 'content' ];
  const widgets : Widgets = 
    Object.fromEntries(ids.map(id => [id, document.getElementById(id) ]));
  const urlChangeHandler = async (ev: Event) => {
    const isLoaded =
      await loadContent((ev.target as HTMLInputElement).value, widgets);
    if (isLoaded) change(widgets);
  };
  widgets.url.addEventListener('change', urlChangeHandler);
  widgets.content.addEventListener('input', () => change(widgets)); 
  widgets.regex.addEventListener('change', () => change(widgets));
}

window.onload = setup;

async function loadContent(url: string, widgets: Widgets) : Promise<boolean> {
  try {
    clearErrors();
    const response = await fetch(url);
    if (response.status !== 200) {
      error('url', `accessing ${url} resulted in ${response.status}`);
      return false;
    }
    const data = await response.text();
    widgets.content.innerHTML = data;
    return true;
  }
  catch (err) {
    error('url', err.message);
    return false;
  }
}

function change(widgets: Widgets) {
  clearErrors();
  const regexElement = widgets.regex as HTMLInputElement;
  const regex = makeRegex(regexElement.value)
  if (regex === null) {
    error('regex', `bad regex ${regexElement.value}`);
    return;
  }
  const content = widgets.content.innerText;
  const results = jgrep(regex, content);
  reportResults(results, widgets.content);
}

function reportResults(results: MatchInfo[], widget: HTMLElement) {
  //innerText returns text without HTML, hence no previous match markup
  let lines = widget.innerText.split(/\n/);
  for (const result of results) {
    const { lineIndex, matches } = result;
    const line = lines[lineIndex];
    console.assert(matches.length > 0);
    let newLine = '';
    let lastEnd = 0;
    for (const [colN0, colN1] of matches) {
      newLine += `<span class="matchLine">${line.slice(lastEnd, colN0)}</span>`;
      newLine += `<span class="matchSeg">${line.slice(colN0, colN1)}</span>`;
      lastEnd = colN1;
    }
    newLine += `<span class="matchLine">${line.slice(lastEnd)}</span>`;
    lines[lineIndex] = newLine;
  }
  widget.innerHTML = lines.join('\n');
}

function error(id: string, msg: string) {
  const errWidget = document.querySelectorAll(`#${id} ~ .error`)[0];
  errWidget.innerHTML = msg;
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(e => e.innerHTML = '');
}
