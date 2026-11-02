'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PrototypeHeader from '../components/prototype/PrototypeHeader';
import PrototypeFooter from '../components/prototype/PrototypeFooter';
import ViewingModal from '../components/prototype/ViewingModal';
import Toast, { showToast } from '../components/prototype/Toast';
import { PROPS, SAMPLE_REQ, matchesFor, art, locTxt, money, comma } from '../utils/prototypeData';
import { getStore, setMatchDecision, toggleSaveProperty, isPropertySaved, subscribeStore } from '../utils/prototypeStore';

function ScoreRing({ score }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const col = score >= 80 ? '#1f9d63' : score >= 65 ? '#f2961d' : '#8a93a8';
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="ring">
      <svg viewBox="0 0 84 84" width="84" height="84">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="#e3e7ef" strokeWidth="8" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke={col}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference * score / 100} ${circumference}`}
          transform="rotate(-90 42 42)"
        />
      </svg>
      <b>{score}%</b>
    </div>
  );
}

const blankStore = {
  v1: { reqs: [], listings: [], enq: [], visits: [], saved: [], decisions: {}, contact: [], ownerDecisions: {} },
  v3: { session: { role: 'buyer', name: '', email: '', isLoggedIn: false }, profile: {}, lst: {}, oEnq: {}, oView: {}, docs: {}, reqState: {}, adm: {} }
};

export default function MatchesPage() {
  const [store, setStore] = useState(blankStore);
  const [selectedReq, setSelectedReq] = useState(null);
  const [viewingProp, setViewingProp] = useState(null);

  useEffect(() => {
    const update = () => {
      const s = getStore();
      setStore(s);
    };
    update();
    return subscribeStore(update);
  }, []);

  const activeReq = useMemo(() => {
    if (selectedReq) return selectedReq;
    const reqs = store.v1.reqs || [];
    return reqs[0] || null;
  }, [selectedReq, store.v1.reqs]);

  const matches = useMemo(() => {
    if (!activeReq) return [];
    return matchesFor(activeReq, [...(store.v1.listings || []), ...PROPS]);
  }, [activeReq, store.v1.listings]);

  const handleDecision = (propId, decision) => {
    setMatchDecision(propId, decision);
    if (decision === 'accepted') {
      showToast('✓ Engaged. Owner direct contact is unlocked!');
    } else if (decision === 'declined') {
      showToast('Declined. The owner is not told who you are.');
    } else {
      showToast('Decision undone.');
    }
  };

  return (
    <>
      <PrototypeHeader />
      <Toast />

      <div className="phead">
        <div className="wrap">
          <div className="crumb">
            <Link href="/">Home</Link> / <span>Matches</span>
          </div>
          <h1>Matches for your requirement</h1>
          <p>Scored automatically against verified Dhaka listings. Your number stays private until you accept or book.</p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '24px 20px' }}>
        {/* REQUIREMENT SUMMARY STRIP */}
        {activeReq ? (
          <div className="reqsum">
            <div>
              <small>Active Requirement</small>
              <b>{activeReq.id || 'REQ-1'}</b>
            </div>
            <div>
              <small>Looking to</small>
              <b>{activeReq.purpose === 'Rent' ? 'Rent' : 'Buy'} {activeReq.type}</b>
            </div>
            <div>
              <small>Preferred Locations</small>
              <b>{(activeReq.areas || []).map(locTxt).join(' / ')}</b>
            </div>
            <div>
              <small>Target Budget</small>
              <b>{money(activeReq.minBudget, activeReq.purpose)} – {money(activeReq.maxBudget, activeReq.purpose)}</b>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <Link href="/requirement" className="btn btn-o btn-sm">
                + New Requirement
              </Link>
            </div>
          </div>
        ) : null}

        {/* MATCHES LIST */}
        {matches.length > 0 ? (
          <div>
            {matches.map(({ p, s }) => {
              const decision = store.v1.decisions?.[p.id];
              const saved = isPropertySaved(p.id);

              return (
                <div key={p.id} className="card mcard">
                  {/* LEFT: IMAGE & TAGS */}
                  <Link href={`/property/${p.id}`} className="pimg" style={{ position: 'relative' }}>
                    <div dangerouslySetInnerHTML={{ __html: art(p, 0) }} style={{ width: '100%', height: '100%' }} />
                    <div className="tags">
                      <span className={`tag ${p.purpose === 'Rent' ? 'o' : 'n'}`}>
                        For {p.purpose}
                      </span>
                      {p.verified && <span className="tag g">✓ Verified</span>}
                    </div>
                  </Link>

                  {/* MIDDLE: INFO & WHY IT MATCHED */}
                  <div className="mc">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="price">{money(p.price, p.purpose)}</div>
                        <Link href={`/property/${p.id}`} className="ptitle" style={{ fontSize: '16px', color: 'var(--navy)' }}>
                          {p.title}
                        </Link>
                        <div className="loc" style={{ margin: '4px 0 8px' }}>
                          📍 {locTxt(p.area)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`heart ${saved ? 'on' : ''}`}
                        onClick={() => {
                          const n = toggleSaveProperty(p.id);
                          showToast(n ? '♥ Saved to shortlist' : 'Removed from shortlist');
                        }}
                        style={{ position: 'static' }}
                        aria-label="Save"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'var(--orange)' : 'none'} stroke={saved ? 'var(--orange)' : '#1c2847'} strokeWidth="2">
                          <path d="M12 20s-7-4.5-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.5-9 9-9 9z" />
                        </svg>
                      </button>
                    </div>

                    <div className="facts" style={{ margin: '6px 0 10px', borderTop: 'none', padding: 0 }}>
                      {p.beds ? <span>🛏 {p.beds} bed</span> : null}
                      {p.baths ? <span>🚿 {p.baths} bath</span> : null}
                      <span>📐 {comma(p.size)} sqft</span>
                      <span>Facing {p.facing || 'South'}</span>
                    </div>

                    {/* WHY THIS MATCHES */}
                    <div className="why">
                      {s.reasons.map((r, i) => (
                        <span key={i} style={{ color: r[0] ? '#17733a' : '#8a93a8' }}>
                          {r[0] ? '✓' : '•'} {r[1]}
                        </span>
                      ))}
                    </div>

                    {/* PROGRESS BARS */}
                    <div className="bars">
                      {s.parts.map((part) => (
                        <div key={part[0]} className="bar">
                          <span>{part[0]}</span>
                          <i>
                            <em style={{ width: `${Math.round((part[1] / part[2]) * 100)}%` }} />
                          </i>
                          <span>{part[1]}/{part[2]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: SCORE RING & ACTIONS */}
                  <div className="mside">
                    <ScoreRing score={s.total} />

                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                      {decision === 'accepted' ? (
                        <span className="status st-acc">✓ Engaged</span>
                      ) : decision === 'declined' ? (
                        <span className="status st-dec">Declined</span>
                      ) : (
                        <span className="status st-new">New match</span>
                      )}
                    </div>

                    {decision === 'accepted' ? (
                      <div style={{ display: 'grid', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-o btn-sm"
                          onClick={() => setViewingProp(p)}
                        >
                          📅 Schedule visit
                        </button>
                        <button
                          type="button"
                          className="btn btn-g btn-sm"
                          onClick={() => handleDecision(p.id, 'undo')}
                        >
                          Undo
                        </button>
                      </div>
                    ) : decision === 'declined' ? (
                      <button
                        type="button"
                        className="btn btn-g btn-sm"
                        onClick={() => handleDecision(p.id, 'undo')}
                      >
                        Undo decline
                      </button>
                    ) : (
                      <div style={{ display: 'grid', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-o btn-sm"
                          onClick={() => handleDecision(p.id, 'accepted')}
                        >
                          Accept & Unlock
                        </button>
                        <button
                          type="button"
                          className="btn btn-g btn-sm"
                          onClick={() => setViewingProp(p)}
                        >
                          📅 Book visit
                        </button>
                        <button
                          type="button"
                          className="btn btn-l btn-sm"
                          style={{ fontSize: '12px' }}
                          onClick={() => handleDecision(p.id, 'declined')}
                        >
                          Decline privately
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            <h3>{!activeReq ? 'No active requirement found' : 'No matches found yet'}</h3>
            <p style={{ margin: '8px 0 16px' }}>
              {!activeReq
                ? 'Post your property requirement (budget, preferred locations, bedroom count) to receive verified matches automatically.'
                : 'We could not find verified listings meeting a 55% match score. Try broadening your preferred neighbourhoods or budget.'}
            </p>
            <Link href="/requirement" className="btn btn-o btn-sm">
              {!activeReq ? '+ Post a Requirement' : 'Adjust your requirement'}
            </Link>
          </div>
        )}
      </div>

      <ViewingModal
        property={viewingProp}
        isOpen={!!viewingProp}
        onClose={() => setViewingProp(null)}
      />

      <PrototypeFooter />
    </>
  );
}
