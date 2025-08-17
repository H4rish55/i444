const [ COURSE ] = window.location.pathname.match(/\w+/);

const BASE = `/${COURSE}/online/auth/${COURSE}`;

function cookieValue(cookieName) {
  const cookies = document.cookie.split(/\s*\;\s*/);
  const re = new RegExp(`${cookieName}\\s*\\=`);
  const nameValue = cookies.find(keyValue => keyValue.match(re));
  return nameValue && nameValue.split('=')[1].trim();
}

const TIMEOUT_COOKIE = 'x';
function setup() {
  const expiryTimeMillis = Number(cookieValue(TIMEOUT_COOKIE));
  const isLoggedIn = (expiryTimeMillis && Date.now() < expiryTimeMillis);
  const loginAction = isLoggedIn ? 'Personal' : 'Login';
  const loginElement = document.getElementById('loginAction');
  loginElement.innerHTML = loginAction;
  loginElement.addEventListener('click', isLoggedIn ? home() : login());
}

function login() {
  return (event) =>  {
    event.preventDefault();
    window.location = `${BASE}/login`;
  };
}

function home() {
  return (event) =>  {
    event.preventDefault();
    window.location = `${BASE}/private`;
  };
}

setup();
  
