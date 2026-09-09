'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import BuyerSidebar from './BuyerSidebar';
import BuyerTopHeader from './BuyerTopHeader';
import { isSellerAgent } from '../../utils/roles';
import { hasPortalToken } from '../../utils/authStorage';
import { activateRoleSession } from '../../store/slices/authSlice';
import {
  buildRoleSelectHref,
  getRequiredRoleForPath,
} from '../../utils/navigation';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated, isHydrated, user, selectedRole } = useSelector((state) => state.auth);
  const sellerView = isSellerAgent(user, selectedRole);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessReady, setAccessReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    const requiredRole = getRequiredRoleForPath(pathname);

    // Generic dashboard: must be logged into some portal
    if (!requiredRole) {
      if (!isAuthenticated) {
        setAccessReady(false);
        router.replace(buildRoleSelectHref(pathname));
        return;
      }
      setAccessReady(true);
      return;
    }

    // Role-specific pages: only that portal's token is allowed
    if (user?.role === requiredRole) {
      setAccessReady(true);
      return;
    }

    if (hasPortalToken(requiredRole)) {
      dispatch(activateRoleSession(requiredRole));
      setAccessReady(true);
      return;
    }

    setAccessReady(false);
    router.replace(buildRoleSelectHref(pathname, requiredRole));
  }, [isAuthenticated, isHydrated, pathname, user, dispatch, router]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSidebarOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  if (!isHydrated || !isAuthenticated || !accessReady) {
    return <div className={styles.pageLoading}>Loading...</div>;
  }

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={styles.shell}>
      {sidebarOpen && (
        <button
          type="button"
          className={styles.sidebarBackdrop}
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      {sellerView ? (
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      ) : (
        <BuyerSidebar open={sidebarOpen} onClose={closeSidebar} />
      )}

      <div className={styles.main}>
        {sellerView ? (
          <TopHeader onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        ) : (
          <BuyerTopHeader onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
