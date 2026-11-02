'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { matchApi, getUploadUrl } from '../../utils/api';
import { isSellerAgent } from '../../utils/roles';
import common from './pageCommon.module.css';
import styles from './siteVisits.module.css';

export default function SiteVisitsPage() {
  const { user, selectedRole } = useSelector((state) => state.auth);
  const sellerView = isSellerAgent(user, selectedRole);

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [filter, setFilter] = useState('all');

  // Propose New Time Modal state
  const [proposingVisit, setProposingVisit] = useState(null);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('11:00 AM');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = sellerView
          ? await matchApi.getSellerSiteVisits()
          : await matchApi.getBuyerSiteVisits();
        setVisits(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sellerView]);

  const handleConfirmVisit = async (id) => {
    setActingId(id);
    setError('');
    try {
      await matchApi.confirmSellerVisit(id);
      setVisits((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, visitStatus: 'confirmed' } : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleOpenProposeModal = (visit) => {
    setProposingVisit(visit);
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setNewDate(d.toISOString().split('T')[0]);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!proposingVisit) return;
    setSubmittingProposal(true);
    try {
      await matchApi.proposeSellerTime(proposingVisit.id, {
        date: newDate,
        time: newTime,
      });
      setVisits((prev) =>
        prev.map((item) =>
          item.id === proposingVisit.id
            ? {
                ...item,
                visitStatus: 'rescheduled',
                proposedDate: newDate,
                proposedTime: newTime,
              }
            : item
        )
      );
      setProposingVisit(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleMarkDone = async (id) => {
    setActingId(id);
    setError('');
    try {
      const res = sellerView
        ? await matchApi.completeSellerVisit(id)
        : await matchApi.completeBuyerVisit(id);
      setVisits((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, visitStatus: 'completed' } : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  const filteredVisits = visits.filter((visit) => {
    if (filter === 'pending') return visit.visitStatus === 'pending';
    if (filter === 'confirmed') return visit.visitStatus === 'confirmed';
    if (filter === 'completed') return visit.visitStatus === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading viewing requests &amp; site visits...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>Site Visit Requests</h1>
          <p className={common.pageSubtitle}>
            {sellerView
              ? 'Buyer and tenant contact details appear here with requested visit timings. Confirm slots or call directly to coordinate.'
              : 'Viewing requests you have sent to property owners, with confirmed dates and timings.'}
          </p>
        </div>
      </div>

      {error && <div className={common.error}>{error}</div>}

      {visits.length > 0 && (
        <div className={styles.filterRow}>
          {[
            { key: 'all', label: `All (${visits.length})` },
            {
              key: 'pending',
              label: `Awaiting Confirmation (${visits.filter((v) => v.visitStatus === 'pending').length})`,
            },
            {
              key: 'confirmed',
              label: `Confirmed (${visits.filter((v) => v.visitStatus === 'confirmed').length})`,
            },
            {
              key: 'completed',
              label: `Completed (${visits.filter((v) => v.visitStatus === 'completed').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.filterBtn} ${filter === tab.key ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {visits.length === 0 ? (
        <div className={common.emptyState}>
          <div className={common.emptyIcon}>📅</div>
          <h2 className={common.emptyTitle}>No viewing requests yet</h2>
          <p className={common.emptyDesc}>
            {sellerView
              ? 'When buyers or tenants request a private viewing on your suggested properties, their full contact details and preferred timings will appear here.'
              : 'When you book a site visit on suggested properties, the schedule and seller details will appear here.'}
          </p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className={common.emptyState}>
          <h2 className={common.emptyTitle}>No visits in this filter</h2>
          <p className={common.emptyDesc}>Try another tab to see more visits.</p>
        </div>
      ) : (
        <div className={styles.visitGrid}>
          {filteredVisits.map((visit) => {
            const isDone = visit.visitStatus === 'completed';
            const isConfirmed = visit.visitStatus === 'confirmed';
            const isResched = visit.visitStatus === 'rescheduled';
            const contact = sellerView ? visit.buyer : visit.seller;
            const contactLabel = sellerView ? 'Buyer / Tenant Details' : 'Seller / Agent Details';

            return (
              <article
                key={visit.id}
                className={`${styles.visitCard} ${isDone ? styles.visitCardDone : ''}`}
                style={{
                  borderLeft: isConfirmed
                    ? '4px solid var(--ok)'
                    : isResched
                    ? '4px solid #b45f00'
                    : '4px solid var(--orange)',
                }}
              >
                <div className={styles.visitCardInner}>
                  {/* Property section */}
                  <div className={styles.propertySection}>
                    <p className={styles.sectionLabel}>Target Property</p>
                    <h2 className={styles.propertyTitle}>
                      {visit.property?.title || 'Property Match'}
                    </h2>
                    <p className={styles.propertyMeta}>{visit.property?.details || '—'}</p>
                    <p className={styles.propertyPrice}>{visit.property?.priceDisplay || ''}</p>

                    <div className={styles.tagRow}>
                      <span
                        className={`${styles.tag} ${
                          isDone
                            ? styles.tagCompleted
                            : isConfirmed
                            ? styles.tagAccepted
                            : styles.tag
                        }`}
                        style={{
                          background: isConfirmed ? '#e7f6ee' : isResched ? '#fff3e0' : '#eef1f8',
                          color: isConfirmed ? '#14794b' : isResched ? '#b45f00' : 'var(--navy)',
                          fontWeight: '700',
                        }}
                      >
                        {isDone
                          ? '✓ Visit Completed'
                          : isConfirmed
                          ? '✓ Confirmed by Seller'
                          : isResched
                          ? 'New Time Proposed'
                          : 'Awaiting Confirmation'}
                      </span>
                      {visit.matchScore ? (
                        <span className={`${styles.tag} ${styles.tagMatch}`}>
                          {visit.matchScore}% Match
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.addressRow} style={{ marginTop: '10px' }}>
                      <span className={styles.addressIcon}>📍</span>
                      <span>{visit.property?.address || visit.property?.area || 'Address on file'}</span>
                    </div>

                    {/* Visit Timing Banner */}
                    <div
                      style={{
                        background: '#f6f7fb',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        marginTop: '12px',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ fontWeight: '700', color: 'var(--navy)' }}>
                        🗓️ Requested Timing: {visit.visitDate}
                      </div>
                      <div style={{ color: 'var(--mut)', marginTop: '2px' }}>
                        ⏰ Slot: <b>{visit.visitSlot}</b> · {visit.visitPeople || 1} Person(s)
                      </div>
                      {visit.visitNotes && (
                        <div style={{ marginTop: '6px', fontStyle: 'italic', color: 'var(--ink)' }}>
                          &ldquo;{visit.visitNotes}&rdquo;
                        </div>
                      )}
                      {isResched && visit.proposedDate && (
                        <div style={{ marginTop: '6px', color: '#b45f00', fontWeight: '600' }}>
                          Proposed new time: {visit.proposedDate} at {visit.proposedTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact section */}
                  <div className={styles.buyerSection}>
                    <p className={styles.sectionLabel}>{contactLabel}</p>
                    <p className={styles.buyerName} style={{ fontSize: '17px', fontWeight: '800', color: 'var(--navy)' }}>
                      {contact?.fullName || 'Nusrat Jahan (Buyer)'}
                    </p>

                    <div className={styles.contactList}>
                      <div className={styles.contactItem}>
                        <span className={styles.contactIcon}>📞</span>
                        <div>
                          <span className={styles.contactLabel}>Mobile Number</span>
                          <span className={styles.contactValue} style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy)' }}>
                            <a href={`tel:${contact?.phone}`} style={{ textDecoration: 'underline', color: 'var(--navy)' }}>
                              {contact?.phone || '017XXXXXXXX'}
                            </a>
                          </span>
                        </div>
                      </div>
                      <div className={styles.contactItem}>
                        <span className={styles.contactIcon}>✉️</span>
                        <div>
                          <span className={styles.contactLabel}>Email</span>
                          <span className={styles.contactValue}>
                            <a href={`mailto:${contact?.email}`}>
                              {contact?.email || 'buyer@example.com'}
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.verifyRow} style={{ margin: '10px 0' }}>
                      <span className={`${styles.verifyBadge} ${styles.verifyYes}`}>
                        ✓ Phone Verified
                      </span>
                      <span className={`${styles.verifyBadge} ${styles.verifyYes}`}>
                        ✓ NID Checked
                      </span>
                    </div>

                    {/* Action buttons for seller */}
                    <div className={styles.actionRow} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {sellerView && !isConfirmed && !isDone && (
                        <button
                          type="button"
                          className={styles.doneBtn}
                          style={{ background: 'var(--ok)', color: '#fff', border: 'none' }}
                          disabled={actingId === visit.id}
                          onClick={() => handleConfirmVisit(visit.id)}
                        >
                          {actingId === visit.id ? 'Confirming...' : '✓ Confirm Site Visit'}
                        </button>
                      )}

                      {sellerView && !isDone && (
                        <button
                          type="button"
                          className="btn btn-g btn-sm"
                          onClick={() => handleOpenProposeModal(visit)}
                        >
                          Propose New Time
                        </button>
                      )}

                      {!isDone ? (
                        <button
                          type="button"
                          className={`${styles.doneBtn} ${styles.doneBtnCompleted}`}
                          disabled={actingId === visit.id}
                          onClick={() => handleMarkDone(visit.id)}
                        >
                          {actingId === visit.id ? 'Updating...' : 'Mark Visit as Done'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--ok)', fontWeight: '700' }}>
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* PROPOSE NEW TIME MODAL */}
      {proposingVisit && (
        <div
          className={styles.modalOverlay}
          onClick={() => setProposingVisit(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Propose New Visit Time</h3>
              <p className={styles.modalSubtitle}>
                {proposingVisit.property?.title || 'Property'} · {proposingVisit.buyer?.fullName}
              </p>
            </div>

            <form onSubmit={handleSubmitProposal}>
              <div className={styles.modalBody}>
                <div style={{ marginBottom: '14px' }}>
                  <label className={styles.fieldLabel}>New Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={styles.input}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className={styles.fieldLabel}>New Time Window</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className={styles.select}
                  >
                    {[
                      '10:00 AM',
                      '11:00 AM',
                      '12:00 PM',
                      '3:00 PM',
                      '4:00 PM',
                      '5:00 PM',
                      '6:00 PM',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setProposingVisit(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submittingProposal}
                  style={{ background: 'var(--navy)', color: '#fff' }}
                >
                  {submittingProposal ? 'Saving...' : 'Send Proposed Time →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
