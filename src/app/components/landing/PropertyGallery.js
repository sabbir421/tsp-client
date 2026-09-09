'use client';

import { useState } from 'react';
import { getUploadUrl } from '../../utils/api';
import MediaLightbox, { isVideoPath } from './MediaLightbox';
import styles from './landing.module.css';

const MAX_THUMBS = 4;

export default function PropertyGallery({ photos, title, isVerified }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const items = (photos || []).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className={styles.galleryEmpty}>
        <span className={styles.propImageIcon} aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
          </svg>
        </span>
        <p className={styles.galleryEmptyText}>No photos yet</p>
      </div>
    );
  }

  // A video (if present) leads the gallery, matching the "video opens by default" behavior
  // used elsewhere in the app.
  const videoIndex = items.findIndex(isVideoPath);
  const order =
    videoIndex === -1
      ? items.map((_, i) => i)
      : [videoIndex, ...items.map((_, i) => i).filter((i) => i !== videoIndex)];

  const heroIndex = order[0];
  const thumbIndices = order.slice(1, 1 + MAX_THUMBS);
  const extraCount = Math.max(0, items.length - 1 - MAX_THUMBS);
  const heroSrc = items[heroIndex];
  const heroIsVideo = isVideoPath(heroSrc);

  return (
    <>
      <div className={`${styles.galleryGrid} ${thumbIndices.length === 0 ? styles.galleryGridSingle : ''}`}>
        <button
          type="button"
          className={styles.galleryHero}
          onClick={() => setLightboxIndex(heroIndex)}
          aria-label={heroIsVideo ? 'Play video' : 'View photo'}
        >
          {heroIsVideo ? (
            <video
              src={getUploadUrl(heroSrc)}
              className={styles.galleryMedia}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={getUploadUrl(heroSrc)} alt={title} className={styles.galleryMedia} />
          )}
          {isVerified && <span className={styles.galleryVerifiedBadge}>✓ Verified listing</span>}
          {heroIsVideo && <span className={styles.galleryVideoBadge}>▶ Video</span>}
          <span className={styles.galleryCounter}>1 / {items.length}</span>
        </button>

        {thumbIndices.length > 0 && (
          <div className={styles.galleryThumbGrid}>
            {thumbIndices.map((idx, i) => {
              const src = items[idx];
              const showMore = i === thumbIndices.length - 1 && extraCount > 0;
              return (
                <button
                  key={idx}
                  type="button"
                  className={styles.galleryThumbCell}
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={isVideoPath(src) ? 'Play video' : 'View photo'}
                >
                  {isVideoPath(src) ? (
                    <video
                      src={getUploadUrl(src)}
                      className={styles.galleryMedia}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img src={getUploadUrl(src)} alt="" className={styles.galleryMedia} />
                  )}
                  {isVideoPath(src) && !showMore && <span className={styles.mediaThumbVideoIcon}>▶</span>}
                  {showMore && <span className={styles.galleryMoreOverlay}>+{extraCount} more</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          photos={items}
          startIndex={lightboxIndex}
          title={title}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
