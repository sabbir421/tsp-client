'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { USER_ROLES } from '../../../constants';
import { PUBLIC_PROPERTIES } from '../../../data/publicListings';
import LandingHeader from '../../../components/landing/LandingHeader';
import LandingFooter from '../../../components/landing/LandingFooter';
import PropertyGallery from '../../../components/landing/PropertyGallery';
import { openPortalWindow } from '../../../utils/navigation';
import { hasPortalToken } from '../../../utils/authStorage';
import { formatSqFt } from '../../../utils/format';
import PublicPageShell from '../../../components/PublicPageShell';
import styles from '../../../components/landing/landing.module.css';

export default function PropertyDetailPage() {
  const params = useParams();
  const property = useMemo(
    () => PUBLIC_PROPERTIES.find((p) => String(p.id) === String(params.id)),
    [params.id]
  );

  const isBuyerAuthenticated = hasPortalToken(USER_ROLES.BUYER_TENANT);

  if (!property) {
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

  const facts = [];
  if (property.bedrooms > 0) facts.push({ label: 'Bedrooms', value: property.bedrooms });
  facts.push({ label: 'Bathrooms', value: property.bathrooms });
  facts.push({ label: 'Size', value: formatSqFt(property.sizeSqFt) });

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
            {property.postedAgo && <p className={styles.detailPageMeta}>Listed {property.postedAgo}</p>}

            <div className={styles.factStrip}>
              {facts.flatMap((f, i) => [
                i > 0 ? <span key={`div-${f.label}`} className={styles.factDivider} aria-hidden="true" /> : null,
                <div key={f.label} className={styles.factItem}>
                  <p className={styles.factValue}>{f.value}</p>
                  <p className={styles.factLabel}>{f.label}</p>
                </div>,
              ])}
            </div>

            {property.description && (
              <div className={styles.modalSection}>
                <p className={styles.modalSectionTitle}>About this property</p>
                <p className={styles.modalText}>{property.description}</p>
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
                <p className={styles.sidebarPrice}>
                  {property.price}
                  {property.priceNote && <span className={styles.sidebarPriceNote}> {property.priceNote}</span>}
                </p>
                {property.status === 'verified' && (
                  <span className={styles.sidebarVerifiedBadge}>✓ Verified</span>
                )}
              </div>

              {isBuyerAuthenticated ? (
                <div className={styles.sidebarOwner}>
                  <p className={styles.sidebarOwnerLabel}>Owner Details</p>
                  <div className={styles.ownerRow}>
                    <span className={styles.ownerAvatar} aria-hidden="true">
                      {(property.ownerName || 'T')[0].toUpperCase()}
                    </span>
                    <span className={styles.ownerName}>
                      {property.ownerName || 'TrueSpace verified owner'}
                    </span>
                  </div>
                  <div className={styles.ownerContactBtns}>
                    {property.contactNumber && (
                      <a href={`tel:${property.contactNumber}`} className={styles.ownerContactBtn}>
                        📞 {property.contactNumber}
                      </a>
                    )}
                    {property.whatsappNumber && (
                      <a
                        href={`https://wa.me/${property.whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.ownerContactBtn}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.sidebarOwner}>
                  <p className={styles.sidebarLockNote}>
                    🔒 Owner contact details are protected. Sign in to your portal to unlock them.
                  </p>
                  <button
                    type="button"
                    className={`${styles.btnPrimary} ${styles.sidebarFullBtn}`}
                    onClick={handleOwnerDetails}
                  >
                    See property owner details
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <LandingFooter />
    </PublicPageShell>
  );
}
