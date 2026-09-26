'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../../store/slices/authSlice';
import {
  IconDashboard,
  IconRequirements,
  IconSiteVisits,
  IconMessages,
  IconProfile,
  IconSettings,
  IconLogout,
  IconHome,
} from './icons';
import { IconMatched, IconContact, IconAvailable } from './buyerIcons';
import layoutStyles from './dashboard.module.css';
import styles from './buyerLayout.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: IconDashboard },
  { label: 'My Requirements', href: '/dashboard/my-requirements', icon: IconRequirements },
  { label: 'Matched Properties', href: '/dashboard/matched-properties', icon: IconMatched },
  { label: 'Available Properties', href: '/dashboard/available-properties', icon: IconAvailable },
  { label: 'Site Visits', href: '/dashboard/site-visits', icon: IconSiteVisits },
  { label: 'Contact Requests', href: '#', icon: IconContact },
  { label: 'Messages', href: '#', icon: IconMessages },
  { label: 'Profile', href: '/dashboard/profile', icon: IconProfile },
  { label: 'Settings', href: '#', icon: IconSettings },
];

export default function BuyerSidebar({ open = false, onClose }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/role-select');
  };

  return (
    <aside className={`${layoutStyles.sidebar} ${open ? layoutStyles.sidebarOpen : ''}`}>
      <div className={layoutStyles.sidebarLogo}>
        <Link href="/dashboard" className={layoutStyles.sidebarLogoText} onClick={onClose}>
          <div className={layoutStyles.sidebarLogoIcon}>
            <IconHome />
          </div>
          <div>
            <div className={layoutStyles.sidebarLogoName}>
              True<span className={styles.logoAccent}>space</span>
            </div>
          </div>
        </Link>
        <button
          type="button"
          className={layoutStyles.sidebarCloseBtn}
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav className={layoutStyles.sidebarNav}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href !== '#' &&
            (pathname === href || (href !== '/dashboard' && pathname.startsWith(href)));

          if (href === '#') {
            return (
              <span key={label} className={`${layoutStyles.navItem} ${layoutStyles.navItemDisabled}`} title="Coming soon">
                <span className={layoutStyles.navItemIcon}><Icon /></span>
                {label}
              </span>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={`${layoutStyles.navItem} ${isActive ? styles.navItemActivePill : ''}`}
              onClick={onClose}
            >
              <span className={layoutStyles.navItemIcon}><Icon /></span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.expertHelp}>
        <div className={styles.expertHelpContent}>
          <div className={styles.expertHelpText}>
            <strong>Need Expert Help?</strong>
            <span>Talk to our property experts for free</span>
          </div>
          <button type="button" className={styles.expertHelpBtn}>Contact Expert</button>
        </div>
        <div className={styles.expertAvatar} aria-hidden="true">
          TS
        </div>
      </div>

      <div className={layoutStyles.sidebarFooter}>
        <button
          type="button"
          className={`${layoutStyles.navItem} ${layoutStyles.logoutBtn}`}
          onClick={handleLogout}
        >
          <span className={layoutStyles.navItemIcon}><IconLogout /></span>
          Logout
        </button>
      </div>
    </aside>
  );
}
