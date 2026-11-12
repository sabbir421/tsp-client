'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PrototypeHeader from './components/prototype/PrototypeHeader';
import PrototypeFooter from './components/prototype/PrototypeFooter';
import PropertyCard from './components/prototype/PropertyCard';
import SuggestPropertyModal from './components/prototype/SuggestPropertyModal';
import Toast, { showToast } from './components/prototype/Toast';
import { DHAKA_ZONES, art, locTxt } from './utils/prototypeData';
import { propertyApi, requirementApi } from './utils/api';
import { getActiveToken, getActiveUser, getPortalSession } from './utils/authStorage';

export default function HomePage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState('Sale');
  const [propType, setPropType] = useState('Apartment');
  const [area, setArea] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');

  const [featured, setFeatured] = useState([]);
  const [publicReqs, setPublicReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestModalReq, setSuggestModalReq] = useState(null);

  const handleSuggestClick = (e, req) => {
    e.preventDefault();
    const activeUser = getActiveUser();
    const token = getActiveToken();
    const ownerSession = getPortalSession('owner') || getPortalSession('seller_agent');
    const isSeller = Boolean((token && (activeUser?.role === 'seller_agent' || activeUser?.role === 'owner')) || ownerSession);

    if (!isSeller) {
      showToast('Log in as a Seller / Rent Giver to suggest a property');
      router.push(`/login?role=owner&returnUrl=${encodeURIComponent('/')}`);
      return;
    }

    setSuggestModalReq(req);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      propertyApi.getPublic().catch(() => ({ data: [] })),
      requirementApi.getPublic().catch(() => ({ data: [] })),
    ]).then(([propsRes, reqsRes]) => {
      if (!mounted) return;
      const props = Array.isArray(propsRes?.data) ? propsRes.data : Array.isArray(propsRes) ? propsRes : [];
      const reqs = Array.isArray(reqsRes?.data) ? reqsRes.data : Array.isArray(reqsRes) ? reqsRes : [];
      setFeatured(props);
      setPublicReqs(reqs);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const teaserProp = featured[0] || null;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (purpose) params.set('purpose', purpose);
    if (propType && propType !== 'All') params.set('type', propType);
    if (area && area !== 'All') params.set('area', area);
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <>
      <PrototypeHeader />
      <Toast />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="wrap heroGrid">
          <div>
            <h1>
              Tell us what you need.<br />
              <em>We bring the right home to you</em>, privately.
            </h1>
            <p className="lead">
              TrueSpace Property is privacy-first property matching across Dhaka City. Post what you're looking for and get scored matches from verified listings. Owner details stay hidden until you choose to engage, and your phone number stays private.
            </p>

            <div className="searchBox">
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${purpose === 'Sale' ? 'on' : ''}`}
                  onClick={() => setPurpose('Sale')}
                >
                  Buy a property
                </button>
                <button
                  type="button"
                  className={`tab ${purpose === 'Rent' ? 'on' : ''}`}
                  onClick={() => setPurpose('Rent')}
                >
                  Rent a home
                </button>
              </div>

              <form onSubmit={handleSearch} className="sRow">
                <div className="fld">
                  <label>Property Type</label>
                  <select value={propType} onChange={(e) => setPropType(e.target.value)}>
                    <option value="Apartment">Flat / Apartment</option>
                    <option value="Duplex">Duplex</option>
                    <option value="House">Independent House</option>
                    <option value="Plot">Land / Plot</option>
                    <option value="Commercial">Commercial space</option>
                  </select>
                </div>

                <div className="fld">
                  <label>Neighbourhood</label>
                  <select value={area} onChange={(e) => setArea(e.target.value)}>
                    <option value="All">All Dhaka City</option>
                    {Object.keys(DHAKA_ZONES).map((zone) => (
                      <optgroup key={zone} label={zone}>
                        {DHAKA_ZONES[zone].map((loc) => (
                          <option key={loc} value={`${loc}, Dhaka`}>
                            {loc}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="fld">
                  <label>Max Budget (৳)</label>
                  <input
                    type="number"
                    placeholder={purpose === 'Rent' ? 'e.g. 35000' : 'e.g. 15000000'}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                <div className="fld go">
                  <label>&nbsp;</label>
                  <button type="submit" className="btn btn-o" style={{ width: '100%' }}>
                    Search homes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* TEASER CARD */}
          <div className="heroCard">
            <h4>LIVE MATCH PREVIEW</h4>
            {teaserProp ? (
              <>
                <div className="mini">
                  <div
                    className="th"
                    dangerouslySetInnerHTML={{ __html: art(teaserProp, 0) }}
                  />
                  <div>
                    <b style={{ fontSize: '14px', display: 'block', color: 'var(--navy)' }}>
                      {teaserProp.title}
                    </b>
                    <small style={{ color: 'var(--mut)' }}>{teaserProp.area}</small>
                  </div>
                  <div className="sc">
                    96%<small>Match</small>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#c9d1e6', margin: '8px 0', display: 'grid', gap: '4px' }}>
                  <div>✓ Budget matches requested range</div>
                  <div>✓ Verified ownership deed & tax clearance</div>
                </div>
              </>
            ) : (
              <div style={{ padding: '16px 0', color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.6 }}>
                Post your property requirement to see instant matched verified properties across Dhaka City.
              </div>
            )}

            <div className="lockline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="11" rx="2"></rect>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
              </svg>
              <span>Owner phone number unlocks after scheduling a viewing slot</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="wrap">
        <div className="stats">
          <div className="stat">
            <b>{featured.length > 0 ? `${featured.length}` : '0'}</b>
            <span>Verified Dhaka properties</span>
          </div>
          <div className="stat">
            <b>{publicReqs.length > 0 ? `${publicReqs.length}` : '0'}</b>
            <span>Active buyer requirements</span>
          </div>
          <div className="stat">
            <b>100%</b>
            <span>Direct owner contact (no broker spam)</span>
          </div>
          <div className="stat">
            <b>0%</b>
            <span>Commission during Dhaka pilot</span>
          </div>
        </div>
      </div>

      {/* LATEST BUYER REQUIREMENTS */}
      <section className="wrap jhome">
        <h2>Latest buyer requirements</h2>
        <p style={{ color: 'var(--mut)', margin: '0 0 16px' }}>
          Real needs from buyers and tenants, approved and public. Have a matching property? Suggest it.
        </p>
        <div className="jgrid">
          {publicReqs && publicReqs.length > 0 ? (
            publicReqs.slice(0, 3).map((r) => {
              const isRent = String(r.purpose || '').toLowerCase().includes('rent') || String(r.category || '').toLowerCase().includes('rent');
              const propType = r.subType || r.propertyType || r.category || 'Property';
              const location = r.sector || r.area || r.zone || r.city || 'Dhaka';
              const createdDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recently';

              return (
                <div key={r.id} className="card jrq">
                  <div className="jtop">
                    <span className={`tag ${isRent ? 'o' : 'n'}`}>
                      To {isRent ? 'rent' : 'buy'}
                    </span>
                    <span className="jref">REQ-{r.id}</span>
                  </div>
                  <h3>
                    {r.bedrooms ? `${r.bedrooms}-bed ` : ''}{propType} to {isRent ? 'rent' : 'buy'}
                  </h3>
                  <div className="jbud">
                    {r.budget || r.budgetDisplay || (r.maxBudget ? `Max ৳${Number(r.maxBudget).toLocaleString()}` : 'Budget on request')}
                  </div>
                  <ul>
                    <li>📍 {location}</li>
                    {r.sizeSqFt && <li>Min {Number(r.sizeSqFt).toLocaleString()} sq ft</li>}
                    {r.floor && <li>Floor: {r.floor}</li>}
                  </ul>
                  {(r.mustIncludeDetails || r.notes) && (
                    <p>{(r.mustIncludeDetails || r.notes).slice(0, 140)}</p>
                  )}
                  <div>
                    <span className="jb">✓ Verified Requirement</span>
                  </div>
                  <div className="jft">
                    <small>
                      Posted {createdDate} · Buyer identity private · {r.suggestionsCount || 0} suggestions
                    </small>
                    <button
                      type="button"
                      onClick={(e) => handleSuggestClick(e, r)}
                      className="btn btn-o btn-sm"
                    >
                      Suggest Property
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', color: 'var(--mut)' }}>
              No public buyer requirements posted yet. <Link href="/requirement" style={{ color: 'var(--brand)', fontWeight: 600 }}>Post a requirement →</Link>
            </div>
          )}
        </div>
        <div style={{ margin: '14px 0 24px' }}>
          <Link className="btn btn-g" href="/requirements">
            See all requirements →
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="blk">
        <div className="wrap">
          <div className="eyebrow">How TrueSpace works</div>
          <h2 className="t">Privacy-first property matching in 4 simple steps</h2>
          <p className="sub">
            Stop giving your phone number to dozens of brokers. Post what you want once, let verified owners match your requirement, and unlock direct contact on your terms.
          </p>

          <div className="steps">
            <div className="step">
              <div className="n">1</div>
              <h3>Post your requirement</h3>
              <p>Tell us your target area, budget, bedrooms, and must-have amenities. Your phone number stays hidden.</p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <h3>Smart matching algorithm</h3>
              <p>Our scoring engine calculates an exact match % across location, budget, layout, and building features.</p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <h3>Schedule private visit</h3>
              <p>Pick a date and time window. The owner confirms through TrueSpace without seeing your personal number.</p>
            </div>
            <div className="step">
              <div className="n">4</div>
              <h3>Direct contact unlock</h3>
              <p>Once you accept a match or confirm your visit, the owner's direct contact details unlock instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="blk" style={{ background: '#fff' }}>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <div className="eyebrow">Curated listings</div>
              <h2 className="t" style={{ margin: '4px 0 0' }}>Verified properties ready in Dhaka</h2>
            </div>
            <Link href="/browse/properties" className="btn btn-g btn-sm">
              Browse all properties →
            </Link>
          </div>

          <div className="grid3">
            {featured && featured.length > 0 ? (
              featured.slice(0, 3).map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onSaveToggle={(id, saved) => {
                    showToast(saved ? '♥ Saved to your shortlist' : 'Removed from shortlist');
                  }}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', color: 'var(--mut)', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
                No verified properties listed yet. <Link href="/dashboard" style={{ color: 'var(--brand)', fontWeight: 600 }}>List your property →</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRIVACY FIRST CALLOUT */}
      <section className="blk">
        <div className="wrap split">
          <div className="privacy">
            <div className="eyebrow" style={{ color: 'var(--orange)' }}>TrueSpace Guarantee</div>
            <h2>Built from day one to protect your privacy</h2>
            <p className="sub">
              Dhaka property hunting shouldn't mean receiving 50 unsolicited phone calls every weekend. TrueSpace is built differently:
            </p>

            <div className="plist">
              <div className="pi">
                <div className="ic">🔒</div>
                <div>
                  <b>Phone number privacy</b>
                  <span>Your number is never publicly listed and never sold to third-party telemarketers.</span>
                </div>
              </div>
              <div className="pi">
                <div className="ic">✓</div>
                <div>
                  <b>Verified ownership papers</b>
                  <span>Every listing undergoes document validation (NID, dolil, utility receipts) before approval.</span>
                </div>
              </div>
              <div className="pi">
                <div className="ic">🎯</div>
                <div>
                  <b>Only relevant matches</b>
                  <span>You only see properties that genuinely match your chosen sectors and budget constraints.</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bdopen" style={{ marginBottom: '20px' }}>
              <div>
                <h3>Looking for a home in Dhaka?</h3>
                <p style={{ color: 'var(--mut)', margin: '0 0 14px' }}>
                  Post your requirement in 2 minutes. We will immediately match you with verified apartments and houses.
                </p>
                <Link href="/requirement" className="btn btn-o">
                  Post a requirement (Free)
                </Link>
              </div>
            </div>

            <div className="bdopen" style={{ background: '#eef1f8', borderColor: '#c5cce0' }}>
              <div>
                <h3>Are you a property owner or agent?</h3>
                <p style={{ color: 'var(--mut)', margin: '0 0 14px' }}>
                  List your property for sale or rent. Suggest your flat directly to active buyers matching your specs.
                </p>
                <Link href="/list" className="btn btn-n">
                  List your property
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="blk" style={{ background: '#fff' }}>
        <div className="wrap">
          <div className="eyebrow">Got questions?</div>
          <h2 className="t">Frequently asked questions</h2>
          <div className="faq" style={{ maxWidth: '820px', marginTop: '20px' }}>
            <details open>
              <summary>How does requirement-first matching work?</summary>
              <p>
                Instead of endlessly browsing outdated classifieds, you enter what you're looking for (e.g. 3-bed flat in Uttara Sector 7 or 11, under ৳35k rent). Our matching system scans verified listings and notifies you of high-confidence matches with an exact compatibility breakdown.
              </p>
            </details>
            <details>
              <summary>When does my phone number become visible?</summary>
              <p>
                Never publicly. Your phone number is only shared with an owner if you accept their matched property or after both sides confirm a site viewing slot.
              </p>
            </details>
            <details>
              <summary>Is there any commission or service fee?</summary>
              <p>
                During our Dhaka pilot program, TrueSpace is 100% free for buyers, tenants, and property owners. Zero broker commissions.
              </p>
            </details>
            <details>
              <summary>How do you verify property owners?</summary>
              <p>
                Owners and agents upload their National ID (NID), property ownership documents (dolil/khatian), and recent utility bills. Our admin moderation team verifies each document before awarding the "Verified Owner" badge.
              </p>
            </details>
          </div>
        </div>
      </section>

      <SuggestPropertyModal
        requirement={suggestModalReq}
        isOpen={!!suggestModalReq}
        onClose={() => setSuggestModalReq(null)}
      />

      <PrototypeFooter />
    </>
  );
}
