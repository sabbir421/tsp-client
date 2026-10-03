'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { USER_ROLES } from '../../constants';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import RequirementCard from '../../components/landing/RequirementCard';
import RequirementDetailModal from '../../components/landing/RequirementDetailModal';
import FilterBar, { filterItems } from '../../components/common/FilterBar';
import { openPortalWindow } from '../../utils/navigation';
import { requirementApi } from '../../utils/api';
import PublicPageShell from '../../components/PublicPageShell';
import styles from '../../components/landing/landing.module.css';

export default function BrowseRequirementsPage() {
  const [selected, setSelected] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [filter, setFilter] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await requirementApi.getPublic();
        setRequirements(res.data || []);
      } catch {
        setRequirements([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRequirements = filterItems(requirements, filter);

  return (
    <PublicPageShell className={styles.browsePage}>
      <LandingHeader />

      <div className={styles.browseHero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to home</Link>
          <h1 className={styles.browseHeroTitle}>All Requirements</h1>
          <p className={styles.browseHeroSub}>
            Active buyer and tenant requirements. Use filters to search by budget, location, or bedrooms.
          </p>
        </div>
      </div>

      <div className={`${styles.container} ${styles.browseContent}`}>
        <FilterBar
          onFilterChange={setFilter}
          placeholder="Filter requirements by title, sector, area..."
        />

        {loading ? (
          <div className={styles.emptyState}>Loading requirements...</div>
        ) : filteredRequirements.length === 0 ? (
          <div className={styles.emptyState}>
            {requirements.length === 0
              ? 'No requirements posted yet.'
              : 'No requirements match your filter criteria.'}
          </div>
        ) : (
          <div className={styles.reqGrid}>
            {filteredRequirements.map((req) => (
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
