// Shared auth session (admin + client) — token in sessionStorage.

const TOKEN_KEY = 'desarpro:auth:token';
const USER_KEY = 'desarpro:auth:user';
const LEGACY_TOKEN = 'desarpro:admin:token';
const LEGACY_SESSION = 'desarpro:admin:session';
const LEGACY_USER = 'desarpro:admin:user';

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN);
  } catch (e) {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(LEGACY_TOKEN, token);
      sessionStorage.setItem(LEGACY_SESSION, '1');
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(LEGACY_TOKEN);
      sessionStorage.removeItem(LEGACY_SESSION);
    }
  } catch (e) {}
}

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(LEGACY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LEGACY_USER);
    }
  } catch (e) {}
}

function clearSession() {
  writeToken(null);
  writeUser(null);
}

function isAdminUser(user) {
  return user && (user.role === 'admin' || user.role === 'super_admin');
}

function isClientUser(user) {
  return user && user.role === 'client';
}

export {
  readToken,
  writeToken,
  readUser,
  writeUser,
  clearSession,
  isAdminUser,
  isClientUser,
  TOKEN_KEY,
};
