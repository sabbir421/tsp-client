import { USER_ROLES } from '../constants';

const ACTIVE_ROLE_KEY = 'activePortalRole';

const tokenKey = (role) => `tsp:token:${role}`;
const userKey = (role) => `tsp:user:${role}`;

export const PORTAL_ROLES = Object.values(USER_ROLES);

function getSessionStore() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

function getLocalStore() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function hasPortalToken(role) {
  const store = getLocalStore();
  if (!store || !role) return false;
  return Boolean(store.getItem(tokenKey(role)));
}

export function hasAnyPortalToken() {
  return PORTAL_ROLES.some((role) => hasPortalToken(role));
}

export function getPortalSession(role) {
  const store = getLocalStore();
  if (!store || !role) return null;
  const token = store.getItem(tokenKey(role));
  const rawUser = store.getItem(userKey(role));
  if (!token || !rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    if (!user?.role || user.role !== role) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export function savePortalSession(role, { token, user }) {
  const local = getLocalStore();
  if (!local || !role || !token || !user) return;

  local.setItem(tokenKey(role), token);
  local.setItem(userKey(role), JSON.stringify({ ...user, role }));
  activatePortalSession(role);
}

/** Activate a portal session for this browser tab/window only. */
export function activatePortalSession(role) {
  const session = getPortalSession(role);
  const tab = getSessionStore();
  const local = getLocalStore();
  if (!session || !tab || !local) return false;

  tab.setItem(ACTIVE_ROLE_KEY, role);
  tab.setItem('token', session.token);
  tab.setItem('user', JSON.stringify(session.user));
  tab.setItem('selectedRole', role);

  // Keep legacy local keys in sync for this activation, but tab token wins for API
  local.setItem('selectedRole', role);
  return true;
}

export function getActivePortalRole() {
  const tab = getSessionStore();
  const local = getLocalStore();
  if (!tab) return null;

  const fromTab = tab.getItem(ACTIVE_ROLE_KEY);
  if (fromTab) return fromTab;

  try {
    const user = tab.getItem('user') || local?.getItem('user');
    return user ? JSON.parse(user)?.role : local?.getItem('selectedRole');
  } catch {
    return local?.getItem('selectedRole') || null;
  }
}

export function getActiveToken() {
  const tab = getSessionStore();
  const role = getActivePortalRole();
  if (role) {
    const session = getPortalSession(role);
    if (session?.token) return session.token;
  }
  return tab?.getItem('token') || getLocalStore()?.getItem('token') || null;
}

export function getActiveUser() {
  const role = getActivePortalRole();
  if (role) {
    const session = getPortalSession(role);
    if (session?.user) return session.user;
  }

  const tab = getSessionStore();
  const local = getLocalStore();
  const raw = tab?.getItem('user') || local?.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPortalSession(role) {
  const local = getLocalStore();
  const tab = getSessionStore();
  if (!local) return;

  if (role) {
    local.removeItem(tokenKey(role));
    local.removeItem(userKey(role));
  }

  const activeRole = getActivePortalRole();
  if (!role || activeRole === role) {
    tab?.removeItem('token');
    tab?.removeItem('user');
    tab?.removeItem('selectedRole');
    tab?.removeItem(ACTIVE_ROLE_KEY);
    local.removeItem('token');
    local.removeItem('user');
    local.removeItem('selectedRole');
    local.removeItem(ACTIVE_ROLE_KEY);
  }
}

export function clearAllPortalSessions() {
  const local = getLocalStore();
  const tab = getSessionStore();
  if (!local) return;

  PORTAL_ROLES.forEach((role) => {
    local.removeItem(tokenKey(role));
    local.removeItem(userKey(role));
  });
  local.removeItem('token');
  local.removeItem('user');
  local.removeItem('selectedRole');
  local.removeItem(ACTIVE_ROLE_KEY);
  tab?.removeItem('token');
  tab?.removeItem('user');
  tab?.removeItem('selectedRole');
  tab?.removeItem(ACTIVE_ROLE_KEY);
}

/** Migrate legacy single-token sessions into role-scoped storage once. */
export function migrateLegacySession() {
  const local = getLocalStore();
  if (!local) return;

  const token = local.getItem('token');
  const rawUser = local.getItem('user');
  if (!token || !rawUser) return;

  try {
    const user = JSON.parse(rawUser);
    if (!user?.role) return;
    if (!local.getItem(tokenKey(user.role))) {
      local.setItem(tokenKey(user.role), token);
      local.setItem(userKey(user.role), JSON.stringify(user));
    }
  } catch {
    // ignore corrupt legacy data
  }
}

export function updateStoredPortalUser(user) {
  const local = getLocalStore();
  const tab = getSessionStore();
  if (!local || !user?.role) return;

  const role = user.role;
  if (!local.getItem(tokenKey(role))) return;
  local.setItem(userKey(role), JSON.stringify(user));

  if (getActivePortalRole() === role) {
    tab?.setItem('user', JSON.stringify(user));
  }
}
