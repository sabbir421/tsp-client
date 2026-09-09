'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../../store/slices/authSlice';
import {
  IconDashboard,
  IconProperties,
  IconRequirements,
  IconSuggestions,
  IconLeads,
  IconSiteVisits,
  IconPayments,
  IconMessages,
  IconProfile,
  IconSettings,
  IconLogout,
  IconHome,
  IconPlus,
} from './icons';
import styles from './dashboard.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: IconDashboard },
  { label: 'Post Property', href: '/dashboard/post-property', icon: IconPlus },
  { label: 'My Properties', href: '/dashboard/my-properties', icon: IconProperties },
  { label: 'Buyer Requirements', href: '/dashboard/buyer-requirements', icon: IconRequirements },
  { label: 'Submitted Suggestions', href: '/dashboard/submitted-suggestions', icon: IconSuggestions },
  { label: 'Leads Shared by TSP', href: '#', icon: IconLeads },
  { label: 'Site Visits', href: '/dashboard/site-visits', icon: IconSiteVisits },
  { label: 'Payments / Plans', href: '#', icon: IconPayments },
  { label: 'Messages', href: '#', icon: IconMessages },
  { label: 'Profile', href: '/dashboard/profile', icon: IconProfile },
  { label: 'Settings', href: '#', icon: IconSettings },
];

export default function Sidebar({ open = false, onClose }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/role-select');
  };

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarLogo}>
        <Link href="/dashboard" className={styles.sidebarLogoText} onClick={onClose}>
          <div className={styles.sidebarLogoIcon}>
            <IconHome />
          </div>
          <div>
            <div className={styles.sidebarLogoName}>TrueSpace</div>
            <div className={styles.sidebarLogoSub}>Property</div>
          </div>
        </Link>
        <button
          type="button"
          className={styles.sidebarCloseBtn}
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href !== '#' &&
            (pathname === href || (href !== '/dashboard' && pathname.startsWith(href)));

          if (href === '#') {
            return (
              <span key={label} className={`${styles.navItem} ${styles.navItemDisabled}`} title="Coming soon">
                <span className={styles.navItemIcon}><Icon /></span>
                {label}
              </span>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={onClose}
            >
              <span className={styles.navItemIcon}><Icon /></span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          type="button"
          className={`${styles.navItem} ${styles.logoutBtn}`}
          onClick={handleLogout}
        >
          <span className={styles.navItemIcon}><IconLogout /></span>
          Logout
        </button>
      </div>
    </aside>
  );
}
