'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import SuggestPropertyModal from '../components/prototype/SuggestPropertyModal';
import Toast, { showToast } from '../components/prototype/Toast';
import { DHAKA_ZONES, locTxt, money } from '../utils/prototypeData';
import { requirementApi } from '../utils/api';
import { getActiveToken, getActiveUser, getPortalSession } from '../utils/authStorage';

export default function RequirementsFeedPage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState('All');
  const [propType, setPropType] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [reqs, setReqs] = useState([]);
  const [suggestModalReq, setSuggestModalReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    requirementApi
      .getPublic()
      .then((reqRes) => {
        if (!mounted) return;
        const rList = Array.isArray(reqRes?.data) ? reqRes.data : Array.isArray(reqRes) ? reqRes : [];
        setReqs(rList);
      })
      .catch(() => {
        if (mounted) setReqs([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const normalizedReqs = useMemo(() => {
    return reqs.map((r) => {
      const isRent = String(r.purpose || '').toLowerCase().includes('rent') || String(r.category || '').toLowerCase().includes('rent');
      const p = isRent ? 'Rent' : 'Sale';
      const loc = r.sector || r.area || r.zone || r.city || 'Dhaka';
      return {
        ...r,
        purpose: p,
        type: r.subType || r.propertyType || r.category || 'Property',
        areas: [loc],
        beds: r.bedrooms,
        minSize: r.sizeSqFt,
        notes: r.mustIncludeDetails || r.notes,
      };
    });
  }, [reqs]);

  const filteredReqs = useMemo(() => {
    return normalizedReqs.filter((r) => {
      if (purpose !== 'All' && r.purpose !== purpose) return false;
      if (propType !== 'All' && r.type !== propType) return false;
      if (selectedArea !== 'All') {
        if (!r.areas.some((a) => a.toLowerCase().includes(selectedArea.toLowerCase()))) return false;
      }
      return true;
    });
  }, [normalizedReqs, purpose, propType, selectedArea]);

  const handleOpenSuggest = (req) => {
    const activeUser = getActiveUser();
    const token = getActiveToken();
    const ownerSession = getPortalSession('owner') || getPortalSession('seller_agent');
    const isSeller = Boolean((token && (activeUser?.role === 'seller_agent' || activeUser?.role === 'owner')) || ownerSession);

    if (!isSeller) {
      showToast('Log in as a Seller / Rent Giver to suggest a property');
      router.push(`/login?role=owner&returnUrl=${encodeURIComponent('/requirements')}`);
      return;
    }

    setSuggestModalReq(req);
  };

  return (
    <>
      <PrototypeHeader />
      <Toast />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <span>Requirements</span>
          </div>
          <h1>Buyer & Tenant Requirements Feed</h1>
          <p>
            Browse real, active property requirements posted by verified buyers and tenants across Dhaka City.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '24px 20px' }}>
        {/* FILTERS */}
        <div className="fcard" style={{ marginBottom: '20px', padding: '18px 22px' }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--mut)', marginRight: '8px' }}>
                Purpose:
              </span>
              <div className="chips" style={{ display: 'inline-flex' }}>
                {['All', 'Sale', 'Rent'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`chip ${purpose === p ? 'on' : ''}`}
                    onClick={() => setPurpose(p)}
                  >
                    {p === 'All' ? 'All' : p === 'Sale' ? 'Looking to Buy' : 'Looking to Rent'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--mut)', marginRight: '8px' }}>
                Type:
              </span>
              <select
                value={propType}
                onChange={(e) => setPropType(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment / Flat</option>
                <option value="Duplex">Duplex</option>
                <option value="House">House</option>
                <option value="Plot">Plot</option>
              </select>
            </div>

            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--mut)', marginRight: '8px' }}>
                Neighbourhood:
              </span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
              >
                <option value="All">All Dhaka</option>
                <option value="Uttara">Uttara</option>
                <option value="Gulshan">Gulshan & Banani</option>
                <option value="Dhanmondi">Dhanmondi</option>
                <option value="Bashundhara">Bashundhara R/A</option>
                <option value="Mirpur">Mirpur</option>
              </select>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <Link href="/requirement" className="btn btn-o btn-sm">
                + Post your requirement
              </Link>
            </div>
          </div>
        </div>

        {/* FEED LIST */}
        <div className="list">
          <h4>
            <span>Active Buyer Requirements ({filteredReqs.length})</span>
            <small style={{ color: 'var(--mut)', fontWeight: 'normal' }}>
              Verified requirements · Direct owner connect
            </small>
          </h4>

          {filteredReqs.length > 0 ? (
            filteredReqs.map((req) => (
              <div key={req.id} className="li" style={{ padding: '18px 20px' }}>
                <div className="grow">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <b style={{ color: 'var(--navy)', fontSize: '15px' }}>REQ-{req.id}</b>
                    <span className={`tag ${req.purpose === 'Rent' ? 'o' : 'n'}`}>
                      {req.purpose === 'Rent' ? 'Looking to Rent' : 'Looking to Buy'}
                    </span>
                    <span className="tag" style={{ background: '#eef1f8', color: 'var(--navy)' }}>
                      {req.type}
                    </span>
                    {req.beds ? <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>• {req.beds}+ Beds</span> : null}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
                    {(req.areas || []).map((a) => (
                      <span key={a} className="chip" style={{ fontSize: '12px', padding: '4px 10px' }}>
                        📍 {locTxt(a)}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '13.5px', color: '#46506b', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>
                      Budget: <b>{req.budgetDisplay || (req.maxBudget ? money(req.maxBudget, req.purpose) : 'Budget on request')}</b>
                    </span>
                    {req.minSize ? <span>Min Size: <b>{req.minSize} sqft</b></span> : null}
                    {req.timeline ? <span>Timeframe: <b>{req.timeline}</b></span> : null}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-g btn-sm"
                    onClick={() => handleOpenSuggest(req)}
                  >
                    ✉ Propose Property
                  </button>
                  <Link href={`/matches`} className="btn btn-l btn-sm" style={{ padding: '0', fontSize: '12px' }}>
                    Preview matching algorithm →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--mut)' }}>
              No active buyer requirements found.
            </div>
          )}
        </div>
      </div>

      {/* SUGGEST MODAL */}
      <SuggestPropertyModal
        requirement={suggestModalReq}
        isOpen={!!suggestModalReq}
        onClose={() => setSuggestModalReq(null)}
        onSuccess={() => {
          showToast('Property suggestion submitted successfully!');
        }}
      />

      <PrototypeFooter />
    </>
  );
}
