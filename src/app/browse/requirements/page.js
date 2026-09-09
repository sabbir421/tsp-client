'use client';

import { useState } from 'react';
import Link from 'next/link';
import { USER_ROLES } from '../../constants';
import { PUBLIC_REQUIREMENTS } from '../../data/publicListings';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import RequirementCard from '../../components/landing/RequirementCard';
import RequirementDetailModal from '../../components/landing/RequirementDetailModal';
import { openPortalWindow } from '../../utils/navigation';
import PublicPageShell from '../../components/PublicPageShell';
import styles from '../../components/landing/landing.module.css';

export default function BrowseRequirementsPage() {
  const [selected, setSelected] = useState(null);

  return (
    <PublicPageShell className={styles.browsePage}>
      <LandingHeader />

      <div className={styles.browseHero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to home</Link>
          <h1 className={styles.browseHeroTitle}>All Requirements</h1>
          <p className={styles.browseHeroSub}>
            Active buyer and tenant requirements. Browse freely — sign in to suggest a matching property.
          </p>
        </div>
      </div>

      <div className={`${styles.container} ${styles.browseContent}`}>
        {PUBLIC_REQUIREMENTS.length === 0 ? (
          <div className={styles.emptyState}>No requirements posted yet.</div>
        ) : (
          <div className={styles.reqGrid}>
            {PUBLIC_REQUIREMENTS.map((req) => (
              <RequirementCard
                key={req.id}
                requirement={req}
                onViewDetails={setSelected}
                onSuggest={(r) =>
                  openPortalWindow(
                    `/dashboard/buyer-requirements?requirementId=${r.id}`,
                    USER_ROLES.SELLER_AGENT
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      <LandingFooter />

      {selected && (
        <RequirementDetailModal requirement={selected} onClose={() => setSelected(null)} />
      )}
    </PublicPageShell>
  );
}
