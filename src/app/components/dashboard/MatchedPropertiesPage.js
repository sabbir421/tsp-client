'use client';

import { useEffect, useState, useCallback } from 'react';
import { matchApi, getUploadUrl } from '../../utils/api';
import common from './pageCommon.module.css';
import styles from './matchedProperties.module.css';

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
    {
      label: 'Size',
      value: property.sizeSqFt ? `${property.sizeSqFt} sft` : null,
    },
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

function amenityList(property) {
  if (!property) return [];
  const list = [...(property.amenities || [])];
  if (property.otherAmenity) list.push(property.otherAmenity);
  return list.filter(Boolean);
}

function getMatchMedia(match) {
  const fromProperty = (match.property?.photos || []).filter(Boolean);
  if (fromProperty.length > 0) return fromProperty;
  if (match.image) return [match.image];
  return [];
}

function isVideoPath(src) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(src || '');
}

function MediaThumb({ src, className, alt = '' }) {
  const url = getUploadUrl(src);
  if (isVideoPath(src)) {
    return (
      <video src={url} className={className} muted playsInline preload="metadata" aria-label={alt} />
    );
  }
  return <img src={url} alt={alt} className={className} />;
}

function CardImageSlider({ photos, title, matchScore, statusLabel, statusClass, onOpen }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = photos.length > 1;
  const current = photos[index] || photos[0];
  const currentIsVideo = isVideoPath(current);

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className={styles.imageWrap}>
      <button
        type="button"
        className={styles.imageOpenBtn}
        onClick={() => onOpen(index)}
        aria-label={currentIsVideo ? `Play video of ${title}` : `View photos of ${title}`}
      >
        {currentIsVideo ? (
          <video
            key={current}
            src={getUploadUrl(current)}
            className={styles.image}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img src={getUploadUrl(current)} alt={title} className={styles.image} />
        )}
        <span className={styles.imageViewOverlay}>
          <span className={styles.imageViewLabel}>{currentIsVideo ? 'Play' : 'View'}</span>
        </span>
        {currentIsVideo && <span className={styles.videoBadge}>Video</span>}
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            className={`${styles.cardNav} ${styles.cardNavPrev}`}
            onClick={goPrev}
            aria-label="Previous media"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.cardNav} ${styles.cardNavNext}`}
            onClick={goNext}
            aria-label="Next media"
          >
            ›
          </button>
          <div className={styles.cardDots}>
            {photos.map((photo, i) => (
              <button
                key={`${photo}-${i}`}
                type="button"
                className={`${styles.cardDot} ${i === index ? styles.cardDotActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                aria-label={`Show media ${i + 1}`}
              />
            ))}
          </div>
          <span className={styles.photoCount}>
            {index + 1}/{photos.length}
          </span>
        </>
      )}

      <span className={`${styles.statusBadge} ${statusClass}`}>{statusLabel}</span>
      <span className={styles.matchBadge}>{matchScore}%</span>
    </div>
  );
}

function ImageLightbox({ images, startIndex = 0, title, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const hasMultiple = images.length > 1;
  const current = images[index];
  const currentIsVideo = isVideoPath(current);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasMultiple) goPrev();
      if (e.key === 'ArrowRight' && hasMultiple) goNext();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goPrev, goNext, hasMultiple]);

  return (
    <div className={styles.lightboxOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.lightboxClose} onClick={onClose} aria-label="Close">
          ×
        </button>

        {title && <p className={styles.lightboxTitle}>{title}</p>}

        <div className={styles.lightboxStage}>
          {hasMultiple && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
              onClick={goPrev}
              aria-label="Previous media"
            >
              ‹
            </button>
          )}

          {currentIsVideo ? (
            <video
              key={current}
              src={getUploadUrl(current)}
              className={styles.lightboxVideo}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={getUploadUrl(current)}
              alt={`${title || 'Property'} photo ${index + 1}`}
              className={styles.lightboxImage}
            />
          )}

          {hasMultiple && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
              onClick={goNext}
              aria-label="Next media"
            >
              ›
            </button>
          )}
        </div>

        {hasMultiple && (
          <>
            <p className={styles.lightboxCounter}>
              {index + 1} / {images.length}
              {currentIsVideo ? ' · Video' : ''}
            </p>
            <div className={styles.lightboxDots}>
              {images.map((photo, i) => (
                <button
                  key={`${photo}-${i}`}
                  type="button"
                  className={`${styles.lightboxDot} ${i === index ? styles.lightboxDotActive : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to media ${i + 1}`}
                />
              ))}
            </div>
            <div className={styles.lightboxThumbs}>
              {images.map((photo, i) => (
                <button
                  key={`thumb-${photo}-${i}`}
                  type="button"
                  className={`${styles.lightboxThumbBtn} ${
                    i === index ? styles.lightboxThumbActive : ''
                  }`}
                  onClick={() => setIndex(i)}
                >
                  <MediaThumb src={photo} className={styles.lightboxThumb} />
                  {isVideoPath(photo) && <span className={styles.thumbVideoIcon}>▶</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MatchedPropertiesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [gallery, setGallery] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = await matchApi.getBuyerMatches();
        setMatches(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openGallery = (match, startIndex = 0) => {
    const media = getMatchMedia(match);
    if (media.length === 0) return;
    setGallery({
      images: media,
      startIndex: Math.min(startIndex, media.length - 1),
      title: match.title,
    });
  };

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading matched properties...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>Matched Properties</h1>
          <p className={common.pageSubtitle}>
            Full listing details from sellers and agents. Contact info unlocks after you accept a
            match (Site Visits).
          </p>
        </div>
      </div>

      {error && <div className={common.error}>{error}</div>}

      {matches.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>🔍</div>
          <h2 className={common.emptyTitle}>No matches yet</h2>
          <p className={common.emptyDesc}>
            Create a requirement and sellers will send matching properties here when they find a fit.
          </p>
        </div>
      ) : (
        <div className={styles.propertyGrid}>
          {matches.map((match) => {
            const isAccepted = match.status === 'interested';
            const isExpanded = expandedId === match.id;
            const prop = match.property;
            const specs = buildSpecRows(prop);
            const amenities = amenityList(prop);
            const photos = getMatchMedia(match);
            const extraPhotos = photos.slice(1);
            const statusClass = isAccepted
              ? styles.statusAccepted
              : match.property?.status === 'verified'
                ? styles.statusVerified
                : styles.statusPending;
            const statusLabel = isAccepted ? 'Accepted' : match.statusLabel;

            return (
              <article key={match.id} className={styles.propertyCard}>
                {photos.length > 0 ? (
                  <CardImageSlider
                    photos={photos}
                    title={match.title}
                    matchScore={match.matchScore}
                    statusLabel={statusLabel}
                    statusClass={statusClass}
                    onOpen={(startIndex) => openGallery(match, startIndex)}
                  />
                ) : (
                  <div className={styles.imageWrap}>
                    <div className={styles.imagePlaceholder}>No photo</div>
                    <span className={`${styles.statusBadge} ${statusClass}`}>{statusLabel}</span>
                    <span className={styles.matchBadge}>{match.matchScore}%</span>
                  </div>
                )}
                <div className={styles.cardBody}>
                  <div className={styles.price}>
                    {match.price}
                    {prop?.priceNegotiable ? (
                      <span className={styles.negotiableTag}>Negotiable</span>
                    ) : null}
                  </div>
                  <h2 className={styles.title}>{match.title}</h2>
                  <p className={styles.details}>{match.details}</p>
                  {prop && (
                    <p className={styles.locationLine}>
                      {[prop.sector, prop.area, prop.city].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {match.requirementTitle && (
                    <p className={styles.reqLink}>Matched to: {match.requirementTitle}</p>
                  )}
                  {match.sellerNote && (
                    <p className={styles.sellerNote}>&ldquo;{match.sellerNote}&rdquo;</p>
                  )}

                  {isExpanded && prop && (
                    <div className={styles.fullDetails}>
                      <h3 className={styles.fullDetailsTitle}>Property details</h3>
                      <dl className={styles.specList}>
                        {specs.map((row) => (
                          <div key={row.label} className={styles.specRow}>
                            <dt>{row.label}</dt>
                            <dd>{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                      {amenities.length > 0 && (
                        <div className={styles.amenityBlock}>
                          <span className={styles.amenityLabel}>Amenities</span>
                          <div className={styles.amenityChips}>
                            {amenities.map((item) => (
                              <span key={item} className={styles.amenityChip}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {extraPhotos.length > 0 && (
                        <div className={styles.photoStrip}>
                          {extraPhotos.map((photo, photoIndex) => (
                            <button
                              key={photo}
                              type="button"
                              className={styles.thumbBtn}
                              onClick={() => openGallery(match, photoIndex + 1)}
                              aria-label={
                                isVideoPath(photo)
                                  ? `Play video ${photoIndex + 2}`
                                  : `View photo ${photoIndex + 2}`
                              }
                            >
                              <MediaThumb src={photo} className={styles.thumb} />
                              {isVideoPath(photo) && (
                                <span className={styles.thumbVideoIcon}>▶</span>
                              )}
                              <span className={styles.thumbView}>
                                {isVideoPath(photo) ? 'Play' : 'View'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      <p className={styles.contactHint}>
                        Contact details are hidden until you accept. After accepting, open Site
                        Visits to reach the seller.
                      </p>
                    </div>
                  )}

                  <div className={styles.matchScore}>
                    <div className={styles.matchBar}>
                      <div
                        className={styles.matchBarFill}
                        style={{ width: `${match.matchScore}%` }}
                      />
                    </div>
                    <span className={styles.matchLabel}>{match.matchScore}% Match</span>
                  </div>
                  <div className={styles.actionsRow}>
                    <button
                      type="button"
                      className={styles.detailsBtn}
                      onClick={() =>
                        setExpandedId((prev) => (prev === match.id ? null : match.id))
                      }
                    >
                      {isExpanded ? 'Hide details' : 'View full details'}
                    </button>
                    <button
                      type="button"
                      className={`${styles.acceptBtn} ${isAccepted ? styles.acceptBtnAccepted : ''}`}
                      disabled={actingId === match.id || isAccepted}
                      onClick={async () => {
                        try {
                          setActingId(match.id);
                          setError('');
                          const res = await matchApi.acceptBuyerMatch(match.id);
                          setMatches((prev) =>
                            prev.map((item) =>
                              item.id === match.id ? { ...item, ...res.data } : item
                            )
                          );
                        } catch (err) {
                          setError(err.message);
                        } finally {
                          setActingId(null);
                        }
                      }}
                    >
                      {isAccepted
                        ? '✓ Accepted'
                        : actingId === match.id
                          ? 'Accepting...'
                          : 'Accept Match'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {gallery && (
        <ImageLightbox
          images={gallery.images}
          startIndex={gallery.startIndex}
          title={gallery.title}
          onClose={() => setGallery(null)}
        />
      )}
    </div>
  );
}
