'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { USER_ROLES } from '../../constants';
import { openPortalWindow } from '../../utils/navigation';
import { logout } from '../../store/slices/authSlice';
import styles from './landing.module.css';

export default function LandingHeader() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const goBuyer = (path) => openPortalWindow(path, USER_ROLES.BUYER_TENANT);
  const goSeller = (path) => openPortalWindow(path, USER_ROLES.SELLER_AGENT);

  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.logoLink}>
          <Image src="/logo.png" alt="TrueSpace" width={140} height={36} className={styles.logoImg} priority />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <Link href="/browse/requirements" className={styles.navLink}>Requirements</Link>
          <Link href="/browse/properties" className={styles.navLink}>Properties</Link>
          <a href="#bachelor" className={styles.navLink}>Bachelor Feed</a>
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
      </div>
    </header>
  );
}
