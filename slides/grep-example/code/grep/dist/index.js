import { makeRegex } from './utils.js';
import { jgrep } from './jgrep.js';
function setup() {
    const ids = ['regex', 'url', 'content'];
    const widgets = Object.fromEntries(ids.map(id => [id, document.querySelector(`#${id}`)]));
    const urlChangeHandler = async (ev) => {
        const isLoaded = await loadContent(ev.target.value, widgets);
        if (isLoaded)
            change(widgets);
    };
    widgets.url.addEventListener('change', urlChangeHandler);
    widgets.content.addEventListener('input', () => change(widgets));
    widgets.regex.addEventListener('change', () => change(widgets));
}
window.onload = setup;
async function loadContent(url, widgets) {
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
//bug: firing this for input event on #content causes #content
//to lose focus.  Necessary to reclick mouse to continue typing
//into #content.
function change(widgets) {
    clearErrors();
    const regexElement = widgets.regex;
    const regex = makeRegex(regexElement.value);
    if (regex === null) {
        error('regex', `bad regex ${regexElement.value}`);
        return;
    }
    const content = widgets.content.innerText;
    const results = jgrep(regex, content);
    reportResults(results, widgets.content);
}
function reportResults(results, widget) {
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
function error(id, msg) {
    const errWidget = document.querySelectorAll(`#${id} ~ .error`)[0];
    errWidget.innerHTML = msg;
}
function clearErrors() {
    document.querySelectorAll('.error').forEach(e => e.innerHTML = '');
}
//# sourceMappingURL=index.js.map