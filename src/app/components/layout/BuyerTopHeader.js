'use client';

import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IconMessages } from './icons';
import { IconBell, IconChevronDown } from './buyerIcons';
import layoutStyles from './dashboard.module.css';
import styles from './buyerLayout.module.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Buyer Dashboard', subtitle: 'Your home search command center' },
  '/dashboard/my-requirements': {
    title: 'My Requirements',
    subtitle: 'Manage your property search criteria',
  },
  '/dashboard/matched-properties': {
    title: 'Matched Properties',
    subtitle: 'Properties matched to your requirements',
  },
  '/dashboard/site-visits': {
    title: 'Site Visits',
    subtitle: 'Accepted matches and visit status',
  },
  '/dashboard/profile': {
    title: 'My Profile',
    subtitle: 'View and update your account details',
  },
};

export default function BuyerTopHeader({ onMenuClick, sidebarOpen }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.fullName?.split(' ')[0] || 'User';
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
    (pathname.startsWith('/dashboard/my-requirements')
      ? PAGE_TITLES['/dashboard/my-requirements']
      : PAGE_TITLES['/dashboard']);

  return (
    <header className={styles.buyerTopHeader}>
      <div className={styles.buyerHeaderLeft}>
        <button
          type="button"
          className={layoutStyles.menuToggle}
          onClick={onMenuClick}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <div>
          <h1 className={styles.buyerHeaderTitle}>{pageInfo.title}</h1>
          <p className={styles.buyerHeaderSubtitle}>{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className={styles.buyerHeaderRight}>
        <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDesktop}`} aria-label="Notifications">
          <IconBell />
        </button>
        <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDesktop}`} aria-label="Messages">
          <IconMessages />
        </button>
        <button type="button" className={styles.userProfile}>
          <span className={layoutStyles.userAvatar}>{initials}</span>
          <div className={styles.userProfileText}>
            <span className={styles.userGreeting}>Hi, {firstName}</span>
            <span className={styles.userRole}>Buyer</span>
          </div>
          <span className={styles.chevronDesktop}>
            <IconChevronDown />
          </span>
        </button>
      </div>
    </header>
  );
}
