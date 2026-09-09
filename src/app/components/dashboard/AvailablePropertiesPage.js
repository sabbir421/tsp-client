'use client';

import { useEffect, useState } from 'react';
import { propertyApi, getUploadUrl } from '../../utils/api';
import { formatSqFt } from '../../utils/format';
import common from './pageCommon.module.css';
import cardStyles from './myProperties.module.css';
import modalStyles from './matchedProperties.module.css';
import styles from './availableProperties.module.css';

const BADGE_CLASS = {
  pending: cardStyles.badgePending,
  verified: cardStyles.badgeVerified,
  matched: cardStyles.badgeMatched,
};

function isVideoPath(src) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(src || '');
}

function buildSpecRows(property) {
  if (!property) return [];
  const rows = [
    { label: 'Type', value: property.propertyType },
    {
      label: 'For',
      value: property.propertyFor
        ? `${property.propertyFor === 'rent' ? 'Rent' : 'Sale'}${
            property.purpose ? ` · ${property.purpose}` : ''
          }`
        : null,
    },
    {
      label: 'Location',
      value: [property.sector, property.area, property.city].filter(Boolean).join(', ') || null,
    },
    { label: 'Address', value: property.address },
    { label: 'Area map', value: property.location },
    { label: 'Size', value: property.sizeSqFt ? formatSqFt(property.sizeSqFt) : null },
    {
      label: 'Land',
      value: property.landAreaKatha ? `${property.landAreaKatha} katha` : null,
    },
    { label: 'Bedrooms', value: property.bedrooms },
    { label: 'Bathrooms', value: property.bathrooms },
    { label: 'Balcony', value: property.balcony },
    {
      label: 'Floor',
      value:
        property.floor != null
          ? property.totalFloors
            ? `${property.floor} of ${property.totalFloors}`
            : String(property.floor)
          : null,
    },
    {
      label: 'Negotiable',
      value: property.priceNegotiable ? 'Yes' : null,
    },
  ];
  return rows.filter((row) => row.value);
}

function PropertyMedia({ src, className, alt = '' }) {
  const url = getUploadUrl(src);
  if (isVideoPath(src)) {
    return (
      <video src={url} className={className} muted playsInline preload="metadata" aria-label={alt} />
    );
  }
  return <img src={url} alt={alt} className={className} />;
}

function PropertyDetailModal({ property, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = property.photos || [];
  const specs = buildSpecRows(property);
  const amenities = [...(property.amenities || []), property.otherAmenity].filter(Boolean);
  const current = photos[photoIndex];

  return (
    <div className={modalStyles.lightboxOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.detailModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="available-property-title"
      >
        <button type="button" className={modalStyles.lightboxClose} onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className={styles.detailModalBody}>
          {photos.length > 0 ? (
            <div className={styles.detailMedia}>
              <PropertyMedia src={current} className={styles.detailMainImage} alt={property.title} />
              {photos.length > 1 && (
                <div className={modalStyles.lightboxThumbs}>
                  {photos.map((photo, i) => (
                    <button
                      key={`${photo}-${i}`}
                      type="button"
                      className={`${modalStyles.lightboxThumbBtn} ${
                        i === photoIndex ? modalStyles.lightboxThumbActive : ''
                      }`}
                      onClick={() => setPhotoIndex(i)}
                    >
                      <PropertyMedia src={photo} className={modalStyles.lightboxThumb} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={cardStyles.cardImagePlaceholder}>No photo</div>
          )}

          <div className={styles.detailContent}>
            <span className={`${cardStyles.badge} ${BADGE_CLASS[property.status] || ''}`}>
              {property.statusLabel}
            </span>
            <h2 id="available-property-title" className={styles.detailTitle}>
              {property.title}
            </h2>
            <p className={styles.detailPrice}>{property.priceDisplay}</p>
            <p className={styles.detailMeta}>{property.meta}</p>

            <dl className={modalStyles.specList}>
              {specs.map((row) => (
                <div key={row.label} className={modalStyles.specRow}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>

            {amenities.length > 0 && (
              <div className={styles.amenitiesBlock}>
                <p className={styles.amenitiesTitle}>Amenities</p>
                <div className={styles.amenityTags}>
                  {amenities.map((item) => (
                    <span key={item} className={styles.amenityTag}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.amenitiesBlock}>
              <p className={styles.amenitiesTitle}>Owner Details</p>
              <dl className={modalStyles.specList}>
                {property.contactNumber && (
                  <div className={modalStyles.specRow}>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${property.contactNumber}`}>{property.contactNumber}</a>
                    </dd>
                  </div>
                )}
                {property.whatsappNumber && (
                  <div className={modalStyles.specRow}>
                    <dt>WhatsApp</dt>
                    <dd>
                      <a
                        href={`https://wa.me/${property.whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {property.whatsappNumber}
                      </a>
                    </dd>
                  </div>
                )}
                {property.preferredContact?.length > 0 && (
                  <div className={modalStyles.specRow}>
                    <dt>Preferred contact</dt>
                    <dd>{property.preferredContact.join(', ')}</dd>
                  </div>
                )}
                {property.bestTime && (
                  <div className={modalStyles.specRow}>
                    <dt>Best time to contact</dt>
                    <dd>{property.bestTime}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AvailablePropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = await propertyApi.getAvailable();
        setProperties(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading available properties...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>Available Properties</h1>
          <p className={common.pageSubtitle}>
            Browse all properties listed by sellers and agents on TrueSpace. View full details
            without owner contact — contact unlocks through the matching flow.
          </p>
        </div>
      </div>

      {error && <div className={common.error}>{error}</div>}

      {properties.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>🏢</div>
          <h2 className={common.emptyTitle}>No properties listed yet</h2>
          <p className={common.emptyDesc}>
            When sellers post properties, they will appear here for browsing.
          </p>
        </div>
      ) : (
        <div className={cardStyles.propertyGrid}>
          {properties.map((property) => (
            <article key={property.id} className={cardStyles.propertyCard}>
              {property.photos?.[0] ? (
                <PropertyMedia
                  src={property.photos[0]}
                  className={cardStyles.cardImage}
                  alt={property.title}
                />
              ) : (
                <div className={cardStyles.cardImagePlaceholder}>No photo</div>
              )}

              <div className={cardStyles.cardBody}>
                <span className={`${cardStyles.badge} ${BADGE_CLASS[property.status] || ''}`}>
                  {property.statusLabel}
                </span>
                <h2 className={cardStyles.cardTitle}>{property.title}</h2>
                <p className={cardStyles.cardMeta}>{property.meta}</p>
                <p className={cardStyles.cardPrice}>{property.priceDisplay}</p>
                <p className={cardStyles.cardMeta}>
                  {[property.sector, property.area, property.city].filter(Boolean).join(', ')}
                </p>

                <div className={cardStyles.cardActions}>
                  <button
                    type="button"
                    className={cardStyles.editBtn}
                    onClick={() => setSelected(property)}
                  >
                    View full details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && <PropertyDetailModal property={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
