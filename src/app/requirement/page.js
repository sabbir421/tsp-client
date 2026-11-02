'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import Toast, { showToast } from '../components/prototype/Toast';
import { DHAKA_ZONES, matchesFor, PROPS } from '../utils/prototypeData';
import { requirementApi } from '../utils/api';

export default function PostRequirementPage() {
  const router = useRouter();

  const [purpose, setPurpose] = useState('Sale');
  const [propType, setPropType] = useState('Apartment');
  const [location, setLocation] = useState('Uttara, Dhaka');
  const [subArea, setSubArea] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [beds, setBeds] = useState(3);
  const [minSize, setMinSize] = useState(1300);
  const [timeline, setTimeline] = useState('Within 3 months');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newReqId, setNewReqId] = useState('');

  const displayLocation = subArea.trim() ? `${subArea.trim()}, ${location}` : location;

  const previewReq = useMemo(() => {
    return {
      purpose,
      type: propType,
      areas: [location],
      minBudget: minBudget ? Number(minBudget) : 0,
      maxBudget: maxBudget ? Number(maxBudget) : 999999999,
      beds: Number(beds) || 0,
      minSize: Number(minSize) || 0,
    };
  }, [purpose, propType, location, minBudget, maxBudget, beds, minSize]);

  const matches = useMemo(() => {
    return matchesFor(previewReq, PROPS);
  }, [previewReq]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      showToast('Please select a location / area.');
      return;
    }

    try {
      const budgetMax = maxBudget ? Number(maxBudget) : minBudget ? Number(minBudget) : 50000;
      const payload = {
        purpose,
        type: propType,
        subType: propType,
        category: propType === 'Commercial' ? 'commercial' : 'residential',
        areas: [displayLocation],
        area: displayLocation,
        location,
        subArea: subArea.trim(),
        minBudget: minBudget ? Number(minBudget) : 0,
        maxBudget: budgetMax,
        beds: Number(beds) || 0,
        bedrooms: String(beds || 3),
        sizeSqFt: Number(minSize) || 0,
        timeline,
        name: name.trim() || 'Verified Buyer',
        phone: phone.trim() || '01700000000',
        city: 'Dhaka',
      };

      const res = await requirementApi.create(payload);
      const reqId = res?.data?.id || res?.id || Date.now();
      setNewReqId(`REQ-${reqId}`);
      setSubmitted(true);
      showToast(`✓ Requirement REQ-${reqId} posted successfully!`);
    } catch (err) {
      showToast(`⚠️ ${err.message || 'Failed to post requirement'}`);
    }
  };

  return (
    <>
      <PrototypeHeader />
      <Toast />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <span>Post a requirement</span>
          </div>
          <h1>Post your property requirement</h1>
          <p>
            Tell us what you&apos;re looking for. We will score all verified listings in Dhaka and match you with the right property. Your phone number stays hidden until you choose to unlock it.
          </p>
        </div>
      </div>

      <div className="wrap formwrap" style={{ paddingBottom: '60px' }}>
        {submitted ? (
          <div className="fcard ok">
            <div className="tick">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>Requirement posted successfully!</h2>
            <div className="ref">Reference: {newReqId}</div>
            <p>
              We found <b>{matches.length} matching properties</b> in Dhaka that match your criteria. You can review scores, inspect architectural layouts, and schedule private viewings.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <Link href="/matches" className="btn btn-o">
                View Match Results ({matches.length}) →
              </Link>
              <Link href="/dashboard?role=buyer" className="btn btn-g">
                Go to Buyer Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fcard">
            {/* Step 1: Purpose & Type */}
            <h3 style={{ margin: '0 0 16px', color: 'var(--navy)', fontSize: '18px' }}>
              1. What kind of property are you looking for?
            </h3>

            <div className="frow">
              <div className="fl">
                <label>Purpose <span className="req">*</span></label>
                <div className="chips">
                  {['Sale', 'Rent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`chip ${purpose === p ? 'on' : ''}`}
                      onClick={() => setPurpose(p)}
                    >
                      {p === 'Sale' ? 'Buy a Property' : 'Rent a Home'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fl">
                <label>Property Type <span className="req">*</span></label>
                <select value={propType} onChange={(e) => setPropType(e.target.value)}>
                  <option value="Apartment">Flat / Apartment</option>
                  <option value="Duplex">Duplex</option>
                  <option value="House">Independent House</option>
                  <option value="Plot">Land / Plot</option>
                  <option value="Commercial">Commercial Space</option>
                </select>
              </div>
            </div>

            {/* Step 2: Location and Sub-area */}
            <div className="frow" style={{ margin: '20px 0 14px' }}>
              <div className="fl">
                <label>Location / Area <span className="req">*</span></label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {Object.keys(DHAKA_ZONES).map((z) => (
                    <optgroup key={z} label={z}>
                      {DHAKA_ZONES[z].map((loc) => (
                        <option key={loc} value={`${loc}, Dhaka`}>
                          {loc}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="Other, Dhaka">Other location in Dhaka</option>
                </select>
                <div className="hint" style={{ marginTop: '4px' }}>
                  Select one primary location / area.
                </div>
              </div>

              <div className="fl">
                <label>Sub-area <span className="opt">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4, Road 11, Block C"
                  value={subArea}
                  onChange={(e) => setSubArea(e.target.value)}
                />
                <div className="hint" style={{ marginTop: '4px' }}>
                  Type your specific sector, road, block or landmark.
                </div>
              </div>
            </div>

            {/* Step 3: Budget Range (Optional) */}
            <h3 style={{ margin: '24px 0 8px', color: 'var(--navy)', fontSize: '18px' }}>
              2. Target budget range <span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--mut)' }}>(optional)</span>
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--mut)' }}>
              Budget is optional. Leave blank if you are open to any range.
            </p>

            <div className="frow">
              <div className="fl">
                <label>Minimum Budget (৳) <span className="opt">(optional)</span></label>
                <input
                  type="number"
                  placeholder={purpose === 'Rent' ? 'e.g. 25000' : 'e.g. 10000000'}
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                />
                {minBudget && (
                  <div className="hint">
                    {purpose === 'Rent'
                      ? `৳${Number(minBudget).toLocaleString()} / month`
                      : Number(minBudget) >= 10000000
                      ? `৳${(Number(minBudget) / 10000000).toFixed(2)} Crore`
                      : `৳${Number(minBudget).toLocaleString()}`}
                  </div>
                )}
              </div>

              <div className="fl">
                <label>Maximum Budget (৳) <span className="opt">(optional)</span></label>
                <input
                  type="number"
                  placeholder={purpose === 'Rent' ? 'e.g. 40000' : 'e.g. 15000000'}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
                {maxBudget && (
                  <div className="hint">
                    {purpose === 'Rent'
                      ? `৳${Number(maxBudget).toLocaleString()} / month`
                      : Number(maxBudget) >= 10000000
                      ? `৳${(Number(maxBudget) / 10000000).toFixed(2)} Crore`
                      : `৳${Number(maxBudget).toLocaleString()}`}
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Specs & Timeline */}
            <h3 style={{ margin: '24px 0 16px', color: 'var(--navy)', fontSize: '18px' }}>
              3. Layout & Timeframe
            </h3>

            <div className="frow three">
              <div className="fl">
                <label>Bedrooms</label>
                <select value={beds} onChange={(e) => setBeds(e.target.value)}>
                  <option value="1">1+ Bed</option>
                  <option value="2">2+ Beds</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
              </div>

              <div className="fl">
                <label>Minimum Size (sqft)</label>
                <input
                  type="number"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                />
              </div>

              <div className="fl">
                <label>Timeframe</label>
                <select value={timeline} onChange={(e) => setTimeline(e.target.value)}>
                  <option value="Immediate (within 15 days)">Immediate</option>
                  <option value="Within 1 month">Within 1 month</option>
                  <option value="Within 3 months">Within 3 months</option>
                  <option value="Exploring market">Exploring</option>
                </select>
              </div>
            </div>

            {/* Step 5: Contact & Privacy */}
            <h3 style={{ margin: '24px 0 16px', color: 'var(--navy)', fontSize: '18px' }}>
              4. Your contact details
            </h3>

            <div className="frow">
              <div className="fl">
                <label>Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="fl">
                <label>
                  Phone Number <span className="req">*</span>
                  <span className="private">🔒 Stays hidden</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="hint">We never share your number without your explicit permission.</div>
              </div>
            </div>

            {/* LIVE MATCH COUNTER */}
            <div className="note" style={{ margin: '24px 0 20px' }}>
              <b>⚡ Live Match Preview:</b> We currently have <b>{matches.length} verified listings</b> matching this requirement with a compatibility score of 55% or higher!
            </div>

            <div className="factions">
              <Link href="/discover" className="btn btn-g">
                Cancel
              </Link>
              <button type="submit" className="btn btn-o">
                Post Requirement & See Matches →
              </button>
            </div>
          </form>
        )}
      </div>

      <PrototypeFooter />
    </>
  );
}
