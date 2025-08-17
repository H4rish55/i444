import NAV_DATA from './nav-data.mjs';

const [ COURSE ] = window.location.pathname.match(/\w+/);


document.addEventListener('DOMContentLoaded', ev => {
  populateCourseNav(NAV_DATA);
  setupWinEdgeNav('n', 'nav');
  setupLogin();
  setupWinEdgeNav('s', '.umt-slides-control');  
});

function relUrlToCourseBase() {
  const currentPath = window.location.pathname;
  const relPath = currentPath.replace(/.*\/cs\d+\//, '');
  const basePath = relPath.replace(/[^/]/g, '').replace(/\//g, '../');
  return basePath;
}

function populateCourseNav() {
  const nav = document.querySelector('#course-nav ul');
  if (!nav) return;
  const base = relUrlToCourseBase();
  for (const [text, props] of Object.entries(NAV_DATA)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = text;
    for (const [name, val] of Object.entries(props)) {
      const value = (name === 'href') ? val.replace('@{REL_BASE}', base) : val;
      a.setAttribute(name, value);
    }
    li.append(a); nav.append(li);
  }
}

function setupLogin() {

  const LOGIN_BASE = `/${COURSE}/online/auth/${COURSE}`;
  const TIMEOUT_COOKIE = 'x';

  function cookieValue(cookieName) {
    const cookies = document.cookie.split(/\s*\;\s*/);
    const re = new RegExp(`${cookieName}\\s*\\=`);
    const nameValue = cookies.find(keyValue => keyValue.match(re));
    return nameValue && nameValue.split('=')[1].trim();
  }

  function setup() {
    const loginElement = document.getElementById('loginAction');
    if (!loginElement) return;
    const expiryTimeMillis = Number(cookieValue(TIMEOUT_COOKIE));
    const isLoggedIn = (expiryTimeMillis && Date.now() < expiryTimeMillis);
    const loginAction = isLoggedIn ? 'Personal' : 'Login';
    loginElement.innerHTML = loginAction;
    loginElement.addEventListener('click', isLoggedIn ? home() : login());
  }

  function login() {
    return (event) =>  {
      event.preventDefault();
      window.location = `${LOGIN_BASE}/login`;
    };
  }

  function home() {
    return (event) =>  {
      event.preventDefault();
      window.location = `${LOGIN_BASE}/private`;
    };
  }

  setup();
}


const DEFAULT_OPTIONS = {
  d0: 50,  //any pointer activity within this will trigger handler
  d1: 50,  //pointer movement in edge direction will trigger handler
};

const TIMEOUT_MILLIS = 3 * 1000;

export default function setupWinEdgeNav(edge='n', selector='nav', options={}) {
  new Nav(edge, selector, options);
}

class Nav {
  constructor(edge, selector, options) {
    let timer = null;
    let last = 0;
    const navs = document.querySelectorAll(selector);
    const opts = { ...options, ...DEFAULT_OPTIONS };
    document.addEventListener('pointermove', this.chk);
    document.addEventListener('pointerdown', this.chk);
    const isHorizEdge = (edge === 'n' || edge === 's');
    const isTopOrLeftEdge = (edge === 'n' || edge === 'w')
    Object.assign(this, {edge, timer, navs, last, isHorizEdge, isTopOrLeftEdge,
			 opts});
    this.showNav();
  }

  chk = (ev) => {
    const pos = this.isHorizEdge ? ev.clientY : ev.clientX;
    if (this.isAtEdge(pos)) {
      this.showNav();
    }
    else {
      this.hideNav();
    }
  }

  showNav = () => {
    this.navs.forEach(nav => nav.style.visibility = 'visible');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.hideNav, TIMEOUT_MILLIS);
  }

  hideNav = () => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.navs.forEach(nav => nav.style.visibility = 'hidden');
  }

  isAtEdge = (pos) => {
    const { clientWidth: w, clientHeight: h } = document.documentElement;
    const limit = this.isTopOrLeftEdge ? 0 : (this.edge === 's') ? h : w;
    const sgn =  this.isTopOrLeftEdge ? +1 : -1;
    const d = sgn * (pos - limit);
    const opts = this.opts;
    const ret = (d < opts.d0 || (d < opts.d1 && sgn*(this.last - pos) > 0));
    this.last = pos;
    return ret;
  };

  
}
			  
