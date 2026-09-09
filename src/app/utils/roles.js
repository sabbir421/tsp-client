import { USER_ROLES } from '../constants';

/** Once logged in, account role wins. selectedRole is only for pre-auth UI. */
function resolveRole(user, selectedRole) {
  return user?.role || selectedRole || null;
}

export function isSellerAgent(user, selectedRole) {
  return resolveRole(user, selectedRole) === USER_ROLES.SELLER_AGENT;
}

export function isBuyerTenant(user, selectedRole) {
  return resolveRole(user, selectedRole) === USER_ROLES.BUYER_TENANT;
}

export function isBachelorPoster(user, selectedRole) {
  return resolveRole(user, selectedRole) === USER_ROLES.BACHELOR_POSTER;
}
