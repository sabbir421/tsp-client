'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import PropertyCard from '../components/prototype/PropertyCard';
import Toast, { showToast } from '../components/prototype/Toast';
import { PROPS, DHAKA_ZONES, locIn, locTxt } from '../utils/prototypeData';
import { getStore, subscribeStore } from '../utils/prototypeStore';
import { propertyApi } from '../utils/api';

function DiscoverContent() {
  const searchParams = useSearchParams();

  const [purpose, setPurpose] = useState(searchParams.get('purpose') || 'All');
  const [propType, setPropType] = useState(searchParams.get('type') || 'All');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || 'All');
  const [otherAreaText, setOtherAreaText] = useState('');
  const [minBeds, setMinBeds] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [customListings, setCustomListings] = useState([]);
  const [apiListings, setApiListings] = useState([]);

  useEffect(() => {
    propertyApi.getPublic()
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setApiListings(res.data.map((p) => ({
            ...p,
            type: p.propertyType || p.type || 'Apartment',
            size: p.sizeSqFt || p.size || 0,
            beds: Number(p.bedrooms || p.beds || 0),
            baths: Number(p.bathrooms || p.baths || 0),
            verified: p.status === 'verified',
          })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const update = () => {
      const { v1 } = getStore();
      setCustomListings(v1.listings || []);
    };
    update();
    return subscribeStore(update);
  }, []);

  const allPropertyListings = useMemo(() => {
    const ids = new Set();
    const result = [];
    customListings.forEach((p) => {
      if (!ids.has(p.id)) {
        ids.add(p.id);
        result.push(p);
      }
    });
    apiListings.forEach((p) => {
      if (!ids.has(p.id)) {
        ids.add(p.id);
        result.push(p);
      }
    });
    return result;
  }, [customListings, apiListings]);

  const filteredProperties = useMemo(() => {
    return allPropertyListings.filter((p) => {
      // Purpose
      if (purpose !== 'All' && p.purpose !== purpose) return false;

      // Property Type
      if (propType !== 'All' && p.type !== propType) return false;

      // Area filter
      if (selectedArea === '__other__') {
        if (otherAreaText) {
          const hay = String(p.area || '').toLowerCase();
          if (!hay.includes(otherAreaText.toLowerCase())) return false;
        }
      } else if (selectedArea !== 'All') {
        if (!locIn(p.area, selectedArea)) return false;
      }

      // Min beds
      if (minBeds !== 'All') {
        const beds = Number(p.beds) || 0;
        if (beds < Number(minBeds)) return false;
      }

      // Verified only
      if (verifiedOnly && !p.verified) return false;

      // Max price
      if (maxPrice && Number(maxPrice) > 0) {
        if (Number(p.price) > Number(maxPrice)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const str = `${p.title} ${p.area} ${p.desc || ''} ${(p.features || []).join(' ')}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      return (b.id || 0) - (a.id || 0); // newest default
    });
  }, [allPropertyListings, purpose, propType, selectedArea, otherAreaText, minBeds, verifiedOnly, maxPrice, searchQuery, sortBy]);

  const handleReset = () => {
    setPurpose('All');
    setPropType('All');
    setSelectedArea('All');
    setOtherAreaText('');
    setMinBeds('All');
    setVerifiedOnly(false);
    setMaxPrice('');
    setSearchQuery('');
  };

  const quickAreas = ['Uttara, Dhaka', 'Gulshan, Dhaka', 'Banani, Dhaka', 'Dhanmondi, Dhaka', 'Bashundhara R/A, Dhaka', 'Mirpur, Dhaka', 'Mohammadpur, Dhaka'];

  return (
    <>
      <PrototypeHeader />
      <Toast />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <a href="/">Home</a> / <span>Discover</span>
          </div>
          <h1>Discover Properties in Dhaka City</h1>
          <p>Find verified flats, apartments, and duplexes for rent and sale directly from property owners.</p>
        </div>
      </div>

      <div className="wrap disc">
        {/* FILTERS SIDEBAR */}
        <aside className={`filters ${mobileFilterOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, color: 'var(--navy)' }}>Filters</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-l btn-sm"
                onClick={handleReset}
                style={{ padding: '0', color: 'var(--orange2)' }}
              >
                Reset all
              </button>
              <button
                type="button"
                className="btn btn-g btn-sm filter-close-btn"
                onClick={() => setMobileFilterOpen(false)}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Purpose */}
          <div className="fgroup">
            <label>Purpose</label>
            <div className="chips">
              {['All', 'Sale', 'Rent'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`chip ${purpose === p ? 'on' : ''}`}
                  onClick={() => setPurpose(p)}
                >
                  {p === 'All' ? 'All' : `For ${p}`}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="fgroup">
            <label>Property Type</label>
            <div className="chips">
              {['All', 'Apartment', 'Duplex', 'House', 'Plot', 'Commercial'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${propType === t ? 'on' : ''}`}
                  onClick={() => setPropType(t)}
                >
                  {t === 'Apartment' ? 'Flat' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Neighbourhood / Areas */}
          <div className="fgroup">
            <label>Neighbourhood</label>
            <div className="chips" style={{ marginBottom: '8px' }}>
              <button
                type="button"
                className={`chip ${selectedArea === 'All' ? 'on' : ''}`}
                onClick={() => setSelectedArea('All')}
              >
                All Dhaka
              </button>
              {quickAreas.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className={`chip ${selectedArea === loc ? 'on' : ''}`}
                  onClick={() => setSelectedArea(selectedArea === loc ? 'All' : loc)}
                >
                  {locTxt(loc)}
                </button>
              ))}
            </div>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{ marginTop: '6px' }}
            >
              <option value="All">More neighbourhoods...</option>
              {Object.keys(DHAKA_ZONES).map((zone) => (
                <optgroup key={zone} label={zone}>
                  {DHAKA_ZONES[zone].map((loc) => (
                    <option key={loc} value={`${loc}, Dhaka`}>
                      {loc}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="__other__">Other location (enter custom area)</option>
            </select>

            {selectedArea === '__other__' && (
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="Type your area in Dhaka..."
                  value={otherAreaText}
                  onChange={(e) => setOtherAreaText(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Bedrooms */}
          <div className="fgroup">
            <label>Minimum Bedrooms</label>
            <div className="chips">
              {['All', '1', '2', '3', '4'].map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`chip ${minBeds === b ? 'on' : ''}`}
                  onClick={() => setMinBeds(b)}
                >
                  {b === 'All' ? 'Any' : `${b}+ Beds`}
                </button>
              ))}
            </div>
          </div>

          {/* Max Budget */}
          <div className="fgroup">
            <label>Max Budget (৳)</label>
            <input
              type="number"
              placeholder="e.g. 15000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          {/* Verified Toggle */}
          <div className="fgroup">
            <label className="chk">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              <span style={{ fontSize: '13.5px', fontWeight: '500' }}>
                Verified properties only
              </span>
            </label>
          </div>

          {mobileFilterOpen && (
            <button
              type="button"
              className="btn btn-o btn-sm"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply Filters ({filteredProperties.length})
            </button>
          )}
        </aside>

        {/* PROPERTY LISTINGS MAIN AREA */}
        <div>
          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="q">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mut)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, road, or features (e.g. Sector 7, Lift, Park)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '9px 12px', fontSize: '13px' }}
              >
                <option value="newest">Sort: Newest first</option>
                <option value="price-asc">Sort: Price low to high</option>
                <option value="price-desc">Sort: Price high to low</option>
                <option value="popular">Sort: Most viewed</option>
              </select>

              <button
                type="button"
                className="btn btn-g btn-sm fbtn"
                onClick={() => setMobileFilterOpen(true)}
              >
                Filters
              </button>
            </div>
          </div>

          <div className="count" style={{ marginBottom: '14px' }}>
            Showing <b>{filteredProperties.length}</b> verified Dhaka properties
          </div>

          {/* GRID */}
          {filteredProperties.length > 0 ? (
            <div className="grid2">
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onSaveToggle={(id, saved) => {
                    showToast(saved ? '♥ Saved to your shortlist' : 'Removed from shortlist');
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>No properties found</h3>
              <p style={{ margin: '8px 0 16px' }}>
                We couldn't find any property matching your active filters. Try broadening your area or budget.
              </p>
              <button type="button" className="btn btn-o btn-sm" onClick={handleReset}>
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <PrototypeFooter />
    </>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="wrap" style={{ padding: '40px 0' }}>Loading properties...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
