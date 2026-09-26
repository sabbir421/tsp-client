'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { USER_ROLES } from '../../../constants';
import LandingHeader from '../../../components/landing/LandingHeader';
import LandingFooter from '../../../components/landing/LandingFooter';
import PropertyGallery from '../../../components/landing/PropertyGallery';
import { openPortalWindow } from '../../../utils/navigation';
import { propertyApi } from '../../../utils/api';
import { formatPostedAgo, formatSqFt, formatTaka } from '../../../utils/format';
import PublicPageShell from '../../../components/PublicPageShell';
import styles from '../../../components/landing/landing.module.css';

export default function PropertyDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await propertyApi.getPublicOne(params.id);
        setProperty(res.data || null);
        setNotFound(!res.data);
      } catch {
        setProperty(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) {
    return (
      <PublicPageShell className={styles.browsePage}>
        <LandingHeader />
        <div className={`${styles.container} ${styles.browseContent}`}>
          <div className={styles.emptyState}>Loading property...</div>
        </div>
        <LandingFooter />
      </PublicPageShell>
    );
  }

  if (notFound || !property) {
    return (
      <PublicPageShell className={styles.browsePage}>
        <LandingHeader />
        <div className={`${styles.container} ${styles.browseContent}`}>
          <div className={styles.emptyState}>
            Property not found. <Link href="/browse/properties">Back to all properties</Link>
          </div>
        </div>
        <LandingFooter />
      </PublicPageShell>
    );
  }

  const handleOwnerDetails = () => {
    openPortalWindow(`/browse/properties/${property.id}`, USER_ROLES.BUYER_TENANT);
  };

  const tags = [property.sector, property.propertyType, property.purpose].filter(Boolean);
  const postedAgo = formatPostedAgo(property.createdAt);

  const facts = [];
  if (property.bedrooms && Number(property.bedrooms) > 0) {
    facts.push({ label: 'Bedrooms', value: property.bedrooms });
  }
  if (property.bathrooms) facts.push({ label: 'Bathrooms', value: property.bathrooms });
  if (property.sizeSqFt) facts.push({ label: 'Size', value: formatSqFt(property.sizeSqFt) });

  return (
    <PublicPageShell className={styles.browsePage}>
      <LandingHeader />

      <div className={`${styles.container} ${styles.detailPageWrap}`}>
        <Link href="/browse/properties" className={styles.detailBackLink}>
          ← Back to all properties
        </Link>

        <PropertyGallery
          photos={property.photos}
          title={property.title}
          isVerified={property.status === 'verified'}
        />

        <div className={styles.detailGrid}>
          <div className={styles.detailMain}>
            {tags.length > 0 && (
              <div className={styles.tagRow}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tagPill}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className={styles.detailPageTitle}>{property.title}</h1>
            <p className={styles.locationRow}>
              <svg
                className={styles.locationIcon}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 21s-7-7.5-7-12a7 7 0 1114 0c0 4.5-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {[property.sector, property.area, property.city].filter(Boolean).join(', ')}
            </p>
            {postedAgo && <p className={styles.detailPageMeta}>Listed {postedAgo}</p>}

            {facts.length > 0 && (
              <div className={styles.factStrip}>
                {facts.flatMap((f, i) => [
                  i > 0 ? <span key={`div-${f.label}`} className={styles.factDivider} aria-hidden="true" /> : null,
                  <div key={f.label} className={styles.factItem}>
                    <p className={styles.factValue}>{f.value}</p>
                    <p className={styles.factLabel}>{f.label}</p>
                  </div>,
                ])}
              </div>
            )}

            {property.address && (
              <div className={styles.modalSection}>
                <p className={styles.modalSectionTitle}>Address</p>
                <p className={styles.modalText}>{property.address}</p>
              </div>
            )}

            {property.amenities?.length > 0 && (
              <>
                <hr className={styles.detailDivider} />
                <div className={styles.modalSection}>
                  <p className={styles.modalSectionTitle}>What&apos;s included</p>
                  <div className={styles.chipList}>
                    {property.amenities.map((a) => (
                      <span key={a} className={styles.chip}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className={styles.detailSidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarPriceRow}>
                <p className={styles.sidebarPrice}>{formatTaka(property.priceDisplay)}</p>
                {property.status === 'verified' && (
                  <span className={styles.sidebarVerifiedBadge}>✓ Verified</span>
                )}
              </div>

              <div className={styles.sidebarOwner}>
                <p className={styles.sidebarLockNote}>
                  Owner contact details stay hidden until you match and accept a listing in your portal.
                </p>
                <button
                  type="button"
                  className={`${styles.btnPrimary} ${styles.sidebarFullBtn}`}
                  onClick={handleOwnerDetails}
                >
                  See property owner details
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LandingFooter />
    </PublicPageShell>
  );
}
