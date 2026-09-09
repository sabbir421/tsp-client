'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IconPlus } from './icons';
import styles from './dashboard.module.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Seller Dashboard', subtitle: 'Manage your properties and leads' },
  '/dashboard/post-property': { title: 'Post Property', subtitle: 'List a new property on TrueSpace' },
  '/dashboard/my-properties': { title: 'My Properties', subtitle: 'View and manage your listings' },
  '/dashboard/buyer-requirements': { title: 'Buyer Requirements', subtitle: 'Match properties to buyer needs' },
  '/dashboard/submitted-suggestions': { title: 'Submitted Suggestions', subtitle: 'Track your sent matches' },
  '/dashboard/site-visits': { title: 'Site Visits', subtitle: 'Accepted matches and buyer contacts' },
  '/dashboard/profile': { title: 'My Profile', subtitle: 'View and update your account details' },
};

export default function TopHeader({ onMenuClick, sidebarOpen }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const pageInfo =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith('/dashboard/my-properties')
      ? PAGE_TITLES['/dashboard/my-properties']
      : PAGE_TITLES['/dashboard']);

  return (
    <header className={styles.topHeader}>
      <div className={styles.topHeaderLeft}>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={onMenuClick}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <div>
          <span className={styles.topHeaderBrand}>{pageInfo.title}</span>
          <span className={styles.topHeaderSubtitle}>{pageInfo.subtitle}</span>
        </div>
      </div>

      <div className={styles.topActions}>
        <Link href="/dashboard/post-property" className={styles.postBtn}>
          <IconPlus />
          <span className={styles.postBtnText}>Post Property</span>
        </Link>
        <button type="button" className={styles.userMenu}>
          <span className={styles.userAvatar}>{initials}</span>
          <span className={styles.userMenuName}>{user?.fullName || 'Account'}</span>
        </button>
      </div>
    </header>
  );
}
