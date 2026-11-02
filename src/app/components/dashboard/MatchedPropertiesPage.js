'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { matchApi, getUploadUrl } from '../../utils/api';
import { addViewingRequest } from '../../utils/prototypeStore';
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
    { label: 'Area map', value: property.location || property.map },
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
              className={styles.lightboxMedia}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={getUploadUrl(current)}
              alt={title || ''}
              className={styles.lightboxMedia}
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
          <div className={styles.lightboxThumbStrip}>
            {images.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                className={`${styles.lightboxThumbBtn} ${i === index ? styles.lightboxThumbActive : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Jump to media ${i + 1}`}
              >
                <MediaThumb src={img} className={styles.lightboxThumb} />
                {isVideoPath(img) && (
                  <span className={styles.thumbVideoBadge}>▶</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchedPropertiesPage() {
  const { user } = useSelector((state) => state.auth);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [gallery, setGallery] = useState(null);

  // Viewing Request Modal state
  const [bookingMatch, setBookingMatch] = useState(null);
  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [visitSlot, setVisitSlot] = useState('Morning (10:00 - 12:30)');
  const [visitMode, setVisitMode] = useState('direct');
  const [visitPeople, setVisitPeople] = useState('2');
  const [visitNotes, setVisitNotes] = useState('');
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [visitSuccessMsg, setVisitSuccessMsg] = useState('');

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
    const photos = getMatchMedia(match);
    if (!photos.length) return;
    setGallery({
      images: photos,
      startIndex: Math.min(Math.max(startIndex, 0), photos.length - 1),
      title: match.title,
    });
  };

  const openBookingModal = (match) => {
    setBookingMatch(match);
    setVisitNotes('');
    setVisitSuccessMsg('');
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setVisitDate(d.toISOString().split('T')[0]);
  };

  const closeBookingModal = () => {
    setBookingMatch(null);
    setVisitSuccessMsg('');
  };

  const handleConfirmViewing = async (e) => {
    e.preventDefault();
    if (!bookingMatch) return;

    setSubmittingVisit(true);
    try {
      const payload = {
        date: visitDate,
        slot: visitSlot,
        mode: visitMode,
        people: Number(visitPeople) || 1,
        notes: visitNotes,
        buyerName: user?.fullName || user?.name || 'Interested Buyer',
        buyerPhone: user?.phone || user?.mobile || '',
        buyerEmail: user?.email || '',
      };

      // 1. Send viewing request to backend API
      try {
        await matchApi.requestViewing(bookingMatch.id, payload);
      } catch (apiErr) {
        console.warn('Backend viewing request warning:', apiErr);
      }

      // 2. Also register in local prototype store
      addViewingRequest({
        propId: bookingMatch.propertyId,
        date: visitDate,
        slot: visitSlot,
        mode: visitMode,
      });

      // 3. Update in local component state
      setMatches((prev) =>
        prev.map((item) =>
          item.id === bookingMatch.id
            ? {
                ...item,
                status: 'interested',
                visitRequested: true,
                visitDate,
                visitSlot,
                visitMode,
                visitStatus: 'pending',
              }
            : item
        )
      );

      setVisitSuccessMsg('✓ Viewing request sent! The seller will see your contact details and confirmed time in their portal.');
      setTimeout(() => {
        closeBookingModal();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit viewing request');
    } finally {
      setSubmittingVisit(false);
    }
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
          <h1 className={common.pageTitle}>Suggested Properties</h1>
          <p className={common.pageSubtitle}>
            Properties suggested by verified sellers matching your requirements. Request a private viewing to connect directly with the seller.
          </p>
        </div>
      </div>

      {error && <div className={common.error}>{error}</div>}

      {matches.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>🔍</div>
          <h2 className={common.emptyTitle}>No property suggestions yet</h2>
          <p className={common.emptyDesc}>
            When sellers find your requirements and suggest matching properties, they will appear here with photos, pricing, and viewing booking options.
          </p>
        </div>
      ) : (
        <div className={styles.propertyGrid}>
          {matches.map((match) => {
            const isAccepted = match.status === 'interested' || match.visitRequested;
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
            const statusLabel = isAccepted ? 'Viewing Requested' : 'New Suggestion';

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
                    <p className={styles.sellerNote}>
                      <b>Seller Note:</b> &ldquo;{match.sellerNote}&rdquo;
                    </p>
                  )}

                  {match.visitRequested && (
                    <div
                      style={{
                        background: '#e7f6ee',
                        border: '1px solid #c2ebd5',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        margin: '10px 0',
                        fontSize: '13px',
                        color: '#14794b',
                      }}
                    >
                      <b>✓ Viewing Requested:</b> {match.visitDate}, {match.visitSlot}
                      <div style={{ fontSize: '11.5px', color: '#2d8659', marginTop: '2px' }}>
                        The seller has received your contact details to coordinate the site visit.
                      </div>
                    </div>
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
                        Your contact stays hidden until you book a site visit. When you request a viewing, your verified details are shared with the seller.
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
                      disabled={actingId === match.id}
                      onClick={() => openBookingModal(match)}
                    >
                      {isAccepted ? '📅 Re-schedule / Update Visit' : '📅 Book Site Visit'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* VIEWING BOOKING MODAL */}
      {bookingMatch && (
        <div className={styles.modalOverlay} onClick={closeBookingModal} style={{ zIndex: 9999 }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Book a Private Site Visit</h3>
              <p className={styles.modalSubtitle}>
                {bookingMatch.title} · {bookingMatch.price}
              </p>
            </div>

            <form onSubmit={handleConfirmViewing}>
              <div className={styles.modalBody}>
                {visitSuccessMsg && (
                  <div style={{ background: '#e7f6ee', color: '#14794b', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13.5px', fontWeight: '600' }}>
                    {visitSuccessMsg}
                  </div>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label className={styles.fieldLabel}>
                    Preferred Visit Date <span style={{ color: 'var(--orange)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className={styles.input}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className={styles.fieldLabel}>Preferred Time Window</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                    {['Morning (10:00 - 12:30)', 'Afternoon (2:00 - 4:30)', 'Evening (5:00 - 7:00)'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setVisitSlot(slot)}
                        style={{
                          padding: '8px 6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '8px',
                          border: visitSlot === slot ? '2px solid var(--orange)' : '1px solid var(--line)',
                          background: visitSlot === slot ? '#fff7ec' : '#fff',
                          color: visitSlot === slot ? 'var(--navy)' : 'var(--mut)',
                          cursor: 'pointer',
                        }}
                      >
                        {slot.split(' ')[0]}<br />
                        <small style={{ fontSize: '10.5px', fontWeight: 'normal' }}>{slot.split(' ')[1]}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label className={styles.fieldLabel}>Number of Visitors</label>
                    <select
                      value={visitPeople}
                      onChange={(e) => setVisitPeople(e.target.value)}
                      className={styles.select}
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 People (Couple / Family)</option>
                      <option value="3">3 People</option>
                      <option value="4">4+ People</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Visit Coordination</label>
                    <select
                      value={visitMode}
                      onChange={(e) => setVisitMode(e.target.value)}
                      className={styles.select}
                    >
                      <option value="direct">Direct with Seller (Contact shared)</option>
                      <option value="tsp">Through TrueSpace agent</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className={styles.fieldLabel}>Notes / Questions for Seller (Optional)</label>
                  <textarea
                    rows={2}
                    className={styles.textarea}
                    placeholder="e.g. Coming with family, please confirm parking space available..."
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                  />
                </div>

                <div style={{ background: '#f6f7fb', padding: '12px', borderRadius: '10px', fontSize: '12.5px', color: 'var(--navy)' }}>
                  <b>🔒 Contact Disclosure:</b> By submitting this request, your verified name ({user?.fullName || user?.name || 'You'}) and mobile number ({user?.phone || 'Your verified number'}) will be shared with the property seller so they can confirm your visit slot.
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeBookingModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submittingVisit}
                  style={{ background: 'var(--orange)', color: '#fff' }}
                >
                  {submittingVisit ? 'Sending Request...' : 'Confirm Viewing Request →'}
                </button>
              </div>
            </form>
          </div>
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
