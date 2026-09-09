'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { USER_ROLES } from '../../constants';
import { PUBLIC_PROPERTIES } from '../../data/publicListings';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import PropertyCard from '../../components/landing/PropertyCard';
import { openPortalWindow } from '../../utils/navigation';
import { hasPortalToken } from '../../utils/authStorage';
import PublicPageShell from '../../components/PublicPageShell';
import styles from '../../components/landing/landing.module.css';

export default function BrowsePropertiesPage() {
  const router = useRouter();

  const handleOwnerDetails = (property) => {
    if (hasPortalToken(USER_ROLES.BUYER_TENANT)) {
      router.push(`/browse/properties/${property.id}`);
    } else {
      openPortalWindow(`/browse/properties/${property.id}`, USER_ROLES.BUYER_TENANT);
    }
  };

  return (
    <PublicPageShell className={styles.browsePage}>
      <LandingHeader />

      <div className={styles.browseHero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to home</Link>
          <h1 className={styles.browseHeroTitle}>All Properties</h1>
          <p className={styles.browseHeroSub}>
            Browse verified listings in Uttara and across Dhaka. No account needed to view details.
          </p>
        </div>
      </div>

      <div className={`${styles.container} ${styles.browseContent}`}>
        {PUBLIC_PROPERTIES.length === 0 ? (
          <div className={styles.emptyState}>No properties available yet.</div>
        ) : (
          <div className={styles.propGrid}>
            {PUBLIC_PROPERTIES.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onViewDetails={(p) => router.push(`/browse/properties/${p.id}`)}
                onOwnerDetails={handleOwnerDetails}
              />
            ))}
          </div>
        )}
      </div>

      <LandingFooter />
    </PublicPageShell>
  );
}
