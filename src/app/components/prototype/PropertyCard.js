'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { art, locTxt, money, comma } from '../../utils/prototypeData';
import { isPropertySaved, toggleSaveProperty, subscribeStore } from '../../utils/prototypeStore';
import { getUploadUrl } from '../../utils/api';

export default function PropertyCard({ property, onSaveToggle }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isPropertySaved(property.id));
    return subscribeStore(() => {
      setSaved(isPropertySaved(property.id));
    });
  }, [property.id]);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = toggleSaveProperty(property.id);
    setSaved(isNowSaved);
    if (onSaveToggle) onSaveToggle(property.id, isNowSaved);
  };

  const svgArt = art(property);

  let firstPhoto = null;
  if (Array.isArray(property.photos) && property.photos.length > 0) {
    firstPhoto = property.photos[0];
  } else if (typeof property.photos === 'string' && property.photos.trim()) {
    try {
      const parsed = JSON.parse(property.photos);
      if (Array.isArray(parsed) && parsed.length > 0) firstPhoto = parsed[0];
      else if (typeof parsed === 'string') firstPhoto = parsed;
    } catch {
      firstPhoto = property.photos;
    }
  } else if (property.photo) {
    firstPhoto = property.photo;
  }

  const imgUrl = firstPhoto ? getUploadUrl(firstPhoto) : null;

  return (
    <div className="card pcard">
      <Link href={`/property/${property.id}`} className="pimg" style={{ position: 'relative', overflow: 'hidden' }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={property.title || 'Property'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const sibling = e.currentTarget.parentElement?.querySelector('.fallback-svg');
              if (sibling) sibling.style.display = 'block';
            }}
          />
        ) : null}
        <div
          className="fallback-svg"
          dangerouslySetInnerHTML={{ __html: svgArt }}
          style={{ width: '100%', height: '100%', display: imgUrl ? 'none' : 'block' }}
        />
        <div className="tags">
          <span className={`tag ${property.purpose === 'Rent' ? 'o' : 'n'}`}>
            For {property.purpose}
          </span>
          {property.verified && (
            <span className="tag g">
              ✓ Verified owner
            </span>
          )}
          {property.handover && property.handover !== 'Ready' && (
            <span className="tag">Under construction</span>
          )}
        </div>
      </Link>

      <button
        type="button"
        className={`heart ${saved ? 'on' : ''}`}
        onClick={handleHeartClick}
        aria-label="Save to shortlist"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={saved ? 'var(--orange)' : 'none'}
          stroke={saved ? 'var(--orange)' : '#1c2847'}
          strokeWidth="2"
        >
          <path d="M12 20s-7-4.5-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.5-9 9-9 9z" />
        </svg>
      </button>

      <Link href={`/property/${property.id}`} className="pbody">
        <div className="price">{money(property.price, property.purpose)}</div>
        <div className="ptitle">{property.title}</div>
        <div className="loc">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {locTxt(property.area)}
        </div>
        <div className="hidden-owner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          {property.provider || 'Owner'} details hidden until you engage
        </div>
        <div className="facts">
          {property.beds ? <span>🛏 {property.beds} bed</span> : null}
          {property.baths ? <span>🚿 {property.baths} bath</span> : null}
          {property.size ? <span>📐 {comma(property.size)} sqft</span> : null}
          <span>{property.type}</span>
        </div>
      </Link>
    </div>
  );
}
