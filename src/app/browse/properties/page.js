'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { USER_ROLES } from '../../constants';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import PropertyCard from '../../components/landing/PropertyCard';
import FilterBar, { filterItems } from '../../components/common/FilterBar';
import { openPortalWindow } from '../../utils/navigation';
import { hasPortalToken } from '../../utils/authStorage';
import { propertyApi } from '../../utils/api';
import PublicPageShell from '../../components/PublicPageShell';
import styles from '../../components/landing/landing.module.css';

export default function BrowsePropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await propertyApi.getPublic();
        setProperties(res.data || []);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProperties = filterItems(properties, filter);

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
            Browse listings posted by sellers and agents. Use filters to narrow down by price, location, or bedrooms.
          </p>
        </div>
      </div>

      <div className={`${styles.container} ${styles.browseContent}`}>
        <FilterBar
          onFilterChange={setFilter}
          placeholder="Filter properties by title, sector, area, city..."
        />

        {loading ? (
          <div className={styles.emptyState}>Loading properties...</div>
        ) : filteredProperties.length === 0 ? (
          <div className={styles.emptyState}>
            {properties.length === 0
              ? 'No properties available yet.'
              : 'No properties match your filter criteria.'}
          </div>
        ) : (
          <div className={styles.propGrid}>
            {filteredProperties.map((prop) => (
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
