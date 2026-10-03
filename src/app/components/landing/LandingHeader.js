'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { USER_ROLES } from '../../constants';
import { openPortalWindow } from '../../utils/navigation';
import { logout } from '../../store/slices/authSlice';
import styles from './landing.module.css';

export default function LandingHeader() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goBuyer = (path) => {
    setDrawerOpen(false);
    openPortalWindow(path, USER_ROLES.BUYER_TENANT);
  };

  const goSeller = (path) => {
    setDrawerOpen(false);
    openPortalWindow(path, USER_ROLES.SELLER_AGENT);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleProfileClick = () => {
    closeDrawer();
    if (isAuthenticated) {
      router.push('/dashboard/profile');
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const renderDrawer = () => {
    if (!drawerOpen || !mounted) return null;
    return createPortal(
      <>
        <div
          className={styles.drawerBackdrop}
          onClick={closeDrawer}
          aria-hidden="true"
        />
        <div
          className={styles.mobileDrawer}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          <div className={styles.drawerHeader}>
            <Link href="/" className={styles.logoLink} onClick={closeDrawer}>
              <Image src="/logo.png" alt="TrueSpace" width={120} height={30} className={styles.logoImg} />
            </Link>
            <button
              type="button"
              className={styles.drawerCloseBtn}
              onClick={closeDrawer}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <nav className={styles.drawerNav}>
            <Link href="/browse/requirements" className={styles.drawerNavLink} onClick={closeDrawer}>
              Requirements
            </Link>
            <Link href="/browse/properties" className={styles.drawerNavLink} onClick={closeDrawer}>
              Properties
            </Link>
            <button type="button" className={styles.drawerNavBtnLink} onClick={handleProfileClick}>
              Profile 👤
            </button>
            <a href="#bachelor" className={styles.drawerNavLink} onClick={closeDrawer}>
              Bachelor Feed
            </a>
            <a href="#how-it-works" className={styles.drawerNavLink} onClick={closeDrawer}>
              About
            </a>
            <a href="#contact" className={styles.drawerNavLink} onClick={closeDrawer}>
              Contact
            </a>
          </nav>

          <div className={styles.drawerActions}>
            <button
              type="button"
              className={`${styles.pillBtn} ${styles.drawerBtn}`}
              onClick={() => goSeller('/dashboard/post-property')}
            >
              List a property
            </button>
            <button
              type="button"
              className={`${styles.btnSecondary} ${styles.drawerBtn}`}
              onClick={() => goBuyer('/dashboard/my-requirements?create=1')}
            >
              Post a requirement
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                className={styles.textLink}
                onClick={() => {
                  dispatch(logout());
                  closeDrawer();
                }}
              >
                Log out
              </button>
            ) : (
              <button
                type="button"
                className={styles.textLink}
                onClick={() => goBuyer('/role-select')}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.logoLink} onClick={closeDrawer}>
          <Image src="/logo.png" alt="TrueSpace" width={140} height={36} className={styles.logoImg} priority />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <Link href="/browse/requirements" className={styles.navLink}>Requirements</Link>
          <Link href="/browse/properties" className={styles.navLink}>Properties</Link>
          <a href="#bachelor" className={styles.navLink}>Bachelor Feed</a>
          <button type="button" className={styles.navBtnLink} onClick={handleProfileClick}>
            Profile
          </button>
          <a href="#how-it-works" className={styles.navLink}>About</a>
          <a href="#contact" className={styles.navLink}>Contact</a>
        </nav>

        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <button type="button" className={styles.textLink} onClick={() => dispatch(logout())}>
              Log out
            </button>
          ) : (
            <button type="button" className={styles.textLink} onClick={() => goBuyer('/role-select')}>
              Log in
            </button>
          )}
          <button type="button" className={styles.textLinkAccent} onClick={() => goBuyer('/dashboard/my-requirements?create=1')}>
            Post a requirement
          </button>
          <button type="button" className={styles.pillBtn} onClick={() => goSeller('/dashboard/post-property')}>
            List a property
          </button>
        </div>

        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {renderDrawer()}
    </header>
  );
}
