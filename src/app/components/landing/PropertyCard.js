'use client';

import { formatSqFt, formatPostedAgo, formatTaka } from '../../utils/format';
import { getUploadUrl } from '../../utils/api';
import styles from './landing.module.css';

export default function PropertyCard({ property, onViewDetails, onOwnerDetails }) {
  const photo = property.photos?.[0];
  const postedAgo = formatPostedAgo(property.createdAt);

  return (
    <article className={styles.propCard}>
      <div className={styles.propImage} style={{ background: photo ? '#e5e7eb' : '#dbeafe' }}>
        {photo ? (
          <img src={getUploadUrl(photo)} alt={property.title} className={styles.propImagePhoto} />
        ) : (
          <span className={styles.propImageIcon} aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
            </svg>
          </span>
        )}
        {property.status === 'verified' && (
          <span className={styles.verifiedBadge}>{property.statusLabel}</span>
        )}
      </div>
      <div className={styles.propBody}>
        <h3 className={styles.propTitle}>{property.title}</h3>
        <p className={styles.propLocation}>
          {[property.sector, property.area, property.city].filter(Boolean).join(', ')}
        </p>
        {postedAgo && <p className={styles.propMetaLine}>Listed {postedAgo}</p>}
        <p className={styles.propPrice}>{formatTaka(property.priceDisplay)}</p>
        <div className={styles.propSpecs}>
          {property.bedrooms && Number(property.bedrooms) > 0 && (
            <span>{property.bedrooms} Bed</span>
          )}
          {property.bathrooms && <span>{property.bathrooms} Bath</span>}
          <span>{formatSqFt(property.sizeSqFt)}</span>
        </div>
        <div className={styles.propActions}>
          <button type="button" className={styles.btnSecondary} onClick={() => onViewDetails(property)}>
            View full details
          </button>
          <button type="button" className={styles.btnPrimary} onClick={() => onOwnerDetails(property)}>
            Owner details
          </button>
        </div>
      </div>
    </article>
  );
}
