'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PrototypeHeader from '../../components/prototype/PrototypeHeader';
import PrototypeFooter from '../../components/prototype/PrototypeFooter';
import ViewingModal from '../../components/prototype/ViewingModal';
import PropertyCard from '../../components/prototype/PropertyCard';
import Toast, { showToast } from '../../components/prototype/Toast';
import { PROPS, art, locTxt, money, comma, currentReq, score, ring } from '../../utils/prototypeData';
import { getStore, toggleSaveProperty, isPropertySaved, subscribeStore } from '../../utils/prototypeStore';
import { propertyApi, getUploadUrl } from '../../utils/api';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propId = Number(params?.id);

  const [customListings, setCustomListings] = useState([]);
  const [apiProperty, setApiProperty] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [visitInfo, setVisitInfo] = useState(null);

  useEffect(() => {
    if (!propId) return;
    propertyApi.getPublicOne(propId)
      .then((res) => {
        if (res?.data) {
          const d = res.data;
          setApiProperty({
            ...d,
            type: d.propertyType || d.type || 'Apartment',
            purpose: String(d.purpose || '').toLowerCase().includes('rent') ? 'Rent' : 'Sale',
            beds: d.bedrooms || d.beds,
            baths: d.bathrooms || d.baths,
            size: d.sqft || d.size || d.sizeSqFt,
            area: d.area || d.location || 'Dhaka',
          });
        }
      })
      .catch(() => {});
  }, [propId]);

  useEffect(() => {
    const update = () => {
      const { v1 } = getStore();
      setCustomListings(v1.listings || []);
      setIsSaved(isPropertySaved(propId));
      if (v1.decisions && v1.decisions[propId] === 'accepted') {
        setUnlocked(true);
      }
      const existingVisit = (v1.visits || []).find((v) => Number(v.pid) === propId);
      if (existingVisit) {
        setUnlocked(true);
        setVisitInfo(existingVisit);
      } else {
        setVisitInfo(null);
      }
    };
    update();
    return subscribeStore(update);
  }, [propId]);

  const property = useMemo(() => {
    if (apiProperty) return apiProperty;
    const found = [...customListings, ...PROPS].find((p) => Number(p.id) === propId);
    return found || null;
  }, [propId, customListings, apiProperty]);

  const similar = useMemo(() => {
    if (!property) return [];
    return customListings.filter((p) => p.id !== property.id && p.purpose === property.purpose && p.type === property.type).slice(0, 3);
  }, [property, customListings]);

  const matchData = useMemo(() => {
    if (!property) return null;
    const r = currentReq();
    if (!r) return null;
    return score(property, r);
  }, [property]);

  const handleHeartClick = () => {
    if (!property) return;
    const nextSaved = toggleSaveProperty(property.id);
    setIsSaved(nextSaved);
    showToast(nextSaved ? '♥ Saved to your shortlist' : 'Removed from shortlist');
  };

  if (!property) {
    return (
      <>
        <PrototypeHeader />
        <div className="wrap" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '50vh' }}>
          <h2>Property not found</h2>
          <p style={{ color: 'var(--mut)', marginTop: '8px' }}>The requested property does not exist or has been removed.</p>
          <Link href="/discover" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Browse Properties →
          </Link>
        </div>
        <PrototypeFooter />
      </>
    );
  }

  const rent = property.purpose === 'Rent';
  const ready = property.handover === 'Ready';
  const prov = property.provider || 'Owner';
  const provL = prov.toLowerCase();

  return (
    <>
      <PrototypeHeader />
      <Toast />

      <div className="detailpage pd">
        {/* TOP BAR / BREADCRUMBS */}
        <div className="pd-wrap pd-top">
          <button
            type="button"
            className="pd-back"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            &larr; Back
          </button>
          <nav className="crumb pd-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> / <Link href="/discover">Discover</Link> / <span>{locTxt(property.area)}</span>
          </nav>
        </div>

        {/* PHOTO GALLERY */}
        <div className="pd-wrap">
          {Array.isArray(property.photos) && property.photos.length > 0 ? (
            <div className="pd-gal" aria-label="Property photos">
              {property.photos.map((photo, idx) => (
                <figure key={idx} className={`pd-shot ${idx === 0 ? 'pd-main' : ''}`} style={{ overflow: 'hidden' }}>
                  <img
                    src={getUploadUrl(photo)}
                    alt={`${property.title || 'Property'} photo ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <figcaption>Photo {idx + 1}</figcaption>
                </figure>
              ))}
              <span className="pd-count">{property.photos.length} photos</span>
            </div>
          ) : (
            <div className="pd-gal" aria-label="Property photos">
              <figure className="pd-shot pd-main">
                <div
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{
                    __html: art(property, 0).replace('<svg', '<svg preserveAspectRatio="xMidYMid slice"'),
                  }}
                />
                <figcaption>Front view</figcaption>
              </figure>
              <figure className="pd-shot">
                <div
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{
                    __html: art(property, 2).replace('<svg', '<svg preserveAspectRatio="xMidYMid slice"'),
                  }}
                />
                <figcaption>Living room</figcaption>
              </figure>
              <figure className="pd-shot">
                <div
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{
                    __html: art(property, 1).replace('<svg', '<svg preserveAspectRatio="xMidYMid slice"'),
                  }}
                />
                <figcaption>Balcony aspect</figcaption>
              </figure>
              <span className="pd-count">3 photos · swipe</span>
            </div>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="pd-wrap pd-grid">
          {/* HEADER SECTION */}
          <section className="pd-head pd-card">
            <div className="pd-tags">
              <span className={`tag ${rent ? 'o' : 'n'}`}>For {property.purpose}</span>
              <span className="tag pd-soft">{prov} listing</span>
              <span className="tag pd-soft">ID TSP-{property.id}</span>
              {property.verified && <span className="tag g">✓ Verified owner</span>}
            </div>
            <h1 className="pd-title">{property.title}</h1>
            <div className="pd-loc">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flex: 'none', marginTop: '2px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                <b>{locTxt(property.area)}</b> · exact address hidden until the {provL} accepts
              </span>
            </div>
            <div className="pd-facts">
              <div>
                <b>{property.beds || '-'}</b>
                <span>Bedrooms</span>
              </div>
              <div>
                <b>{property.baths || '-'}</b>
                <span>Bathrooms</span>
              </div>
              <div>
                <b>{comma(property.size)}</b>
                <span>Sqft{property.type === 'Plot' ? ' (3 katha)' : ''}</span>
              </div>
              <div>
                <b>{ready ? 'Ready' : (property.handover || 'Q4 2027')}</b>
                <span>Handover</span>
              </div>
            </div>
          </section>

          {/* STICKY SIDEBAR */}
          <aside className="pd-side">
            <div className="pd-card pd-buy">
              <div className="pd-status">
                <span className={`pd-pill ${rent ? 'o' : 'n'}`}>For {property.purpose}</span>
                <span className={`pd-pill ${ready ? 'ok' : 'w'}`}>{ready ? 'Ready to move' : 'Under construction'}</span>
              </div>
              <div className="pd-price">{money(property.price, property.purpose)}</div>
              <div className="pd-sub">
                {property.purpose === 'Sale' ? `৳${comma(Math.round(property.price / (property.size || 1)))} per sqft · ` : ''}
                0% commission at launch
              </div>

              <div className="pd-seller">
                <div className="pd-av">{prov.charAt(0)}</div>
                <div>
                  <small>Listed by</small>
                  <b>{prov}</b>
                  <small>TSP-{property.id} · {property.days ? `listed ${property.days} day${property.days > 1 ? 's' : ''} ago` : 'listed today'}</small>
                </div>
              </div>

              {/* PRIVACY LOCKBOX */}
              <div className={`lockbox ${unlocked ? 'open' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flex: 'none', marginTop: '2px' }}>
                  {unlocked ? (
                    <>
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V5a4 4 0 0 1 8 0" />
                    </>
                  ) : (
                    <>
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </>
                  )}
                </svg>
                <div>
                  <b style={{ color: 'var(--navy)' }}>{prov} contact</b>
                  <br />
                  {unlocked ? (
                    <>
                      <span>Rafiqul H. (verified owner) · +880 1711-234567</span>
                      <br />
                      <small style={{ color: 'var(--ok)' }}>Shown because you requested a viewing or engaged.</small>
                    </>
                  ) : (
                    <>
                      <span className="blur">Mr. Hasan · 01712 345 678</span>
                      <br />
                      <small>Hidden to protect privacy until you book a visit.</small>
                    </>
                  )}
                </div>
              </div>

              <div id="ctaState">
                {visitInfo && (
                  <div className="note" style={{ background: '#e9f8f0', borderColor: 'var(--ok)', color: '#1d5a3c', marginBottom: '12px' }}>
                    ✓ Site visit requested for <b>{visitInfo.date}, {visitInfo.slot}</b> ({visitInfo.ref || 'VR-REQ'})
                  </div>
                )}
              </div>

              <div className="pd-ctas">
                <button
                  type="button"
                  className="btn btn-n"
                  onClick={() => setViewingModalOpen(true)}
                  disabled={Boolean(visitInfo)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {visitInfo ? 'Visit requested' : 'Book a site visit'}
                </button>
                <button type="button" className={`btn btn-g ${isSaved ? 'on' : ''}`} onClick={handleHeartClick}>
                  {isSaved ? '♥ Saved to shortlist' : '♡ Save to shortlist'}
                </button>
              </div>

              <p className="pd-fine">Prototype: actions are stored only in this browser. Zero spam guarantee.</p>
            </div>

            <div className="pd-card pd-more">
              <h3>Want more like this?</h3>
              <p>Post your requirement and get scored matches as soon as similar homes are listed.</p>
              <Link href="/requirement" className="btn btn-g btn-sm pd-more-btn">
                Post a requirement
              </Link>
            </div>
          </aside>

          {/* BODY COLUMN */}
          <div className="pd-body">
            {/* MATCH SCORE BREAKDOWN */}
            {matchData && (
              <section className="pd-card pd-match">
                <h3>How this matches your requirement</h3>
                <div className="pd-mrow">
                  <div dangerouslySetInnerHTML={{ __html: ring(matchData.total) }} />
                  <div className="bars">
                    {matchData.parts.map((x) => (
                      <div className="bar" key={x[0]}>
                        <span>{x[0]}</span>
                        <i>
                          <em style={{ width: `${(x[1] / x[2]) * 100}%` }}></em>
                        </i>
                        <span>
                          {x[1]}/{x[2]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* DESCRIPTION */}
            <section className="pd-card">
              <h3>About this property</h3>
              <p className="pd-desc">
                {property.desc ||
                  'Well-maintained property situated in a prime residential zone of Dhaka City. Excellent natural daylight, cross ventilation, secure boundary, and easy access to main transit and markets.'}
              </p>
            </section>

            {/* DETAILS */}
            <section className="pd-card">
              <h3>Details &amp; Specifications</h3>
              <dl className="pd-dl">
                <div>
                  <dt>Price</dt>
                  <dd>{money(property.price, property.purpose)}</dd>
                </div>
                <div>
                  <dt>Property Type</dt>
                  <dd>{property.type}</dd>
                </div>
                <div>
                  <dt>Floor level</dt>
                  <dd>{property.floor || '4th of 8'}</dd>
                </div>
                <div>
                  <dt>Facing</dt>
                  <dd>{property.facing || 'South'}</dd>
                </div>
                <div>
                  <dt>Balconies</dt>
                  <dd>{property.balc || 2}</dd>
                </div>
                <div>
                  <dt>Car parking</dt>
                  <dd>{property.parking || '1 Dedicated space'}</dd>
                </div>
                <div>
                  <dt>Listed</dt>
                  <dd>{property.days ? `${property.days} day${property.days > 1 ? 's' : ''} ago` : 'Today'}</dd>
                </div>
                <div>
                  <dt>Listing ID</dt>
                  <dd>TSP-{property.id}</dd>
                </div>
              </dl>
            </section>

            {/* FEATURES */}
            <section className="pd-card">
              <h3>Features &amp; amenities</h3>
              <div className="pd-feat">
                {(property.features || ['Lift', 'Generator', 'Gas line', 'Security', 'Rooftop access', 'Intercom']).map((f) => (
                  <span key={f}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* SIMILAR PROPERTIES */}
        {similar.length > 0 && (
          <div className="pd-wrap pd-sim">
            <h2 className="t">Similar properties in Dhaka</h2>
            <div className="grid3">
              {similar.map((s) => (
                <PropertyCard
                  key={s.id}
                  property={s}
                  onSaveToggle={(id, saved) => {
                    showToast(saved ? '♥ Saved to your shortlist' : 'Removed from shortlist');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* MOBILE STICKY ACTION BAR */}
        <div className="pd-mbar">
          <div className="pd-mp">
            <b>{money(property.price, property.purpose)}</b>
            <small>For {property.purpose} · {locTxt(property.area)}</small>
          </div>
          <button
            type="button"
            className="btn btn-n"
            onClick={() => setViewingModalOpen(true)}
            disabled={Boolean(visitInfo)}
          >
            {visitInfo ? 'Booked ✓' : 'Book viewing'}
          </button>
        </div>
      </div>

      <ViewingModal
        property={property}
        isOpen={viewingModalOpen}
        onClose={() => setViewingModalOpen(false)}
      />

      <PrototypeFooter />
    </>
  );
}
