import { USER_ROLES } from '../constants';
import { getActivePortalRole, hasAnyPortalToken, hasPortalToken } from './authStorage';

export function getSafeNextPath(value, fallback = '/dashboard') {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\') ||
    value.startsWith('/role-select') ||
    value.startsWith('/login') ||
    value.startsWith('/signup') ||
    value.startsWith('/portal-gate')
  ) {
    return fallback;
  }

  return value;
}

export function buildRoleSelectHref(nextPath, role) {
  const params = new URLSearchParams();
  const safeNext = getSafeNextPath(nextPath, '');

  if (safeNext && safeNext !== '/dashboard') {
    params.set('next', safeNext);
  }

  if (role) {
    params.set('role', role);
  }

  const query = params.toString();
  return query ? `/role-select?${query}` : '/role-select';
}

export function buildAuthHref(basePath, nextPath, role) {
  const params = new URLSearchParams();
  const safeNext = getSafeNextPath(nextPath, '');

  if (safeNext && safeNext !== '/dashboard') {
    params.set('next', safeNext);
  }

  if (role) {
    params.set('role', role);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildPortalGateHref(nextPath, role) {
  const params = new URLSearchParams();
  params.set('role', role);
  const safeNext = getSafeNextPath(nextPath, '/dashboard');
  if (safeNext !== '/dashboard') {
    params.set('next', safeNext);
  }
  return `/portal-gate?${params.toString()}`;
}

const SELLER_ONLY_PATHS = [
  '/dashboard/post-property',
  '/dashboard/my-properties',
  '/dashboard/buyer-requirements',
  '/dashboard/submitted-suggestions',
];

const BUYER_ONLY_PATHS = [
  '/dashboard/my-requirements',
  '/dashboard/matched-properties',
  '/dashboard/available-properties',
];

export function getRequiredRoleForPath(pathname) {
  if (!pathname) return null;
  if (SELLER_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return USER_ROLES.SELLER_AGENT;
  }
  if (BUYER_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return USER_ROLES.BUYER_TENANT;
  }
  return null;
}

export function getPortalEntryHref(nextPath, role) {
  const safeNext = getSafeNextPath(nextPath, '/dashboard');
  if (role && hasPortalToken(role)) {
    return buildPortalGateHref(safeNext, role);
  }
  return buildRoleSelectHref(safeNext, role);
}

export function openPortalWindow(nextPath, role) {
  const href = getPortalEntryHref(nextPath, role);
  const hasTargetToken = role ? hasPortalToken(role) : false;
  const activeRole = getActivePortalRole();
  const useSameWindow =
    !hasAnyPortalToken() || hasTargetToken || !activeRole || activeRole === role;

  if (useSameWindow) {
    window.location.href = href;
    return null;
  }

  const windowName = role ? `tsp-portal-${role}` : 'tsp-portal';
  const opened = window.open(href, windowName);

  if (!opened) {
    window.location.href = href;
  }

  return opened;
}
