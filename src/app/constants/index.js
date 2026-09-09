export const USER_ROLES = {
  BUYER_TENANT: 'buyer_tenant',
  SELLER_AGENT: 'seller_agent',
  BACHELOR_POSTER: 'bachelor_poster',
};

export const ROLE_OPTIONS = [
  {
    value: USER_ROLES.BUYER_TENANT,
    label: 'Buyer / Tenant',
    description: 'Find or rent properties',
    icon: 'user',
  },
  {
    value: USER_ROLES.SELLER_AGENT,
    label: 'Seller / Agent / Developer',
    description: 'List & manage properties',
    icon: 'briefcase',
  },
  {
    value: USER_ROLES.BACHELOR_POSTER,
    label: 'Bachelor Poster',
    description: 'Post bachelor accommodation',
    icon: 'graduation',
  },
];

export const DASHBOARD_ROUTES = {
  [USER_ROLES.BUYER_TENANT]: '/dashboard',
  [USER_ROLES.SELLER_AGENT]: '/dashboard',
  [USER_ROLES.BACHELOR_POSTER]: '/dashboard',
};
