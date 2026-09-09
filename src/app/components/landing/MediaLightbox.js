'use client';

import { useCallback, useEffect, useState } from 'react';
import { getUploadUrl } from '../../utils/api';
import styles from './landing.module.css';

export function isVideoPath(src) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(src || '');
}

export default function MediaLightbox({ photos, startIndex, title, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const hasMultiple = photos.length > 1;
  const current = photos[index];
  const currentIsVideo = isVideoPath(current);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

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
    <div className={styles.mediaLightboxOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.mediaLightbox} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.mediaLightboxClose} onClick={onClose} aria-label="Close">
          ×
        </button>

        {title && <p className={styles.mediaLightboxTitle}>{title}</p>}

        <div className={styles.mediaLightboxStage}>
          {hasMultiple && (
            <button
              type="button"
              className={`${styles.mediaLightboxNav} ${styles.mediaLightboxNavPrev}`}
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
              className={styles.mediaLightboxVideo}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={getUploadUrl(current)}
              alt={`${title || 'Property'} photo ${index + 1}`}
              className={styles.mediaLightboxImage}
            />
          )}

          {hasMultiple && (
            <button
              type="button"
              className={`${styles.mediaLightboxNav} ${styles.mediaLightboxNavNext}`}
              onClick={goNext}
              aria-label="Next media"
            >
              ›
            </button>
          )}
        </div>

        {hasMultiple && (
          <>
            <p className={styles.mediaLightboxCounter}>
              {index + 1} / {photos.length}
              {currentIsVideo ? ' · Video' : ''}
            </p>
            <div className={styles.mediaLightboxThumbs}>
              {photos.map((photo, i) => (
                <button
                  key={`thumb-${photo}-${i}`}
                  type="button"
                  className={`${styles.mediaLightboxThumbBtn} ${
                    i === index ? styles.mediaLightboxThumbActive : ''
                  }`}
                  onClick={() => setIndex(i)}
                >
                  {isVideoPath(photo) ? (
                    <video
                      src={getUploadUrl(photo)}
                      className={styles.mediaLightboxThumb}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img src={getUploadUrl(photo)} alt="" className={styles.mediaLightboxThumb} />
                  )}
                  {isVideoPath(photo) && <span className={styles.mediaThumbVideoIcon}>▶</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
