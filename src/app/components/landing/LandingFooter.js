'use client';

import Link from 'next/link';
import Image from 'next/image';
import { USER_ROLES } from '../../constants';
import { openPortalWindow } from '../../utils/navigation';
import styles from './landing.module.css';

export default function LandingFooter() {
  const goBuyer = (path) => openPortalWindow(path, USER_ROLES.BUYER_TENANT);
  const goSeller = (path) => openPortalWindow(path, USER_ROLES.SELLER_AGENT);

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <Link href="/">
              <Image src="/logo.png" alt="TrueSpace" width={120} height={32} />
            </Link>
            <p className={styles.footerBrand}>
              Stop scrolling listings. Post what you need — let the market answer.
            </p>
          </div>

          <div>
            <p className={styles.footerColTitle}>Discover</p>
            <Link href="/browse/requirements" className={styles.footerLink}>Requirements</Link>
            <Link href="/browse/properties" className={styles.footerLink}>Properties</Link>
            <a href="#bachelor" className={styles.footerLink}>Bachelor Feed</a>
          </div>

          <div>
            <p className={styles.footerColTitle}>For Owners</p>
            <button type="button" className={styles.footerLink} onClick={() => goSeller('/dashboard/post-property')}>
              List a property
            </button>
            <button type="button" className={styles.footerLink} onClick={() => goSeller('/dashboard/buyer-requirements')}>
              Answer requirements
            </button>
          </div>

          <div>
            <p className={styles.footerColTitle}>Company</p>
            <a href="#how-it-works" className={styles.footerLink}>How it works</a>
            <button type="button" className={styles.footerLink} onClick={() => goBuyer('/role-select')}>
              Log in
            </button>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span suppressHydrationWarning>© 2026 TrueSpace Property</span>
          <div className={styles.footerTags}>
            <span className={styles.footerTag}>Dhaka</span>
            <span className={styles.footerTag}>Uttara pilot</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
