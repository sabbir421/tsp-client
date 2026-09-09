'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { matchApi } from '../../utils/api';
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

  const handleMarkDone = async (id) => {
    setActingId(id);
    setError('');
    try {
      const res = sellerView
        ? await matchApi.completeSellerVisit(id)
        : await matchApi.completeBuyerVisit(id);
      setVisits((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...res.data } : item))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  const filteredVisits = visits.filter((visit) => {
    if (filter === 'pending') return visit.visitStatus !== 'completed';
    if (filter === 'completed') return visit.visitStatus === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className={common.loading}>
        <div className={common.spinner} />
        Loading site visits...
      </div>
    );
  }

  return (
    <div>
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>Site Visits</h1>
          <p className={common.pageSubtitle}>
            {sellerView
              ? 'Buyer and tenant contact details appear here after they accept your match. Mark visits as done when completed.'
              : 'Accepted property matches appear here with seller contact details. Mark a visit as done after you visit.'}
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
              label: `Pending (${visits.filter((v) => v.visitStatus !== 'completed').length})`,
            },
            {
              key: 'completed',
              label: `Done (${visits.filter((v) => v.visitStatus === 'completed').length})`,
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
          <div className={common.emptyIcon}>🏠</div>
          <h2 className={common.emptyTitle}>No accepted matches yet</h2>
          <p className={common.emptyDesc}>
            {sellerView
              ? 'When a buyer or tenant accepts your matching property, their contact details will appear here for site visit coordination.'
              : 'When you accept a matched property, visit details and seller contact info will appear here.'}
          </p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className={common.emptyState}>
          <h2 className={common.emptyTitle}>No visits in this filter</h2>
          <p className={common.emptyDesc}>Try another filter to see more site visits.</p>
        </div>
      ) : (
        <div className={styles.visitGrid}>
          {filteredVisits.map((visit) => {
            const isDone = visit.visitStatus === 'completed';
            const contact = sellerView ? visit.buyer : visit.seller;
            const contactLabel = sellerView ? 'Buyer / Tenant' : 'Seller / Agent';

            return (
              <article
                key={visit.id}
                className={`${styles.visitCard} ${isDone ? styles.visitCardDone : ''}`}
              >
                <div className={styles.visitCardInner}>
                  <div className={styles.propertySection}>
                    <p className={styles.sectionLabel}>Property</p>
                    <h2 className={styles.propertyTitle}>
                      {visit.property?.title || 'Property match'}
                    </h2>
                    <p className={styles.propertyMeta}>{visit.property?.details || '—'}</p>
                    <p className={styles.propertyPrice}>{visit.property?.priceDisplay || ''}</p>
                    <div className={styles.tagRow}>
                      <span
                        className={`${styles.tag} ${
                          isDone ? styles.tagCompleted : styles.tagAccepted
                        }`}
                      >
                        {isDone ? 'Visit Done' : 'Visit Pending'}
                      </span>
                      {visit.matchScore ? (
                        <span className={`${styles.tag} ${styles.tagMatch}`}>
                          {visit.matchScore}% Match
                        </span>
                      ) : null}
                      {visit.requirementTitle ? (
                        <span className={styles.tag}>{visit.requirementTitle}</span>
                      ) : null}
                    </div>
                    <div className={styles.addressRow}>
                      <span className={styles.addressIcon}>📍</span>
                      <span>{visit.property?.address || 'Address not available'}</span>
                    </div>
                    {visit.property?.contactNumber ? (
                      <p className={styles.propertyContact}>
                        Property contact: {visit.property.contactNumber}
                      </p>
                    ) : null}
                  </div>

                  <div className={styles.buyerSection}>
                    <p className={styles.sectionLabel}>{contactLabel}</p>
                    <p className={styles.buyerName}>{contact?.fullName || 'N/A'}</p>
                    <div className={styles.contactList}>
                      <div className={styles.contactItem}>
                        <span className={styles.contactIcon}>📞</span>
                        <div>
                          <span className={styles.contactLabel}>Phone</span>
                          <span className={styles.contactValue}>{contact?.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className={styles.contactItem}>
                        <span className={styles.contactIcon}>✉️</span>
                        <div>
                          <span className={styles.contactLabel}>Email</span>
                          <span className={styles.contactValue}>{contact?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.verifyRow}>
                      <span
                        className={`${styles.verifyBadge} ${
                          contact?.isPhoneVerified ? styles.verifyYes : styles.verifyNo
                        }`}
                      >
                        {contact?.isPhoneVerified ? '✓ Phone Verified' : 'Phone Unverified'}
                      </span>
                      <span
                        className={`${styles.verifyBadge} ${
                          contact?.isEmailVerified ? styles.verifyYes : styles.verifyNo
                        }`}
                      >
                        {contact?.isEmailVerified ? '✓ Email Verified' : 'Email Unverified'}
                      </span>
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={`${styles.doneBtn} ${isDone ? styles.doneBtnCompleted : ''}`}
                        disabled={isDone || actingId === visit.id}
                        onClick={() => handleMarkDone(visit.id)}
                      >
                        {isDone
                          ? '✓ Marked as Done'
                          : actingId === visit.id
                            ? 'Updating...'
                            : 'Mark Visit as Done'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
